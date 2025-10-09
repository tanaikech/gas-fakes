
import { google } from "googleapis";
import { Auth } from '../../support/auth.js'
import { syncLog} from '../../support/workersync/synclogger.js'

let __client = null;
syncLog('...importing Slides API');
export const getSlidesApiClient = () => {
  const auth = Auth.getAuthClient()
  if (!__client) {
    syncLog('Creating new Slides API client');
    __client = google.slides({ version: 'v1', auth });
  }
  return __client;
}