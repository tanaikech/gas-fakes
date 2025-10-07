import { google } from "googleapis";
import { Auth } from '../../support/auth.js'
import { syncLog} from '../../support/workersync/synclogger.js'

let __client = null;
syncLog('...importing Drive API');
export const getDriveApiClient = () => {
  const auth = Auth.getAuth()
  if (!__client) {
    syncLog('Creating new Drive API client');
    debugAuth(auth)
    __client = google.drive({ version: 'v3', auth });
  }
  return __client;
}
// Debug what credentials are being detected
async function debugAuth(auth) {
  try {
    const client = await auth.getClient();
    syncLog('Client type:' + client.constructor.name);
    
    // Check if we're using a service account
    if (client.email) {
      syncLog('Service account email:' + client.email);
    }
    
    // Get the current credentials
    const credentials = await auth.getCredentials();
    syncLog('Credential type:'+ JSON.stringify(credentials));
    
  } catch (error) {
    syncLog('Auth debug error:'+ error);
  }
}
