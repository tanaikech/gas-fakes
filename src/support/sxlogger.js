
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
  const projectId = Auth.getProjectId();
  syncLog(`sxLogger creating isolated auth with keyFile: ${keyFile} and projectId: ${projectId}`);

  // Let the Logging client handle its own authentication by providing it
  // with the three essential pieces of information. This is the most robust
  // and idiomatic approach.
  const logging = new Logging({
    projectId, // The Logging client needs the projectId at the top level.
  });
  let response;
  let error;
  logName = 'console_logs'
   syncLog(`${logName} ${projectId} ${JSON.stringify(metadata)}, ${keyFile}`)
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
