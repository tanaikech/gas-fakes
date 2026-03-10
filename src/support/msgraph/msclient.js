import got from 'got';
import { getMsGraphToken } from './msauth.js';

export class MsGraph {
  constructor(token) {
    this.token = token;
    this.baseUrl = 'https://graph.microsoft.com/v1.0';
  }

  async _request(method, path, options = {}) {
    const url = `${this.baseUrl}${path}`;
    const requestOptions = {
      method: method.toUpperCase(),
      headers: {
        Authorization: `Bearer ${this.token}`,
        ...options.headers
      },
      responseType: 'json',
      ...options
    };

    try {
      return await got(url, requestOptions);
    } catch (err) {
      let msg = `MS Graph API Error [${method} ${path}]: ${err.message}`;
      if (err.response?.body) {
        msg += ` - Response: ${JSON.stringify(err.response.body)}`;
      }
      const error = new Error(msg);
      error.statusCode = err.response?.statusCode;
      throw error;
    }
  }

  async getMe() {
    const response = await this._request('GET', '/me');
    return response.body;
  }

  async getMyDrives() {
    const response = await this._request('GET', '/me/drives');
    return response.body;
  }

  /**
   * Get the default OneDrive for the current user
   */
  async getDrive() {
    const response = await this._request('GET', '/me/drive');
    return response.body;
  }

  /**
   * List files in the root of the user's OneDrive
   */
  async listDriveFiles(driveId = 'me/drive') {
    const response = await this._request('GET', `/${driveId}/root/children`);
    return response.body.value;
  }
}

// Simple test if run directly
if (import.meta.url === `file://${process.argv[1]}`) {
  try {
    const token = await getMsGraphToken();
    const graph = new MsGraph(token);
    
    console.log('Fetching MS Graph "/me"...');
    const me = await graph.getMe();
    console.log('Success! Connected as:', me.displayName, `(${me.userPrincipalName})`);
    
    console.log('\nFetching All Accessible Drives...');
    const drivesResponse = await graph.getMyDrives();
    const drives = drivesResponse.value || [];
    console.log(`Found ${drives.length} drives:`);
    
    for (const d of drives) {
      console.log(`\n--- Drive: ${d.name} (Type: ${d.driveType}, ID: ${d.id}) ---`);
      try {
        const files = await graph.listDriveFiles(d.id);
        console.log(`Found ${files.length} items in root:`);
        files.slice(0, 5).forEach(f => {
          const type = f.folder ? '[Folder]' : '[File  ]';
          console.log(`  ${type} ${f.name} (ID: ${f.id})`);
        });
        if (files.length > 5) console.log('  ...');
      } catch (e) {
        console.log(`  Error listing files: ${e.message.split('Response:')[0].trim()}`);
      }
    }

  } catch (err) {
    console.error('Error during test:', err.message);
    process.exit(1);
  }
}
