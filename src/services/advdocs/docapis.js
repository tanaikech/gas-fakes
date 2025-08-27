import { google } from "googleapis";
import { Auth } from '../../support/auth.js'
import { syncLog} from '../../support/workersync/synclogger.js'

let __client = null;

export const getDocsApiClient = () => {
  const auth = Auth.getAuth()
  if (!__client) {
    syncLog('Creating new Docs API client');
    __client = google.docs({ version: 'v1', auth });
  }
  return __client;
}

