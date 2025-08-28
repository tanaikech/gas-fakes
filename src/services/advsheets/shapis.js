import { google } from "googleapis";
import { Auth } from '../../support/auth.js'
import { syncLog} from '../../support/workersync/synclogger.js'
let currentAuth = null;
let __client = null;
syncLog('...importing Sheets API');
export const getSheetsApiClient = () => {
  const auth = Auth.getAuth()

  if (__client && currentAuth !== auth) {
    syncLog('Auth has changed - creating new Sheets API client');
    __client = null;
  }
  
  currentAuth = auth;
  if (!__client) {
    syncLog('Creating new Sheets API client');
    __client = google.sheets({ version: 'v4', auth });
  }
  return __client;
}