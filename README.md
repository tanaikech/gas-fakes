# A proof of concept implementation of Apps Script Environment on Node

I use clasp/vscode to develop Google Apps Script (GAS) applications, but when using GAS native services, there's way too much back and fowards to the GAS IDE going while testing. I set myself the ambition of implementing fake version of the GAS runtime environment on Node so I could at least do some testing and debugging of Apps Scripts locally on Node.

This is a proof of concept so I've implemented a growing subset of number of services and methods. There are a rigorous set of tests for all emulated classes and methods to make sure the same code produces the same result on both Node and Apps Script. Please report any inconsistencies in the issues of this repo.


## Getting started as a package user

You can get the package from npm

```sh
npm i @mcpher/gas-fakes
```

Collaborators should fork the repo and use the local versions of these files - see [collaborators info](collaborators.md).

### Use exactly the same code as in Apps Script

Just as on Apps Script, everything is executed synchronously so you don't need to bother with handling Promises/async/await. Just write normal Apps Script code. Usually you would have an associated App Script project if that's your eventual target, but it's not essential that you do. You can get started right away on Node. 


### Cloud project

You don't have access to GAS maintained cloud projects from Node, so you'll need to create a GCP project to use locally (or you can use it on Apps Script too if you prefer) that has the workspace APIs enabled (Drive, Docs, Sheets etc). 

### .env and shell script helpers

In order to duplicate the OAuth management handled by GAS, we'll use Application Default Credentials. I've provided a handy shell that will take care of all this for you. 

- Get this [folder](https://github.com/brucemcpherson/gas-fakes/tree/main/shells) into the ./shells folder of your project.
- Get this [env template](https://github.com/brucemcpherson/gas-fakes/blob/main/shells/.env.template) and copy it/add it to your .env file in your project

#### Application default credentials

In order to avoid a bunch of Node specific code and credentials, yet still handle OAuth, I figured that we could simply rely on ADC. This is a problem I already wrote about here [Application Default Credentials with Google Cloud and Workspace APIs](https://ramblings.mcpher.com/application-default-credentials-with-google-cloud-and-workspace-apis/)

At the very least you need to add the gcp project id and optionally the id of some file you have access to - this'll be used to check that you have set up ADC properly.

#### Your .env file

You can setup the .env file your self using the .env.template as a guide.

```
# must set these
GCP_PROJECT_ID="add your gcp project id here"

# optional reference if you want to run a test after setting up
DRIVE_TEST_FILE_ID="add the id of some test file you have access to here"

# we'll use the default config for application default credentials
# probably dont need to change these
AC=default
# these are the scopes set by default - take some of these out if you want to minimize access
DEFAULT_SCOPES="https://www.googleapis.com/auth/userinfo.email,openid,https://www.googleapis.com/auth/cloud-platform,https://www.googleapis.com/auth/sqlservice.login"
EXTRA_SCOPES=",https://www.googleapis.com/auth/drive,https://www.googleapis.com/auth/spreadsheets"
 
# optional logging destination
# can be CONSOLE (default), CLOUD, BOTH, NONE
LOG_DESTINATION="BOTH"

```

#### Manifest file

If you have an associated apps script project, you'll probably be using clasp to sync with the apps script IDE, and you'll have an appsscript.json available in your project folder

**gas-fakes** reads the manifest file to see which scopes you need in your project, uses the Google Auth library to attempt to authorizes them and has `ScriptApp.getOauthToken()` return a sufficiently specced token, just as the GAS environment does. Just make sure you have an `appsscript.json` in the same folder as your main script.

Now you can execute this and it will set up your ADC to be able to run any services that require the scopes you add.

##### note

Although you may be tempted to add `https://www.googleapis.com/auth/script.external_request`, it's not necessary for the ADC and in fact will generate an error. You will of course need it in your Apps script manifest. Same goes for "https://www.googleapis.com/auth/documents" and "https://www.googleapis.com/auth/documents" 

### Settings

Optionally, gasfakes.json holds various location and behavior parameters to inform about your Node environment. It's not required on GAS as you can't change anything over there. If you don't have one or need one, it'll create one for you and use some sensible defaults. Here's an example of one with the defaults. It should be in the same folder as your main script.

```
{
  "manifest": "./appsscript.json",
  "clasp": "./.clasp.json",
  "documentId": null,
  "cache": "/tmp/gas-fakes/cache",
  "properties": "/tmp/gas-fakes/properties",
  "scriptId": "1bc79bd3-fe02-425f-9653-525e5ae0b678"
}
```

| property   | type   | default                          | description                                                                                                                                                                                                                                                                              |
| ---------- | ------ | -------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| manifest   | string | ./appsscript.json                | the manifest path and name relative to your main module                                                                                                                                                                                                                                  |
| clasp      | string | ./clasp.json                     | where to look for an optional clasp file                                                                                                                                                                                                                                                 |
| documentId | string | null                             | a bound document id. This will allow testing of container bound script. The documentId will become your activeDocument (for the appropriate service)                                                                                                                                     |
| cache      | string | /tmp/gas-fakes/cache             | gas-fakes uses a local file to emulate apps script's CacheService. This is where it should put the files                                                                                                                                                                                 |
| properties | string | /tmp/gas-fakes/properties        | gas-fakes uses a local file to emulate apps script's PropertiesService. This is where it should put the files. You may want to put it somewhere other than /tmp to avoid accidental deletion, but don't put it in a place that'll get commited to public git repo                        |
| scriptId   | string | from clasp, or some random value | If you have a clasp file, it'll pick up the scriptId from there. If not you can enter your scriptId manually, or just leave it to create a fake one. It's use for the moment is to return something useful from ScriptApp.getScriptId() and to partition the cache and properties stores |

### Pushing files to GAS

There are a couple of syntactical differences between Node and Apps Script. Not in the body of the code but in how the IDE executes. The 2 main ones are
- apps script doesnt support 'import'. Alls its top level variables are global, so we need to drop imports from the files that are pushed to the IDE
- Script run on Node are called immediately. Normally on Apps Script we hit the run button.  Here's how I handle this in my scripts that need to run on both environments. 
````
// this required on Node but not on Apps Script
if (ScriptApp.isFake) testFakes()
````
For inspiration on pushing modified files to the IDE, see the bash script I use for the test suite. 

### Cloud Logging Integration

`gas-fakes` emulates the native Google Apps Script `Logger.log()` integration with Google Cloud Logging, allowing you to send structured logs from your local Node.js environment directly to your Google Cloud project. Note that console.log is the normal Node console and writes to the local console only. All messages from gas-fakes api still go to the console, so the Logger.log is for your own user messages as required.

#### Initial Configuration

The initial logging behavior is controlled by the `LOG_DESTINATION` environment variable in your `.env` file.

| `LOG_DESTINATION` | Behavior |
|---|---|
| `CONSOLE` (Default) | Logs structured JSON to the console (`stdout`). This is the default behavior if the variable is not set. |
| `CLOUD` | Sends logs directly to Google Cloud Logging. Nothing is written to the console. |
| `BOTH` | Sends logs to both Google Cloud Logging and the console. |
| `NONE` | Disables all output from `Logger.log()`. |

When logging to the cloud, entries are sent to the `gas-fakes/console_logs` log name and include the following labels for easy filtering in the Log Explorer:
- `gas-fakes-scriptId`
- `gas-fakes-userId`

#### Dynamic Control

You can change the logging destination at any time during runtime using the `Logger.__setLogDestination()` method. This is especially useful for testing or for applications that need to change their logging behavior dynamically.

The method accepts one of the following string values: `'CONSOLE'`, `'CLOUD'`, `'BOTH'`, or `'NONE'`.

#### Example Usage

To set the initial destination, modify your `.env` file:
```
LOG_DESTINATION="BOTH"
```

To change the destination during runtime in your script:
```javascript
// Initially logs to BOTH (from .env)
Logger.log('This goes to console and cloud');

// Switch to only logging to the console
Logger.__setLogDestination('CONSOLE');
Logger.log('This now only goes to the console');

// Disable logging completely
Logger.__setLogDestination('NONE');
Logger.log('This goes nowhere');
```


## Help

As I mentioned earlier, to take this further, I'm going to need a lot of help to extend the methods and services supported - so if you feel this would be useful to you, and would like to collaborate, please ping me on bruce@mcpher.com and we'll talk.

## Translations and writeups


- [initial idea and thoughts](https://ramblings.mcpher.com/a-proof-of-concept-implementation-of-apps-script-environment-on-node/)
- [Inside the volatile world of a Google Document](https://ramblings.mcpher.com/inside-the-volatile-world-of-a-google-document/
- [Apps Script Services on Node – using apps script libraries](https://ramblings.mcpher.com/apps-script-services-on-node-using-apps-script-libraries/)
- [Apps Script environment on Node – more services](https://ramblings.mcpher.com/apps-script-environment-on-node-more-services/)
- [Turning async into synch on Node using workers](https://ramblings.mcpher.com/turning-async-into-synch-on-node-using-workers/)
- [All about Apps Script Enums and how to fake them](https://ramblings.mcpher.com/all-about-apps-script-enums-and-how-to-fake-them/)
- [Russian version](README.RU.md) ([credit Alex Ivanov](https://github.com/oshliaer)) - needs updating
- [colaborators](collaborators.md) - additional information for collaborators
- [oddities](oddities.md) - a collection of oddities uncovered during this project
- [gemini](gemini.md) - some reflections and experiences on using gemini to help code large projects
- [named colors](named-colors.md) - colors supported by Apps Script
- [setup env](setup-env.md) - ([credit Eric Shapiro] - additional info on contents of .env file
- [this file](README.md)
- [named colors](named-colors.md)
- [sandbox](sandbox.md)
- [named range identity](named-range-identity.md)