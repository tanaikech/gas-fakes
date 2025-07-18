# Approach, and oddities I've found in gas-fakes


Just as on Apps Script, everything is executed synchronously so you don't need to bother with handling Promises/async/await. Note that the intended audience is Apps Script developers who want to run the same code and access the same services in both Node and Apps Script. However I've uncovered quite a few behavioral oddities, inconsistencies (and bugs) in the Apps Script services I've dug into. I'm using this file as a record what I've found and discuss the dilemma of whether I should actually emulate dubious behavior.

If you are using the Advanced services, or the APIS directly, you may also find some of this research of use.

### Where to use (and not use) gas-fakes

If you don't plan on using Apps Script at all, the Node Workspace APIs (which I use in the background for all these services in any case) will be more efficient when operating in their normal asynchronous mode. On the other hand, if you only casually want to access workspace resources from Node, and can't be bothered digging into how the Node Workspace APIs work, you could still use this as part of your node project. Apps Script services are much simpler than the full API. Apps Script advanced services are also available via gas-fakes if you want a hybrid solution.


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

Since asynchonicity is fundamental to Node, there's no real simple way to convert async to sync. However, there is such a thing as a [child-process](https://nodejs.org/api/child_process.html#child-process) which you can start up to run things, and it features an [execSync](https://nodejs.org/api/child_process.html#child_processexecsynccommand-options) method which delays the return from the child process until the promise queue is all settled. So the simplest solution is to run an async method in a child process, wait till it's done, and return the results synchronously. I found that [Sindre Sorhus](https://github.com/sindresorhus) uses this approach with [make-synchronous](https://github.com/sindresorhus/make-synchronous).However, runnng up a child process in Node is pretty expensive and slow, and each subprocess has to reimport the google apis and go through a reauth chain which can take up to 1.5 secs per call.

#### Worker Update 

Instead of the subprocess approach, I'm now using a worker thread to handle all activities that need to be performed synchronously. It's a lot more tricky to implement and handle exceptions, but worth the effort.

- The worker thread only needs to be authed once on initialization and retains state between each call.
- Control to shared memory is via [Node Atomics](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Atomics) which gives a mutex style control.
- Node has built in [worker threads](https://nodejs.org/api/worker_threads.html), so there's no need for any external libraries
- Only arguments that can be stringified can be passed to and from a worker - but this is the same limitiation as passing arguments to a subprocess
- To avoid grabbing too much shared memory,I use a temporary file to pass huge amounts of data - but this will be a rarish exception.
- There are lot of async gotchas with workers so your async handling needs to be very precise. I spent a lot of time trying to track down potentially unsettled promises only to discover that worker.unref() is required to prevent the worker from stopping the main process exiting.
- console.log doesnt work reliable in a worker, even if you redirect the workers stdout & stder

```js
worker.stdout.pipe(process.stdout);
worker.stderr.pipe(process.stderr);
```

This is because console.log is async, and never shows. You need a sync version of console.log - as implemented in `./src/support/workersync/synclogger`

The result is a dramatic speed up over the subprocess approach (x5). So much so, that I had to add exponential backup to the worker threads to overcome quota limits on the workspace APIS to be able to run the test suite. Having said that it is still very much slower (x4 but variable) than most of the same calls in Apps Script - which appears to feature some mixture of in memory shadowing, caching and api call bundling - which I don't intend to mimic in this fake enironment (for now anyway) as this is not about improving the speed of Apps Script but about emulating it.

It's additionally slowed down because there are an unnatural amount of rapid, consecutive calls in the test suite which means that we get an unnatural amount of delay waiting for a quota window (sometimes as much as 15 seconds) added due to exponential back off delays when running the full test suite (I assume Apps script doesn't have the same quota restrictions). In normal operation this is unlikely to be problem.

There's an article here, if you want to read more on this [Apps Script environment on Node – more services](https://ramblings.mcpher.com/apps-script-environment-on-node-more-services/)

### Global intialization

This was a little problematic to sequence, but I wanted to make sure that any GAS services being imitated were available and initialized on the Node side, just as they are in GAS. At the time of writing these services and classes are partially implemented.

Only a subset of methods are currently available for some of them - the rest are work in progress. My approach is to start with a little bit of each service to prove feasibility and provide a base to build on.

v1.0.13

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
- `Docs (Advanced Service)` - 75%
- `DocumentApp` - 15%
- `SlidesApp` - 5%

### Testing coverage

Tests for all methods are added as we go to the cumulative unit tests and run on both Apps Script and Node. The goal is to try to get the behavior as exactly equivalent as possible. There are currently almost 4500 active tests.

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


## Noticed differences

In the main, these will be slight differences in error message text, which I'll normalize over time, or where Apps Script has a fundamental obstacle. Please report any differences in behavior you find in the repo issues.

### Tradeoffs

I've come across various Apps Script bugs/issues as I work through this which I've reported to the GAS team, and added workarounds in the gas fakes code - not sure at this point whether to duplicate the buggy behavior or simulate what would seem to be the correct one. This is not a complete list, so any things you come across please use the issues in the repo to report.

## Oddities

Just a few things I've come across when digging into the differences between what the sheets API and Apps Script do. Whether or not you use gas fakes, some of this stuff might be useful if you are using the APIs directly, or indeed the Advanced service. I'll just make a growing list of stuff I've found, in no particular order.


### Named Colors

Apps script and gas-fakes supports named colors - there's a list here [named colors](named-colors.md) - colors supported by Apps Script

### Fake classes

Most Apps script classes will map to a separate fake class file - sometimes more than one. Many of the methods in large classes are generated from various specification files, but the more complex ones and the ones with weird behavior are directly written as methods in the class.

i've tried to avoid adding properties and methods that don't exist in the emulated class, but sometimes it's necessary to have private methods and properties. Since Apps Script doesn't support private properties, I've decided to simply identify these with a leading pair of underscores, eg this.\_\_myProperty.

Although not strictly necessary to avoid real private propertues, since these Fake classes will exist only on Node, I wanted to keep code as compatible with Apps Script.

Most classes have a new method -- eg `newFakeClass(args)`. It's best to use this rather than `new FakeClass(args)`, since they each wrap the instance created in a proxy that detects attempts to access non existent properties, or indeed to set any properties other than private ones.

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

### Document API

Getting started on the advanced services of the Document API. These notes are for my TIL (things I learned today), but may be useful if you are digging into the Document API yourself.


#### Tabs

Tabs are a recent addition to Docs, and have added a bit of complication to handling Document responses. Here's what they say happens.

```
[docs](https://developers.google.com/workspace/docs/api/reference/rest/v1/documents/get)

suggestionsViewMode	- enum (SuggestionsViewMode)

The suggestions view mode to apply to the document. This allows viewing the document with all suggestions inline, accepted or rejected. If one is not specified, DEFAULT_FOR_CURRENT_ACCESS is used.

includeTabsContent	- boolean

Whether to populate the Document.tabs field instead of the text content fields like body and documentStyle on Document.

When True: Document content populates in the Document.tabs field instead of the text content fields in Document.

When False: The content of the document's first tab populates the content fields in Document excluding Document.tabs. If a document has only one tab, then that tab is used to populate the document content. Document.tabs will be empty.
```

It's actually a little more complicated than that - here are the properties of the each response variation.

##### case 1 {includeTabsContent: false}


Response has these properties:

```
     'revisionId',
     'documentStyle',
     'body',
     'title',
     'suggestionsViewMode',
     'documentId',
     'namedStyles'
```

The body contains just 1 property - `content`

##### case 2 {includeTabsContent: true}

Response has these properties:

```
    'suggestionsViewMode',
    'documentId',
    'tabs',
    'title',
    'revisionId'
```

The tabs property is an array of tabs, the first of which contains these properties

```
  documentTab, tabProperties
```

The documentTab has these properties - so the tab[0] in a document with no tabs isn't exactly the same as the legacy style as implied in the docs, since the document metadata is not repeated in each tab.  
````
  'documentStyle', 'body', 'namedStyles'
````
The tab properties has these properties
````
  'tabId', 'title', 'index'
````

##### case 3 - default

Response includes thes same keys as case 1. As an aside, the property orders are all unpredictable so you can't just compare stringified versions of the response.

```
  'title',
  'body',
  'namedStyles',
  'revisionId',
  'documentId',
  'suggestionsViewMode',
  'documentStyle'
```

#### Document body

Some oddities in the document body

##### number of children

See issue https://issuetracker.google.com/issues/432432968

If you create a blank document, there are 2 children
- a section break element
- a paragraph element

DocumentApp.getNumChildren() returns the value 1 and ignores the initial section break element

### Enums

All Apps Script enums are imitated using a seperate class 'newFakeGasenum()'. A complete write up of that is in [fakegasenum](https://github.com/brucemcpherson/fakegasenum). The same functionality is also available as an Apps Script library if you'd like to make your own enums over on GAS just like you find in Apps Script.

### Auth

Sometime between v144 and v150 of googleapis library, it appeared to become mandatory to include the project id in the auth pattern for API clients. Since we get the project id from the ADC, we actually have to do double auths. One to get the project id (which is async), and another to get an auth with the scopes required for the sheets, drive etc client (which is not async). All this now taken care of during the init phase.


## Testing

If you want to play with the testing suite , then take a look at the [collaborators](collaborators.md) writeup.


## Translations and writeups

- [initial idea and thoughts](https://ramblings.mcpher.com/a-proof-of-concept-implementation-of-apps-script-environment-on-node/)
- [Apps Script Services on Node – using apps script libraries](https://ramblings.mcpher.com/apps-script-services-on-node-using-apps-script-libraries/)
- [Apps Script environment on Node – more services](https://ramblings.mcpher.com/apps-script-environment-on-node-more-services/)
- [Turning async into synch on Node using workers](https://ramblings.mcpher.com/turning-async-into-synch-on-node-using-workers/)
- [All about Apps Script Enums and how to fake them](https://ramblings.mcpher.com/all-about-apps-script-enums-and-how-to-fake-them/)
- [Russian version](README.RU.md) ([credit Alex Ivanov](https://github.com/oshliaer)) - needs updating
- [colaborators](collaborators.md) - additional information for collaborators
- [oddities](oddities.md) - a collection of oddities uncovered during this project
- [gemini](gemini.md) - some reflections and experiences on using gemini to help code large projects
- [setup env](setup-env.md) - ([credit Eric Shapiro] - additional info on contents of .env file
- [this file](README.md)
- [named colors](named-colors.md)
