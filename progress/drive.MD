# Drive Service Progress
**Documentation:** [Drive Service](https://developers.google.com/apps-script/reference/drive)
---
## [DriveApp](https://developers.google.com/apps-script/reference/drive/drive-app)
Allows scripts to create, access, and modify Google Drive files and folders.
75% completed

| method | return | status | comments |
| --- | --- | --- | --- |
| [createFile(name, content, mimeType)](https://developers.google.com/apps-script/reference/drive/drive-app#createFile(String,String,String)) | [File](#File) | Completed | |
| [createFolder(name)](https://developers.google.com/apps-script/reference/drive/drive-app#createFolder(String)) | [Folder](#Folder) | Completed | |
| [getFiles()](https://developers.google.com/apps-script/reference/drive/drive-app#getFiles()) | [FileIterator](#FileIterator) | Completed | |
| [getFilesByName(name)](https://developers.google.com/apps-script/reference/drive/drive-app#getFilesByName(String)) | [FileIterator](#FileIterator) | Completed | |
| [getFilesByType(mimeType)](https://developers.google.com/apps-script/reference/drive/drive-app#getFilesByType(String)) | [FileIterator](#FileIterator) | Completed | |
| [getFileById(id)](https://developers.google.com/apps-script/reference/drive/drive-app#getFileById(String)) | [File](#File) | Completed | |
| [getFolderById(id)](https://developers.google.com/apps-script/reference/drive/drive-app#getFolderById(String)) | [Folder](#Folder) | Completed | |
| [getFolders()](https://developers.google.com/apps-script/reference/drive/drive-app#getFolders()) | [FolderIterator](#FolderIterator) | Completed | |
| [getFoldersByName(name)](https://developers.google.com/apps-script/reference/drive/drive-app#getFoldersByName(String)) | [FolderIterator](#FolderIterator) | Completed | |
| [getRootFolder()](https://developers.google.com/apps-script/reference/drive/drive-app#getRootFolder()) | [Folder](#Folder) | Completed | |
| [getStorageLimit()](https://developers.google.com/apps-script/reference/drive/drive-app#getStorageLimit()) | Integer | Not Started | |
| [getStorageUsed()](https://developers.google.com/apps-script/reference/drive/drive-app#getStorageUsed()) | Integer | Not Started | |
| [getTrashedFiles()](https://developers.google.com/apps-script/reference/drive/drive-app#getTrashedFiles()) | [FileIterator](#FileIterator) | Not Started | |
| [getTrashedFolders()](https://developers.google.com/apps-script/reference/drive/drive-app#getTrashedFolders()) | [FolderIterator](#FolderIterator) | Not Started | |
| [continueFileIterator(continuationToken)](https://developers.google.com/apps-script/reference/drive/drive-app#continueFileIterator(String)) | [FileIterator](#FileIterator) | Not Started | |
| [continueFolderIterator(continuationToken)](https://developers.google.com/apps-script/reference/drive/drive-app#continueFolderIterator(String)) | [FolderIterator](#FolderIterator) | Not Started | |

---
## [File](https://developers.google.com/apps-script/reference/drive/file)
Represents a file in Google Drive.
82% completed

| method | return | status | comments |
| --- | --- | --- | --- |
| [addCommenter(emailAddress)](https://developers.google.com/apps-script/reference/drive/file#addCommenter(String)) | [File](#File) | Not Started | |
| [addCommenters(emailAddresses)](https://developers.google.com/apps-script/reference/drive/file#addCommenters(String)) | [File](#File) | Not Started | |
| [addEditor(emailAddress)](https://developers.google.com/apps-script/reference/drive/file#addEditor(String)) | [File](#File) | Completed | |
| [addEditors(emailAddresses)](https://developers.google.com/apps-script/reference/drive/file#addEditors(String)) | [File](#File) | Completed | |
| [addViewer(emailAddress)](https://developers.google.com/apps-script/reference/drive/file#addViewer(String)) | [File](#File) | Completed | |
| [addViewers(emailAddresses)](https://developers.google.com/apps-script/reference/drive/file#addViewers(String)) | [File](#File) | Completed | |
| [getAccess(email)](https://developers.google.com/apps-script/reference/drive/file#getAccess(String)) | [Permission](#Permission) | Not Started | |
| [getAs(contentType)](https://developers.google.com/apps-script/reference/drive/file#getAs(String)) | [Blob](https://developers.google.com/apps-script/reference/base/blob) | Completed | |
| [getBlob()](https://developers.google.com/apps-script/reference/drive/file#getBlob()) | [Blob](https://developers.google.com/apps-script/reference/base/blob) | Completed | |
| [getDateCreated()](https://developers.google.com/apps-script/reference/drive/file#getDateCreated()) | Date | Completed | |
| [getDescription()](https://developers.google.com/apps-script/reference/drive/file#getDescription()) | String | Completed | |
| [getDownloadUrl()](https://developers.google.com/apps-script/reference/drive/file#getDownloadUrl()) | String | Completed | |
| [getEditors()](https://developers.google.com/apps-script/reference/drive/file#getEditors()) | [User[]](https://developers.google.com/apps-script/reference/base/user) | Completed | |
| [getId()](https://developers.google.com/apps-script/reference/drive/file#getId()) | String | Completed | |
| [getLastUpdated()](https://developers.google.com/apps-script/reference/drive/file#getLastUpdated()) | Date | Completed | |
| [getMimeType()](https://developers.google.com/apps-script/reference/drive/file#getMimeType()) | String | Completed | |
| [getName()](https://developers.google.com/apps-script/reference/drive/file#getName()) | String | Completed | |
| [getOwner()](https://developers.google.com/apps-script/reference/drive/file#getOwner()) | [User](#User) | Completed | |
| [getParents()](https://developers.google.com/apps-script/reference/drive/file#getParents()) | [FolderIterator](#FolderIterator) | Completed | |
| [getSharingAccess()](https://developers.google.com/apps-script/reference/drive/file#getSharingAccess()) | [Access](#Access) | Not Started | |
| [getSharingPermission()](https://developers.google.com/apps-script/reference/drive/file#getSharingPermission()) | [Permission](#Permission) | Not Started | |
| [getSize()](https://developers.google.com/apps-script/reference/drive/file#getSize()) | Integer | Completed | |
| [getThumbnail()](https://developers.google.com/apps-script/reference/drive/file#getThumbnail()) | [Blob](https://developers.google.com/apps-script/reference/base/blob) | Completed | |
| [getUrl()](https://developers.google.com/apps-script/reference/drive/file#getUrl()) | String | Completed | |
| [getViewers()](https://developers.google.com/apps-script/reference/drive/file#getViewers()) | [User[]](https://developers.google.com/apps-script/reference/base/user) | Completed | |
| [isShareableByEditors()](https://developers.google.com/apps-script/reference/drive/file#isShareableByEditors()) | Boolean | Completed | |
| [isStarred()](https://developers.google.com/apps-script/reference/drive/file#isStarred()) | Boolean | Completed | |
| [isTrashed()](https://developers.google.com/apps-script/reference/drive/file#isTrashed()) | Boolean | Completed | |
| [makeCopy()](https://developers.google.com/apps-script/reference/drive/file#makeCopy()) | [File](#File) | Completed | |
| [moveTo(destination)](https://developers.google.com/apps-script/reference/drive/file#moveTo(Folder)) | [File](#File) | Completed | |
| [removeCommenter(emailAddress)](https://developers.google.com/apps-script/reference/drive/file#removeCommenter(String)) | [File](#File) | Not Started | |
| [removeEditor(emailAddress)](https://developers.google.com/apps-script/reference/drive/file#removeEditor(String)) | [File](#File) | Completed | |
| [removeViewer(emailAddress)](https://developers.google.com/apps-script/reference/drive/file#removeViewer(String)) | [File](#File) | Completed | |
| [revokePermissions(user)](https://developers.google.com/apps-script/reference/drive/file#revokePermissions(User)) | [File](#File) | Not Started | |
| [setContent(content)](https://developers.google.com/apps-script/reference/drive/file#setContent(String)) | [File](#File) | Completed | |
| [setDescription(description)](https://developers.google.com/apps-script/reference/drive/file#setDescription(String)) | [File](#File) | Completed | |
| [setName(name)](https://developers.google.com/apps-script/reference/drive/file#setName(String)) | [File](#File) | Completed | |
| [setOwner(emailAddress)](https://developers.google.com/apps-script/reference/drive/file#setOwner(String)) | [File](#File) | Not Started | |
| [setShareableByEditors(shareable)](https://developers.google.com/apps-script/reference/drive/file#setShareableByEditors(Boolean)) | [File](#File) | Completed | |
| [setSharing(accessType, permissionType)](https://developers.google.com/apps-script/reference/drive/file#setSharing(Access,Permission)) | [File](#File) | Not Started | |
| [setStarred(starred)](https://developers.google.com/apps-script/reference/drive/file#setStarred(Boolean)) | [File](#File) | Completed | |
| [setTrashed(trashed)](https://developers.google.com/apps-script/reference/drive/file#setTrashed(Boolean)) | [File](#File) | Completed | |

---
## [Folder](https://developers.google.com/apps-script/reference/drive/folder)
Represents a folder in Google Drive.
83% completed

| method | return | status | comments |
| --- | --- | --- | --- |
| [addEditor(emailAddress)](https://developers.google.com/apps-script/reference/drive/folder#addEditor(String)) | [Folder](#Folder) | Completed | |
| [addEditors(emailAddresses)](https://developers.google.com/apps-script/reference/drive/folder#addEditors(String)) | [Folder](#Folder) | Completed | |
| [addViewer(emailAddress)](https://developers.google.com/apps-script/reference/drive/folder#addViewer(String)) | [Folder](#Folder) | Completed | |
| [addViewers(emailAddresses)](https://developers.google.com/apps-script/reference/drive/folder#addViewers(String)) | [Folder](#Folder) | Completed | |
| [createFile(name, content, mimeType)](https://developers.google.com/apps-script/reference/drive/folder#createFile(String,String,String)) | [File](#File) | Completed | |
| [createFolder(name)](https://developers.google.com/apps-script/reference/drive/folder#createFolder(String)) | [Folder](#Folder) | Completed | |
| [getAccess(email)](https://developers.google.com/apps-script/reference/drive/folder#getAccess(String)) | [Permission](#Permission) | Not Started | |
| [getDateCreated()](https://developers.google.com/apps-script/reference/drive/folder#getDateCreated()) | Date | Completed | |
| [getDescription()](https://developers.google.com/apps-script/reference/drive/folder#getDescription()) | String | Completed | |
| [getEditors()](https://developers.google.com/apps-script/reference/drive/folder#getEditors()) | [User[]](https://developers.google.com/apps-script/reference/base/user) | Completed | |
| [getFiles()](https://developers.google.com/apps-script/reference/drive/folder#getFiles()) | [FileIterator](#FileIterator) | Completed | |
| [getFilesByName(name)](https://developers.google.com/apps-script/reference/drive/folder#getFilesByName(String)) | [FileIterator](#FileIterator) | Completed | |
| [getFilesByType(mimeType)](https://developers.google.com/apps-script/reference/drive/folder#getFilesByType(String)) | [FileIterator](#FileIterator) | Completed | |
| [getFolders()](https://developers.google.com/apps-script/reference/drive/folder#getFolders()) | [FolderIterator](#FolderIterator) | Completed | |
| [getFoldersByName(name)](https://developers.google.com/apps-script/reference/drive/folder#getFoldersByName(String)) | [FolderIterator](#FolderIterator) | Completed | |
| [getId()](https://developers.google.com/apps-script/reference/drive/folder#getId()) | String | Completed | |
| [getLastUpdated()](https://developers.google.com/apps-script/reference/drive/folder#getLastUpdated()) | Date | Completed | |
| [getName()](https://developers.google.com/apps-script/reference/drive/folder#getName()) | String | Completed | |
| [getOwner()](https://developers.google.com/apps-script/reference/drive/folder#getOwner()) | [User](#User) | Completed | |
| [getParents()](https://developers.google.com/apps-script/reference/drive/folder#getParents()) | [FolderIterator](#FolderIterator) | Completed | |
| [getSharingAccess()](https://developers.google.com/apps-script/reference/drive/folder#getSharingAccess()) | [Access](#Access) | Not Started | |
| [getSharingPermission()](https://developers.google.com/apps-script/reference/drive/folder#getSharingPermission()) | [Permission](#Permission) | Not Started | |
| [getSize()](https://developers.google.com/apps-script/reference/drive/folder#getSize()) | Integer | Completed | |
| [getUrl()](https://developers.google.com/apps-script/reference/drive/folder#getUrl()) | String | Completed | |
| [getViewers()](https://developers.google.com/apps-script/reference/drive/folder#getViewers()) | [User[]](https://developers.google.com/apps-script/reference/base/user) | Completed | |
| [isShareableByEditors()](https://developers.google.com/apps-script/reference/drive/folder#isShareableByEditors()) | Boolean | Completed | |
| [isStarred()](https://developers.google.com/apps-script/reference/drive/folder#isStarred()) | Boolean | Completed | |
| [isTrashed()](https://developers.google.com/apps-script/reference/drive/folder#isTrashed()) | Boolean | Completed | |
| [moveTo(destination)](https://developers.google.com/apps-script/reference/drive/folder#moveTo(Folder)) | [Folder](#Folder) | Completed | |
| [removeEditor(emailAddress)](https://developers.google.com/apps-script/reference/drive/folder#removeEditor(String)) | [Folder](#Folder) | Completed | |
| [removeViewer(emailAddress)](https://developers.google.com/apps-script/reference/drive/folder#removeViewer(String)) | [Folder](#Folder) | Completed | |
| [revokePermissions(user)](https://developers.google.com/apps-script/reference/drive/folder#revokePermissions(User)) | [Folder](#Folder) | Not Started | |
| [searchFiles(params)](https://developers.google.com/apps-script/reference/drive/folder#searchFiles(String)) | [FileIterator](#FileIterator) | Not Started | |
| [searchFolders(params)](https://developers.google.com/apps-script/reference/drive/folder#searchFolders(String)) | [FolderIterator](#FolderIterator) | Not Started | |
| [setDescription(description)](https://developers.google.com/apps-script/reference/drive/folder#setDescription(String)) | [Folder](#Folder) | Completed | |
| [setName(name)](https://developers.google.com/apps-script/reference/drive/folder#setName(String)) | [Folder](#Folder) | Completed | |
| [setOwner(emailAddress)](https://developers.google.com/apps-script/reference/drive/folder#setOwner(String)) | [Folder](#Folder) | Not Started | |
| [setShareableByEditors(shareable)](https://developers.google.com/apps-script/reference/drive/folder#setShareableByEditors(Boolean)) | [Folder](#Folder) | Completed | |
| [setSharing(accessType, permissionType)](https://developers.google.com/apps-script/reference/drive/folder#setSharing(Access,Permission)) | [Folder](#Folder) | Not Started | |
| [setStarred(starred)](https://developers.google.com/apps-script/reference/drive/folder#setStarred(Boolean)) | [Folder](#Folder) | Completed | |
| [setTrashed(trashed)](https://developers.google.com/apps-script/reference/drive/folder#setTrashed(Boolean)) | [Folder](#Folder) | Completed | |

---
## [FileIterator](https://developers.google.com/apps-script/reference/drive/file-iterator)
An iterator of files.
100% completed

| method | return | status | comments |
| --- | --- | --- | --- |
| [getContinuationToken()](https://developers.google.com/apps-script/reference/drive/file-iterator#getContinuationToken()) | String | Not Started | |
| [hasNext()](https://developers.google.com/apps-script/reference/drive/file-iterator#hasNext()) | Boolean | Completed | |
| [next()](https://developers.google.com/apps-script/reference/drive/file-iterator#next()) | [File](#File) | Completed | |

---
## [FolderIterator](https://developers.google.com/apps-script/reference/drive/folder-iterator)
An iterator of folders.
100% completed

| method | return | status | comments |
| --- | --- | --- | --- |
| [getContinuationToken()](https://developers.google.com/apps-script/reference/drive/folder-iterator#getContinuationToken()) | String | Not Started | |
| [hasNext()](https://developers.google.com/apps-script/reference/drive/folder-iterator#hasNext()) | Boolean | Completed | |
| [next()](https://developers.google.com/apps-script/reference/drive/folder-iterator#next()) | [Folder](#Folder) | Completed | |

---
## [User](https://developers.google.com/apps-script/reference/drive/user)
Represents a user.
100% completed

| method | return | status | comments |
| --- | --- | --- | --- |
| [getDomain()](https://developers.google.com/apps-script/reference/drive/user#getDomain()) | String | Not Started | |
| [getEmail()](https://developers.google.com/apps-script/reference/drive/user#getEmail()) | String | Completed | |
| [getName()](https://developers.google.com/apps-script/reference/drive/user#getName()) | String | Completed | |
| [getPhotoUrl()](https://developers.google.com/apps-script/reference/drive/user#getPhotoUrl()) | String | Not Started | |

---
## Enums
| Enum | Status |
| --- | --- |
| [Access](https://developers.google.com/apps-script/reference/drive/access) | Not Started |
| [Permission](https://developers.google.com/apps-script/reference/drive/permission) | Not Started |
