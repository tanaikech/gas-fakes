
const getTempFolder = (suffix = "") => {
  const folderName = "---gas-fakes-experiments" + suffix
  const folders = DriveApp.getFoldersByName(folderName)
  let folder = null
  if (folders.hasNext()) {
    folder = folders.next()
    console.log('using existing temp folder', folder.getName(), folder.getId())
  } else {
    folder = DriveApp.createFolder(folderName)
    console.log('created temp folder', folder.getName(), folder.getId())
  }
  return folder
}
export const moveToTempFolder = (id, suffix = "") => {
  const file = DriveApp.getFileById(id)
  const folder = getTempFolder(suffix)
  file.moveTo(folder)
  return {
    folder,
    file
  }
}
export const deleteTempFile = (id) => {
  const file = DriveApp.getFileById(id)
  file.setTrashed(true)
  console.log ('deleted temp file', file.getName(), file.getId())
  return file
}