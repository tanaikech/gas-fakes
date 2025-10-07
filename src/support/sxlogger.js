
//import { syncError, syncLog } from './workersync/synclogger.js';
import { Logging } from '@google-cloud/logging';
import { syncError, syncLog } from './workersync/synclogger.js';

/**
 * sync a call to logger api
 * @param {import('./auth.js').Auth} Auth an auth object
 * @param {object} p pargs
 * @param {string} p.logName the cloud log file name
 * @param {string} p.metadata the entry metadata
 */

export const sxLogger = async (Auth , { logName, metadata }) => {
  const keyFile = Auth.getAdcPath()
  syncLog('key file is', keyFile)
  const logging = new Logging({
    projectId: Auth.getProjectId(),
    auth: Auth.getAuth(),
    keyFile // Explicitly provide the path to the credentials
  });
  let response;
  let error;
  const cloudlog = logging.log(logName)
  try {
    response = await cloudlog.write(cloudlog.entry(metadata))
  } catch (err) {
    error = err;
  }


  if (error) {
    syncError(`Failed in to write to cloudlog ${logName}`, error);
    return { data: null, response: error.message }
  }
  return { data: response };
}
