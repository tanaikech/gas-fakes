import { google } from "googleapis";
import { Auth } from '../../support/auth.js'
import { syncLog } from '../../support/workersync/synclogger.js'

let __client = null;
syncLog('...importing Calendar API');
export const getCalendarApiClient = () => {
  const auth = Auth.getAuthClient()
  if (!__client) {
    syncLog('Creating new Calendar API client');
    __client = google.calendar({ version: 'v3', auth });
  }
  return __client;
}
