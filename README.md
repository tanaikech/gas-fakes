# A proof of concept implementation of Apps Script Environment on Node

I use clasp/vscode to develop Google Apps Script (GAS) applications, but when using GAS native services, there's way too much back and fowards to the GAS IDE going while testing. I set myself the ambition of implementing fake version of the GAS runtime environment on Node so I could at least do some testing locally.

This is a proof of concept so I've implemented a subset of number of services and methods, but the tricky parts are all in place so all that's left is a load of busy work (to which I heartily invite any interested collaborators).
## progress

This is a pretty huge task, so I'm working on adding services a little bit at a time, with usually just a few methods added in each release. I'm using this readme to report not just on how to use this thing, but also on challenges and things I've learned along the way. So it's going to get pretty long.


## Getting started

You can get the package from npm

```sh
npm i @mcpher/gas-fakes
```

The idea is that you can run GAS services (so far implemented) locally on Node, and it will use various Google Workspace APIS to emulate what would happen if you were to run the same thing in the GAS environment. Other than logging in with application default credentials (see below) you don't have to do any intitialization and can start using the implemented Apps Script services directly from Node using the same syntax and getting equivalent responses.

### Use exactly the same code as in Apps Script

Just as on Apps Script, everything is executed synchronously so you don't need to bother with handling Promises/async/await. Note that the intended audience is Apps Script developers who want to run the same code and access the same services in both Node and Apps Script.

### Where to use (and not use)

If you don't plan on using Apps Script at all, the Node Workspace APIs (which I use in the background for all these services in any case) will be more efficient when operating in their normal asynchronous mode. On the other hand, if you only casually want to access workspace resources from Node, and can't be bothered digging into how the Node Workspace APIs work, you could still use this as part of your node project. Apps Script services are much simpler than the full API. Apps Script advanced services are also available via gas-fakes if you want a hybrid solution.

### Development schedule

As a background project I'm chipping away at this when I can. There's a mountain of work to do, and I'm not that bothered about the general order I do it in. If you would specifically like some service or method prioritized, let me know and I'll see if I can push it forward. Better still, if you'd like to have a crack at implementing it yourself, let me know and I'll get you started.

### Cloud project

You don't have access to the GAS maintained cloud project, so you'll need to create a GCP project to use locally. In order to duplicate the OAuth management handled by GAS, we'll use Application Default Credentials.

There are some scripts in this repo in the ./shells folder to set up and test these, but first you'll need to add some stuff to the .env file. First copy the .env.template to .env. More info on this is availble in the setup-env.MD file.

This is the template - at the very least you need to add the gcp project id you'll be using for testing, plus the id of some file you have access to - this'll be used to check that you have set up ADC properly.

If you want to run the test suite, there are some other things required in the .env file as below - you may need to request access to some of the resources mentions, or you could replace with your own. If you just want to get going using gas-fakes on Node, you can just ignore all that.

```
# for testing authentication
GCP_PROJECT_ID="add your gcp project id here"
DRIVE_TEST_FILE_ID="add the id of some test file you have access to here"

# we'll use the default config for application default credentials
AC=default
# these are the scopes set by default - take some of these out if you want to minimize access
DEFAULT_SCOPES="https://www.googleapis.com/auth/userinfo.email,openid,https://www.googleapis.com/auth/cloud-platform,https://www.googleapis.com/auth/sqlservice.login"
EXTRA_SCOPES=",https://www.googleapis.com/auth/drive,https://www.googleapis.com/auth/spreadsheets"

# everything below here is required for the test suite if you are using it otherwise you can ignore everything below here
# you can ask me for access to the shared files if you are running the test suite, or you can create your own versions

# set your email address to test various apis
SHARED_FILE_OWNER="bruce@mcpher.com"
EMAIL="bruce@mcpher.com"
TIMEZONE="Europe/London"
TEST_LOCALE="en"
OWNER_NAME="Bruce Mcpherson"

# these are files that are used to test some drive features
TEST_BORDERS_ID="1hRGdrYHEPixXTuQLeL3Z0qGRZVs_8ojMIm6D4KrCh1o"
TEST_AIRPORTS_ID="1h9IGIShgVBVUrUjjawk5MaCEQte_7t32XeEP1Z5jXKQ"
TEST_AIRPORTS_NAME="airport list"
TEST_FOLDER_NAME="math"
TEST_FOLDER_FILES=3
TEST_FOLDER_ID="1Zww9oCTFR7zYcUYXxd70yQr3sw6VdLG-"
TEXT_FILE_NAME="fake.txt"
TEXT_FILE_ID="1142Vn7W-pGl5nWLpUSkpOB82JDiz9R6p"
TEXT_FILE_TYPE="text/plain"
TEXT_FILE_CONTENT="foo is not bar"
BLOB_NAME="foo.txt"
BLOB_TYPE="text/plain"
TEST_SHEET_ID="1DlKpVVYCrCPNfRbGsz6N_K3oPTgdC9gQIKi0aNb42uI"
TEST_SHEET_NAME="sharedlibraries"
PUBLIC_SHARE_FILE_ID="1OFJk38kW9TRrEf-B9F1gTZk2uLV-ZSpR"
SHARED_FILE_ID="1uz4cxEDxtQzu0cBb1B4h6fsjgWy7hNFf"
PDF_ID="1v5kJ5SOY2nu3DI1LKwALb3seaBpF3kWu"

# these are parameters for testing
MIN_ROOT_PDFS=20
MIN_PDFS=400
MIN_FOLDERS_ROOT=110
SKIP_SINGLE_PARENT=1

ZIP_TYPE="application/zip"
KIND_DRIVE="drive#file"

RANDOM_IMAGE="https://picsum.photos/200"
API_URL="http://suggestqueries.google.com/complete/search?client=chrome&hl=en&q=trump"
API_TYPE="text/javascript"
CLEAN=1
```

### OAuth

There's 2 pieces to this solution.

#### Application default credentials (ADC)

In order to avoid a bunch of Node specific code and credentials, yet still handle OAuth, I figured that we could simply rely on ADC. This is a problem I already wrote about here [Application Default Credentials with Google Cloud and Workspace APIs](https://ramblings.mcpher.com/application-default-credentials-with-google-cloud-and-workspace-apis/)

This section in your env file controls which scopes you plan to use.

```
we'll use the default config for application default credentials
AC=default
# these are the scopes set by default - take some of these out if you want to minimize access
DEFAULT_SCOPES="https://www.googleapis.com/auth/userinfo.email,openid,https://www.googleapis.com/auth/cloud-platform,https://www.googleapis.com/auth/sqlservice.login"
EXTRA_SCOPES=",https://www.googleapis.com/auth/drive,https://www.googleapis.com/auth/spreadsheets"

.....etc
```

#### Manifest file

**gas-fakes** reads the manifest file to see which scopes you need in your project, uses the Google Auth library to attempt to authorizes them and has `ScriptApp.getOauthToken()` return a sufficiently specced token, just as the GAS environment does. Just make sure you have an `appsscript.json` in the same folder as your main script.

Now you can execute this and it will set up your ADC to be able to run any services that require the scopes you add.

##### note

Although you may be tempted to add `https://www.googleapis.com/auth/script.external_request`, it's not necessary for the ADC and in fact will generate an error. You will of course need it in your Apps script manifest.

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

More on all this later.

## Approach

Google have not made details about the GAS run time public (as far as I know). What we do know is that it used to run on a Java based JavaScript emulator [Rhino](https://ramblings.mcpher.com/gassnippets2/what-javascript-engine-is-apps-script-running-on/) but a few years ago moved to a V8 runtime. Beyond that, we don't know anything much other than it runs on Google Servers somewhere.

There were 3 main sticky problems to overcome to get this working

- GAS is entirely synchronous, whereas the replacement calls to Workspace APIS on Node are all asynchrounous.
- GAS handles OAuth initialization from the manifest file automatically, whereas we need some additional coding or alternative approaches on Node.
- The service singletons (eg. DriveApp) are all intialized and available in the global space automatically, whereas in Node they need some post AUTH intialization, sequencing intialization and exposure.
- GAS iterators aren't the same as standard iterators, as they have a hasNext() method and don't behave in the same way.

Beyond that, implementation is just a lot of busy work. If you are interested, here's how I've dealt with these 3 problems.

### Sync versus Async

Although Apps Script supports async/await/promise syntax, it operates in blocking mode. I didn't really want to have to insist on async coding in code targeted at GAS, so I needed to find a way to emulate what the GAS environment probably does.

Since asynchonicity is fundamental to Node, there's no real simple way to convert async to sync. However, there is such a thing as a [child-process](https://nodejs.org/api/child_process.html#child-process) which you can start up to run things, and it features an [execSync](https://nodejs.org/api/child_process.html#child_processexecsynccommand-options) method which delays the return from the child process until the promise queue is all settled. So the simplest solution is to run an async method in a child process, wait till it's done, and return the results synchronously. I found that [Sindre Sorhus](https://github.com/sindresorhus) uses this approach with [make-synchronous](https://github.com/sindresorhus/make-synchronous).However, runnng up a child process in Node is pretty expensive and slow, and each subprocess has to reimport the google apis and go through a reauth chain which can take up  to 1.5 secs per call.

#### Worker Update

I'm now upgrading to use a worker thread to handle all activities that need to be performed synchronously. It's a lot more tricky to implement and handle exceptions, but worth the effort. 
- The worker thread only needs to be authed once on initialization and retains state between each call.
- Control to shared memory is via [Node Atomics](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Atomics) which gives a mutex style control.
- Node has built in [worker threads](https://nodejs.org/api/worker_threads.html), so there's no need for any external libraries
- Only arguments that can be stringified can be passed to and from a worker - but this is the same limitiation as passing arguments to a subprocess
- To avoid grabbing too much shared memory,I use a temporary file to pass huge amounts of data - but this will be a rarish exception.
- There are lot of async gotchas with workers so your async handling needs to be very precise. I spent a lot of time trying to track down potentially unsettled promises only to discover that worker.unref() is required to prevent the worker from stopping the main process exiting.
- console.log doesnt work reliable in a worker, even if you redirect the workers stdout & stder 
````js
worker.stdout.pipe(process.stdout);
worker.stderr.pipe(process.stderr);
```` 
This is because console.log is async, and never shows. You need a sync version of console.log - as implemented in `./src/support/workersync/synclogger`


The result is a dramatic speed up over the subprocess approach (x5). So much so, that I had to add exponential backup to the worker threads to overcome quota limits on the workspace APIS to be able to run the test suite. Having said that it is still very much slower (x4 but variable) than most of the same calls in Apps Script - which appears to feature some mixture of in memory shadowing, caching and api call bundling - which I don't intend to mimic in this fake enironment (for now anyway) as this is not about improving the speed of Apps Script but about emulating it. 

It's additionally slowed down because there are an unnatural amount of rapid, consecutive calls in the test suite which means that we get an unnatural amount of delay waiting for a quota window (sometimes as much as 15 seconds) added due to exponential back off delays when running the full test suite (I assume Apps script doesn't have the same quota restrictions). In normal operation this is unlikely to be problem.

### Global intialization

This was a little problematic to sequence, but I wanted to make sure that any GAS services being imitated were available and initialized on the Node side, just as they are in GAS. At the time of writing these services and classes are partially implemented.

Only a subset of methods are currently available for some of them - the rest are work in progress. My approach is to start with a little bit of each service to prove feasibility and provide a base to build on.

v1.0.10

- `DriveApp` - 50%
- `ScriptApp` - almost all
- `UrlFetchApp` - 80%
- `Utilities` - almost all
- `Sheets` - 50%
- `SpreadsheetApp` - 60%
- `CacheService` - 80%
- `PropertiesService` - 80%
- `Session` - almost all
- `Blob` - all
- `User` - all
- `Drive (Advanced Service)` - 40%
- `Sheets (Advanced Service)` - 60%
- `Slides (Advanced Service)` - 2%
- `Docs (Advanced Service)` - 2%
- `DocumentApp` - placeholder
- `SlidesApp` - placeholder



### Testing coverage

Tests for all methods are added as we go to the cumulative unit tests and run on both Apps Script and Node. The goal is to try to get the behavior as exactly equivalent as possible. There are currently almost 4000 active tests.

#### Proxies and globalThis

Each service has a FakeClass but I needed the Auth cycle to be initiated and done before making them public. Using a proxy was the simplest approach.

In short, the service is registered as an empty object, but when any attempt is made to access it actually returns a different object which handles the request. In the `ScriptApp` example, `ScriptApp` is an empty object, but accessing `ScriptApp.getOAuthToken()` returns an Fake `ScriptApp` object which gets initialized if you try to access it.

There's also a test available to see if you are running in GAS or on Node - `ScriptApp.isFake`. In fact this method 'isFake' is available on any of the implemented services, eg `DriveApp.isFake`.

### Iterators

An iterator created by a generator does not have a `hasNext()` function, whereas GAS iterators do. To get round this, I use a regular Node iterator, but with a wrapper so the constructor actually gets the first one, and `next()` uses the value we've already peeked at.

### Cache and Property services

These are currently implemented using [keyv](https://github.com/jaredwray/keyv) with storage adaptor [keyv-file](https://github.com/zaaack/keyv-file).The `gasfakes.json` file is used to commiicate where these files should be. I've gone for local file storage rather than something like redis to avoid adding local service requirements, but keyv takes a wide range of storage adaptors if you want to do something fancier. A small modificaion to kv.js is all you need.

#### Script, user and document store varieties

All 3 are supported for both properties and cache.

##### scriptId

The local version may have no knowledge of the Apps ScriptId. If you are using clasp, it's picked up from the .clasp.json file. However if you are not using clasp, or want to use something else, you can set the scriptId in `gasfakes.json`, otherwise it'll create a fake id use that - but that means that each store will be different each time you run it, so the best approach is to add a value unique to the group of scripts that want to share the same stores in gas-fakes.json. All property and cache stores use the scriptId to partition data.

##### userId

The userId is extracted from an accessToken and will match the id derived from Application Default Credentials. This means that you can logon as a different user to test user data isolation. All user level property and cache stores use the scriptId and userId to partition data.

##### documentId

The documentId is only meaningful if you are working on a container bound scrip. We use the the documentId property of gasfakes.json to identify a container file. All document level property and cache stores use the scriptId and documentId to partition data.

### Settings and temporary files

As you will have noticed, there are various local support files for props/caching etc. Be careful that these do not get committed to a public repo if you are adding sensitive values to your stores. Note that the real user Id is not used when creating files, but rather an encrypted version of it. This avoids real user ids being revealed in your file system.

## Debugging

For conversion of async to sync, I'm spawing a subprocess using [make-synchronous](https://github.com/sindresorhus/make-synchronous). Out of the box it inherits the Node Options from the main process, so that means it'll try to run each subprocess in debug mode also. Bringing up and down the debugger each time takes forever, so I've temporaily modified my local version of make-synchronous to drop the debug inheritance.

If this makes it to the repo we can start to use it from there - see issue https://github.com/sindresorhus/make-synchronous/issues/14

## Noticed differences

In the main, these will be slight differences in error message text, which I'll normalize over time, or where Apps Script has a fundamental obstacle. Please report any differences in behavior you find in the repo issues.

### Tradeoffs

I've come across various Apps Script bugs/issues as I work through this which I've reported to the GAS team, and added workarounds in the gas fakes code - not sure at this point whether to duplicate the buggy behavior or simulate what would seem to be the correct one. This is not a complete list, so any things you come across please use the issues in the repo to report. 

## Oddities

Just a few things I've come across when digging into the differences between what the sheets API and Apps Script do. Whether or not you use gas fakes, some of this stuff might be useful if you are using the Sheets API directly, or indeed the Sheets Advanced service. I'll just make a growing list of stuff I've found, in no particular order.

### Note to collaborators

Gemini code assist can be a very helpful for the busy work, but there a huge number of inconsistencies between what it believes to be the documentation and the actual real world, so if Gemini starts flailing take over early.

You eventually have to dig into the docs yourself to track down why something Gemini advised isn't working.

Gemini can also write test cases, but it tends to miss adding edge cases, so don't rely on Gemini completely for that, and always get the tests working Apps Script side first to ensure it is behaving as expected (often it's not) - after all that's what we're trying to emulate.

### Colors

#### Named Colors

In addition to CSS hex notation (e.g., `#ff0000`), Apps Script methods like `Range.setBackground()` and `Range.setFontColor()` also accept standard CSS color names. The fake environment supports all 147 standard names, which are treated case-insensitively.

| Name                   | Hex Value |
| ---------------------- | --------- |
| `aliceblue`            | `#f0f8ff` |
| `antiquewhite`         | `#faebd7` |
| `aqua`                 | `#00ffff` |
| `aquamarine`           | `#7fffd4` |
| `azure`                | `#f0ffff` |
| `beige`                | `#f5f5dc` |
| `bisque`               | `#ffe4c4` |
| `black`                | `#000000` |
| `blanchedalmond`       | `#ffebcd` |
| `blue`                 | `#0000ff` |
| `blueviolet`           | `#8a2be2` |
| `brown`                | `#a52a2a` |
| `burlywood`            | `#deb887` |
| `cadetblue`            | `#5f9ea0` |
| `chartreuse`           | `#7fff00` |
| `chocolate`            | `#d2691e` |
| `coral`                | `#ff7f50` |
| `cornflowerblue`       | `#6495ed` |
| `cornsilk`             | `#fff8dc` |
| `crimson`              | `#dc143c` |
| `cyan`                 | `#00ffff` |
| `darkblue`             | `#00008b` |
| `darkcyan`             | `#008b8b` |
| `darkgoldenrod`        | `#b8860b` |
| `darkgray`             | `#a9a9a9` |
| `darkgreen`            | `#006400` |
| `darkgrey`             | `#a9a9a9` |
| `darkkhaki`            | `#bdb76b` |
| `darkmagenta`          | `#8b008b` |
| `darkolivegreen`       | `#556b2f` |
| `darkorange`           | `#ff8c00` |
| `darkorchid`           | `#9932cc` |
| `darkred`              | `#8b0000` |
| `darksalmon`           | `#e9967a` |
| `darkseagreen`         | `#8fbc8f` |
| `darkslateblue`        | `#483d8b` |
| `darkslategray`        | `#2f4f4f` |
| `darkslategrey`        | `#2f4f4f` |
| `darkturquoise`        | `#00ced1` |
| `darkviolet`           | `#9400d3` |
| `deeppink`             | `#ff1493` |
| `deepskyblue`          | `#00bfff` |
| `dimgray`              | `#696969` |
| `dimgrey`              | `#696969` |
| `dodgerblue`           | `#1e90ff` |
| `firebrick`            | `#b22222` |
| `floralwhite`          | `#fffaf0` |
| `forestgreen`          | `#228b22` |
| `fuchsia`              | `#ff00ff` |
| `gainsboro`            | `#dcdcdc` |
| `ghostwhite`           | `#f8f8ff` |
| `gold`                 | `#ffd700` |
| `goldenrod`            | `#daa520` |
| `gray`                 | `#808080` |
| `green`                | `#008000` |
| `greenyellow`          | `#adff2f` |
| `grey`                 | `#808080` |
| `honeydew`             | `#f0fff0` |
| `hotpink`              | `#ff69b4` |
| `indianred`            | `#cd5c5c` |
| `indigo`               | `#4b0082` |
| `ivory`                | `#fffff0` |
| `khaki`                | `#f0e68c` |
| `lavender`             | `#e6e6fa` |
| `lavenderblush`        | `#fff0f5` |
| `lawngreen`            | `#7cfc00` |
| `lemonchiffon`         | `#fffacd` |
| `lightblue`            | `#add8e6` |
| `lightcoral`           | `#f08080` |
| `lightcyan`            | `#e0ffff` |
| `lightgoldenrodyellow` | `#fafad2` |
| `lightgray`            | `#d3d3d3` |
| `lightgreen`           | `#90ee90` |
| `lightgrey`            | `#d3d3d3` |
| `lightpink`            | `#ffb6c1` |
| `lightsalmon`          | `#ffa07a` |
| `lightseagreen`        | `#20b2aa` |
| `lightskyblue`         | `#87cefa` |
| `lightslategray`       | `#778899` |
| `lightslategrey`       | `#778899` |
| `lightsteelblue`       | `#b0c4de` |
| `lightyellow`          | `#ffffe0` |
| `lime`                 | `#00ff00` |
| `limegreen`            | `#32cd32` |
| `linen`                | `#faf0e6` |
| `magenta`              | `#ff00ff` |
| `maroon`               | `#800000` |
| `mediumaquamarine`     | `#66cdaa` |
| `mediumblue`           | `#0000cd` |
| `mediumorchid`         | `#ba55d3` |
| `mediumpurple`         | `#9370db` |
| `mediumseagreen`       | `#3cb371` |
| `mediumslateblue`      | `#7b68ee` |
| `mediumspringgreen`    | `#00fa9a` |
| `mediumturquoise`      | `#48d1cc` |
| `mediumvioletred`      | `#c71585` |
| `midnightblue`         | `#191970` |
| `mintcream`            | `#f5fffa` |
| `mistyrose`            | `#ffe4e1` |
| `moccasin`             | `#ffe4b5` |
| `navajowhite`          | `#ffdead` |
| `navy`                 | `#000080` |
| `oldlace`              | `#fdf5e6` |
| `olive`                | `#808000` |
| `olivedrab`            | `#6b8e23` |
| `orange`               | `#ffa500` |
| `orangered`            | `#ff4500` |
| `orchid`               | `#da70d6` |
| `palegoldenrod`        | `#eee8aa` |
| `palegreen`            | `#98fb98` |
| `paleturquoise`        | `#afeeee` |
| `palevioletred`        | `#db7093` |
| `papayawhip`           | `#ffefd5` |
| `peachpuff`            | `#ffdab9` |
| `peru`                 | `#cd853f` |
| `pink`                 | `#ffc0cb` |
| `plum`                 | `#dda0dd` |
| `powderblue`           | `#b0e0e6` |
| `purple`               | `#800080` |
| `red`                  | `#ff0000` |
| `rosybrown`            | `#bc8f8f` |
| `royalblue`            | `#4169e1` |
| `saddlebrown`          | `#8b4513` |
| `salmon`               | `#fa8072` |
| `sandybrown`           | `#f4a460` |
| `seagreen`             | `#2e8b57` |
| `seashell`             | `#fff5ee` |
| `sienna`               | `#a0522d` |
| `silver`               | `#c0c0c0` |
| `skyblue`              | `#87ceeb` |
| `slateblue`            | `#6a5acd` |
| `slategray`            | `#708090` |
| `slategrey`            | `#708090` |
| `snow`                 | `#fffafa` |
| `springgreen`          | `#00ff7f` |
| `steelblue`            | `#4682b4` |
| `tan`                  | `#d2b48c` |
| `teal`                 | `#008080` |
| `thistle`              | `#d8bfd8` |
| `tomato`               | `#ff6347` |
| `turquoise`            | `#40e0d0` |
| `violet`               | `#ee82ee` |
| `wheat`                | `#f5deb3` |
| `white`                | `#ffffff` |
| `whitesmoke`           | `#f5f5f5` |
| `yellow`               | `#ffff00` |
| `yellowgreen`          | `#9acd32` |

##### rebeccapurple

This is an interesting html color name that apps script does not support, so I've omitted that from the color name support. To learn more about this color name see - https://medium.com/@valgaze/the-hidden-purple-memorial-in-your-web-browser-7d84813bb416

#### Banding Themes

The colors used for banding themes can change over time with UI updates from Google. The `gas-fakes` library maintains a map of the current colors to match the live environment. The `Banding Theme Colors Verification` test in `testsheetssets.js` is used to validate these.

| Theme         | Header    | First Band | Second Band | Footer    |
| ------------- | --------- | ---------- | ----------- | --------- |
| `LIGHT_GREY`  | `#bdbdbd` | `#ffffff`  | `#f3f3f3`   | `#dedede` |
| `CYAN`        | `#4dd0e1` | `#ffffff`  | `#e0f7fa`   | `#a2e8f1` |
| `GREEN`       | `#63d297` | `#ffffff`  | `#e7f9ef`   | `#afe9ca` |
| `YELLOW`      | `#f7cb4d` | `#ffffff`  | `#fef8e3`   | `#fce8b2` |
| `ORANGE`      | `#f46524` | `#ffffff`  | `#ffe6dd`   | `#ffccbc` |
| `BLUE`        | `#5b95f9` | `#ffffff`  | `#e8f0fe`   | `#acc9fe` |
| `TEAL`        | `#26a69a` | `#ffffff`  | `#ddf2f0`   | `#8cd3cd` |
| `GREY`        | `#78909c` | `#ffffff`  | `#ebeff1`   | `#bbc8ce` |
| `BROWN`       | `#cca677` | `#ffffff`  | `#f8f2eb`   | `#e6d3ba` |
| `LIGHT_GREEN` | `#8bc34a` | `#ffffff`  | `#eef7e3`   | `#c4e2a0` |
| `INDIGO`      | `#8989eb` | `#ffffff`  | `#e8e7fc`   | `#c4c3f7` |
| `PINK`        | `#e91d63` | `#ffffff`  | `#fddce8`   | `#f68ab0` |

### Fake classes

Most Apps script classes will map to a separate fake class file - sometimes more than one. Many of the methods in large classes are generated from various specification files, but the more complex ones and the ones with weird behavior are directly written as methods in the class.

i've tried to avoid adding properties and methods that don't exist in the emulated class, but sometimes it's necessary to have private methods and properties. Since Apps Script doesn't support private properties, I've decided to simply identify these with a leading pair of underscores, eg this.\_\_myProperty.

Although not strictly necessary to avoid real private propertues, since these Fake classes will exist only on Node, I wanted to keep code comaptible with Apps Script.

Most classes have a new method -- eg `newFakeClass(args)`. It's best to use this rather than `new FakeClass(args)`, since they each wrap the instance created in a proxy that detects attempts to access non existent properties, or indeed to set any properties other than private ones. Very handy when debugging.

### Formats and styles

When getting formats with the sheets API, there are 2 types

- userEnteredFormat - any formats a user (or an apps script function) has explicitly set
- effectiveFormat - what rendered format actually looks like

This means that sometimes, for example, a font might be red in the UI, but Apps Script reports it as black. This is because Apps Script uses the userEnteredFormat exclusively (I think). I've implemented the same in Gas Fakes. To get the effectiveFormat, you'll need to use the Fake Advanced Sheets service, just as you would in Apps Script.

### Values

Just as with Formats, the actual value rendered might be different than the value stored. For example the number 1 might be displayed as '1' but returned as 1, and visa versa depending on the effective format for its range. I'm not entrely sure at this point the exact rules that getValues() applies, but this is what I've implemented - which appears to get the results most similar to App Script.

Here is how I've implemented getting and setting values.

- getValues() uses { valueRenderOption: 'UNFORMATTED_VALUE' }
- setValues() uses { valueInputOption: "RAW" } (as opposed to 'USER_ENTERED')
- getDisplayValues() { valueRenderOption: 'FORMATTED_VALUE' }

### Data Validation

There's quite a few oddities in Data Validation, which turned out to be the most complicated topic I've tackled at the time of writing.

#### Criteria types

A few of the criteria types differ between the Sheets API and Apps Script - for example TEXT_IS_VALID_EMAIL on GAS is equivalent to TEXT_IS_EMAIL on the API, and VALUE_IN_LIST is equivalent to ONE_OF_LIST and a few others. I tried using Gemini to help tabulate the differences but there were too many errors for that to be a trustworthy source.

The file 'fakedatavalidationcriteria.js' has a list of the final mappings between the 2.

#### Relative dates

Both the sheets API and GAS can return either relative dates or actual dates. In Sheets, you'll see a relativeDate property versus a userEnteredValue, whereas in GAS you get a different code to the one expected - so in other words a criteria type you expect to return DATE_EQUAL, might instead return DATE_EQUAL_TO_RELATIVE.

##### Setting a relative date

There are no methods in Apps Script to actually set relative dates in Data Validation - for example you'd expect a method such as requireDateEqualToRelative to exist - but it doesn't - to set you'd need to use the advanced sheets service or the withCriteria method. However this does not work - see this Apps Script issue - https://issuetracker.google.com/issues/418495831

Not all date validations have related RELATIVE versions. See later section for details.

In GAS (and of course also with GasFakes), in theory you would set a relative date like this, which gives the appearance of working, but in fact does nothing. If you follow up by retrieving the just set value, it'll throw an unexpected error.

```js
const rule = SpreadsheetApp.newDataValidation()
  .withCriteria(SpreadsheetApp.DataValidationCriteria.DATE_EQUAL_TO_RELATIVE, [
    SpreadsheetApp.RelativeDate.TODAY,
  ])
  .build();
const range = sheet.getRange("b30");
range.setDataValidation(rule);
```

Because this doesn't work in GAS, I'm not at this point sure whether to handle this or throw an error. Will review once I see whether there is any insight on the reported issue.

##### Getting a relative date

You can of course set a limited set of relative Data Validation via the UI, and GAS supports returning its content. However the criteria type returned from App Script getCriteriaType() is in the form DATE_EQUAL_TO_RELATIVE etc. If you are using the advanced sheets service you can find these values in the relativeDate field, rather than the userEnteredValue field.

This is what the sheets API returns.

```
{"condition":{"type":"DATE_EQ","values":[{"relativeDate":"TODAY"}]}}
```

Which would be translated into a criteria type of DATE_EQUAL_TO_RELATIVE in GAS, with the value SpreadsheetApp.DataValidation.Criteria.TODAY

#### datavalidation enum and relative dates

Despite being able to return a criteriaType of \_RELATIVE, these are not documented in the criteriaType ENUM (https://developers.google.com/apps-script/reference/spreadsheet/data-validation-criteria), do not have corresponding require builder functions, and although they can be set using the withCriteria method, they create an invalid dataValidation (https://issuetracker.google.com/issues/418495831).

These 3 relatives exist as keys of SpreadsheetApp.DataValidationCriteria, but none of the other DATE enum values exist

- DATE_AFTER_RELATIVE
- DATE_BEFORE_RELATIVE
- DATE_EQUAL_TO_RELATIVE

I'll implement these 3 realtives in gasFakes, but treat the others as invalid. However, you cannot set these as the sheets API doesnt support seting of relative dates with Data Validation and neither does GAS - which doesnt throw an error. I believe it should, so I'm going to throw an error if you try.

#### datavalidation with formulas

Normally there's a strict check on the input to .requirexxx methods (for example dates, numbers etc). However the Sheets UI and the Sheets API allow these values to be formulas - and the formulas are stored as the user enters them. When using GAS, you would normally use a custom formula for these occasions.

In other words - here's what happens in GAS when you retrieve a data validation that has had a formula used as its value

```
  console.log (cb.getCriteriaType().toString())    // DATE_EQUAL_TO
  console.log (cb.getCriteriaValues())             // [ '=I1' ]
```

and yet, you get the error 'The parameters (String) don't match the method signature for SpreadsheetApp.DataValidationBuilder.requireDate.' with this.

```
SpreadsheetApp.newDataValidation().requireDate("=i1")
```

Another way to bypass the argument validation is to use withCriteria. For example, this will work, even though the string argument would have been rejected by requireDate()

```
 SpreadsheetApp.newDataValidation().withCriteria(SpreadsheetApp.DataValidationCriteria.DATE_AFTER,['=i1']).build()
```

I'm leaving these same behaviors in place, and you would need to use the same workarounds as you do in GAS.

#### mixing real dates and relative dates

Since only relative versions of single dates are implemented in GAS, there's no need to handle mixed relative and real dates. As an aside, there's no validation in the UI, so you can enter any nonsense in the from and to values.

#### sheets notes

Normally, range.setNote ("takes a string"). However it does allow a numeric argument as well, which it converts to a string. However a normal toString() - for example 25.toString() would give "25". Apps script however returns "25.0" if we use getNotes() on a range whose notes has been set with setNotes() but "25" if the note was set with setNote().

There's an issue reported here - https://issuetracker.google.com/issues/429373214 - for now I'm returing "25.0" in all cases till we see what the actual resolution of this issue should be

#### Locale of dates

CriteriaValues are stored as a string, exactly as typed by the user. This means that if the API is operating in a different locale to the sheet, date formats will be different and wrong (for example - 20/2/23 in UK is 2/20/23 in US). This is a problem you would anyway face in Apps Script so I don't plan to handle this right now.

## Various hints when using the advanced sheets service

I've tried to exactly imitate the behavior of the Sheets advanced service (even though it's often inconvenient and inconsistent), so these following comments apply to both Sheets and FakeSheets. If you are usng the Advanced service, here's a few hints Ive come across that might be helpful.

### Advanced sheets updating cells

The advanced sheets service provides a huge list of builders such as Sheets.newCellData(). This is supposed to simplify building requests using the Sheets service, rather than building the requests from scratch your self. I sometimes find them more long winded that just making the objects, and I notice that there are no checks on the values that you set using them, so there's not any validation to proft from.

In any case, I've implemented them all (note that there are some GAS bugs on some of these) - https://issuetracker.google.com/issues/423737982)

I mainly use them when emulating Apps Script SpreadsheetApp services too as a double check that they are working as intended, but sometimes I build the requests up from scratch if it makes the automation simpler.

If you want to see how these are all generated, see the constructor in services/advsheets/fakeadvsheets.

#### Handling multiple response variations and formats.

If you retrieve a cell format that has been set in the UI (or in Apps Script), you often get a less full response than one that has been set using the API. If you are using the Advanced Sheets Service, and you ask for "numberFormat" for example, you may get just the pattern (0.###) or you may get the full cellformat data { type: "NUMBER", pattern: "0.###""}. You'll have to be ready to handle either type of response depending on how (and perhaps even when) the value was originally created. This could apply to any fetches of format values.

Something like this should do the trick.

```js
const extractPattern = (response) => {
  // a plain pattern entered by UI, apps script or lax api call
  if (is.string(response)) return response;
  // should be { type: "TYPE", pattern: "xxx"}
  if (!is.object(response) || !Reflect.has(response, "pattern")) return null;
  return response.pattern;
};
```

To emulate the regular SpreadsheetApp behavior, `fakeRange.getNumberFormat()` will strip out any extra stuff and just return the pattern. `fakeRange.setNumberFormat("0.###")` will always set the complete cellformat object { type: "NUMBER", pattern: "0.###"}

##### Numberformat default pattern

Normally we can use a null value to reset a format to the default UI value. However, number format will fail messily with a null argument. The correct way is `setNumberFormat('general')` even though `getNumberFormat()` returns '0.###############" or similar. If using Advanced Sheets, you still need to use the 'pattern' approach - { pattern: "general", type: "NUMBER" }

#### Text direction

Unlike other similar functions, `setTextDirection(TextDirection)` takes an enum argument and `getTextDirection()` returns an enum too. `setTextDirection(null)` will reset to default behavior, but a subsequent `getTextDirection()` will return null, rather than a default value. This allows the Sheets UI to make an in context decision based on language locale.

#### Horizontal alignment

The documented acceptable values to `range.setHorizontalAlignment()` are left, center, normal, null. However right is also valid so I'm supporting that too. `range.getHorizontalAlignment()` returns left,center,right,general,general-left. Although the alignment behavior for 'general' and 'general-left' in the UI appears identical, `range.setHorizontalAlignment(null)` returns 'general', whereas `range.setHorizontalAlignment('normal')` returns 'general-left'. There doesn't appear to be a way to force a 'general-left' return via the Sheets API or advanced service.

As with most of these format setting methods, Apps Script will silently ignore invalid arguments. I've generally throw an error if an invalid value argument is sent so, by design, `range.setHorizontalAlignment('foo') will throw an error on FakeGas, but not on Apps Script.

#### Wrap and Wrap strategy

Initially a cell will return OVERFLOW for `getWrapStrategy` and true for `getWrap`. This is wrong as OVERFLOW should be paired with false. Once you set wrapStrategy explicitly to OVERFLOW, it returns the correct value of false.

The Apps Script issue for that is here https://issuetracker.google.com/issues/427134600

#### range.copyValuesToRange

The documentaton for this method says - "Copy the content of the range to the given location. If the destination is larger or smaller than the source range then the source is repeated or truncated accordingly."

This implies that a smaller destination range that the source should only paste a truncated version of the source range. In fact it pastes it all - see issue https://issuetracker.google.com/issues/427192537

So in summary the current behavior of this function in Apps Script doesn't match the documentation in these ways:

- If the target range is smaller than the source range, it does not truncate, but always copies the entire range even if it violates the dimensions of the target range.
- If the target range is larger than the source range, it only duplicates enough times where it can fit the entire source data into what's remaining in the target range.

#### range.copyTo

The variant of copyToRange suffers from the same problems as .copyValuesToRange. But there are others too. I've decided to implement them cleanly in the hope that the issues in Apps Script will one day be fixed - see issue https://issuetracker.google.com/issues/427192537

1. I also note that range.copyTo() has the same behavior

2. the documentation for copyTo says "A destination range to copy to; only the top-left cell position is relevant." - This is not true - since duplication or truncation will happen depending on the size of the output range, just as with range.copyValuesToRange and range.copyFormatToRange().

3. There is no way to pass "transposed" when using the range.copyTo(destination, options) variant.

4. There is no checking on the enum passed as the 2nd argument unless the optional transpose argumment is provided

```
range.copyTo (destination) // valid
range.copyTo (destination, SpreadsheetApp.CopyPasteType.PASTE_VALUES) // valid
range.copyTo (destination, "FOO", true)  // correctly reports FOO as invalid type
range.copyTo (destination, "FOO") // ignores FOO and runs without reporting error
```

5. There is no conflicting option error thrown for

```
range.copyTo(destination, { contentsOnly: true, formatOnly: true }) // should throw error for conflicting options
```

6. Does not check for invalid options

```
range.copyTo(targetRange, { foo: true }) // should throw an error for invalid option
```

7. Paste values can also reset paste formats (doesnt happen with advanced sheets)

```
range.copyTo (destination, SpreadsheetApp.CopyPasteType.PASTE_VALUES)   /// this can also trash formats previously set with PASTE_FORMAT
```

#### checking of invalid arguments

In many cases, Apps Script doesn't check the validity of invalid arguments - for example (sse this issue https://issuetracker.google.com/issues/428869869), it happily accepts invalid colors.

```
  range.setBackground("foo")
  range.setBackground("#gggggg")
```

Generally I type check most arguments, so may throw an error when Apps Script doesn't - but I also raise as an issue with the Apps Script team in the hope they'll fix it one day. As a result you may find some t.threw() tests are skipped when running in the real Apps Script environment.

#### TextRotation

Apps Script returns a `TextRotation` object to `range.getTextRotation()`, which has both an 'isVertical()' and `getDegrees()` method. There is an overload for the `setTextRotation(degrees)` function - `setTextRotation(TextRotation)` which theoretically allows you to set a vertical or and angle. https://developers.google.com/apps-script/reference/spreadsheet/range#settextrotationrotation

However, unlike most objects like this, there is not a `SpreadsheetApp.newTextRotation()`, and the object returned by `getTextRotation()` is readonly with no set variants. Trying to pass a plain JavaScript object with the assumed properties results in this error.

```
Exception: The parameters ((class)) don't match the method signature for SpreadsheetApp.Range.setTextRotation.
```

So the conclusion is that the overload for `setTextRotation(TextRotation)` does not work, so I won't be implementing this until the issue is resolved. `setTextRotation(degrees)` has been implemented of course.

[See this issue for more information ](https://issuetracker.google.com/issues/425390984)

Here's Gemini's verdict on textRotation

"You are absolutely right, and I sincerely apologize once again for the continuous string of incorrect information regarding SpreadsheetApp's TextRotation capabilities. This specific part of the Apps Script API is surprisingly complex and poorly documented/intuitive."

There's also a bug in the advanced sheet service - it doesn't return an angle in its response, even though it is set in the UI and even though Range.getTextRotation() correctly returns the angle. See https://issuetracker.google.com/issues/425390984.

Since I'm using the API I can't detect the angle until that issue is fixed, so an angle set by the UI will always be seen as 0.

#### Dates and sheets advanced service

Dates can be stored in 'Excel dateserial' format in the API. This is a float showing how many days have passed since the Excel epoch which was Dec 30th, 1899. Here's a function to convert JS dates to that, which may be helpful if you are using the sheets advanced service, rather than the SpreadsheetApp service.

```js
const dateToSerial = (date) => {
  if (!is.date(date)) {
    throw new Error(`dateToSerial is expecting a date but got ${is(date)}`);
  }
  // these are held in a serial number like in Excel, rather than JavaScript epoch
  // so the epoch is actually Dec 30 1899 rather than Jan 1 1970
  const epochCorrection = 2209161600000;
  const msPerDay = 24 * 60 * 60 * 1000;
  const adjustedMs = date.getTime() + epochCorrection;
  return adjustedMs / msPerDay;
};
```

To enter this, you submit do this to create the value for your updateCells request body.

```js
const value = Sheets.newExtendedValue().setNumberValue(dateToSerial(value));
```

Note that this simply enters the numeric value of the dateSerial, without mentioning that it actually a date. To fix it as a date, you'll need to follow up with an userEnterFormat request to set the type to a date along with a custom format if required.

#### UI settings

Some of the options available in the GAS UI for setting or examining data validation are not available via GAS, and may not be available via Sheets. I'll update that later once I've figured the exact omissions and dicovered if there's a workaround. Since I'm implementing what GAS can currently do, not what it should do, this may not be an issue - just disappointing omissions.

##### examples of UI settings not intuitively settable in GAS service

- allow multiple selections - needs the allowMultipleSelections set to true - you need to you advanced service to set this
- display style - chip - This needs the displayStyle property set to "CHIP" - you need to you advanced service to set this
- color for drop downs - haven't looked into this, but it's not possible via regular gas service.

###### showCustomUI

This API property controls whether to show a drop down as plain text, or to use a fancy display such as chip or arrow. In the UI the default is true, and the displayStyle is "CHIP". As mentioned though you can't set the displayStyle with SpreadsheetApp, so setting showCustomUI true via the datavalidation builder will give you the arrow displayStyle.

In the Apps Script DataValidation builder, setting showCustomUi is achieved via the boolean 2nd argument(known as showDropdown) to requireValueInList() and requireValueInRange().

Despite the various defaults, a missing value for these properties returned via the Sheets API always means false, and a missing displayStyle with showCustomUi set to true default is "ARROW".

### Enums

All Apps Script enums are imitated using a seperate class 'newFakeGasenum()'. A complete write up of that is in [fakegasenum](https://github.com/brucemcpherson/fakegasenum). The same functionality is also available as an Apps Script library if you'd like to make your own enums over on GAS just like you find in Apps Script.

### Auth

Sometime between v144 and v150 of googleapis library, it appeared to become mandatory to include the project id in the auth pattern for API clients. Since we get the project id from the ADC, we actually have to do double auths. One to get the project id (which is async), and another to get an auth with the scopes required for the sheets, drive etc client (which is not async). All this now taken care of during the init phase, so look at an existing getauthenticated client function for how if you are adding a new service,


## Some experiences with using Gemini code assist

I tried using Gemini to generate the code and test cases for a number of method types. The results were mixed ranging from 'wow, how did it do that' to endless hallucinatory loops with Gemini insisting it was right despite the evidence. In the end I think it was mildly helpful but probably didnt save me any time or effort. It was just a different kind of effort.

Another annoyance is after deep sessions of back and forwards, code assist is generally unable to make the changes automatically and often reverts to an empty gray sidebar - which means you have to start again. Recalling the history doesn't necessarily reinstate where you were.

I also dislike the habit gemini has of 'mansplaining' back to me the answer I've just provided to correct some of it's code.


#### range.banding

This was a fairly convoluted section. I used gemini code assist heavily on this to do the legwork and all in all it made a pretty decent job of it, although with the endlessly repeated updates and test refactoring it took longer from start to finish than I would have expected it to take had I done it from scratch manually as all the previous classes. I think the right approach going forward is mainly manual with gemini doing the busy work. The tests Gemini came up with were also far from exhaustive, and pretty much ignored edge cases, so it needed additional requests to add more robust tests. On the plus side, it very quickly figured out how to reuse functions that already existed.

#### developer meta data

As per range.banding, I initially used Gemini to create much of the methods and tests associated with this. This was tortuous with Gemini going round in circles making the same mistakes over and over, eventually crashing and having to start again. After an entire day, I picked it up manually - which I should have done much earlier.Since I did not create the developer data methods in the first place, it's very hard to pick up and debug where Gemini left off as it's repeated attempts left behind some very convoluted code. A learning here is that if it looks like Gemini is flailing and failing, take over early.

As an aside, I find the implementation of developer meta data very messy and inconsistent with the usual Apps Script services. I believe that regular Apps Script developers will find it unfamiliar, restrictive and intimidating (which is maybe why it never really caught on)

#### grouping and collapsing

Gemini took me down a rabbit hole on this one, where it kept forgetting that the objective was to have the fake environment behave as Apps Script. Up to this point, Gemini was quite good at remembering this, but for some reason for this collection of methods it kept fiddling with the test cases to make them work differently in each environment rather than replicating the Apps Script behavior and having the same tests pass in both environments.

In particular it started to believe that the Apps Script environment was not atomic and to try to modify tests with Utilities.sleep everywhere and many other false avenues.

Quite often all that is needed is for you to read the documentation yourself, undo the unnecessary labyrinth of gemini changes, and paste a copy of the documentation into the gemini context to get it back on track. A lesson to take from this is to start the emulation task by providing the more complex parts of the documentaion instead of relying on gemini to look them up.

#### pivot tables

There are many classes and methods required to support pivot table, so I decided to try to have gemini build them all. I found that building a placeholder class at a time, adding checking and correcting methods as we go, was the best approach. By this time Gemini was intuitively building classes that looked the same as the others, using the same shared helper functions and approaches.

Gemini tends to have its own opinion about which methods should exist in apps script classes and this is almost always wrong. I found it best to supply the list of methods that should exist along with a link to the documenation for best results. There are some undocumented methods in some Apps Script classes, so as a final check I often review the Object.keys() of an instance to see if any are missing from the documentation.

Despite this Gemini will often create unknown methods, miss known ones, and attempt to reference private functions and methods when creating test cases. There were also quite a few occurrences of gemini introducing bugs in to previously tested material, so I found I needed to re-run not only the tests I was working on, but also other vaguely realated ones too.

In summary, Gemini has achieved a lot of good work with this collection of classes, however I don't yet feel completetly confident that we have a completely robust set of implementations. I think I have to write some more edge case testing manually to properly excercise this. The tests created by Gemini are relatively superficial.

On the other hand, using these techniques meant that we got the entire pivot table collection of classes and tests to this point in about a day, mainly tracking down filter hallucinations. It would probably have taken me a few days to do it all manually.

As a general rule, once Gemini starts talking about making sweeping changes and suggesting that the Sheets API has bugs that is causing everything to collapse, it's time to start a new session. We did go down this rabbit hole a few times when working on pivot table filter criteria and as a result we've ended up with a lot of messy, hard to understand and unplesant code in these classes, following many attempts by gemini to diagnose self inflicted issues. I may have to back and take out some of the redundancy at some point.

#### Datasource

These have been basicly implemented, but remain untested in any way. I haven't been able to test and refine these as I don't have the right level of an expensive enough workspace license. Will come back to that at a later date - TODO.

#### r1c1 style ranges

The Sheets API doesn't know about these, so all r1c1 style methods such as setFormulasR1C1 include a conversion to a regular range to be able to communicate with the underlying sheets API. This can get pretty complex, so we have rudimentary, mainly Gemini generated functions to handle that.

#### Intial verdict on using Gemini to generate some of this stuff

I'm torn. On the one hand, it's been great at doing busy work like writing test cases and detecting dependencies that I might otherwise have missed. It can often be pretty good at refactoring/renaming things. On the other hand, if it gets it wrong, it's very hard to get it back on track as it tries bury itself deeper and deeper into previous misconceptions. It also has huge difficulty in updating large files no matter the detailed guidance. The usual end game is to restart a fresh context and/or copy and paste the content into a file you create manually. 

There were ocassions when the content Gemini provided content to be copied and pasted that was invalid syntax, or worse, dropped lines of code in sections it didn't plan to make any changes. In particular, code that had something like `ob[method](args)` was regularily truncated to just `obmethod`. I've found that if you enter `ob[method](args)` in the code assist chat window it will also interpret it as `obmethod` unless you escape the brackets (which of course you wouldnt do in code). 

Another issue is that Gemini can take 10 mins or more to create the full content for a large class in its chat window, sometimes ending in the gray screen of death. I've found it's best to completely avoid using Gemini to make minor changes, but to just make them manually.


Overall it saves some time, for sure. However, the result is often suboptimal, wordy, lacking in reusability and not something I would be be happy to put my name to. From a coder perspective, the role becomes one of repetetive specification, debugging, checking and testing, while failing to develop a deep understanding of the work in hand. I like coding, so from a satisfaction perspective, I'm not entirely convinced yet. I've found it's very impressive when creating small, standalone scripts but deteriorates rapidly both in speed and effectiveness as the codebase and dependencies grows. There's a point at which it becomes more trouble than it's worth.


## Testing

I recommend you use the test project included in the repo if you want to do some tests. It uses a Fake DriveApp service to excercise Auth etc. Just change the fixtures in your own environments by following the instructions in [setup-env.md](https://github.com/brucemcpherson/gas-fakes/blob/main/setup-env.MD), then `npm i && npm test`.

It's not necessary to run these tests, but if you are a collaborator and want to add some additional methods, you need to create a test section and always run a full set of tests before creating a merge request to ensure your changes havent broken anything. At the time of writing there are about 4,000 active tests.

Note that I use a [unit tester](https://ramblings.mcpher.com/apps-script-test-runner-library-ported-to-node/) that runs in both GAS and Node, so the exact same tests will run in both environments. There are some example tests in the repo. Each test has been proved on both Node and GAS. There's also a shell (togas.sh) which will use clasp to push the test code to Apps Script.

Each test can be run individually (for example `npm run testdrive`) or all with `npm test`

Test settings and fixtures are in the .env file. Some readonly files are publicly shared and can be left with the example value in .env-template. Most files which are written are created and deleted afterwards on successful completion. They will be named something starting with --. In case of failures you may need to delete these yourself. If you want to preserve the testfiles it creates doing a test session, just set the CLEAN parameter in .env to 0.

### Pushing to GAS

The script uses togas.sh will move the test scripts to GAS with clasp - just set the `SOURCE` and `TARGET` folders in the TOGAS script. Make sure you have an `appsscript.json` manifest in the `SOURCE` folder, as **gas-fakes** reads that to handle OAuth on Node.

You can write your project to run on Node and call GAS services, and it will also run on the GAS environment with no code changes, except on the Node side you have this one import

```sh
// all the fake services are here
import '@mcpher/gas-fakes/main.js'
```

togas.sh will remove imports and exports on the way to apps script, which doesnt support them.

## Help

As I mentioned earlier, to take this further, I'm going to need a lot of help to extend the methods and services supported - so if you feel this would be useful to you, and would like to collaborate, please ping me on [bruce@mcpher.com](mailto:bruce@mcpher.com) and we'll talk.

## Translations and writeups

- [mcpher](https://ramblings.mcpher.com/a-proof-of-concept-implementation-of-apps-script-environment-on-node/)
- [Russian version](README.RU.md) ([credit Alex Ivanov](https://github.com/oshliaer)) - needs updating
