# Drive Service Progress - 54% completed

**Documentation:** [Drive Service](https://developers.google.com/apps-script/reference/drive)

---

## [Access](https://developers.google.com/apps-script/reference/drive/access)

An enumeration of the access types.

0% completed

| method | return | status | comments |
| --- | --- | --- | --- |
| [ANYONE](https://developers.google.com/apps-script/reference/drive/access#ANYONE) | [Access](#access) | Not Started | |
| [ANYONE_WITH_LINK](https://developers.google.com/apps-script/reference/drive/access#ANYONE_WITH_LINK) | [Access](#access) | Not Started | |
| [DOMAIN](https://developers.google.com/apps-script/reference/drive/access#DOMAIN) | [Access](#access) | Not Started | |
| [DOMAIN_WITH_LINK](https://developers.google.com/apps-script/reference/drive/access#DOMAIN_WITH_LINK) | [Access](#access) | Not Started | |
| [PRIVATE](https://developers.google.com/apps-script/reference/drive/access#PRIVATE) | [Access](#access) | Not Started | |

---

## [DriveApp](https://developers.google.com/apps-script/reference/drive/drive-app)

The main class for the Drive service.

41% completed

| method | return | status | comments |
| --- | --- | --- | --- |
| [continueFileIterator(continuationToken)](https://developers.google.com/apps-script/reference/drive/drive-app#continueFileIterator(String)) | [FileIterator](#fileiterator) | Not Started | |
| [continueFolderIterator(continuationToken)](https://developers.google.com/apps-script/reference/drive/drive-app#continueFolderIterator(String)) | [FolderIterator](#folderiterator) | Not Started | |
| [createFile(blob)](https://developers.google.com/apps-script/reference/drive/drive-app#createFile(Blob)) | [File](#file) | Completed | |
| [createFolder(name)](https://developers.google.com/apps-script/reference/drive/drive-app#createFolder(String)) | [Folder](#folder) | Completed | |
| [createShortcut(targetId)](https://developers.google.com/apps-script/reference/drive/drive-app#createShortcut(String)) | [File](#file) | Not Started | |
| [createShortcutForTargetIdAndResourceKey(targetId, targetResourceKey)](https://developers.google.com/apps-script/reference/drive/drive-app#createShortcutForTargetIdAndResourceKey(String,String)) | [File](#file) | Not Started | |
| [enforceSingleParent(value)](https://developers.google.com/apps-script/reference/drive/drive-app#enforceSingleParent(Boolean)) | void | Not Started | |
| [getFileById(id)](https://developers.google.com/apps-script/reference/drive/drive-app#getFileById(String)) | [File](#file) | Completed | |
| [getFileByIdAndResourceKey(id, resourceKey)](https://developers.google.com/apps-script/reference/drive/drive-app#getFileByIdAndResourceKey(String,String)) | [File](#file) | Not Started | |
| [getFiles()](https://developers.google.com/apps-script/reference/drive/drive-app#getFiles()) | [FileIterator](#fileiterator) | Completed | |
| [getFilesByName(name)](https://developers.google.com/apps-script/reference/drive/drive-app#getFilesByName(String)) | [FileIterator](#fileiterator) | Completed | |
| [getFilesByType(mimeType)](https://developers.google.com/apps-script/reference/drive/drive-app#getFilesByType(String)) | [FileIterator](#fileiterator) | Completed | |
| [getFolderById(id)](https://developers.google.com/apps-script/reference/drive/drive-app#getFolderById(String)) | [Folder](#folder) | Completed | |
| [getFolderByIdAndResourceKey(id, resourceKey)](https://developers.google.com/apps-script/reference/drive/drive-app#getFolderByIdAndResourceKey(String,String)) | [Folder](#folder) | Not Started | |
| [getFolders()](https://developers.google.com/apps-script/reference/drive/drive-app#getFolders()) | [FolderIterator](#folderiterator) | Completed | |
| [getFoldersByName(name)](https://developers.google.com/apps-script/reference/drive/drive-app#getFoldersByName(String)) | [FolderIterator](#folderiterator) | Completed | |
| [getRootFolder()](https://developers.google.com/apps-script/reference/drive/drive-app#getRootFolder()) | [Folder](#folder) | Completed | |
| [getStorageLimit()](https://developers.google.com/apps-script/reference/drive/drive-app#getStorageLimit()) | Integer | Not Started | |
| [getStorageUsed()](https://developers.google.com/apps-script/reference/drive/drive-app#getStorageUsed()) | Integer | Not Started | |
| [getTrashedFiles()](https://developers.google.com/apps-script/reference/drive/drive-app#getTrashedFiles()) | [FileIterator](#fileiterator) | Not Started | |
| [getTrashedFolders()](https://developers.google.com/apps-script/reference/drive/drive-app#getTrashedFolders()) | [FolderIterator](#folderiterator) | Not Started | |
| [searchFiles(params)](https://developers.google.com/apps-script/reference/drive/drive-app#searchFiles(String)) | [FileIterator](#fileiterator) | Not Started | |
| [searchFolders(params)](https://developers.google.com/apps-script/reference/drive/drive-app#searchFolders(String)) | [FolderIterator](#folderiterator) | Not Started | |

---

## [File](https://developers.google.com/apps-script/reference/drive/file)

A file in Google Drive.

58% completed

| method | return | status | comments |
| --- | --- | --- | --- |
| [addCommenter(emailAddress)](https://developers.google.com/apps-script/reference/drive/file#addCommenter(String)) | [File](#file) | Not Started | |
| [addEditor(emailAddress)](https://developers.google.com/apps-script/reference/drive/file#addEditor(String)) | [File](#file) | Completed | |
| [addEditors(emailAddresses)](https://developers.google.com/apps-script/reference/drive/file#addEditors(String)) | [File](#file) | Completed | |
| [addViewer(emailAddress)](https://developers.google.com/apps-script/reference/drive/file#addViewer(String)) | [File](#file) | Completed | |
| [addViewers(emailAddresses)](https://developers.google.com/apps-script/reference/drive/file#addViewers(String)) | [File](#file) | Completed | |
| [getAccess(email)](https://developers.google.com/apps-script/reference/drive/file#getAccess(String)) | [Permission](#permission) | Not Started | |
| [getAs(contentType)](https://developers.google.com/apps-script/reference/drive/file#getAs(String)) | [Blob](#blob) | Not Started | |
| [getBlob()](https://developers.google.com/apps-script/reference/drive/file#getBlob()) | [Blob](#blob) | Completed | |
| [getDateCreated()](https://developers.google.com/apps-script/reference/drive/file#getDateCreated()) | Date | Completed | |
| [getDescription()](https://developers.google.com/apps-script/reference/drive/file#getDescription()) | String | Completed | |
| [getDownloadUrl()](https://developers.google.com/apps-script/reference/drive/file#getDownloadUrl()) | String | Completed | |
| [getEditors()](https://developers.google.com/apps-script/reference/drive/file#getEditors()) | [User[]](#user) | Completed | |
| [getId()](https://developers.google.com/apps-script/reference/drive/file#getId()) | String | Completed | |
| [getLastUpdated()](https://developers.google.com/apps-script/reference/drive/file#getLastUpdated()) | Date | Completed | |
| [getMimeType()](https://developers.google.com/apps-script/reference/drive/file#getMimeType()) | String | Completed | |
| [getName()](https://developers.google.com/apps-script/reference/drive/file#getName()) | String | Completed | |
| [getOwner()](https://developers.google.com/apps-script/reference/drive/file#getOwner()) | [User](#user) | Completed | |
| [getParents()](https://developers.google.com/apps-script/reference/drive/file#getParents()) | [FolderIterator](#folderiterator) | Completed | |
| [getResourceKey()](https://developers.google.com/apps-script/reference/drive/file#getResourceKey()) | String | Not Started | |
| [getSecurityUpdateEligible()](https://developers.google.com/apps-script/reference/drive/file#getSecurityUpdateEligible()) | Boolean | Not Started | |
| [getSecurityUpdateEnabled()](https://developers.google.com/apps-script/reference/drive/file#getSecurityUpdateEnabled()) | Boolean | Not Started | |
| [getSharingAccess()](https://developers.google.com/apps-script/reference/drive/file#getSharingAccess()) | [Access](#access) | Not Started | |
| [getSharingPermission()](https://developers.google.com/apps-script/reference/drive/file#getSharingPermission()) | [Permission](#permission) | Not Started | |
| [getSize()](https://developers.google.com/apps-script/reference/drive/file#getSize()) | Integer | Completed | |
| [getTargetId()](https://developers.google.com/apps-script/reference/drive/file#getTargetId()) | String | Not Started | |
| [getTargetMimeType()](https://developers.google.com/apps-script/reference/drive/file#getTargetMimeType()) | String | Not Started | |
| [getTargetResourceKey()](https://developers.google.com/apps-script/reference/drive/file#getTargetResourceKey()) | String | Not Started | |
| [getThumbnail()](https://developers.google.com/apps-script/reference/drive/file#getThumbnail()) | [Blob](#blob) | Completed | |
| [getUrl()](https://developers.google.com/apps-script/reference/drive/file#getUrl()) | String | Completed | |
| [getViewers()](https://developers.google.com/apps-script/reference/drive/file#getViewers()) | [User[]](#user) | Completed | |
| [isShareableByEditors()](https://developers.google.com/apps-script/reference/drive/file#isShareableByEditors()) | Boolean | Completed | |
| [isStarred()](https://developers.google.com/apps-script/reference/drive/file#isStarred()) | Boolean | Completed | |
| [isTrashed()](https://developers.google.com/apps-script/reference/drive/file#isTrashed()) | Boolean | Completed | |
| [makeCopy()](https://developers.google.com/apps-script/reference/drive/file#makeCopy()) | [File](#file) | Completed | |
| [moveTo(destination)](https://developers.google.com/apps-script/reference/drive/file#moveTo(Folder)) | [File](#file) | Completed | |
| [removeCommenter(emailAddress)](https://developers.google.com/apps-script/reference/drive/file#removeCommenter(String)) | [File](#file) | Not Started | |
| [removeEditor(emailAddress)](https://developers.google.com/apps-script/reference/drive/file#removeEditor(String)) | [File](#file) | Completed | |
| [removeViewer(emailAddress)](https://developers.google.com/apps-script/reference/drive/file#removeViewer(String)) | [File](#file) | Completed | |
| [revokePermissions(emailAddress)](https://developers.google.com/apps-script/reference/drive/file#revokePermissions(String)) | [File](#file) | Not Started | |
| [setContent(content)](https://developers.google.com/apps-script/reference/drive/file#setContent(String)) | [File](#file) | Completed | |
| [setDescription(description)](https://developers.google.com/apps-script/reference/drive/file#setDescription(String)) | [File](#file) | Completed | |
| [setName(name)](https://developers.google.com/apps-script/reference/drive/file#setName(String)) | [File](#file) | Completed | |
| [setOwner(emailAddress)](https://developers.google.com/apps-script/reference/drive/file#setOwner(String)) | [File](#file) | Not Started | |
| [setSecurityUpdateEnabled(enabled)](https://developers.google.com/apps-script/reference/drive/file#setSecurityUpdateEnabled(Boolean)) | [File](#file) | Not Started | |
| [setShareableByEditors(shareable)](https://developers.google.com/apps-script/reference/drive/file#setShareableByEditors(Boolean)) | [File](#file) | Completed | |
| [setSharing(accessType, permissionType)](https://developers.google.com/apps-script/reference/drive/file#setSharing(Access,Permission)) | [File](#file) | Not Started | |
| [setStarred(starred)](https://developers.google.com/apps-script/reference/drive/file#setStarred(Boolean)) | [File](#file) | Completed | |
| [setTrashed(trashed)](https://developers.google.com/apps-script/reference/drive/file#setTrashed(Boolean)) | [File](#file) | Completed | |

---

## [FileIterator](https://developers.google.com/apps-script/reference/drive/file-iterator)

An iterator of files.

67% completed

| method | return | status | comments |
| --- | --- | --- | --- |
| [getContinuationToken()](https://developers.google.com/apps-script/reference/drive/file-iterator#getContinuationToken()) | String | Not Started | |
| [hasNext()](https://developers.google.com/apps-script/reference/drive/file-iterator#hasNext()) | Boolean | Completed | |
| [next()](https://developers.google.com/apps-script/reference/drive/file-iterator#next()) | [File](#file) | Completed | |

---

## [Folder](https://developers.google.com/apps-script/reference/drive/folder)

A folder in Google Drive.

64% completed

| method | return | status | comments |
| --- | --- | --- | --- |
| [addEditor(emailAddress)](https://developers.google.com/apps-script/reference/drive/folder#addEditor(String)) | [Folder](#folder) | Completed | |
| [addEditors(emailAddresses)](https://developers.google.com/apps-script/reference/drive/folder#addEditors(String)) | [Folder](#folder) | Completed | |
| [addViewer(emailAddress)](https://developers.google.com/apps-script/reference/drive/folder#addViewer(String)) | [Folder](#folder) | Completed | |
| [addViewers(emailAddresses)](https://developers.google.com/apps-script/reference/drive/folder#addViewers(String)) | [Folder](#folder) | Completed | |
| [createFile(blob)](https://developers.google.com/apps-script/reference/drive/folder#createFile(Blob)) | [File](#file) | Completed | |
| [createFolder(name)](https://developers.google.com/apps-script/reference/drive/folder#createFolder(String)) | [Folder](#folder) | Completed | |
| [createShortcut(targetId)](https://developers.google.com/apps-script/reference/drive/folder#createShortcut(String)) | [File](#file) | Not Started | |
| [createShortcutForTargetIdAndResourceKey(targetId, targetResourceKey)](https://developers.google.com/apps-script/reference/drive/folder#createShortcutForTargetIdAndResourceKey(String,String)) | [File](#file) | Not Started | |
| [getAccess(email)](https://developers.google.com/apps-script/reference/drive/folder#getAccess(String)) | [Permission](#permission) | Not Started | |
| [getDateCreated()](https://developers.google.com/apps-script/reference/drive/folder#getDateCreated()) | Date | Completed | |
| [getDescription()](https://developers.google.com/apps-script/reference/drive/folder#getDescription()) | String | Completed | |
| [getEditors()](https://developers.google.com/apps-script/reference/drive/folder#getEditors()) | [User[]](#user) | Completed | |
| [getFiles()](https://developers.google.com/apps-script/reference/drive/folder#getFiles()) | [FileIterator](#fileiterator) | Completed | |
| [getFilesByName(name)](https://developers.google.com/apps-script/reference/drive/folder#getFilesByName(String)) | [FileIterator](#fileiterator) | Completed | |
| [getFilesByType(mimeType)](https://developers.google.com/apps-script/reference/drive/folder#getFilesByType(String)) | [FileIterator](#fileiterator) | Completed | |
| [getFolders()](https://developers.google.com/apps-script/reference/drive/folder#getFolders()) | [FolderIterator](#folderiterator) | Completed | |
| [getFoldersByName(name)](https://developers.google.com/apps-script/reference/drive/folder#getFoldersByName(String)) | [FolderIterator](#folderiterator) | Completed | |
| [getId()](https://developers.google.com/apps-script/reference/drive/folder#getId()) | String | Completed | |
| [getLastUpdated()](https://developers.google.com/apps-script/reference/drive/folder#getLastUpdated()) | Date | Completed | |
| [getName()](https://developers.google.com/apps-script/reference/drive/folder#getName()) | String | Completed | |
| [getOwner()](https://developers.google.com/apps-script/reference/drive/folder#getOwner()) | [User](#user) | Completed | |
| [getParents()](https://developers.google.com/apps-script/reference/drive/folder#getParents()) | [FolderIterator](#folderiterator) | Completed | |
| [getResourceKey()](https://developers.google.com/apps-script/reference/drive/folder#getResourceKey()) | String | Not Started | |
| [getSecurityUpdateEligible()](https://developers.google.com/apps-script/reference/drive/folder#getSecurityUpdateEligible()) | Boolean | Not Started | |
| [getSecurityUpdateEnabled()](https://developers.google.com/apps-script/reference/drive/folder#getSecurityUpdateEnabled()) | Boolean | Not Started | |
| [getSharingAccess()](https://developers.google.com/apps-script/reference/drive/folder#getSharingAccess()) | [Access](#access) | Not Started | |
| [getSharingPermission()](https://developers.google.com/apps-script/reference/drive/folder#getSharingPermission()) | [Permission](#permission) | Not Started | |
| [getSize()](https://developers.google.com/apps-script/reference/drive/folder#getSize()) | Integer | Completed | |
| [getUrl()](https://developers.google.com/apps-script/reference/drive/folder#getUrl()) | String | Completed | |
| [getViewers()](https://developers.google.com/apps-script/reference/drive/folder#getViewers()) | [User[]](#user) | Completed | |
| [isShareableByEditors()](https://developers.google.com/apps-script/reference/drive/folder#isShareableByEditors()) | Boolean | Completed | |
| [isStarred()](https://developers.google.com/apps-script/reference/drive/folder#isStarred()) | Boolean | Completed | |
| [isTrashed()](https://developers.google.com/apps-script/reference/drive/folder#isTrashed()) | Boolean | Completed | |
| [moveTo(destination)](https://developers.google.com/apps-script/reference/drive/folder#moveTo(Folder)) | [Folder](#folder) | Completed | |
| [removeEditor(emailAddress)](https://developers.google.com/apps-script/reference/drive/folder#removeEditor(String)) | [Folder](#folder) | Completed | |
| [removeViewer(emailAddress)](https://developers.google.com/apps-script/reference/drive/folder#removeViewer(String)) | [Folder](#folder) | Completed | |
| [revokePermissions(emailAddress)](https://developers.google.com/apps-script/reference/drive/folder#revokePermissions(String)) | [Folder](#folder) | Not Started | |
| [searchFiles(params)](https://developers.google.com/apps-script/reference/drive/folder#searchFiles(String)) | [FileIterator](#fileiterator) | Not Started | |
| [searchFolders(params)](https://developers.google.com/apps-script/reference/drive/folder#searchFolders(String)) | [FolderIterator](#folderiterator) | Not Started | |
| [setDescription(description)](https://developers.google.com/apps-script/reference/drive/folder#setDescription(String)) | [Folder](#folder) | Completed | |
| [setName(name)](https://developers.google.com/apps-script/reference/drive/folder#setName(String)) | [Folder](#folder) | Completed | |
| [setOwner(emailAddress)](https://developers.google.com/apps-script/reference/drive/folder#setOwner(String)) | [Folder](#folder) | Not Started | |
| [setSecurityUpdateEnabled(enabled)](https://developers.google.com/apps-script/reference/drive/folder#setSecurityUpdateEnabled(Boolean)) | [Folder](#folder) | Not Started | |
| [setShareableByEditors(shareable)](https://developers.google.com/apps-script/reference/drive/folder#setShareableByEditors(Boolean)) | [Folder](#folder) | Completed | |
| [setSharing(accessType, permissionType)](https://developers.google.com/apps-script/reference/drive/folder#setSharing(Access,Permission)) | [Folder](#folder) | Not Started | |
| [setStarred(starred)](https://developers.google.com/apps-script/reference/drive/folder#setStarred(Boolean)) | [Folder](#folder) | Completed | |
| [setTrashed(trashed)](https://developers.google.com/apps-script/reference/drive/folder#setTrashed(Boolean)) | [Folder](#folder) | Completed | |

---

## [FolderIterator](https://developers.google.com/apps-script/reference/drive/folder-iterator)

An iterator of folders.

67% completed

| method | return | status | comments |
| --- | --- | --- | --- |
| [getContinuationToken()](https://developers.google.com/apps-script/reference/drive/folder-iterator#getContinuationToken()) | String | Not Started | |
| [hasNext()](https://developers.google.com/apps-script/reference/drive/folder-iterator#hasNext()) | Boolean | Completed | |
| [next()](https://developers.google.com/apps-script/reference/drive/folder-iterator#next()) | [Folder](#folder) | Completed | |

---

## [Permission](https://developers.google.com/apps-script/reference/drive/permission)

An enumeration of the permission types.

0% completed

| method | return | status | comments |
| --- | --- | --- | --- |
| [VIEW](https://developers.google.com/apps-script/reference/drive/permission#VIEW) | [Permission](#permission) | Not Started | |
| [EDIT](https://developers.google.com/apps-script/reference/drive/permission#EDIT) | [Permission](#permission) | Not Started | |
| [COMMENT](https://developers.google.com/apps-script/reference/drive/permission#COMMENT) | [Permission](#permission) | Not Started | |
| [OWNER](https://developers.google.com/apps-script/reference/drive/permission#OWNER) | [Permission](#permission) | Not Started | |
| [ORGANIZER](https://developers.google.com/apps-script/reference/drive/permission#ORGANIZER) | [Permission](#permission) | Not Started | |
| [FILE_ORGANIZER](https://developers.google.com/apps-script/reference/drive/permission#FILE_ORGANIZER) | [Permission](#permission) | Not Started | |
| [NONE](https://developers.google.com/apps-script/reference/drive/permission#NONE) | [Permission](#permission) | Not Started | |

---

## [User](https://developers.google.com/apps-script/reference/drive/user)

A user in Google Drive.

80% completed

| method | return | status | comments |
| --- | --- | --- | --- |
| [getDomain()](https://developers.google.com/apps-script/reference/drive/user#getDomain()) | String | Completed | |
| [getEmail()](https://developers.google.com/apps-script/reference/drive/user#getEmail()) | String | Completed | |
| [getName()](https://developers.google.com/apps-script/reference/drive/user#getName()) | String | Completed | |
| [getPhotoUrl()](https://developers.google.com/apps-script/reference/drive/user#getPhotoUrl()) | String | Completed | |
| [getUserLoginId()](https://developers.google.com/apps-script/reference/drive/user#getUserLoginId()) | String | Not Started | |