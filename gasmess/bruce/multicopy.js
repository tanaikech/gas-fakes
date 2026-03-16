import '@mcpher/gas-fakes'


// this tells gas-fakes we'd like auth to be available for both ksuite and google
ScriptApp.__platformAuth = ["msgraph", "ksuite", "google"]

const demoTransfer = () => {
  // copy the files from ksuite
  copyFiles({
    sourcePlatform: 'ksuite',
    targetPlatform: 'google',
    sourceFolderName: 'gas-fakes-assets',
    targetFolderName: 'from-ksuite-to-google'
  })
  // and back again
  copyFiles({
    sourcePlatform: 'google',
    targetPlatform: 'ksuite',
    sourceFolderName: 'from-ksuite-to-google',
    targetFolderName: 'from-google-to-ksuite'
  })

  // now copy them from google to ms-graph
  copyFiles({
    sourcePlatform: 'google',
    targetPlatform: 'msgraph',
    sourceFolderName: 'from-ksuite-to-google',
    targetFolderName: 'from-google-to-ms-graph'
  })

  // and back again
  copyFiles({
    sourcePlatform: 'msgraph',
    targetPlatform: 'ksuite',
    sourceFolderName: 'from-google-to-ms-graph',
    targetFolderName: 'from-ms-graph-to-ksuite'
  })

  // check that the final files in ksuite match the original
  const sourceBlobs = getBlobs ({
    sourcePlatform: 'ksuite',
    sourceFolderName: 'gas-fakes-assets'
  })
  const finalBlobs = getBlobs ({
    sourcePlatform: 'ksuite',
    sourceFolderName: 'from-ms-graph-to-ksuite'
  })

  // check blobs by checking theor digest
  if (sourceBlobs.length !== finalBlobs.length) {
    throw new Error (`expected ${sourceBlobs.length} blobs but got ${finalBlobs.length}`)
  }
  sourceBlobs.forEach ((b,i)=> {
    if (Utilities.base64Encode((Utilities.computeDigest(Utilities.DigestAlgorithm.MD5, b.getBytes()))) !== 
      Utilities.base64Encode((Utilities.computeDigest(Utilities.DigestAlgorithm.MD5, finalBlobs[i].getBytes())))) {
      console.log (`${b.getName()} blob mismatch with ${finalBlobs[i].getName()}`)
    }
  })
}

const getBlobs = ({sourcePlatform, sourceFolderName }) => {
  // set whih platform to use
  ScriptApp.__platform = sourcePlatform
  const sourceFolders = DriveApp.getFoldersByName(sourceFolderName)
  if (!sourceFolders.hasNext()) {
    throw new Error(`Source folder ${sourceFolderName} not found`)
  }


  // get the files in that source folder
  const files = sourceFolders.next().getFiles()
  const blobsToCopy = []
  while (files.hasNext()) {
    const file = files.next()
    blobsToCopy.push(file.getBlob())
  }
  return blobsToCopy
}

const copyFiles = ({ sourcePlatform, targetPlatform, sourceFolderName, targetFolderName }) => {


  const blobsToCopy = getBlobs ({sourcePlatform, sourceFolderName})

  // now use an alternative platform
  ScriptApp.__platform = targetPlatform

  // create the folder if it doesn't exist
  const targetFolders = DriveApp.getFoldersByName(targetFolderName)
  let targetFolder = targetFolders.hasNext() 
    ? targetFolders.next() 
    : DriveApp.createFolder(targetFolderName)

  // now copy the blobs to the target folder
  blobsToCopy.forEach(blob => {
    targetFolder.createFile(blob)
  })
  return blobsToCopy
}

demoTransfer()
