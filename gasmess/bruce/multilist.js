import '@mcpher/gas-fakes'


// run explore on each platform
const dual = () => {
  ScriptApp.__platform = 'msgraph'
  const rootFolder0 = DriveApp.getRootFolder()
  console.log('--- msgraph Recursive Explorer ---')
  explore(rootFolder0)

  ScriptApp.__platform = 'ksuite'
  const rootFolder = DriveApp.getRootFolder()
  console.log('--- KSuite Recursive Explorer ---')
  explore(rootFolder)

  ScriptApp.__platform = 'google'
  const rootFolder2 = DriveApp.getRootFolder()
  console.log('--- Google Workspace Recursive Explorer ---')
  explore(rootFolder2)

}


const explore = (folder, depth = 0) => {
  const indent = '  '.repeat(depth)
  console.log(`${indent}FOLDER: ${folder.getName()} (ID: ${folder.getId()})`)

  // Show files in this folder
  const files = folder.getFiles()
  while (files.hasNext()) {
    const file = files.next()
    console.log(`${indent}  FILE: ${file.getName()} (ID: ${file.getId()})`)
  }

  // Drill into subfolders
  const folders = folder.getFolders()
  while (folders.hasNext()) {
    explore(folders.next(), depth + 1)
  }
}

dual ()