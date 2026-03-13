import got from 'got';
import { syncLog, syncWarn } from '../workersync/synclogger.js';
import { Auth } from '../auth.js';

// Static map to persist sessions across MsExcel instances in the same worker
const sessions = new Map();

export class MsExcel {
  constructor(token) {
    this.token = token;
    this.baseUrl = 'https://graph.microsoft.com/v1.0';

    const method = Auth.getAuthMethod('msgraph');
    const identity = Auth.getEffectiveUser();

    if (method === 'secret' && identity?.email) {
      this.userPath = `/users/${identity.email}`;
    } else {
      this.userPath = '/me';
    }
  }

  /**
   * Centralized request handler
   * @private
   */
  async _request(method, path, options = {}, workbookId = null) {
    const url = path.startsWith('http') ? path : `${this.baseUrl}${path}`;
    const { headers = {}, responseType, ...otherOptions } = options;

    const requestHeaders = {
      Authorization: `Bearer ${this.token}`,
      ...headers
    };

    // If we have a session for this workbook, use it
    if (workbookId && sessions.has(workbookId)) {
      requestHeaders['workbook-session-id'] = sessions.get(workbookId);
    }

    const requestOptions = {
      method: method.toUpperCase(),
      headers: requestHeaders,
      responseType: responseType || 'json',
      ...otherOptions
    };

    try {
      const res = await got(url, requestOptions);
      return res;
    } catch (err) {
      let msg = `MS Excel Graph API Error [${method} ${path}]: ${err.message}`;
      if (err.response?.body) {
        const body = typeof err.response.body === 'object' ? JSON.stringify(err.response.body) : String(err.response.body);
        msg += ` - Response: ${body}`;
      }
      const error = new Error(msg);
      error.statusCode = err.response?.statusCode;
      throw error;
    }
  }

  async _ensureSession(workbookId) {
    if (!sessions.has(workbookId)) {
      const res = await this._request('POST', `${this.userPath}/drive/items/${workbookId}/workbook/createSession`, {
        json: { persistChanges: true }
      });
      sessions.set(workbookId, res.body.id);
    }
    return sessions.get(workbookId);
  }

  async closeSession(workbookId) {
    if (sessions.has(workbookId)) {
      const sessionId = sessions.get(workbookId);
      try {
        await this._request('POST', `${this.userPath}/drive/items/${workbookId}/workbook/closeSession`, {
           headers: { 'workbook-session-id': sessionId }
        });
      } catch (e) {
        // If it fails, it's likely already closed or the file is gone
      }
      sessions.delete(workbookId);
    }
  }

  async getWorkbook(id) {
    const response = await this._request('GET', `${this.userPath}/drive/items/${id}/workbook`, {}, id);
    
    // Fetch the drive item to get the real name (title)
    const itemResponse = await this._request('GET', `${this.userPath}/drive/items/${id}`);
    const driveItem = itemResponse.body;

    // Fetch worksheets
    const worksheetsResponse = await this._request('GET', `${this.userPath}/drive/items/${id}/workbook/worksheets`, {}, id);
    const worksheets = worksheetsResponse.body.value || [];

    return {
      spreadsheetId: id,
      properties: {
        title: driveItem.name || id,
      },
      sheets: worksheets.map(ws => ({
        properties: {
          sheetId: ws.id,
          title: ws.name,
          index: ws.position,
          gridProperties: {
            rowCount: 1000, 
            columnCount: 26
          }
        }
      })),
      spreadsheetUrl: `https://onedrive.live.com/edit.aspx?resid=${id}`
    };
  }

  _parseRange(range) {
    let sheetName = '';
    let address = '';

    // Robust parsing for 'Sheet Name'!A1 or SheetName!A1 or just 'Sheet Name'
    // Matches: optional single quote, any chars until a single quote followed by ! OR just chars until !
    const match = range.match(/^(?:'([^']+)'|([^!]+))!(.+)$/);
    
    if (match) {
      sheetName = match[1] || match[2];
      address = match[3];
    } else {
      // If no ! is found, the whole string is the sheet name (referencing the used range)
      sheetName = range.replace(/^'(.+)'$/, '$1');
      address = null; 
    }

    return { sheetName, address };
  }

  async getValues(id, range) {
    await this._ensureSession(id);
    const { sheetName, address } = this._parseRange(range);

    // If address is null, we use usedRange() to mimic GAS behavior of getting the whole sheet data
    const path = address
      ? `${this.userPath}/drive/items/${id}/workbook/worksheets/${encodeURIComponent(sheetName)}/range(address='${address}')`
      : `${this.userPath}/drive/items/${id}/workbook/worksheets/${encodeURIComponent(sheetName)}/usedRange`;

    const response = await this._request('GET', path, {}, id);
    return {
      range: range,
      majorDimension: 'ROWS',
      values: response.body.values || [[]]
    };
  }

  async updateValues(id, range, values) {
    await this._ensureSession(id);
    const { sheetName, address } = this._parseRange(range);

    if (!address) {
       throw new Error(`Cannot update values without a specific range address: ${range}`);
    }

    const path = `${this.userPath}/drive/items/${id}/workbook/worksheets/${encodeURIComponent(sheetName)}/range(address='${address}')`;

    const response = await this._request('PATCH', path, {
      json: { values: values }
    }, id);

    return response.body;
  }

  async batchUpdateValues(id, data) {
    await this._ensureSession(id);
    const results = [];
    for (const item of data) {
      const res = await this.updateValues(id, item.range, item.values);
      results.push(res);
    }
    return {
      spreadsheetId: id,
      responses: results
    };
  }

  async createWorkbook(name) {
    const response = await this._request('POST', `${this.userPath}/drive/root/children`, {
      json: {
        name: name.endsWith('.xlsx') ? name : `${name}.xlsx`,
        file: {},
        "@microsoft.graph.conflictBehavior": "rename"
      }
    });
    const file = response.body;
    return this.getWorkbook(file.id);
  }

  async addWorksheet(workbookId, name) {
    await this._ensureSession(workbookId);
    const response = await this._request('POST', `${this.userPath}/drive/items/${workbookId}/workbook/worksheets`, {
      json: { name }
    }, workbookId);
    const ws = response.body;

    return {
      properties: {
        sheetId: ws.id,
        title: ws.name,
        index: ws.position,
        gridProperties: {
          rowCount: 1000,
          columnCount: 26
        }
      }
    };
  }
}
