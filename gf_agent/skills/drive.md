# Service: drive

## Class: DriveApp

Supported Methods:
- `continueFileIterator(String)`
- `continueFolderIterator(String)`
- `createFile(BlobSource)`
- `createFile(String,String,String)`
- `createFile(String,String)`
- `createFolder(String)`
- `createShortcut(String)`
- `createShortcutForTargetIdAndResourceKey(String,String)`
- `enforceSingleParent(Boolean)`
- `getFileById(String)`
- `getFileByIdAndResourceKey(String,String)`
- `getFiles()`
- `getFilesByName(String)`
- `getFilesByType(String)`
- `getFolderById(String)`
- `getFolderByIdAndResourceKey(String,String)`
- `getFolders()`
- `getFoldersByName(String)`
- `getRootFolder()`
- `getStorageLimit()`
- `getStorageUsed()`
- `getTrashedFiles()`
- `getTrashedFolders()`
- `searchFiles(String)`
- `searchFolders(String)`

## Class: File

Supported Methods:
- `addCommenter(String)`
- `addCommenter(User)`
- `addCommenters(String)`
- `addEditor(String)`
- `addEditor(User)`
- `addEditors(String)`
- `addViewer(String)`
- `addViewer(User)`
- `addViewers(String)`
- `getAccess(String)`
- `getAccess(User)`
- `getAs(String)`
- `getBlob()`
- `getDateCreated()`
- `getDescription()`
- `getDownloadUrl()`
- `getEditors()`
- `getId()`
- `getLastUpdated()`
- `getMimeType()`
- `getName()`
- `getOwner()`
- `getParents()`
- `getResourceKey()`
- `getSecurityUpdateEligible()`
- `getSecurityUpdateEnabled()`
- `getSharingAccess()`
- `getSharingPermission()`
- `getSize()`
- `getTargetId()`
- `getTargetMimeType()`
- `getTargetResourceKey()`
- `getThumbnail()`
- `getUrl()`
- `getViewers()`
- `isShareableByEditors()`
- `isStarred()`
- `isTrashed()`
- `makeCopy()`
- `makeCopy(Folder)`
- `makeCopy(String,Folder)`
- `makeCopy(String)`
- `moveTo(Folder)`
- `removeCommenter(String)`
- `removeCommenter(User)`
- `removeEditor(String)`
- `removeEditor(User)`
- `removeViewer(String)`
- `removeViewer(User)`
- `revokePermissions(String)`
- `revokePermissions(User)`
- `setContent(String)`
- `setDescription(String)`
- `setName(String)`
- `setOwner(String)`
- `setOwner(User)`
- `setSecurityUpdateEnabled(Boolean)`
- `setShareableByEditors(Boolean)`
- `setSharing(Access,Permission)`
- `setStarred(Boolean)`
- `setTrashed(Boolean)`

## Class: FileIterator

Supported Methods:
- `getContinuationToken()`
- `hasNext()`
- `next()`

## Class: Folder

Supported Methods:
- `addEditor(String)`
- `addEditor(User)`
- `addEditors(String)`
- `addViewer(String)`
- `addViewer(User)`
- `addViewers(String)`
- `createFile(BlobSource)`
- `createFile(String,String,String)`
- `createFile(String,String)`
- `createFolder(String)`
- `createShortcut(String)`
- `createShortcutForTargetIdAndResourceKey(String,String)`
- `getAccess(String)`
- `getAccess(User)`
- `getDateCreated()`
- `getDescription()`
- `getEditors()`
- `getFiles()`
- `getFilesByName(String)`
- `getFilesByType(String)`
- `getFolders()`
- `getFoldersByName(String)`
- `getId()`
- `getLastUpdated()`
- `getName()`
- `getOwner()`
- `getParents()`
- `getResourceKey()`
- `getSecurityUpdateEligible()`
- `getSecurityUpdateEnabled()`
- `getSharingAccess()`
- `getSharingPermission()`
- `getSize()`
- `getUrl()`
- `getViewers()`
- `isShareableByEditors()`
- `isStarred()`
- `isTrashed()`
- `moveTo(Folder)`
- `removeEditor(String)`
- `removeEditor(User)`
- `removeViewer(String)`
- `removeViewer(User)`
- `revokePermissions(String)`
- `revokePermissions(User)`
- `searchFiles(String)`
- `searchFolders(String)`
- `setDescription(String)`
- `setName(String)`
- `setOwner(String)`
- `setOwner(User)`
- `setSecurityUpdateEnabled(Boolean)`
- `setShareableByEditors(Boolean)`
- `setSharing(Access,Permission)`
- `setStarred(Boolean)`
- `setTrashed(Boolean)`

## Class: FolderIterator

Supported Methods:
- `getContinuationToken()`
- `hasNext()`
- `next()`

## Class: User

Supported Methods:
- `getDomain()`
- `getEmail()`
- `getName()`
- `getPhotoUrl()`

