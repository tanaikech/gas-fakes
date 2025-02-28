# A proof of concept implementation of Apps Script Environment on Node

I use clasp/vscode to develop Google Apps Script (GAS) applications, but when using GAS native services, there's way too much back and fowards to the GAS IDE going while testing. I set myself the ambition of implementing fake version of the GAS runtime environment on Node so I could at least do some testing locally.

This is just a proof of concept so I've just implemented a very limited number of services and methods, but the tricky parts are all in place so all that's left is a load of busy work (to which I heartily invite any interested collaborators).

## Getting started

You can get the package from npm

```sh
npm i @mcpher/gas-fakes
```

The idea is that you can run GAS services (so far implemented) locally on Node, and it will use various Google Workspace APIS to emulate what would happen if you were to run the same thing in the GAS environment.

### Cloud project

You don't have access to the GAS maintained cloud project, so you'll need to create a GCP project to use locally. In order to duplicate the OAuth management handled by GAS, we'll use Application Default Caredentials. There re some scripts in this repo to set up and test these. Once you've set up a cloud project go to the shells folder and add your `project id` to `setaccount.sh` and

### Testing

I recommend you use the test project included in the repo to make sure all is set up correctly. It uses a Fake DriveApp service to excercise Auth etc. Just change the fixtures to values present in your own Drive, then `npm i && npm test`. Note that I use a [unit tester](https://ramblings.mcpher.com/apps-script-test-runner-library-ported-to-node/) that runs in both GAS and Node, so the exact same tests will run in both environments.

### Pushing to GAS

The script togas.sh will move your files to GAS - just set the `SOURCE` and `TARGET` folders in the script. Make sure you have an `appsscript.json` manifest in the `SOURCE` folder, as **gas-fakes** reads that to handle OAuth on Node.

You can write your project to run on Node and call GAS services, and it will also run on the GAS environment with no code changes, except on the Node side you have this one import

```sh
// all the fake services are here
import '@mcpher/gas-fakes/main.js'
```

togas.sh will remove imports and exports on the way to apps script, which doesnt support them.

## Approach

Google have not made details about the GAS run time public (as far as I know). What we do know is that it used to run on a Java based JavaScript emulator [Rhino](https://ramblings.mcpher.com/gassnippets2/what-javascript-engine-is-apps-script-running-on/) but a few years ago moved to a V8 runtime. Beyond that, we don't know anything much other than it runs on Google Servers somewhere.

There were 3 main sticky problems to overcome to get this working

- GAS is entirely synchronous, whereas the replacement calls to Workspace APIS on Node are all asynchrounous.
- GAS handles OAuth initialization from the manifest file automatically, whereas we need some additional coding or alternative approaches on Node.
- The service singletons (eg. DriveApp) are all intialized and available in the global space automatically, whereas in Node they need some post AUTH intialization, sequencing intialization and exposure.
- GAS iterators aren't the same as standard iterators, as they have a hasNext() method and don't behave in the same way.

Beyond that, implementation is just a lot of busy work. Here's how I've dealt with these 3 problems.

### Sync versus Async

Although Apps Script supports async/await/promise syntax, it operates in blocking mode. I didn't really want to have to insist on async coding in code targeted at GAS, so I needed to find a way to emulate what the GAS environment probably does.

Since asynchonicity is fundamental to Node, there's no real simple way to convert async to sync. However, there is such a thing as a [child-process](https://nodejs.org/api/child_process.html#child-process) which you can start up to run things, and it features an [execSync](https://nodejs.org/api/child_process.html#child_processexecsynccommand-options)  method which delays the return from the child process until the promise queue is all settled. So the simplest solution is to run an async method in a child process, wait till it's done, and return the results synchronously. I found that [Sindre Sorhus](https://github.com/sindresorhus) uses this approach with [make-synchronous](https://github.com/sindresorhus/make-synchronous), so I'm using that.

Here's a simple example of how to get info on an access token made synchronous

```js
/**
 * a sync version of token checking
 * @param {string} token the token to check
 * @returns {object} access token info
 */
const fxCheckToken = (accessToken) => {

  // now turn all that into a synchronous function - it runs as a subprocess, so we need to start from scratch
  const fx = makeSynchronous(async accessToken => {
    const { default: got } = await import('got')
    const tokenInfo = await got(`https://www.googleapis.com/oauth2/v3/tokeninfo?access_token=${accessToken}`).json()
    return tokenInfo
  })

  const result = fx(accessToken)
  return result
}
```

### OAuth

There's 2 pieces to this solution.

#### Application default credentials (ADC)

In order to avoid a bunch of Node specific code and credentials, yet still handle OAuth, I figured that we could simply rely on ADC. This is a problem I already wrote about here [Application Default Credentials with Google Cloud and Workspace APIs](https://ramblings.mcpher.com/application-default-credentials-with-google-cloud-and-workspace-apis/)

To set this up, set your GCP project ID and the extra scopes you'll need in `shells/setaccount.sh`. In this example I'm retaining the usual ADC scopes, and adding an extra scope to be able to access Drive.

```sh
# project ID
P=YOUR_GCP_PROJECT_ID

# config to activate - multiple configs can each be named
# here we're working on the default project configuration
AC=default

# these are the ones it sets by default - take some of these out if you want to minimize access
DEFAULT_SCOPES="https://www.googleapis.com/auth/userinfo.email,https://www.googleapis.com/auth/drive,openid,https://www.googleapis.com/auth/cloud-platform,https://www.googleapis.com/auth/sqlservice.login"

# these are the ones we want to add (note comma at beginning)
EXTRA_SCOPES=",https://www.googleapis.com/auth/drive"

.....etc
```

Now you can execute this and it will set up your ADC to be able to run any services that require the scopes you add.

##### note

Although you may be tempted to add `https://www.googleapis.com/auth/script.external_request`, it's not necessary for the ADC and in fact will generate an error. You will of course need it in your Apps script manifest.

##### testing ADC

`shells/testtoken.sh` can test that you can generate a token with sufficient scope. In this example, I'm checking that I can access a file I own. Change the id to one of your own.

```js
# check tokens have scopes required for DRIVE access
# set below to a fileid on drive you have access to
FILE_ID=SOME_FILE_ID

....etc
```

I recommend you do this to make sure Auth it's all good before you start coding up your app.

#### Manifest file

**gas-fakes** reads the manifest file to see which scopes you need in your project, uses the Google Auth library to attempt to authorizes them and has `ScriptApp.getOauthToken()` return a sufficiently specced token, just as the GAS environment does. Just make sure you have an `appsscript.json` in the same folder as your main script.

### Global intialization

This was a little problematic to sequence, but I wanted to make sure that any GAS services being imitated were available and initialized on the Node side, just as they are in GAS. At the time of writing these services are implemented. Only a subset of methods are currently available - the rest are work in progress.

v1.0.1 
- `DriveApp`
- `ScriptApp`
- `UrlFetchApp`
- `Utilities`
- `Sheets`
- `CacheService`
- `PropertiesService`

#### Proxies and globalThis

Each service has a FakeClass but I needed the Auth cycle to be initiated and done before making them public. Using a proxy was the simplest approach.

Here's the code for `ScriptApp`

```js

/**
 * adds to global space to mimic Apps Script behavior
 */
const name = "ScriptApp"

if (typeof globalThis[name] === typeof undefined) {

  // initializing auth etc
  Syncit.fxInit()

  console.log(`setting ${name} to global`)
  const getApp = () => {

    // if it hasn't been intialized yet then do that
    if (!_app) {

      _app = {
        getOAuthToken,
        requireAllScopes,
        requireScopes,
        AuthMode: {
          FULL: 'FULL'
        }
      }


    }
    // this is the actual driveApp we'll return from the proxy
    return _app
  }


  Proxies.registerProxy(name, getApp)

}
```

Here's how the proxies are registered

```js

/**
 * diverts the property get to another object returned by the getApp function
 * @param {function} a function to get the proxy object to substitutes
 * @returns {function} a handler for a proxy
 */
const getAppHandler = (getApp) => {
  return {

    get(_, prop, receiver) {
      // this will let the caller know we're not really running in Apps Script 
      return (prop === 'isFake')  ? true : Reflect.get(getApp(), prop, receiver);
    },

    ownKeys(_) {
      return Reflect.ownKeys(getApp())
    }
  }
}

const registerProxy = (name, getApp) => {
  const value = new Proxy({}, getAppHandler(getApp))
  // add it to the global space to mimic what apps script does
  Object.defineProperty(globalThis, name, {
    value,
    enumerable: true,
    configurable: false,
    writable: false,
  });
}
```

In short, the service us registered as an empty object, but when any attempt is made to access it actually returns a different object which handles the request. In the `ScriptApp` example, `ScriptApp` is an empty object, but accessing `ScriptApp.getOAuthToken()` returns an Fake `ScriptApp` object which has been initialized.

There's also a test available to see if you are running in GAS or on Node - `ScriptApp.isFake`

### Iterators

An iterator created by a generator does not have a `hasNext()` function, whereas GAS iterators do. To get round this, we can create a regular Node iterator, but introduce a wrapper so the constructor actually gets the first one, and `next()` uses the value we've already peeked at. Here's a wrapper to convert an iterator into a GAS style one.

```js
import { Proxies } from './proxies.js'
/**
 * this is a class to add a hasnext to a generator
 * @class Peeker
 * 
 */
class Peeker {
  /**
   * @constructor 
   * @param {function} generator the generator function to add a hasNext() to
   * @returns {Peeker}
   */
  constructor(generator) {
    this.generator = generator
    // in order to be able to do a hasnext we have to actually get the value
    // this is the next value stored
    this.peeked = generator.next()
  }

  /**
   * we see if there's a next if the peeked at is all over
   * @returns {Boolean}
   */
  hasNext () {
    return !this.peeked.done
  }

  /**
   * get the next value - actually its already got and storef in peeked
   * @returns {object} {value, done}
   */
  next () {
    if (!this.hasNext()) {
      // TODO find out what driveapp does
      throw new Error ('iterator is exhausted - there is no more')
    }
    // instead of returning the next, we return the prepeeked next
    const value = this.peeked.value
    this.peeked = this.generator.next()
    return value
  }
}

export const newPeeker = (...args) => Proxies.guard(new Peeker (...args))
```

And an example of usage, creating a parents iterator from a Drive API file.

````
const getParentsIterator = ({
  file
}) => {

  assert.object(file)
  assert.array(file.parents)

  function* filesink() {
    // the result tank, we just get them all by id
    let tank = file.parents.map(id => getFileById({ id, allow404: false }))

    while (tank.length) {
      yield newFakeDriveFolder(tank.splice(0, 1)[0])
    }
  }

  // create the iterator
  const parentsIt = filesink()

  // a regular iterator doesnt support the same methods 
  // as Apps Script so we'll fake that too
  return newPeeker(parentsIt)

}
````

### Cache and Property services

These are currently implemented using [keyv](https://github.com/jaredwray/keyv) with storage adaptor [keyv-file](https://github.com/zaaack/keyv-file). By default the Node side files are held in './gas-fakes/store'. I've gone for local file storage rather than something like redis to avoid adding local service requirements, but keyv takes a wide range of storage adaptors if you want to do something fancier. A small modificaion to kv.js is all you need.

#### script, user and document store varieties

All 3 are supported for both properties and cache. 

##### scriptId

The local version may have no knowledge of the Apps ScriptId. If you are using clasp, it's picked up from the .clasp.json file. However if you are not using clasp, it'll create a fake id in ./gas-fakes/settings.json and use that. All property and cache stores use the scriptId to partition data.

##### userId

The userId is extracted from an accessToken and will match the id derived from Application Default Credentials. This means that you can logon as a different user to test user data isolation. All user level property and cache stores use the scriptId and userId to partition data.

##### documentId

The documentId is only meaningful if you are working on a container bound script or add-on. We use the .clasp.json to find the container doc if it's specified, otherwise it'll generate a fake documentId in ./gas-fakes/.settings.json and use that. All document level property and cache stores use the scriptId and documentId to partition data.


## Help

As I mentioned earlier, to take this further, I'm going to need a lot of help to extend the methods and services supported - so if you feel this would be useful to you, and would like to collaborate, please ping me on [bruce@mcpher.com](mailto:bruce@mcpher.com) and we'll talk.

## Translations and writeups

- [mcpher] (https://ramblings.mcpher.com/a-proof-of-concept-implementation-of-apps-script-environment-on-node/)
- [Russian version](README.RU.md) ([credit Alex Ivanov](https://github.com/oshliaer))
