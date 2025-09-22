import { google } from "googleapis";
import { Auth } from '../../support/auth.js'
import { syncLog} from '../../support/workersync/synclogger.js'

let __client = null;

export const getGmailApiClient = () => {
  const auth = Auth.getAuth()
  if (!__client) {
    syncLog('Creating new Gmail API client');
    __client = google.gmail({ version: 'v1', auth });
  }
  return __client;
}

