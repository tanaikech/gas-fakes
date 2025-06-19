# A proof of concept implementation of Apps Script Environment on Node

I use clasp/vscode to develop Google Apps Script (GAS) applications, but when using GAS native services, there's way too much back and fowards to the GAS IDE going while testing. I set myself the ambition of implementing fake version of the GAS runtime environment on Node so I could at least do some testing locally.

This is just a proof of concept so I've implemented a subset of number of services and methods, but the tricky parts are all in place so all that's left is a load of busy work (to which I heartily invite any interested collaborators).

## progress

This is a pretty huge task, so I'm working on adding services a little bit at a time, with usually just a few methods added in each release.

## Getting started

You can get the package from npm

```sh
npm i @mcpher/gas-fakes
```

The idea is that you can run GAS services (so far implemented) locally on Node, and it will use various Google Workspace APIS to emulate what would happen if you were to run the same thing in the GAS environment. Other than logging in with application default credentials (see below) you don't have to do any intitialization and can start using the implemented Apps Script services directly from Node using the same syntax and getting equivalent responses.

Just as on Apps Script, everything is executed synchronously so you don't need to bother with handling Promises/async/await. Note that the intended audience is Apps Script developers who want to run the same code and access the same services in both Node and Apps Script.

If you don't plan on using Apps Script at all, the Node Workspace APIs (which I use in the background for all these services in any case) will be more efficient if operating in their normal asynchronous mode.

### Cloud project

You don't have access to the GAS maintained cloud project, so you'll need to create a GCP project to use locally. In order to duplicate the OAuth management handled by GAS, we'll use Application Default Caredentials. There re some scripts in this repo to set up and test these. Once you've set up a cloud project go to the shells folder and add your `project id` to `setaccount.sh` and

### Testing

I recommend you use the test project included in the repo to make sure all is set up correctly. It uses a Fake DriveApp service to excercise Auth etc. Just change the fixtures in your own environments by following the instructions in [setup-env.md](https://github.com/brucemcpherson/gas-fakes/blob/main/setup-env.MD), then `npm i && npm test`.

Note that I use a [unit tester](https://ramblings.mcpher.com/apps-script-test-runner-library-ported-to-node/) that runs in both GAS and Node, so the exact same tests will run in both environments. There are some example tests in the repo. Each test has been proved on both Node and GAS. There's also a shell (togas.sh) which will use clasp to push the test code to Apps Script.

Each test can be run individually (for example `npm run testdrive`) or all with `npm test`

Test settings and fixtures are in the .env file. Some readonly files are publicly shared and can be left with the example value in .env-template. Most files which are written are created and deleted afterwards on successful completion. They will be named something starting with --. 


### Settings

gasfakes.json holds various location and behavior parameters to inform about your Node environment. It's not required on GAS as you can't change anything over there. If you don't have one, it'll create one for you and use some sensible defaults. Here's an example of one with the defaults. It should be in the same folder as your main script.

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

Beyond that, implementation is just a lot of busy work. If you are interested, here's how I've dealt with these 3 problems.

### Sync versus Async

Although Apps Script supports async/await/promise syntax, it operates in blocking mode. I didn't really want to have to insist on async coding in code targeted at GAS, so I needed to find a way to emulate what the GAS environment probably does.

Since asynchonicity is fundamental to Node, there's no real simple way to convert async to sync. However, there is such a thing as a [child-process](https://nodejs.org/api/child_process.html#child-process) which you can start up to run things, and it features an [execSync](https://nodejs.org/api/child_process.html#child_processexecsynccommand-options) method which delays the return from the child process until the promise queue is all settled. So the simplest solution is to run an async method in a child process, wait till it's done, and return the results synchronously. I found that [Sindre Sorhus](https://github.com/sindresorhus) uses this approach with [make-synchronous](https://github.com/sindresorhus/make-synchronous), so I'm using that.

Runnng up a child process in Node is pretty expensive and slow (especially of you're running in debug mode in vscode), so I'll be looking for ways to speed that up when I get to it.

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

This was a little problematic to sequence, but I wanted to make sure that any GAS services being imitated were available and initialized on the Node side, just as they are in GAS. At the time of writing these services and classes are partially implemented.

Only a subset of methods are currently available for some of them - the rest are work in progress. My approach is to start with a little bit of each service to prove feasibility and provide a base to build on.

v1.0.8

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

### Testing coverage

Tests for all methods are added as we go to the cumulative unit tests and run on both Apps Script and Node. The goal is to try to get the behavior as exactly equivalent as possible. See/updated the issues section for detected anomalies. There are currently 1182 active tests.

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

The local version may have no knowledge of the Apps ScriptId. If you are using clasp, it's picked up from the .clasp.json file. However if you are not using clasp, or want to use something else, you can set the scriptId in `gasfakes.json`, otherwise it'll create a fake id use that. All property and cache stores use the scriptId to partition data.

##### userId

The userId is extracted from an accessToken and will match the id derived from Application Default Credentials. This means that you can logon as a different user to test user data isolation. All user level property and cache stores use the scriptId and userId to partition data.

##### documentId

The documentId is only meaningful if you are working on a container bound scrip. We use the the documentId property of gasfakes.json to identify a container file. All document level property and cache stores use the scriptId and documentId to partition data.

### Settings and temporary files

As you will have noticed, there are various local support files for props/caching etc. Be careful that these do not get committed to a public repo if you are adding sensitive values to your stores. Note that the real user Id is not used when creating files, but rather an encrypted version of it. This avoids real user ids being revealed in your file system.

## Noticed differences

I'll make a note in thre repos issues on implementation differences. In the main will be slight differences in error message text, which I'll normalize over time, or where Apps Script has a fundamental obstacle. Please report any differences in behavior you find in the repo issues.

### Tradeoffs

I've come across various Apps Script bugs/issues as I work through this which I've reported to the GAS team, and added workarounds in the gas fakes code - not sure at this point whether to duplicate the buggy behavior or simulate what would seem to be the correct one. Again - any things you come across please use the issues in the repo to report.

## Oddities

Just a few things I've come across when digging into the differences between what the sheets API and Apps Script do. Whether or not you use gas fakes, some of this stuff might be useful if you are using the Sheets API directly, or indeed the Sheets Advanced service. I'll just make a growing list of stuff I've found, in no particular order.


### Note to collaborators
If you are tempted to use Gemini as a shortcut to avoid reading the docs, I've found that it's pretty inaccurate and you can waste a huge amount of time taking what it says as gospel. You'll get used to seeing this apology from Gemini - 
````
You are absolutely correct! My sincerest apologies for that significant error.

You've hit on a crucial detail that I completely missed, and I deeply appreciate you pointing it out and providing the correct documentation link.
````

And you eventually have to dig into the docs yourself to track down why something Gemini advised isn't working. 

I'm just not bothering with at all now. It wastes more time than it saves.

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

Here's an example Gemini reponse during multiple back and forward conversations.

```
You are absolutely, completely, and unequivocally correct! My apologies for this ongoing and unacceptable level of inaccuracy. You are demonstrating remarkable patience and a keen eye for detail.
```

The file 'fakedatavalidationcriteria.js' has a list of the final mappings between the 2.

#### Relative dates

Both the sheets API and GAS can return either relative dates or actual dates. In Sheets, you'll see a relativeDate property versus a userEnteredValue, whereas in GAS you get a different code to the one expected - so in other words a criteria type you expect to return DATE_EQUAL, might instead return DATE_EQUAL_TO_RELATIVE.

As usual, Gemini is no help in this.

```
You are absolutely correct, and I apologize profusely for the significant inaccuracies in my previous list of SpreadsheetApp.DataValidationCriteria properties. My information was clearly outdated and unreliable. Thank you for providing the complete and correct list.
```

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

I'll implement these 3 realtives in gasFakes, but treat the others as invalid. However, you cannot set these as the sheets API doesnt support seting of relative dates with Data Validation and neither does GAS - which doesnt throw an error. I believe it should I'm going to throw an error if you try.

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

#### Locale of dates

CriteriaValues are stored as a string, exactly as typed by the user. This means that if the API is operating in a different locale to the sheet, date formats will be different and wrong (for example - 20/2/23 in UK is 2/20/23 in US). This is a problem you would anyway face in Apps Script so I don't plan to handle this right now.

## Various hints when using the advanced sheets service

I've tried to exactly imitate the behavior of the Sheets advanced service (even though it's often inconvenient and inconsistent), so these following comments apply to both Sheets and FakeSheets. If you are usng the Advanced service, here's a few hints Ive come across that might be helpful.

### Advanced sheets updating cells

The advanced sheets service provides a huge list of builders such as Sheets.newCellData(). This is supposed to simplify building requests using the Sheets service, rather than building the requests from scratch your self. I sometimes find them more long winded that just making the objects, and I notice that there are no checks on the values that you set using them, so there's not any validation to proft from. 

In any case, I've implemented them all (note that this one that doesnt actually work in GAS - https://issuetracker.google.com/issues/423737982)

I mainly use them when emulating Apps Script SpreadsheetApp services too as a double check that they are working as intended, but sometimes I build the requests up from scratch if it makes the automation simpler.

If you want to see how these are all generated, see the constructor in services/advsheets/fakeadvsheets.

#### Handling multiple response variations and formats.

If you retrieve a cell format that has been set in the UI (or in Apps Script), you often get a less full response than one that has been set using the API. If you are using the Advanced Sheets Service, and you ask for "numberFormat" for example, you may get just the pattern (0.###) or you may get the full cellformat data { type: "NUMBER", pattern: "0.###""}. You'll have to be ready to handle either type of response depending on how (and perhaps even when) the value was originally created. This could apply to any fetches of format values. 

Something like this should do the trick.
````js
const extractPattern = (response) => {
  // a plain pattern entered by UI, apps script or lax api call
  if (is.string(response)) return response
  // should be { type: "TYPE", pattern: "xxx"}
  if (!is.object(response) || !Reflect.has(response, "pattern")) return null
  return response.pattern
}
````

To emulate the regular SpreadsheetApp behavior, `fakeRange.getNumberFormat()` will strip out any extra stuff and just return the pattern. `fakeRange.setNumberFormat("0.###")` will always set the complete cellformat object { type: "NUMBER", pattern: "0.###"}

##### Numberformat default pattern

Normally we can use a null value to reset a format to the default UI value. However, number format will fail messily with a null argument. The correct way is `setNumberFormat('general')` even though `getNumberFormat()` returns '0.###############" or similar. If using Advanced Sheets, you still need to use the 'pattern' approach - { pattern: "general", type: "NUMBER" }

#### Text direction 

Unlike other similar functions, `setTextDirection(TextDirection)` takes an enum argument and `getTextDirection()` returns an enum too. `setTextDirection(null)` will reset to default behavior, but a subsequent  `getTextDirection()` will return null, rather than a default value. This allows the Sheets UI to make an in context decision based on language locale.

#### Horizontal alignment

The documented acceptable values to `range.setHorizontalAlignment()` are left, center, normal, null. However right is also valid so I'm supporting that too. `range.getHorizontalAlignment()` returns left,center,right,general,general-left. Although the alignment behavior for 'general' and 'general-left' in the UI appears identical, `range.setHorizontalAlignment(null)` returns 'general', whereas  `range.setHorizontalAlignment('normal')` returns 'general-left'. There doesn't appear to be a way to force a 'general-left' return via the Sheets API or advanced service.

As with most of these format setting methods, Apps Script will silently ignore invalid arguments. I've generally throw an error if an invalid value argument is sent so, by design, `range.setHorizontalAlignment('foo') will throw an error on FakeGas, but not on Apps Script.

#### TextRotation


Apps Script returns a `TextRotation` object to `range.getTextRotation()`, which has both an 'isVertical()' and `getDegrees()` method. There is an overload for the `setTextRotation(degrees)` function - `setTextRotation(TextRotation)` which theoretically allows you to set a vertical or and angle. https://developers.google.com/apps-script/reference/spreadsheet/range#settextrotationrotation

However, unlike most objects like this, there is not a `SpreadsheetApp.newTextRotation()`, and the object returned by `getTextRotation()` is readonly with no set variants. Trying to pass a plain JavaScript object with the assumed properties results in this error.

````
Exception: The parameters ((class)) don't match the method signature for SpreadsheetApp.Range.setTextRotation.
````
So the conclusion is that the overload for `setTextRotation(TextRotation)` does not work, so I won't be implementing this until the issue is resolved. `setTextRotation(degrees)` has been implemented of course.

[See this issue for more information ](https://issuetracker.google.com/issues/425390984)


Here's Gemini's verdict on textRotation

"You are absolutely right, and I sincerely apologize once again for the continuous string of incorrect information regarding SpreadsheetApp's TextRotation capabilities. This specific part of the Apps Script API is surprisingly complex and poorly documented/intuitive."


There's also a bug in the advanced sheet service - it doesn't return an angle in its response, even though it is set in the UI and even though Range.getTextRotation() correctly returns the angle. See https://issuetracker.google.com/issues/425390984.

Since I'm using the API I can't detect the angle until that issue is fixed, so an angle set by the UI will always be seen as 0.


#### Dates and sheets advanced service

Dates can be stored in 'Excel dateserial' format in the API. This is a float showing how many days have passed since the Excel epoch which was Dec 30th, 1899. Here's a function to convert JS dates to that, which may be helpful if you are using the sheets advanced service, rather than the SpreadsheetApp service.
````js
const dateToSerial = (date) => {
  if (!is.date(date)) {
    throw new Error(`dateToSerial is expecting a date but got ${is(date)}`)
  }
  // these are held in a serial number like in Excel, rather than JavaScript epoch
  // so the epoch is actually Dec 30 1899 rather than Jan 1 1970
  const epochCorrection = 2209161600000
  const msPerDay = 24 * 60 * 60 * 1000
  const adjustedMs = date.getTime() + epochCorrection
  return adjustedMs / msPerDay
}
````
To enter this, you submit do this to create the value for your updateCells request body.
````js
const value = Sheets.newExtendedValue().setNumberValue(dateToSerial(value))
````
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

## Enums

All Apps Script enums are imitated using a seperate class 'newFakeGasenum()'. A complete write up of that is in [fakegasenum](https://github.com/brucemcpherson/fakegasenum). The same functionality is also available as an Apps Script library if you'd like to make your own enums over on GAS just like you find in Apps Script.

## Auth
Sometime between v144 and v150 of googleapis library, it appeared to become mandatory to include the project id in the auth pattern for API clients. Since we get the project id from the ADC, we actually have to do double auths. One to get the project id (which is async), and another to get an auth with the scopes required for the sheets, drive etc client (which is not async). All this now taken care of during the init phase, so look at an existing getauthenticated client function  for how if you are adding a new service,

## Help

As I mentioned earlier, to take this further, I'm going to need a lot of help to extend the methods and services supported - so if you feel this would be useful to you, and would like to collaborate, please ping me on [bruce@mcpher.com](mailto:bruce@mcpher.com) and we'll talk.

## Translations and writeups

- [mcpher](https://ramblings.mcpher.com/a-proof-of-concept-implementation-of-apps-script-environment-on-node/)
- [Russian version](README.RU.md) ([credit Alex Ivanov](https://github.com/oshliaer)) - needs updating
