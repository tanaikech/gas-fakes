/**
 * ZIPPING/UNZIPPING
 * all these functions run as subprocesses and wait fo completion
 * thus turning async operations into sync
 * note 
 * - since the subprocess starts afresh it has to reimport all dependecies
 * - there is nocontext inhertiance
 * - arguments and returns must be serializable ie. primitives or plain objects
 * 
 * TODO - this slows down debuggng significantly as it has to keep restarting the debugger
 * - need to research how to get over that
 */
/**
 * create a zipped version of multiple files
 * @param {object} p params
 * @param {SerializedBlob[]} blobContent
 * @return  {byte[]} the zipped content
 */
export const sxZipper = async ({ blobsContent }) => {

  const { default: archiver } = await import('archiver')
  const { getStreamAsBuffer } = await import('get-stream')
  const { PassThrough } = await import('node:stream')

  const passthrough = new PassThrough()

  // just use the default compression level

  const archive = archiver.create('zip', {})

  const doArchive = async () => {

    // warning could be non destructive
    archive.on("warning", function (err) {
      if (err.code === "ENOENT") {
        console.log("....warning on archiver", err)
      } else {
        // throw error
        return Promise.reject(err)
      }
    });

    archive.on("error", function (err) {
      return Promise.reject(err)
    })

    const result = getStreamAsBuffer(archive.pipe(passthrough))

    blobsContent.forEach(f => {
      archive.append(Buffer.from(f.bytes), { name: f.name })
    })

    archive.finalize()

    return result.then(buffer => Array.from(buffer))

  }

  return doArchive()
    .catch(err => {
      console.log('...archiver failed with error', err)
      return Promise.reject(err)
    })

}

/**
 * create a unzipped version 
 * @param {object} p params
 * @param {SerializedBlob} blobContent the zipped content
 * @return  {SerializedBlob[]} the unzipped content
 */
export const sxUnzipper = async ({ blobContent }) => {

  const { default: unzipper } = await import('unzipper')
  const { getStreamAsBuffer } = await import('get-stream')

  const buffer = Buffer.from(blobContent.bytes)
  const unzipped = await unzipper.Open.buffer(buffer)

  const result = await Promise.all(unzipped.files.map(async file => {
    const bytes = await getStreamAsBuffer(file.stream())

    return {
      bytes,
      name: file.path
    }
  }))

  return result
}
