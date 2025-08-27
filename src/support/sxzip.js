/**
 * ZIPPING/UNZIPPING
 * all these functions run in the worker
 * thus turning async operations into sync
 * note
 * - arguments and returns must be serializable ie. primitives or plain objects
 */
import archiver from 'archiver';
import unzipper from 'unzipper';
import { syncWarn, syncError } from './workersync/synclogger.js';

const streamToBuffer = (stream) => {
  return new Promise((resolve, reject) => {
    const chunks = [];
    stream.on('data', chunk => chunks.push(chunk));
    stream.on('error', err => reject(err));
    stream.on('end', () => resolve(Buffer.concat(chunks)));
  });
};

/**
 * create a zipped version of multiple files
 * @param {object} p params
 * @param {SerializedBlob[]} blobContent
 * @return  {byte[]} the zipped content
 */
export const sxZipper = async (_Auth, { blobsContent }) => {
 
  const archive = archiver.create('zip', {});

  try {
    // It's important to handle warnings, as they don't necessarily reject the promise.
    archive.on('warning', (err) => syncWarn(`Archiver warning: ${err}`));

    // Start collecting the buffer in parallel. This promise resolves when the stream ends.
    const bufferPromise = streamToBuffer(archive);

    blobsContent.forEach((f) => {
      archive.append(Buffer.from(f.bytes), { name: f.name });
    });

    // Wait for BOTH the stream to end (which gives us the buffer) AND
    // for finalization to be complete. This is the most robust way.
    const [buffer] = await Promise.all([bufferPromise, archive.finalize()]);
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

  const buffer = Buffer.from(blobContent.bytes)
  const unzipped = await unzipper.Open.buffer(buffer)

  // By wrapping the Promise.all in a try/catch, we ensure that if any
  // single file stream fails, the entire operation rejects cleanly.
  try {
    const result = await Promise.all(
      unzipped.files.map(async (file) => {
        const buffer = await streamToBuffer(file.stream());
        return { bytes: Array.from(buffer), name: file.path };
      })
    );

    return result;
  } catch (err) {
    syncError('An error occurred while unzipping a file stream inside the archive.', err);
    throw err; // Re-throw to be caught by the main worker error handler
  }
}
