# Drive Service Progress - 64% completed
**Documentation:** [Drive Service](https://developers.google.com/apps-script/reference/drive)
---
## [Access](https://developers.google.com/apps-script/reference/drive/access)
An enum representing classes of users who can access a file or folder.
(5 methods out of 5 (100%) completed
| method | return | status | comments |
|---|---|---|---|
| [ANYONE](https://developers.google.com/apps-script/reference/drive/access#anyone) | Access | Completed | |
| [ANYONE_WITH_LINK](https://developers.google.com/apps-script/reference/drive/access#anyone_with_link) | Access | Completed | |
| [DOMAIN](https://developers.google.com/apps-script/reference/drive/access#domain) | Access | Completed | |
| [DOMAIN_WITH_LINK](https://developers.google.com/apps-script/reference/drive/access#domain_with_link) | Access | Completed | |
| [PRIVATE](https://developers.google.com/apps-script/reference/drive/access#private) | Access | Completed | |
---
## [DriveApp](https://developers.google.com/apps-script/reference/drive/drive-app)
Allows scripts to create, find, and modify files and folders in Google Drive.
(13 methods out of 23 (57%) completed
| method | return | status | comments |
|---|---|---|---|
| [continueFileIterator(continuationToken)](https://developers.google.com/apps-script/reference/drive/drive-app#continuefileiteratorcontinuationtoken) | [FileIterator](#fileiterator) | Not Started | |
| [continueFolderIterator(continuationToken)](https://developers.google.com/apps-script/reference/drive/drive-app#continuefolderiteratorcontinuationtoken) | [FolderIterator](#folderiterator) | Not Started | |
| [createFile(blob)](https://developers.google.com/apps-script/reference/drive/drive-app#createfileblob) | [File](#file) | Completed | |
| [createFolder(name)](https://developers.google.com/apps-script/reference/drive/drive-app#createfoldername) | [Folder](#folder) | Completed | |
| [createShortcut(targetId)](https://developers.google.com/apps-script/reference/drive/drive-app#createshortcuttargetid) | [File](#file) | Not Started | |
| [createShortcutForTargetIdAndResourceKey(targetId, targetResourceKey)](https://developers.google.com/apps-script/reference/drive/drive-app#createshortcutfortargetidandresourcekeytargetid,-targetresourcekey) | [File](#file) | Not Started | |
| [enforceSingleParent(value)](https://developers.google.com/apps-script/reference/drive/drive-app#enforcesingleparentvalue) | void | Not Started | |
| [getFileById(id)](https://developers.google.com/apps-script/reference/drive/drive-app#getfilebyidid) | [File](#file) | Completed | |
| [getFileByIdAndResourceKey(id, resourceKey)](https://developers.google.com/apps-script/reference/drive/drive-app#getfilebyidandresourcekeyid,-resourcekey) | [File](#file) | Not Started | |
| [getFiles()](https://developers.google.com/apps-script/reference/drive/drive-app#getfiles) | [FileIterator](#fileiterator) | Completed | |
| [getFilesByName(name)](https://developers.google.com/apps-script/reference/drive/drive-app#getfilesbynamename) | [FileIterator](#fileiterator) | Completed | |
| [getFilesByType(mimeType)](https://developers.google.com/apps-script/reference/drive/drive-app#getfilesbytypemimetype) | [FileIterator](#fileiterator) | Completed | |
| [getFolderById(id)](https://developers.google.com/apps-script/reference/drive/drive-app#getfolderbyidid) | [Folder](#folder) | Completed | |
| [getFolderByIdAndResourceKey(id, resourceKey)](https://developers.google.com/apps-script/reference/drive/drive-app#getfolderbyidandresourcekeyid,-resourcekey) | [Folder](#folder) | Not Started | |
| [getFolders()](https://developers.google.com/apps-script/reference/drive/drive-app#getfolders) | [FolderIterator](#folderiterator) | Completed | |
| [getFoldersByName(name)](https://developers.google.com/apps-script/reference/drive/drive-app#getfoldersbynamename) | [FolderIterator](#folderiterator) | Completed | |
| [getRootFolder()](https://developers.google.com/apps-script/reference/drive/drive-app#getrootfolder) | [Folder](#folder) | Completed | |
| [getStorageLimit()](https://developers.google.com/apps-script/reference/drive/drive-app#getstoragelimit) | Integer | Not Started | |
| [getStorageUsed()](https://developers.google.com/apps-script/reference/drive/drive-app#getstorageused) | Integer | Not Started | |
| [getTrashedFiles()](https://developers.google.com/apps-script/reference/drive/drive-app#gettrashedfiles) | [FileIterator](#fileiterator) | Not Started | |
| [getTrashedFolders()](https://developers.google.com/apps-script/reference/drive/drive-app#gettrashedfolders) | [FolderIterator](#folderiterator) | Not Started | |
| [searchFiles(params)](https://developers.google.com/apps-script/reference/drive/drive-app#searchfilesparams) | [FileIterator](#fileiterator) | Not Started | |
| [searchFolders(params)](https://developers.google.com/apps-script/reference/drive/drive-app#searchfoldersparams) | [FolderIterator](#folderiterator) | Not Started | |
---
## [File](https://developers.google.com/apps-script/reference/drive/file)
A file in Google Drive.
(25 methods out of 49 (51%) completed
| method | return | status | comments |
|---|---|---|---|
| [addCommenter(emailAddress)](https://developers.google.com/apps-script/reference/drive/file#addcommenteremailaddress) | [File](#file) | Not Started | |
| [addEditor(emailAddress)](https://developers.google.com/apps-script/reference/drive/file#addeditoremailaddress) | [File](#file) | Completed | |
| [addViewer(emailAddress)](https://developers.google.com/apps-script/reference/drive/file#addvieweremailaddress) | [File](#file) | Completed | |
| [getAccess(email)](https://developers.google.com/apps-script/reference/drive/file#getaccessemail) | [Permission](#permission) | Not Started | |
| [getAs(contentType)](https://developers.google.com/apps-script/reference/drive/file#getascontenttype) | [Blob](https://developers.google.com/apps-script/reference/base/blob) | Not Started | |
| [getBlob()](https://developers.google.com/apps-script/reference/drive/file#getblob) | [Blob](https://developers.google.com/apps-script/reference/base/blob) | Completed | |
| [getDateCreated()](https://developers.google.com/apps-script/reference/drive/file#getdatecreated) | Date | Completed | |
| [getDescription()](https://developers.google.com/apps-script/reference/drive/file#getdescription) | String | Completed | |
| [getDownloadUrl()](https://developers.google.com/apps-script/reference/drive/file#getdownloadurl) | String | Completed | |
| [getEditors()](https://developers.google.com/apps-script/reference/drive/file#geteditors) | [User[]](#user) | Completed | |
| [getId()](https://developers.google.com/apps-script/reference/drive/file#getid) | String | Completed | |
| [getLastUpdated()](https://developers.google.com/apps-script/reference/drive/file#getlastupdated) | Date | Completed | |
| [getMimeType()](https://developers.google.com/apps-script/reference/drive/file#getmimetype) | String | Completed | |
| [getName()](https://developers.google.com/apps-script/reference/drive/file#getname) | String | Completed | |
| [getOwner()](https://developers.google.com/apps-script/reference/drive/file#getowner) | [User](#user) | Completed | |
| [getParents()](https://developers.google.com/apps-script/reference/drive/file#getparents) | [FolderIterator](#folderiterator) | Completed | |
| [getResourceKey()](https://developers.google.com/apps-script/reference/drive/file#getresourcekey) | String | Not Started | |
| [getSecurityUpdateEligible()](https://developers.google.com/apps-script/reference/drive/file#getsecurityupdateeligible) | Boolean | Not Started | |
| [getSecurityUpdateEnabled()](https://developers.google.com/apps-script/reference/drive/file#getsecurityupdateenabled) | Boolean | Not Started | |
| [getSharingAccess()](https://developers.google.com/apps-script/reference/drive/file#getsharingaccess) | [Access](#access) | Not Started | |
| [getSharingPermission()](https://developers.google.com/apps-script/reference/drive/file#getsharingpermission) | [Permission](#permission) | Not Started | |
| [getSize()](https://developers.google.com/apps-script/reference/drive/file#getsize) | Integer | Completed | |
| [getTargetId()](https://developers.google.com/apps-script/reference/drive/file#gettargetid) | String | Not Started | |
| [getTargetMimeType()](https://developers.google.com/apps-script/reference/drive/file#gettargetmimetype) | String | Not Started | |
| [getTargetResourceKey()](https://developers.google.com/apps-script/reference/drive/file#gettargetresourcekey) | String | Not Started | |
| [getThumbnail()](https://developers.google.com/apps-script/reference/drive/file#getthumbnail) | [Blob](https://developers.google.com/apps-script/reference/base/blob) | Completed | |
| [getUrl()](https://developers.google.com/apps-script/reference/drive/file#geturl) | String | Completed | |
| [getViewers()](https://developers.google.com/apps-script/reference/drive/file#getviewers) | [User[]](#user) | Completed | |
| [isShareableByEditors()](https://developers.google.com/apps-script/reference/drive/file#isshareablebyeditors) | Boolean | Completed | |
| [isStarred()](https://developers.google.com/apps-script/reference/drive/file#isstarred) | Boolean | Completed | |
| [isTrashed()](https://developers.google.com/apps-script/reference/drive/file#istrashed) | Boolean | Completed | |
| [makeCopy()](https://developers.google.com/apps-script/reference/drive/file#makecopy) | [File](#file) | Completed | |
| [moveTo(destination)](https://developers.google.com/apps-script/reference/drive/file#movetodestination) | [File](#file) | Completed | |
| [removeCommenter(emailAddress)](https://developers.google.com/apps-script/reference/drive/file#removecommenteremailaddress) | [File](#file) | Not Started | |
| [removeEditor(emailAddress)](https://developers.google.com/apps-script/reference/drive/file#removeeditoremailaddress) | [File](#file) | Completed | |
| [removeViewer(emailAddress)](https://developers.google.com/apps-script/reference/drive/file#removevieweremailaddress) | [File](#file) | Completed | |
| [revokePermissions(emailAddress)](https://developers.google.com/apps-script/reference/drive/file#revokepermissionsemailaddress) | [File](#file) | Not Started | |
| [setContent(content)](https://developers.google.com/apps-script/reference/drive/file#setcontentcontent) | [File](#file) | Completed | |
| [setDescription(description)](https://developers.google.com/apps-script/reference/drive/file#setdescriptiondescription) | [File](#file) | Completed | |
| [setName(name)](https://developers.google.com/apps-script/reference/drive/file#setnamename) | [File](#file) | Completed | |
| [setOwner(emailAddress)](https://developers.google.com/apps-script/reference/drive/file#setowneremailaddress) | [File](#file) | Not Started | |
| [setSecurityUpdateEnabled(enabled)](https://developers.google.com/apps-script/reference/drive/file#setsecurityupdateenabledenabled) | void | Not Started | |
| [setShareableByEditors(shareable)](https://developers.google.com/apps-script/reference/drive/file#setshareablebyeditorsshareable) | [File](#file) | Completed | |
| [setSharing(accessType, permissionType)](https://developers.google.com/apps-script/reference/drive/file#setsharingaccesstype,-permissiontype) | [File](#file) | Not Started | |
| [setStarred(starred)](https://developers.google.com/apps-script/reference/drive/file#setstarredstarred) | [File](#file) | Completed | |
| [setTrashed(trashed)](https://developers.google.com/apps-script/reference/drive/file#settrashedtrashed) | [File](#file) | Completed | |
---
## [FileIterator](https://developers.google.com/apps-script/reference/drive/file-iterator)
An iterator that allows scripts to iterate over a large collection of files.
(3 methods out of 3 (100%) completed
| method | return | status | comments |
|---|---|---|---|
| [getContinuationToken()](https://developers.google.com/apps-script/reference/drive/file-iterator#getcontinuationtoken) | String | Not Started | |
| [hasNext()](https://developers.google.com/apps-script/reference/drive/file-iterator#hasnext) | Boolean | Completed | |
| [next()](https://developers.google.com/apps-script/reference/drive/file-iterator#next) | [File](#file) | Completed | |
---
## [Folder](https://developers.google.com/apps-script/reference/drive/folder)
A folder in Google Drive.
(25 methods out of 49 (51%) completed
| method | return | status | comments |
|---|---|---|---|
| [addEditor(emailAddress)](https://developers.google.com/apps-script/reference/drive/folder#addeditoremailaddress) | [Folder](#folder) | Completed | |
| [addViewer(emailAddress)](https://developers.google.com/apps-script/reference/drive/folder#addvieweremailaddress) | [Folder](#folder) | Completed | |
| [createFile(blob)](https://developers.google.com/apps-script/reference/drive/folder#createfileblob) | [File](#file) | Completed | |
| [createFolder(name)](https://developers.google.com/apps-script/reference/drive/folder#createfoldername) | [Folder](#folder) | Completed | |
| [createShortcut(targetId)](https://developers.google.com/apps-script/reference/drive/folder#createshortcuttargetid) | [Folder](#folder) | Not Started | |
| [createShortcutForTargetIdAndResourceKey(targetId, targetResourceKey)](https://developers.google.com/apps-script/reference/drive/folder#createshortcutfortargetidandresourcekeytargetid,-targetresourcekey) | [Folder](#folder) | Not Started | |
| [getAccess(email)](https://developers.google.com/apps-script/reference/drive/folder#getaccessemail) | [Permission](#permission) | Not Started | |
| [getDateCreated()](https://developers.google.com/apps-script/reference/drive/folder#getdatecreated) | Date | Completed | |
| [getDescription()](https://developers.google.com/apps-script/reference/drive/folder#getdescription) | String | Completed | |
| [getEditors()](https://developers.google.com/apps-script/reference/drive/folder#geteditors) | [User[]](#user) | Completed | |
| [getFiles()](https://developers.google.com/apps-script/reference/drive/folder#getfiles) | [FileIterator](#fileiterator) | Completed | |
| [getFilesByName(name)](https://developers.google.com/apps-script/reference/drive/folder#getfilesbynamename) | [FileIterator](#fileiterator) | Completed | |
| [getFilesByType(mimeType)](https://developers.google.com/apps-script/reference/drive/folder#getfilesbytypemimetype) | [FileIterator](#fileiterator) | Completed | |
| [getFolders()](https://developers.google.com/apps-script/reference/drive/folder#getfolders) | [FolderIterator](#folderiterator) | Completed | |
| [getFoldersByName(name)](https://developers.google.com/apps-script/reference/drive/folder#getfoldersbynamename) | [FolderIterator](#folderiterator) | Completed | |
| [getId()](https://developers.google.com/apps-script/reference/drive/folder#getid) | String | Completed | |
| [getLastUpdated()](https://developers.google.com/apps-script/reference/drive/folder#getlastupdated) | Date | Completed | |
| [getName()](https://developers.google.com/apps-script/reference/drive/folder#getname) | String | Completed | |
| [getOwner()](https://developers.google.com/apps-script/reference/drive/folder#getowner) | [User](#user) | Completed | |
| [getParents()](https://developers.google.com/apps-script/reference/drive/folder#getparents) | [FolderIterator](#folderiterator) | Completed | |
| [getResourceKey()](https://developers.google.com/apps-script/reference/drive/folder#getresourcekey) | String | Not Started | |
| [getSecurityUpdateEligible()](https://developers.google.com/apps-script/reference/drive/folder#getsecurityupdateeligible) | Boolean | Not Started | |
| [getSecurityUpdateEnabled()](https://developers.google.com/apps-script/reference/drive/folder#getsecurityupdateenabled) | Boolean | Not Started | |
| [getSharingAccess()](https://developers.google.com/apps-script/reference/drive/folder#getsharingaccess) | [Access](#access) | Not Started | |
| [getSharingPermission()](https://developers.google.com/apps-script/reference/drive/folder#getsharingpermission) | [Permission](#permission) | Not Started | |
| [getSize()](https://developers.google.com/apps-script/reference/drive/folder#getsize) | Integer | Completed | |
| [getUrl()](https://developers.google.com/apps-script/reference/drive/folder#geturl) | String | Completed | |
| [getViewers()](https://developers.google.com/apps-script/reference/drive/folder#getviewers) | [User[]](#user) | Completed | |
| [isShareableByEditors()](https://developers.google.com/apps-script/reference/drive/folder#isshareablebyeditors) | Boolean | Completed | |
| [isStarred()](https://developers.google.com/apps-script/reference/drive/folder#isstarred) | Boolean | Completed | |
| [isTrashed()](https://developers.google.com/apps-script/reference/drive/folder#istrashed) | Boolean | Completed | |
| [moveTo(destination)](https://developers.google.com/apps-script/reference/drive/folder#movetodestination) | [Folder](#folder) | Completed | |
| [removeEditor(emailAddress)](https://developers.google.com/apps-script/reference/drive/folder#removeeditoremailaddress) | [Folder](#folder) | Completed | |
| [removeViewer(emailAddress)](https://developers.google.com/apps-script/reference/drive/folder#removevieweremailaddress) | [Folder](#folder) | Completed | |
| [revokePermissions(emailAddress)](https://developers.google.com/apps-script/reference/drive/folder#revokepermissionsemailaddress) | [Folder](#folder) | Not Started | |
| [searchFiles(params)](https://developers.google.com/apps-script/reference/drive/folder#searchfilesparams) | [FileIterator](#fileiterator) | Not Started | |
| [searchFolders(params)](https://developers.google.com/apps-script/reference/drive/folder#searchfoldersparams) | [FolderIterator](#folderiterator) | Not Started | |
| [setDescription(description)](https://developers.google.com/apps-script/reference/drive/folder#setdescriptiondescription) | [Folder](#folder) | Completed | |
| [setName(name)](https://developers.google.com/apps-script/reference/drive/folder#setnamename) | [Folder](#folder) | Completed | |
| [setOwner(emailAddress)](https://developers.google.com/apps-script/reference/drive/folder#setowneremailaddress) | [Folder](#folder) | Not Started | |
| [setSecurityUpdateEnabled(enabled)](https://developers.google.com/apps-script/reference/drive/folder#setsecurityupdateenabledenabled) | void | Not Started | |
| [setShareableByEditors(shareable)](https://developers.google.com/apps-script/reference/drive/folder#setshareablebyeditorsshareable) | [Folder](#folder) | Completed | |
| [setSharing(accessType, permissionType)](https://developers.google.com/apps-script/reference/drive/folder#setsharingaccesstype,-permissiontype) | [Folder](#folder) | Not Started | |
| [setStarred(starred)](https://developers.google.com/apps-script/reference/drive/folder#setstarredstarred) | [Folder](#folder) | Completed | |
| [setTrashed(trashed)](https://developers.google.com/apps-script/reference/drive/folder#settrashedtrashed) | [Folder](#folder) | Completed | |
---
## [FolderIterator](https://developers.google.com/apps-script/reference/drive/folder-iterator)
An object that allows scripts to iterate over a large collection of folders.
(3 methods out of 3 (100%) completed
| method | return | status | comments |
|---|---|---|---|
| [getContinuationToken()](https://developers.google.com/apps-script/reference/drive/folder-iterator#getcontinuationtoken) | String | Not Started | |
| [hasNext()](https://developers.google.com/apps-script/reference/drive/folder-iterator#hasnext) | Boolean | Completed | |
| [next()](https://developers.google.com/apps-script/reference/drive/folder-iterator#next) | [Folder](#folder) | Completed | |
---
## [Permission](https://developers.google.com/apps-script/reference/drive/permission)
An enum representing the permissions granted to users for a file or folder.
(7 methods out of 7 (100%) completed
| method | return | status | comments |
|---|---|---|---|
| [VIEW](https://developers.google.com/apps-script/reference/drive/permission#view) | Permission | Completed | |
| [EDIT](https://developers.google.com/apps-script/reference/drive/permission#edit) | Permission | Completed | |
| [COMMENT](https://developers.google.com/apps-script/reference/drive/permission#comment) | Permission | Completed | |
| [OWNER](https://developers.google.com/apps-script/reference/drive/permission#owner) | Permission | Completed | |
| [ORGANIZER](https://developers.google.com/apps-script/reference/drive/permission#organizer) | Permission | Completed | |
| [FILE_ORGANIZER](https://developers.google.com/apps-script/reference/drive/permission#file_organizer) | Permission | Completed | |
| [NONE](https://developers.google.com/apps-script/reference/drive/permission#none) | Permission | Completed | |
---
## [User](https://developers.google.com/apps-script/reference/drive/user)
A user associated with a file in Google Drive.
(4 methods out of 4 (100%) completed
| method | return | status | comments |
|---|---|---|---|
| [getDomain()](https://developers.google.com/apps-script/reference/drive/user#getdomain) | String | Completed | |
| [getEmail()](https://developers.google.com/apps-script/reference/drive/user#getemail) | String | Completed | |
| [getName()](https://developers.google.com/apps-script/reference/drive/user#getname) | String | Completed | |
| [getPhotoUrl()](https://developers.google.com/apps-script/reference/drive/user#getphotourl) | String | Completed | |
