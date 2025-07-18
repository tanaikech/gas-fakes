
# Note to collaborators on Gemini 

Gemini code assist can be a very helpful for the busy work, but there a huge number of inconsistencies between what it believes to be the documentation and the actual real world, so if Gemini starts flailing take over early.

You eventually have to dig into the docs yourself to track down why something Gemini advised isn't working.

Gemini can also write test cases, but it tends to miss adding edge cases, so don't rely on Gemini completely for that, and always get the tests working Apps Script side first to ensure it is behaving as expected (often it's not) - after all that's what we're trying to emulate.


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

When creating the Docs Fakes, I started afresh, letting Gemini have a shot at building the initial templates. After a little while, it kept getting into loops and was mostly unable to produce the code it said it was going to produce - the 'thinking' stage was on the right track, but it either completely failed to produce any code that represented its thinking, or failed to actually apply it. My theory is that, without a body of code specific to the service (as I already had in sheets when I started to let Gemini contribute), it flails around aimlessly looping. At the time of writing I'm just at the beginning of Docs, so I'll do a lot of work manually to get a strong architecural backgound and revisit Gemini later on for any repeptive stuff. For now I'm just giving up with it for Docs.


As I mentioned earlier, to take this further, I'm going to need a lot of help to extend the methods and services supported - so if you feel this would be useful to you, and would like to collaborate, please ping me on [bruce@mcpher.com](mailto:bruce@mcpher.com) and we'll talk.

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
- [readme](README.md)
- [named colors](named-colors.md)
