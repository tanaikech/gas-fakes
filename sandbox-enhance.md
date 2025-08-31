# enhancing sandbox capabilities

It would be useful to further refine the sandbox with more precise restriction capabilites. Currently sandbox can have theses states

| Property          | Type      | Default | Description                                                                                                                                                           |
| ----------------- | --------- | ------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `sandboxMode`     | `boolean` | `false` | When set to `true`, file access is restricted to files created within the current session.                                                                                |
| `cleanup`         | `boolean` | `true`  | If `true`, calling the `trash()` method will move all files created during the session to the Google Drive trash. Set to `false` to leave test artifacts for inspection. |
| `strictSandbox`   | `boolean` | `true`  | When `true` and `sandBoxMode` is active, any attempt to access a file not created in the session will throw an error. If `false`, it allows access, which can be useful for debugging but does not strictly emulate the `drive.file` scope. |

## proposal for sandbox 

Some new features that would be useful

Add some more finegrained values to a new property sandboxService. sandboxMode would provide the default value for sandbox service completely, and strictSandbox and cleanup would to do the same for default behavior for all services. Specific sandboxService values would override these for the given service.

With these properties 
- enabled - if not enabled, any attempt to access the service will be denied - default true
- sandboxStrict - same as sandboxStrict, but only applying to the given service - default true
- sandboxMode - same as sandboxMode, but only applying to the given service - default true
- cleanup - same as cleanup, but only applying to the given service - default true


These services would be covered - these are the default values
````
sandboxService: {
  DriveApp: {
    enabled: true,
    sandboxStrict: true,
    sandboxMode: true,
    cleanup: true
  },
  ...etc for the others
  SheetsApp: {
  },
  DriveApp: {

  },
  SlidesApp: {

  }
... etc for all supported services

}
````

### even more fine grained

Perhaps this is going too far, but we could add also a list of enabled methods for each service, as well as a list of ids that could be accessed and whether they could be deleted/amended/read. Default would be all methods and all ids. ids would of course only be relevant if sandboxStrict was disabled. The method would refer to the final method so DriveApp.folder.createFile() would just be 'createFile' for simplicity. The ids for UrlFetch could be urls, or perhaps domains.

For example

````
  DriveApp: {
    enabled: true,
    sandboxStrict: false,
    sandboxMode: true,
    methods: ['createFile','getFileById'],
    ids: ['xx','yy']
  },

````


## Typo in sandbox name

I notice I've capitalized sandBoxMode rather than sandboxMode. I'll add a synonym for sandboxMode at next update for consistency of case.