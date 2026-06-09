# [Script](https://developers.google.com/apps-script/reference/script)

This service provides access to script triggers and script publishing.

## Class: [AuthorizationInfo](https://developers.google.com/apps-script/reference/script/authorization-info)

An object that checks if the user has granted authorization for the required scopes of the script. The object also provides an authorization URL for users to grant those permissions.

| Method | Description | Return Type | Return Description | Status | Implementation |
|--- |--- |--- |--- |--- |--- |
| [getAuthorizationStatus()](https://developers.google.com/apps-script/reference/script/authorization-info#getAuthorizationStatus()) | Gets a value that indicates whether the user needs to authorize this script to use one or more services (for example, ScriptApp.AuthorizationStatus.REQUIRED). | [AuthorizationStatus](#enum-authorizationstatus) | The authorization status. | completed | [link](../src/services/scriptapp/fakeauthorizationinfo.js#L8) |
| [getAuthorizationUrl()](https://developers.google.com/apps-script/reference/script/authorization-info#getAuthorizationUrl()) | Gets the authorization URL that can be used to grant access to the script. This method returns null if no authorization is required. The page at the URL closes automatically if it is accessed and the script does not require any authorization. | String\|null | A URL that can be used to authorize the script. | completed | [link](../src/services/scriptapp/fakeauthorizationinfo.js#L14) |
| [getAuthorizedScopes()](https://developers.google.com/apps-script/reference/script/authorization-info#getAuthorizedScopes()) | Gets a list of authorized scopes for the script. If authorization information is requested for a specified list of scopes, returns the authorized scopes from the specified list. | String[]\|null | The list of authorized scopes. | not started |  |

## Class: [CalendarTriggerBuilder](https://developers.google.com/apps-script/reference/script/calendar-trigger-builder)

Builder for calendar triggers.

| Method | Description | Return Type | Return Description | Status | Implementation |
|--- |--- |--- |--- |--- |--- |
| [create()](https://developers.google.com/apps-script/reference/script/calendar-trigger-builder#create()) | Creates the trigger and returns it. | [Trigger](#class-trigger) | The new trigger. | not started |  |
| [onEventUpdated()](https://developers.google.com/apps-script/reference/script/calendar-trigger-builder#onEventUpdated()) | Specifies a trigger that fires when a calendar entry is created, updated, or deleted. | [CalendarTriggerBuilder](#class-calendartriggerbuilder) | This CalendarTriggerBuilder, for chaining. | not started |  |

## Class: [ClockTriggerBuilder](https://developers.google.com/apps-script/reference/script/clock-trigger-builder)

A builder for clock triggers.

| Method | Description | Return Type | Return Description | Status | Implementation |
|--- |--- |--- |--- |--- |--- |
| [after(Integer)](https://developers.google.com/apps-script/reference/script/clock-trigger-builder#after(Integer)) | Specifies the minimum duration (in milliseconds) after the current time that the trigger runs. The actual duration might vary, but won't be less than your specified minimum. | [ClockTriggerBuilder](#class-clocktriggerbuilder) | The builder, for chaining. | not started |  |
| [at(Date)](https://developers.google.com/apps-script/reference/script/clock-trigger-builder#at(Date)) | Specifies when the trigger runs. | [ClockTriggerBuilder](#class-clocktriggerbuilder) | The builder, for chaining. | not started |  |
| [atDate(Integer,Integer,Integer)](https://developers.google.com/apps-script/reference/script/clock-trigger-builder#atDate(Integer,Integer,Integer)) |  |  |  | not started |  |
| [atHour(Integer)](https://developers.google.com/apps-script/reference/script/clock-trigger-builder#atHour(Integer)) | Specifies the hour the trigger at which the trigger runs. | [ClockTriggerBuilder](#class-clocktriggerbuilder) | The builder, for chaining. | not started |  |
| [create()](https://developers.google.com/apps-script/reference/script/clock-trigger-builder#create()) | Creates the trigger. | [Trigger](#class-trigger) | The newly created, scheduled trigger. | not started |  |
| [everyDays(Integer)](https://developers.google.com/apps-script/reference/script/clock-trigger-builder#everyDays(Integer)) | Specifies to run the trigger every n days. | [ClockTriggerBuilder](#class-clocktriggerbuilder) | The builder, for chaining. | not started |  |
| [everyHours(Integer)](https://developers.google.com/apps-script/reference/script/clock-trigger-builder#everyHours(Integer)) | Specifies to run the trigger every n hours. | [ClockTriggerBuilder](#class-clocktriggerbuilder) | The builder, for chaining. | not started |  |
| [everyMinutes(Integer)](https://developers.google.com/apps-script/reference/script/clock-trigger-builder#everyMinutes(Integer)) | Specifies to run the trigger every n minutes. n must be 1, 5, 10, 15 or 30. | [ClockTriggerBuilder](#class-clocktriggerbuilder) | The builder, for chaining. | not started |  |
| [everyWeeks(Integer)](https://developers.google.com/apps-script/reference/script/clock-trigger-builder#everyWeeks(Integer)) | Specifies to run the trigger every n weeks. | [ClockTriggerBuilder](#class-clocktriggerbuilder) | The builder, for chaining. | not started |  |
| [inTimezone(String)](https://developers.google.com/apps-script/reference/script/clock-trigger-builder#inTimezone(String)) | Specifies the timezone for the specified dates/time when the trigger runs. By default, the timezone is that of the script. | [ClockTriggerBuilder](#class-clocktriggerbuilder) | This ClockTriggerBuilder, for chaining. | not started |  |
| [nearMinute(Integer)](https://developers.google.com/apps-script/reference/script/clock-trigger-builder#nearMinute(Integer)) | Specifies the minute at which the trigger runs (plus or minus 15 minutes). If nearMinute() is not called, a random minute value is used. | [ClockTriggerBuilder](#class-clocktriggerbuilder) | The builder, for chaining. | not started |  |
| [onMonthDay(Integer)](https://developers.google.com/apps-script/reference/script/clock-trigger-builder#onMonthDay(Integer)) | Specifies the date in the month that the trigger runs. | [ClockTriggerBuilder](#class-clocktriggerbuilder) | The builder, for chaining. | not started |  |
| [onWeekDay(Weekday)](https://developers.google.com/apps-script/reference/script/clock-trigger-builder#onWeekDay(Weekday)) | Specifies the day of the week that the trigger runs. | [ClockTriggerBuilder](#class-clocktriggerbuilder) | The builder, for chaining. | not started |  |

## Class: [DocumentTriggerBuilder](https://developers.google.com/apps-script/reference/script/document-trigger-builder)

A builder for document triggers.

| Method | Description | Return Type | Return Description | Status | Implementation |
|--- |--- |--- |--- |--- |--- |
| [create()](https://developers.google.com/apps-script/reference/script/document-trigger-builder#create()) | Creates and returns the new trigger. | [Trigger](#class-trigger) | The new trigger. | not started |  |
| [onOpen()](https://developers.google.com/apps-script/reference/script/document-trigger-builder#onOpen()) | Specifies a trigger that fires when the document is opened. | [DocumentTriggerBuilder](#class-documenttriggerbuilder) | This DocumentTriggerBuilder, for chaining. | not started |  |

## Class: [FormTriggerBuilder](https://developers.google.com/apps-script/reference/script/form-trigger-builder)

A builder for form triggers.

| Method | Description | Return Type | Return Description | Status | Implementation |
|--- |--- |--- |--- |--- |--- |
| [create()](https://developers.google.com/apps-script/reference/script/form-trigger-builder#create()) | Creates and returns the new trigger. | [Trigger](#class-trigger) | The new trigger. | not started |  |
| [onFormSubmit()](https://developers.google.com/apps-script/reference/script/form-trigger-builder#onFormSubmit()) | Specifies a trigger that fires when a response is submitted to the form. | [FormTriggerBuilder](#class-formtriggerbuilder) | This FormTriggerBuilder, for chaining. | not started |  |
| [onOpen()](https://developers.google.com/apps-script/reference/script/form-trigger-builder#onOpen()) | Specifies a trigger that fires when the form's edit view is opened. | [FormTriggerBuilder](#class-formtriggerbuilder) | This FormTriggerBuilder, for chaining. | not started |  |

## Class: [ScriptApp](https://developers.google.com/apps-script/reference/script/script-app)

Access and manipulate script publishing and triggers. This class allows users to create script triggers and control publishing the script as a service.

| Method | Description | Return Type | Return Description | Status | Implementation |
|--- |--- |--- |--- |--- |--- |
| [deleteTrigger(Trigger)](https://developers.google.com/apps-script/reference/script/script-app#deleteTrigger(Trigger)) | Removes the given trigger so it no longer runs. |  |  | not started |  |
| [getAuthorizationInfo(AuthMode,String)](https://developers.google.com/apps-script/reference/script/script-app#getAuthorizationInfo(AuthMode,String)) |  |  |  | not started |  |
| [getAuthorizationInfo(AuthMode)](https://developers.google.com/apps-script/reference/script/script-app#getAuthorizationInfo(AuthMode)) | Gets an object that checks if the user has granted authorization for all the script requirements. The object also provides an authorization URL for users to grant those permissions, in case any of the script requirements are not authorized. | [AuthorizationInfo](#class-authorizationinfo) | An object that can provide information about the user's authorization status. | not started |  |
| [getIdentityToken()](https://developers.google.com/apps-script/reference/script/script-app#getIdentityToken()) | Gets an OpenID Connect identity token for the effective user, if the openid scope has been granted. This scope is not included by default, and you must add it as an explicit scope in the manifest file to request it. Include the scopes https://www.googleapis.com/auth/userinfo.email or https://www.googleapis.com/auth/userinfo.profile to return additional user information in the token. | String\|null | The identity token if available; otherwise null. | not started |  |
| [getInstallationSource()](https://developers.google.com/apps-script/reference/script/script-app#getInstallationSource()) | Returns an enum value that indicates how the script came to be installed as an add-on for the current user (for example, whether the user installed it personally through the Chrome Web Store, or whether a domain administrator installed it for all users). | [InstallationSource](#enum-installationsource) | The source of installation. | not started |  |
| [getOAuthToken()](https://developers.google.com/apps-script/reference/script/script-app#getOAuthToken()) | Gets the OAuth 2.0 access token for the effective user. If the script's OAuth scopes are sufficient to authorize another Google API that normally requires its own OAuth flow (like Google Picker), scripts can bypass the second authorization prompt by passing this token instead. The token expires after a time (a few minutes at minimum); scripts should handle authorization failures and call this method to obtain a fresh token when needed. | String | A string representation of the OAuth 2.0 token. | not started |  |
| [getProjectTriggers()](https://developers.google.com/apps-script/reference/script/script-app#getProjectTriggers()) | Gets all installable triggers associated with the current project and current user. | [Trigger[]](#class-trigger) | An array of the current user's triggers associated with this project. | not started |  |
| [getScriptId()](https://developers.google.com/apps-script/reference/script/script-app#getScriptId()) | Gets the script project's unique ID. This is the preferred method to get the unique identifier for the script project as opposed to getProjectKey(). This ID can be used in all places where project key was previously provided. | String | The script project's ID. | not started |  |
| [getService()](https://developers.google.com/apps-script/reference/script/script-app#getService()) | Gets an object used to control publishing the script as a web app. | [Service](#class-service) | An object used to observe and control publishing the script as a web app. | not started |  |
| [getUserTriggers(Document)](https://developers.google.com/apps-script/reference/script/script-app#getUserTriggers(Document)) | Gets all installable triggers owned by this user in the given document, for this script or add-on only. This method cannot be used to see the triggers attached to other scripts. | [Trigger[]](#class-trigger) | An array of triggers owned by this user in the given document. | not started |  |
| [getUserTriggers(Form)](https://developers.google.com/apps-script/reference/script/script-app#getUserTriggers(Form)) | Gets all installable triggers owned by this user in the given form, for this script or add-on only. This method cannot be used to see the triggers attached to other scripts. | [Trigger[]](#class-trigger) | An array of triggers owned by this user in the given form. | not started |  |
| [getUserTriggers(Spreadsheet)](https://developers.google.com/apps-script/reference/script/script-app#getUserTriggers(Spreadsheet)) | Gets all installable triggers owned by this user in the given spreadsheet, for this script or add-on only. This method cannot be used to see the triggers attached to other scripts. | [Trigger[]](#class-trigger) | An array of triggers owned by this user in the given spreadsheet. | not started |  |
| [invalidateAuth()](https://developers.google.com/apps-script/reference/script/script-app#invalidateAuth()) | Invalidates the authorization the effective user has to execute the current script. Used to invalidate any permissions for the current script. This is especially useful for functions tagged as one-shot authorization. Since one-shot authorization functions can only be called the first run after the script has acquired authorization, if you wish to perform an action afterwards, you must revoke any authorization the script had, so the user can see the authorization dialog again. |  |  | not started |  |
| [newStateToken()](https://developers.google.com/apps-script/reference/script/script-app#newStateToken()) | Creates a builder for a state token that can be used in a callback API (like an OAuth flow). | [StateTokenBuilder](#class-statetokenbuilder) | An object used to continue the state-token-building process. | not started |  |
| [newTrigger(String)](https://developers.google.com/apps-script/reference/script/script-app#newTrigger(String)) | Begins the process of creating an installable trigger that, when fired, calls a given function. | [TriggerBuilder](#class-triggerbuilder) | An object used to continue the trigger-building process. | not started |  |
| [requireAllScopes(AuthMode)](https://developers.google.com/apps-script/reference/script/script-app#requireAllScopes(AuthMode)) | Validates if the user has granted consent for all of the scopes requested by the script. Use this method if an execution flow relies on all of the scopes that a script requests. If any consents are missing, then this method ends the current execution and renders an authorization prompt to request the missing consents. |  |  | not started |  |
| [requireScopes(AuthMode,String)](https://developers.google.com/apps-script/reference/script/script-app#requireScopes(AuthMode,String)) |  |  |  | not started |  |

## Class: [Service](https://developers.google.com/apps-script/reference/script/service)

Access and manipulate script publishing.

| Method | Description | Return Type | Return Description | Status | Implementation |
|--- |--- |--- |--- |--- |--- |
| [getUrl()](https://developers.google.com/apps-script/reference/script/service#getUrl()) | Returns the URL of the web app, if it has been deployed; otherwise returns null. If you are running the development mode web app, this returns the development mode url. | String | The URL of the web app. | not started |  |
| [isEnabled()](https://developers.google.com/apps-script/reference/script/service#isEnabled()) | Returns true if the script is accessible as a web app. | Boolean | true if the script is published as a web app; false if not. | not started |  |

## Class: [SpreadsheetTriggerBuilder](https://developers.google.com/apps-script/reference/script/spreadsheet-trigger-builder)

Builder for spreadsheet triggers.

| Method | Description | Return Type | Return Description | Status | Implementation |
|--- |--- |--- |--- |--- |--- |
| [create()](https://developers.google.com/apps-script/reference/script/spreadsheet-trigger-builder#create()) | Creates the trigger and returns it. | [Trigger](#class-trigger) | The created trigger. | not started |  |
| [onChange()](https://developers.google.com/apps-script/reference/script/spreadsheet-trigger-builder#onChange()) | Specifies a trigger that fires when the spreadsheet's content or structure is changed. | [SpreadsheetTriggerBuilder](#class-spreadsheettriggerbuilder) | A builder for chaining. | not started |  |
| [onEdit()](https://developers.google.com/apps-script/reference/script/spreadsheet-trigger-builder#onEdit()) | Specifies a trigger that fires when the spreadsheet is edited. | [SpreadsheetTriggerBuilder](#class-spreadsheettriggerbuilder) | A builder for chaining. | not started |  |
| [onFormSubmit()](https://developers.google.com/apps-script/reference/script/spreadsheet-trigger-builder#onFormSubmit()) | Specifies a trigger that fires when the spreadsheet has a form submitted to it. | [SpreadsheetTriggerBuilder](#class-spreadsheettriggerbuilder) | A builder for chaining. | not started |  |
| [onOpen()](https://developers.google.com/apps-script/reference/script/spreadsheet-trigger-builder#onOpen()) | Specifies a trigger that fires when the spreadsheet is opened. | [SpreadsheetTriggerBuilder](#class-spreadsheettriggerbuilder) | A builder for chaining. | not started |  |

## Class: [StateTokenBuilder](https://developers.google.com/apps-script/reference/script/state-token-builder)

Allows scripts to create state tokens that can be used in callback APIs (like OAuth flows).

| Method | Description | Return Type | Return Description | Status | Implementation |
|--- |--- |--- |--- |--- |--- |
| [createToken()](https://developers.google.com/apps-script/reference/script/state-token-builder#createToken()) | Constructs an encrypted string representation of the state token. | String | An encrypted string representing the token. | not started |  |
| [withArgument(String,String)](https://developers.google.com/apps-script/reference/script/state-token-builder#withArgument(String,String)) |  |  |  | not started |  |
| [withMethod(String)](https://developers.google.com/apps-script/reference/script/state-token-builder#withMethod(String)) | Sets a callback function. The default is a function named callback(). | [StateTokenBuilder](#class-statetokenbuilder) | The state token builder, for chaining. | not started |  |
| [withTimeout(Integer)](https://developers.google.com/apps-script/reference/script/state-token-builder#withTimeout(Integer)) | Sets the duration (in seconds) for which the token is valid. The defaults is 60 seconds; the maximum duration is 3600 seconds (1 hour). | [StateTokenBuilder](#class-statetokenbuilder) | The state token builder, for chaining. | not started |  |

## Class: [Trigger](https://developers.google.com/apps-script/reference/script/trigger)

A script trigger.

| Method | Description | Return Type | Return Description | Status | Implementation |
|--- |--- |--- |--- |--- |--- |
| [getEventType()](https://developers.google.com/apps-script/reference/script/trigger#getEventType()) | Returns the event type that the trigger fires on. | [EventType](#enum-eventtype) | The event type that this is a trigger for. | not started |  |
| [getHandlerFunction()](https://developers.google.com/apps-script/reference/script/trigger#getHandlerFunction()) | Returns the function that is called when the trigger fires. | String | The method name. | not started |  |
| [getTriggerSource()](https://developers.google.com/apps-script/reference/script/trigger#getTriggerSource()) | Returns the source of events that causes the trigger to fire. | [TriggerSource](#enum-triggersource) | The publisher this is a trigger for. | not started |  |
| [getTriggerSourceId()](https://developers.google.com/apps-script/reference/script/trigger#getTriggerSourceId()) | Returns the id specific to the source. | String | The id of the entity in the publisher that this is a trigger for. | not started |  |
| [getUniqueId()](https://developers.google.com/apps-script/reference/script/trigger#getUniqueId()) | Returns a unique identifier that can be used to distinguish triggers from each other. | String | The unique identifier of the trigger. | not started |  |

## Class: [TriggerBuilder](https://developers.google.com/apps-script/reference/script/trigger-builder)

A generic builder for script triggers.

| Method | Description | Return Type | Return Description | Status | Implementation |
|--- |--- |--- |--- |--- |--- |
| [forDocument(Document)](https://developers.google.com/apps-script/reference/script/trigger-builder#forDocument(Document)) | Creates and returns a DocumentTriggerBuilder tied to the given document. | [DocumentTriggerBuilder](#class-documenttriggerbuilder) | The new DocumentTriggerBuilder. | not started |  |
| [forDocument(String)](https://developers.google.com/apps-script/reference/script/trigger-builder#forDocument(String)) | Creates and returns a DocumentTriggerBuilder tied to the document with the given ID. | [DocumentTriggerBuilder](#class-documenttriggerbuilder) | The new DocumentTriggerBuilder. | not started |  |
| [forForm(Form)](https://developers.google.com/apps-script/reference/script/trigger-builder#forForm(Form)) | Creates and returns a FormTriggerBuilder tied to the given form. | [FormTriggerBuilder](#class-formtriggerbuilder) | The new FormTriggerBuilder. | not started |  |
| [forForm(String)](https://developers.google.com/apps-script/reference/script/trigger-builder#forForm(String)) | Creates and returns a FormTriggerBuilder tied to the form with the given ID. | [FormTriggerBuilder](#class-formtriggerbuilder) | The new FormTriggerBuilder. | not started |  |
| [forSpreadsheet(Spreadsheet)](https://developers.google.com/apps-script/reference/script/trigger-builder#forSpreadsheet(Spreadsheet)) | Creates and returns a SpreadsheetTriggerBuilder tied to the given spreadsheet. | [SpreadsheetTriggerBuilder](#class-spreadsheettriggerbuilder) | The new SpreadsheetTriggerBuilder. | not started |  |
| [forSpreadsheet(String)](https://developers.google.com/apps-script/reference/script/trigger-builder#forSpreadsheet(String)) | Creates and returns a SpreadsheetTriggerBuilder tied to the spreadsheet with the given ID. | [SpreadsheetTriggerBuilder](#class-spreadsheettriggerbuilder) | The new SpreadsheetTriggerBuilder. | not started |  |
| [forUserCalendar(String)](https://developers.google.com/apps-script/reference/script/trigger-builder#forUserCalendar(String)) | Returns a builder for building calendar triggers. | [CalendarTriggerBuilder](#class-calendartriggerbuilder) | The new CalendarTriggerBuilder. | not started |  |
| [timeBased()](https://developers.google.com/apps-script/reference/script/trigger-builder#timeBased()) | Creates and returns a ClockTriggerBuilder for building time-based triggers. | [ClockTriggerBuilder](#class-clocktriggerbuilder) | The new ClockTriggerBuilder. | not started |  |

## Enum: [AuthMode](https://developers.google.com/apps-script/reference/script/auth-mode)

An enumeration that identifies which categories of authorized services Apps Script is able to execute through a triggered function. These values are exposed in triggered functions as the authMode property of the event parameter, e. For more information, see the guide to the authorization lifecycle for add-ons.

| Property | Description | Status | Implementation |
|--- |--- |--- |--- |
| CUSTOM_FUNCTION | A mode that allows access to a limited subset of services for use in custom spreadsheet functions. Some of these services — including read-only access to Spreadsheet service — normally require authorization, but are permitted without authorization when used in a custom function. Because custom functions do not include an event parameter, this value is never returned; it is documented only to demonstrate that custom functions run in their own authorization mode. | completed | [link](../src/services/enums/scriptenums.js#L16) |
| FULL | A mode that allows access to all services that require authorization. This mode occurs when an add-on or a script executes as the result of any trigger other than the cases described for LIMITED or NONE. | completed | [link](../src/services/enums/scriptenums.js#L18) |
| LIMITED | A mode that allows access to a limited subset of services. This mode occurs when an add-on or a script bound to a document executes an onOpen(e) or onEdit(e) simple trigger, except in the case described for NONE. | completed | [link](../src/services/enums/scriptenums.js#L17) |
| NONE | A mode that does not allow access to any services that require authorization. This mode occurs when an add-on executes an onOpen(e) simple trigger, and the user has installed an add-on in a different document but the add-on has not been used in the current document. | completed | [link](../src/services/enums/scriptenums.js#L15) |

## Enum: [AuthorizationStatus](https://developers.google.com/apps-script/reference/script/authorization-status)

An enumeration denoting the authorization status of a script.

| Property | Description | Status | Implementation |
|--- |--- |--- |--- |
| NOT_REQUIRED | The user has granted this script all the authorization it currently requires. | completed | [link](../src/services/enums/scriptenums.js#L5) |
| REQUIRED | The user needs to authorize this script to use one or more services. In most cases, the script prompts the user for authorization the next time it runs; however, if the script is published as an add-on that uses installable triggers, the trigger runs the script without prompting for authorization but throws an exception if the script attempts to call the unauthorized service. | completed | [link](../src/services/enums/scriptenums.js#L4) |

## Enum: [EventType](https://developers.google.com/apps-script/reference/script/event-type)

An enumeration denoting the type of triggered event.

| Property | Description | Status | Implementation |
|--- |--- |--- |--- |
| CLOCK | The trigger fires once the time-driven event reaches a specific time. | completed | [link](../src/services/enums/scriptenums.js#L9) |
| ON_CHANGE | The trigger fires once the user changes the Google Sheets file (for example, by adding a row, which counts as a change instead of an edit). | completed | [link](../src/services/enums/scriptenums.js#L25) |
| ON_EDIT | The trigger fires once the user edits the Google Sheets file (for example, by entering a new value into a cell, which counts as an edit instead of a change). | completed | [link](../src/services/enums/scriptenums.js#L23) |
| ON_EVENT_UPDATED | The trigger fires once an event gets created, updated, or deleted on the specified Google Calendar. | completed | [link](../src/services/enums/scriptenums.js#L26) |
| ON_FORM_SUBMIT | The trigger fires once the user responds to a Google Form. This trigger is available either in the Google Form itself or in the Google Sheets file that the form sends its responses to. | completed | [link](../src/services/enums/scriptenums.js#L24) |
| ON_OPEN | The trigger fires once the user opens the Google Docs, Sheets, or Forms file. | completed | [link](../src/services/enums/scriptenums.js#L22) |

## Enum: [InstallationSource](https://developers.google.com/apps-script/reference/script/installation-source)

An enumeration that indicates how the script came to be installed as an add-on for the current user.

| Property | Description | Status | Implementation |
|--- |--- |--- |--- |
| APPS_MARKETPLACE_DOMAIN_ADD_ON | Add-on was installed by the administrator for the user's domain. | completed | [link](../src/services/enums/scriptenums.js#L29) |
| NONE | Script is not running as an add-on. | completed | [link](../src/services/enums/scriptenums.js#L15) |
| WEB_STORE_ADD_ON | Add-on was installed by the user from the Chrome Web Store. | completed | [link](../src/services/enums/scriptenums.js#L31) |

## Enum: [TriggerSource](https://developers.google.com/apps-script/reference/script/trigger-source)

An enumeration denoting the source of the event that causes the trigger to fire.

| Property | Description | Status | Implementation |
|--- |--- |--- |--- |
| CALENDAR | Google Calendar causes the trigger to fire. | completed | [link](../src/services/enums/scriptenums.js#L8) |
| CLOCK | A time-driven event causes the trigger to fire. | completed | [link](../src/services/enums/scriptenums.js#L9) |
| DOCUMENTS | Google Docs causes the trigger to fire. | completed | [link](../src/services/enums/scriptenums.js#L10) |
| FORMS | Google Forms causes the trigger to fire. | completed | [link](../src/services/enums/scriptenums.js#L11) |
| SPREADSHEETS | Google Sheets causes the trigger to fire. | completed | [link](../src/services/enums/scriptenums.js#L12) |

