# Drive Service Progress
**Documentation:** [Drive Service](https://developers.google.com/apps-script/reference/drive)
---
Overall Service Completion: 78% completed
## [Access](https://developers.google.com/apps-script/reference/drive/access)
An enum representing the access permissions for a file or folder.

100% completed

| method | return | status | comments |
|---|---|---|---|
| ANYONE | [Access](#access) | Completed | |
| ANYONE_WITH_LINK | [Access](#access) | Completed | |
| DOMAIN | [Access](#access) | Completed | |
| DOMAIN_WITH_LINK | [Access](#access) | Completed | |
| PRIVATE | [Access](#access) | Completed | |
---
## [DriveApp](https://developers.google.com/apps-script/reference/drive/drive-app)
The main class for accessing and creating files and folders in Google Drive.

92% completed

| method | return | status | comments |
|---|---|---|---|
| [addFile(child)](https://developers.google.com/apps-script/reference/drive/drive-app#addFile(File)) | [Folder](#folder) | Completed | |
| [addFolder(child)](https://developers.google.com/apps-script/reference/drive/drive-app#addFolder(Folder)) | [Folder](#folder) | Completed | |
| [continueFileIterator(continuationToken)](https://developers.google.com/apps-script/reference/drive/drive-app#continueFileIterator(String)) | [FileIterator](#fileiterator) | Completed | |
| [continueFolderIterator(continuationToken)](https://developers.google.com/apps-script/reference/drive/drive-app#continueFolderIterator(String)) | [FolderIterator](#folderiterator) | Completed | |
| [createFile(blob)](https://developers.google.com/apps-script/reference/drive/drive-app#createFile(BlobSource)) | [File](#file) | Completed | |
| [createFile(name, content)](https://developers.google.com/apps-script/reference/drive/drive-app#createFile(String,String)) | [File](#file) | Completed | |
| [createFile(name, content, mimeType)](https://developers.google.com/apps-script/reference/drive/drive-app#createFile(String,String,String)) | [File](#file) | Completed | |
| [createFolder(name)](https://developers.google.com/apps-script/reference/drive/drive-app#createFolder(String)) | [Folder](#folder) | Completed | |
| [getAccess(file)](https://developers.google.com/apps-script/reference/drive/drive-app#getAccess(File)) | [Permission](#permission) | Not Started | |
| [getAccess(id)](https://developers.google.com/apps-script/reference/drive/drive-app#getAccess(String)) | [Permission](#permission) | Not Started | |
| [getFileById(id)](https://developers.google.com/apps-script/reference/drive/drive-app#getFileById(String)) | [File](#file) | Completed | |
| [getFiles()](https://developers.google.com/apps-script/reference/drive/drive-app#getFiles()) | [FileIterator](#fileiterator) | Completed | |
| [getFilesByName(name)](https://developers.google.com/apps-script/reference/drive/drive-app#getFilesByName(String)) | [FileIterator](#fileiterator) | Completed | |
| [getFilesByType(mimeType)](https://developers.google.com/apps-script/reference/drive/drive-app#getFilesByType(String)) | [FileIterator](#fileiterator) | Completed | |
| [getFolderById(id)](https://developers.google.com/apps-script/reference/drive/drive-app#getFolderById(String)) | [Folder](#folder) | Completed | |
| [getFolders()](https://developers.google.com/apps-script/reference/drive/drive-app#getFolders()) | [FolderIterator](#folderiterator) | Completed | |
| [getFoldersByName(name)](https://developers.google.com/apps-script/reference/drive/drive-app#getFoldersByName(String)) | [FolderIterator](#folderiterator) | Completed | |
| [getRootFolder()](https://developers.google.com/apps-script/reference/drive/drive-app#getRootFolder()) | [Folder](#folder) | Completed | |
| [getStorageLimit()](https://developers.google.com/apps-script/reference/drive/drive-app#getStorageLimit()) | Integer | Completed | |
| [getStorageUsed()](https://developers.google.com/apps-script/reference/drive/drive-app#getStorageUsed()) | Integer | Completed | |
| [getTrashedFiles()](https://developers.google.com/apps-script/reference/drive/drive-app#getTrashedFiles()) | [FileIterator](#fileiterator) | Completed | |
| [getTrashedFolders()](https://developers.google.com/apps-script/reference/drive/drive-app#getTrashedFolders()) | [FolderIterator](#folderiterator) | Completed | |
| [removeFile(child)](https://developers.google.com/apps-script/reference/drive/drive-app#removeFile(File)) | [Folder](#folder) | Completed | |
| [removeFolder(child)](https://developers.google.com/apps-script/reference/drive/drive-app#removeFolder(Folder)) | [Folder](#folder) | Completed | |
| [searchFiles(params)](https://developers.google.com/apps-script/reference/drive/drive-app#searchFiles(String)) | [FileIterator](#fileiterator) | Completed | |
| [searchFolders(params)](https://developers.google.com/apps-script/reference/drive/drive-app#searchFolders(String)) | [FolderIterator](#folderiterator) | Completed | |
| [setSharing(file, access, permission)](https://developers.google.com/apps-script/reference/drive/drive-app#setSharing(File,Access,Permission)) | [File](#file) | Not Started | |
| [setSharing(id, access, permission)](https://developers.google.com/apps-script/reference/drive/drive-app#setSharing(String,Access,Permission)) | [File](#file) | Not Started | |
---
## [File](https://developers.google.com/apps-script/reference/drive/file)
A file in Google Drive.

67% completed

| method | return | status | comments |
|---|---|---|---|
| [addCommenter(emailAddress)](https://developers.google.com/apps-script/reference/drive/file#addCommenter(String)) | [File](#file) | Not Started | |
| [addCommenter(user)](https://developers.google.com/apps-script/reference/drive/file#addCommenter(User)) | [File](#file) | Not Started | |
| [addCommenters(emailAddresses)](https://developers.google.com/apps-script/reference/drive/file#addCommenters(String[])) | [File](#file) | Not Started | |
| [addEditor(emailAddress)](https://developers.google.com/apps-script/reference/drive/file#addEditor(String)) | [File](#file) | Completed | |
| [addEditor(user)](https://developers.google.com/apps-script/reference/drive/file#addEditor(User)) | [File](#file) | Completed | |
| [addEditors(emailAddresses)](https://developers.google.com/apps-script/reference/drive/file#addEditors(String[])) | [File](#file) | Completed | |
| [addViewer(emailAddress)](https://developers.google.com/apps-script/reference/drive/file#addViewer(String)) | [File](#file) | Completed | |
| [addViewer(user)](https://developers.google.com/apps-script/reference/drive/file#addViewer(User)) | [File](#file) | Completed | |
| [addViewers(emailAddresses)](https://developers.google.com/apps-script/reference/drive/file#addViewers(String[])) | [File](#file) | Completed | |
| [getAccess(emailAddress)](https://developers.google.com/apps-script/reference/drive/file#getAccess(String)) | [Permission](#permission) | Not Started | |
| [getAccess(user)](https://developers.google.com/apps-script/reference/drive/file#getAccess(User)) | [Permission](#permission) | Not Started | |
| [getAs(contentType)](https://developers.google.com/apps-script/reference/drive/file#getAs(String)) | [Blob](https://developers.google.com/apps-script/reference/base/blob) | Completed | |
| [getBlob()](https://developers.google.com/apps-script/reference/drive/file#getBlob()) | [Blob](https://developers.google.com/apps-script/reference/base/blob) | Completed | |
| [getDateCreated()](https://developers.google.com/apps-script/reference/drive/file#getDateCreated()) | [Date](https://developers.google.com/apps-script/reference/base/date) | Completed | |
| [getDescription()](https://developers.google.com/apps-script/reference/drive/file#getDescription()) | String | Completed | |
| [getDownloadUrl()](https://developers.google.com/apps-script/reference/drive/file#getDownloadUrl()) | String | Completed | |
| [getEditors()](https://developers.google.com/apps-script/reference/drive/file#getEditors()) | [User[]](#user) | Completed | |
| [getId()](https://developers.google.com/apps-script/reference/drive/file#getId()) | String | Completed | |
| [getLastUpdated()](https://developers.google.com/apps-script/reference/drive/file#getLastUpdated()) | [Date](https://developers.google.com/apps-script/reference/base/date) | Completed | |
| [getMimeType()](https://developers.google.com/apps-script/reference/drive/file#getMimeType()) | String | Completed | |
| [getName()](https://developers.google.com/apps-script/reference/drive/file#getName()) | String | Completed | |
| [getOwner()](https://developers.google.com/apps-script/reference/drive/file#getOwner()) | [User](#user) | Completed | |
| [getParents()](https://developers.google.com/apps-script/reference/drive/file#getParents()) | [FolderIterator](#folderiterator) | Completed | |
| [getPermission(emailAddress)](https://developers.google.com/apps-script/reference/drive/file#getPermission(String)) | [Permission](#permission) | Not Started | |
| [getPermission(user)](https://developers.google.com/apps-script/reference/drive/file#getPermission(User)) | [Permission](#permission) | Not Started | |
| [getSharingAccess()](https://developers.google.com/apps-script/reference/drive/file#getSharingAccess()) | [Access](#access) | Not Started | |
| [getSharingPermission()](https://developers.google.com/apps-script/reference/drive/file#getSharingPermission()) | [Permission](#permission) | Not Started | |
| [getSize()](https://developers.google.com/apps-script/reference/drive/file#getSize()) | Integer | Completed | |
| [getThumbnail()](https://developers.google.com/apps-script/reference/drive/file#getThumbnail()) | [Blob](https://developers.google.com/apps-script/reference/base/blob) | Completed | |
| [getUrl()](https://developers.google.com/apps-script/reference/drive/file#getUrl()) | String | Completed | |
| [getViewers()](https://developers.google.com/apps-script/reference/drive/file#getViewers()) | [User[]](#user) | Completed | |
| [isShareableByEditors()](https://developers.google.com/apps-script/reference/drive/file#isShareableByEditors()) | Boolean | Not Started | |
| [isStarred()](https://developers.google.com/apps-script/reference/drive/file#isStarred()) | Boolean | Completed | |
| [isTrashed()](https://developers.google.com/apps-script/reference/drive/file#isTrashed()) | Boolean | Completed | |
| [makeCopy()](https://developers.google.com/apps-script/reference/drive/file#makeCopy()) | [File](#file) | Completed | |
| [makeCopy(destination)](https://developers.google.com/apps-script/reference/drive/file#makeCopy(Folder)) | [File](#file) | Completed | |
| [makeCopy(name)](https://developers.google.com/apps-script/reference/drive/file#makeCopy(String)) | [File](#file) | Completed | |
| [makeCopy(name, destination)](https://developers.google.com/apps-script/reference/drive/file#makeCopy(String,Folder)) | [File](#file) | Completed | |
| [removeCommenter(emailAddress)](https://developers.google.com/apps-script/reference/drive/file#removeCommenter(String)) | [File](#file) | Not Started | |
| [removeCommenter(user)](https://developers.google.com/apps-script/reference/drive/file#removeCommenter(User)) | [File](#file) | Not Started | |
| [removeEditor(emailAddress)](https://developers.google.com/apps-script/reference/drive/file#removeEditor(String)) | [File](#file) | Completed | |
| [removeEditor(user)](https://developers.google.com/apps-script/reference/drive/file#removeEditor(User)) | [File](#file) | Completed | |
| [removeViewer(emailAddress)](https://developers.google.com/apps-script/reference/drive/file#removeViewer(String)) | [File](#file) | Completed | |
| [removeViewer(user)](https://developers.google.com/apps-script/reference/drive/file#removeViewer(User)) | [File](#file) | Completed | |
| [revokePermissions(user)](https://developers.google.com/apps-script/reference/drive/file#revokePermissions(User)) | [File](#file) | Not Started | |
| [setContent(content)](https://developers.google.com/apps-script/reference/drive/file#setContent(String)) | [File](#file) | Completed | |
| [setDescription(description)](https://developers.google.com/apps-script/reference/drive/file#setDescription(String)) | [File](#file) | Completed | |
| [setName(name)](https://developers.google.com/apps-script/reference/drive/file#setName(String)) | [File](#file) | Completed | |
| [setOwner(emailAddress)](https://developers.google.com/apps-script/reference/drive/file#setOwner(String)) | [File](#file) | Completed | |
| [setOwner(user)](https://developers.google.com/apps-script/reference/drive/file#setOwner(User)) | [File](#file) | Completed | |
| [setShareableByEditors(shareable)](https://developers.google.com/apps-script/reference/drive/file#setShareableByEditors(Boolean)) | [File](#file) | Not Started | |
| [setSharing(accessType, permissionType)](https://developers.google.com/apps-script/reference/drive/file#setSharing(Access,Permission)) | [File](#file) | Not Started | |
| [setStarred(starred)](https://developers.google.com/apps-script/reference/drive/file#setStarred(Boolean)) | [File](#file) | Completed | |
| [setTrashed(trashed)](https://developers.google.com/apps-script/reference/drive/file#setTrashed(Boolean)) | [File](#file) | Completed | |
---
## [FileIterator](https://developers.google.com/apps-script/reference/drive/file-iterator)
An iterator that allows scripts to iterate over a collection of files.

100% completed

| method | return | status | comments |
|---|---|---|---|
| [getContinuationToken()](https://developers.google.com/apps-script/reference/drive/file-iterator#getContinuationToken()) | String | Completed | |
| [hasNext()](https://developers.google.com/apps-script/reference/drive/file-iterator#hasNext()) | Boolean | Completed | |
| [next()](https://developers.google.com/apps-script/reference/drive/file-iterator#next()) | [File](#file) | Completed | |
---
## [Folder](https://developers.google.com/apps-script/reference/drive/folder)
A folder in Google Drive.

82% completed

| method | return | status | comments |
|---|---|---|---|
| [addEditor(emailAddress)](https://developers.google.com/apps-script/reference/drive/folder#addEditor(String)) | [Folder](#folder) | Completed | |
| [addEditor(user)](https://developers.google.com/apps-script/reference/drive/folder#addEditor(User)) | [Folder](#folder) | Completed | |
| [addEditors(emailAddresses)](https://developers.google.com/apps-script/reference/drive/folder#addEditors(String[])) | [Folder](#folder) | Completed | |
| [addFile(child)](https://developers.google.com/apps-script/reference/drive/folder#addFile(File)) | [Folder](#folder) | Completed | |
| [addFolder(child)](https://developers.google.com/apps-script/reference/drive/folder#addFolder(Folder)) | [Folder](#folder) | Completed | |
| [addViewer(emailAddress)](https://developers.google.com/apps-script/reference/drive/folder#addViewer(String)) | [Folder](#folder) | Completed | |
| [addViewer(user)](https://developers.google.com/apps-script/reference/drive/folder#addViewer(User)) | [Folder](#folder) | Completed | |
| [addViewers(emailAddresses)](https://developers.google.com/apps-script/reference/drive/folder#addViewers(String[])) | [Folder](#folder) | Completed | |
| [createFile(blob)](https://developers.google.com/apps-script/reference/drive/folder#createFile(BlobSource)) | [File](#file) | Completed | |
| [createFile(name, content)](https://developers.google.com/apps-script/reference/drive/folder#createFile(String,String)) | [File](#file) | Completed | |
| [createFile(name, content, mimeType)](https://developers.google.com/apps-script/reference/drive/folder#createFile(String,String,String)) | [File](#file) | Completed | |
| [createFolder(name)](https://developers.google.com/apps-script/reference/drive/folder#createFolder(String)) | [Folder](#folder) | Completed | |
| [getAccess(emailAddress)](https://developers.google.com/apps-script/reference/drive/folder#getAccess(String)) | [Permission](#permission) | Not Started | |
| [getAccess(user)](https://developers.google.com/apps-script/reference/drive/folder#getAccess(User)) | [Permission](#permission) | Not Started | |
| [getDateCreated()](https://developers.google.com/apps-script/reference/drive/folder#getDateCreated()) | [Date](https://developers.google.com/apps-script/reference/base/date) | Completed | |
| [getDescription()](https://developers.google.com/apps-script/reference/drive/folder#getDescription()) | String | Completed | |
| [getEditors()](https://developers.google.com/apps-script/reference/drive/folder#getEditors()) | [User[]](#user) | Completed | |
| [getFiles()](https://developers.google.com/apps-script/reference/drive/folder#getFiles()) | [FileIterator](#fileiterator) | Completed | |
| [getFilesByName(name)](https://developers.google.com/apps-script/reference/drive/folder#getFilesByName(String)) | [FileIterator](#fileiterator) | Completed | |
| [getFilesByType(mimeType)](https://developers.google.com/apps-script/reference/drive/folder#getFilesByType(String)) | [FileIterator](#fileiterator) | Completed | |
| [getFolders()](https://developers.google.com/apps-script/reference/drive/folder#getFolders()) | [FolderIterator](#folderiterator) | Completed | |
| [getFoldersByName(name)](https://developers.google.com/apps-script/reference/drive/folder#getFoldersByName(String)) | [FolderIterator](#folderiterator) | Completed | |
| [getId()](https://developers.google.com/apps-script/reference/drive/folder#getId()) | String | Completed | |
| [getLastUpdated()](https://developers.google.com/apps-script/reference/drive/folder#getLastUpdated()) | [Date](https://developers.google.com/apps-script/reference/base/date) | Completed | |
| [getName()](https://developers.google.com/apps-script/reference/drive/folder#getName()) | String | Completed | |
| [getOwner()](https://developers.google.com/apps-script/reference/drive/folder#getOwner()) | [User](#user) | Completed | |
| [getParents()](https://developers.google.com/apps-script/reference/drive/folder#getParents()) | [FolderIterator](#folderiterator) | Completed | |
| [getPermission(emailAddress)](https://developers.google.com/apps-script/reference/drive/folder#getPermission(String)) | [Permission](#permission) | Not Started | |
| [getPermission(user)](https://developers.google.com/apps-script/reference/drive/folder#getPermission(User)) | [Permission](#permission) | Not Started | |
| [getSharingAccess()](https://developers.google.com/apps-script/reference/drive/folder#getSharingAccess()) | [Access](#access) | Not Started | |
| [getSharingPermission()](https://developers.google.com/apps-script/reference/drive/folder#getSharingPermission()) | [Permission](#permission) | Not Started | |
| [getSize()](https://developers.google.com/apps-script/reference/drive/folder#getSize()) | Integer | Completed | |
| [getUrl()](https://developers.google.com/apps-script/reference/drive/folder#getUrl()) | String | Completed | |
| [getViewers()](https://developers.google.com/apps-script/reference/drive/folder#getViewers()) | [User[]](#user) | Completed | |
| [isShareableByEditors()](https://developers.google.com/apps-script/reference/drive/folder#isShareableByEditors()) | Boolean | Not Started | |
| [isStarred()](https://developers.google.com/apps-script/reference/drive/folder#isStarred()) | Boolean | Completed | |
| [isTrashed()](https://developers.google.com/apps-script/reference/drive/folder#isTrashed()) | Boolean | Completed | |
| [removeEditor(emailAddress)](https://developers.google.com/apps-script/reference/drive/folder#removeEditor(String)) | [Folder](#folder) | Completed | |
| [removeEditor(user)](https://developers.google.com/apps-script/reference/drive/folder#removeEditor(User)) | [Folder](#folder) | Completed | |
| [removeFile(child)](https://developers.google.com/apps-script/reference/drive/folder#removeFile(File)) | [Folder](#folder) | Completed | |
| [removeFolder(child)](https://developers.google.com/apps-script/reference/drive/folder#removeFolder(Folder)) | [Folder](#folder) | Completed | |
| [removeViewer(emailAddress)](https://developers.google.com/apps-script/reference/drive/folder#removeViewer(String)) | [Folder](#folder) | Completed | |
| [removeViewer(user)](https://developers.google.com/apps-script/reference/drive/folder#removeViewer(User)) | [Folder](#folder) | Completed | |
| [revokePermissions(user)](https://developers.google.com/apps-script/reference/drive/folder#revokePermissions(User)) | [Folder](#folder) | Not Started | |
| [searchFiles(params)](https://developers.google.com/apps-script/reference/drive/folder#searchFiles(String)) | [FileIterator](#fileiterator) | Completed | |
| [searchFolders(params)](https://developers.google.com/apps-script/reference/drive/folder#searchFolders(String)) | [FolderIterator](#folderiterator) | Completed | |
| [setDescription(description)](https://developers.google.com/apps-script/reference/drive/folder#setDescription(String)) | [Folder](#folder) | Completed | |
| [setName(name)](https://developers.google.com/apps-script/reference/drive/folder#setName(String)) | [Folder](#folder) | Completed | |
| [setOwner(emailAddress)](https://developers.google.com/apps-script/reference/drive/folder#setOwner(String)) | [Folder](#folder) | Completed | |
| [setOwner(user)](https://developers.google.com/apps-script/reference/drive/folder#setOwner(User)) | [Folder](#folder) | Completed | |
| [setShareableByEditors(shareable)](https://developers.google.com/apps-script/reference/drive/folder#setShareableByEditors(Boolean)) | [Folder](#folder) | Not Started | |
| [setSharing(accessType, permissionType)](https://developers.google.com/apps-script/reference/drive/folder#setSharing(Access,Permission)) | [Folder](#folder) | Not Started | |
| [setStarred(starred)](https://developers.google.com/apps-script/reference/drive/folder#setStarred(Boolean)) | [Folder](#folder) | Completed | |
| [setTrashed(trashed)](https://developers.google.com/apps-script/reference/drive/folder#setTrashed(Boolean)) | [Folder](#folder) | Completed | |
---
## [FolderIterator](https://developers.google.com/apps-script/reference/drive/folder-iterator)
An iterator that allows scripts to iterate over a collection of folders.

100% completed

| method | return | status | comments |
|---|---|---|---|
| [getContinuationToken()](https://developers.google.com/apps-script/reference/drive/folder-iterator#getContinuationToken()) | String | Completed | |
| [hasNext()](https://developers.google.com/apps-script/reference/drive/folder-iterator#hasNext()) | Boolean | Completed | |
| [next()](https://developers.google.com/apps-script/reference/drive/folder-iterator#next()) | [Folder](#folder) | Completed | |
---
## [Permission](https://developers.google.com/apps-script/reference/drive/permission)
An enum representing the permissions for a file or folder.

100% completed

| method | return | status | comments |
|---|---|---|---|
| COMMENT | [Permission](#permission) | Completed | |
| EDIT | [Permission](#permission) | Completed | |
| NONE | [Permission](#permission) | Completed | |
| OWNER | [Permission](#permission) | Completed | |
| VIEW | [Permission](#permission) | Completed | |
---
## [User](https://developers.google.com/apps-script/reference/drive/user)
A user associated with a file in Google Drive.

80% completed

| method | return | status | comments |
|---|---|---|---|
| [getDomain()](https://developers.google.com/apps-script/reference/drive/user#getDomain()) | String | Completed | |
| [getEmail()](https://developers.google.com/apps-script/reference/drive/user#getEmail()) | String | Completed | |
| [getName()](https://developers.google.com/apps-script/reference/drive/user#getName()) | String | Completed | |
| [getPhotoUrl()](https://developers.google.com/apps-script/reference/drive/user#getPhotoUrl()) | String | Completed | |
| [getUserLoginId()](https://developers.google.com/apps-script/reference/drive/user#getUserLoginId()) | String | Not Started | |