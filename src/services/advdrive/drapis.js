import { google } from "googleapis";
import { Auth } from '../../support/auth.js'
import { syncLog} from '../../support/workersync/synclogger.js'

let __client = null;
syncLog('...importing Drive API');
export const getDriveApiClient = () => {
  const auth = Auth.getAuthClient()
  if (!__client) {
    syncLog('Creating new Drive API client');
    __client = google.drive({ version: 'v3', auth });
  }
  return __client;
}