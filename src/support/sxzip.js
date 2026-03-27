/**
 * ZIPPING/UNZIPPING
 * all these functions run in the worker
 * thus turning async operations into sync
 * note
 * - arguments and returns must be serializable ie. primitives or plain objects
 */
import AdmZip from 'adm-zip';
import { syncWarn, syncError } from './workersync/synclogger.js';

/**
 * create a zipped version of multiple files
 * @param {object} p params
 * @param {SerializedBlob[]} blobContent
 * @return  {byte[]} the zipped content
 */
export const sxZipper = async (_Auth, { blobsContent }) => {
  try {
    const zip = new AdmZip();

    blobsContent.forEach((f) => {
      zip.addFile(f.name, Buffer.from(f.bytes));
    });

    const buffer = zip.toBuffer();
    return Array.from(buffer);
  } catch (err) {
    syncError('sxZipper failed', err);
    throw err;
  }
};

/**
 * create a unzipped version 
 * @param {object} p params
 * @param {SerializedBlob} blobContent the zipped content
 * @return  {SerializedBlob[]} the unzipped content
 */
export const sxUnzipper = async (_Auth, { blobContent }) => {
  try {
    const buffer = Buffer.from(blobContent.bytes);
    const zip = new AdmZip(buffer);
    const zipEntries = zip.getEntries();
    
    // Ignore directory entries (they end with a slash)
    const result = zipEntries
      .filter(zipEntry => !zipEntry.isDirectory)
      .map(zipEntry => {
        return { 
          bytes: Array.from(zipEntry.getData()), 
          name: zipEntry.entryName 
        };
      });

    return result;
  } catch (err) {
    syncError('An error occurred while unzipping a file stream inside the archive.', err);
    throw err;
  }
}
