import { google } from "googleapis";
import { Auth } from '../../support/auth.js'
import { syncLog} from '../../support/workersync/synclogger.js'

let __client = null;
syncLog('...importing Sheets API');
export const getSheetsApiClient = () => {
  const auth = Auth.getAuth()
  if (!__client) {
    syncLog('Creating new Sheets API client');
    __client = google.sheets({ version: 'v4', auth });
  }
  return __client;
}