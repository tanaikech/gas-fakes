# Script Service Progress
**Documentation:** [Script Service](https://developers.google.com/apps-script/reference/script) - 13% completed
---
## [ScriptApp](https://developers.google.com/apps-script/reference/script/script-app)
Provides access to script-related information and functionality.
33% completed

| method | return | status | comments |
| --- | --- | --- | --- |
| [deleteTrigger(trigger)](https://developers.google.com/apps-script/reference/script/script-app#deleteTrigger(Trigger)) | void | Not Started | |
| [getAuthorizationInfo()](https://developers.google.com/apps-script/reference/script/script-app#getAuthorizationInfo()) | [AuthorizationInfo](#authorizationinfo) | Not Started | |
| [getOAuthToken()](https://developers.google.com/apps-script/reference/script/script-app#getOAuthToken()) | String | Completed | |
| [getProjectKey()](https://developers.google.com/apps-script/reference/script/script-app#getProjectKey()) | String | Not Started | |
| [getProjectTriggers()](https://developers.google.com/apps-script/reference/script/script-app#getProjectTriggers()) | [Trigger[]](#trigger) | Not Started | |
| [getScriptId()](https://developers.google.com/apps-script/reference/script/script-app#getScriptId()) | String | Completed | |
| [getService()](https://developers.google.com/apps-script/reference/script/script-app#getService()) | [Service](#service) | Not Started | |
| [getUserTriggers(document)](https://developers.google.com/apps-script/reference/script/script-app#getUserTriggers(Document)) | [Trigger[]](#trigger) | Not Started | |
| [newTrigger(functionName)](https://developers.google.com/apps-script/reference/script/script-app#newTrigger(String)) | [TriggerBuilder](#triggerbuilder) | Not Started | |
| [invalidateAuth()](https://developers.google.com/apps-script/reference/script/script-app#invalidateAuth()) | void | Not Started | |
| [requireAllScopes(authMode)](https://developers.google.com/apps-script/reference/script/script-app#requireAllScopes(AuthMode)) | void | Completed | |
| [requireScopes(authMode, scopes)](https://developers.google.com/apps-script/reference/script/script-app#requireScopes(AuthMode,String)) | void | Completed | |

---
## [AuthorizationInfo](https://developers.google.com/apps-script/reference/script/authorization-info)
Provides information about the script's authorization.
0% completed

| method | return | status | comments |
| --- | --- | --- | --- |
| [getAuthorizationStatus()](https://developers.google.com/apps-script/reference/script/authorization-info#getAuthorizationStatus()) | [AuthorizationStatus](#authorizationstatus) | Not Started | |
| [getAuthorizationUrl()](https://developers.google.com/apps-script/reference/script/authorization-info#getAuthorizationUrl()) | String | Not Started | |

---
## [Trigger](https://developers.google.com/apps-script/reference/script/trigger)
Represents a script trigger.
0% completed

| method | return | status | comments |
| --- | --- | --- | --- |
| [getEventType()](https://developers.google.com/apps-script/reference/script/trigger#getEventType()) | [EventType](#eventtype) | Not Started | |
| [getHandlerFunction()](https://developers.google.com/apps-script/reference/script/trigger#getHandlerFunction()) | String | Not Started | |
| [getTriggerSource()](https://developers.google.com/apps-script/reference/script/trigger#getTriggerSource()) | [TriggerSource](#triggersource) | Not Started | |
| [getTriggerSourceId()](https://developers.google.com/apps-script/reference/script/trigger#getTriggerSourceId()) | String | Not Started | |
| [getUniqueId()](https://developers.google.com/apps-script/reference/script/trigger#getUniqueId()) | String | Not Started | |

---
## [TriggerBuilder](https://developers.google.com/apps-script/reference/script/trigger-builder)
Builds a script trigger.
0% completed

| method | return | status | comments |
| --- | --- | --- | --- |
| [forDocument(document)](https://developers.google.com/apps-script/reference/script/trigger-builder#forDocument(Document)) | [DocumentTriggerBuilder](#documenttriggerbuilder) | Not Started | |
| [forForm(form)](https://developers.google.com/apps-script/reference/script/trigger-builder#forForm(Form)) | [FormTriggerBuilder](#formtriggerbuilder) | Not Started | |
| [forSpreadsheet(spreadsheet)](https://developers.google.com/apps-script/reference/script/trigger-builder#forSpreadsheet(Spreadsheet)) | [SpreadsheetTriggerBuilder](#spreadsheeTtriggerbuilder) | Not Started | |
| [timeBased()](https://developers.google.com/apps-script/reference/script/trigger-builder#timeBased()) | [ClockTriggerBuilder](#clocktriggerbuilder) | Not Started | |

---
## [ClockTriggerBuilder](https://developers.google.com/apps-script/reference/script/clock-trigger-builder)
Builds a time-based trigger.
0% completed

| method | return | status | comments |
| --- | --- | --- | --- |
| [after(durationMilliseconds)](https://developers.google.com/apps-script/reference/script/clock-trigger-builder#after(Integer)) | [ClockTriggerBuilder](#clocktriggerbuilder) | Not Started | |
| [at(date)](https://developers.google.com/apps-script/reference/script/clock-trigger-builder#at(Date)) | [ClockTriggerBuilder](#clocktriggerbuilder) | Not Started | |
| [atDate(year, month, day)](https://developers.google.com/apps-script/reference/script/clock-trigger-builder#atDate(Integer,Integer,Integer)) | [ClockTriggerBuilder](#clocktriggerbuilder) | Not Started | |
| [atHour(hour)](https://developers.google.com/apps-script/reference/script/clock-trigger-builder#atHour(Integer)) | [ClockTriggerBuilder](#clocktriggerbuilder) | Not Started | |
| [everyDays(n)](https://developers.google.com/apps-script/reference/script/clock-trigger-builder#everyDays(Integer)) | [ClockTriggerBuilder](#clocktriggerbuilder) | Not Started | |
| [everyHours(n)](https://developers.google.com/apps-script/reference/script/clock-trigger-builder#everyHours(Integer)) | [ClockTriggerBuilder](#clocktriggerbuilder) | Not Started | |
| [everyMinutes(n)](https://developers.google.com/apps-script/reference/script/clock-trigger-builder#everyMinutes(Integer)) | [ClockTriggerBuilder](#clocktriggerbuilder) | Not Started | |
| [everyWeeks(n)](https://developers.google.com/apps-script/reference/script/clock-trigger-builder#everyWeeks(Integer)) | [ClockTriggerBuilder](#clocktriggerbuilder) | Not Started | |
| [inTimezone(timezone)](https://developers.google.com/apps-script/reference/script/clock-trigger-builder#inTimezone(String)) | [ClockTriggerBuilder](#clocktriggerbuilder) | Not Started | |
| [nearMinute(minute)](https://developers.google.com/apps-script/reference/script/clock-trigger-builder#nearMinute(Integer)) | [ClockTriggerBuilder](#clocktriggerbuilder) | Not Started | |
| [onMonthDay(day)](https://developers.google.com/apps-script/reference/script/clock-trigger-builder#onMonthDay(Integer)) | [ClockTriggerBuilder](#clocktriggerbuilder) | Not Started | |
| [onWeekDay(day)](https://developers.google.com/apps-script/reference/script/clock-trigger-builder#onWeekDay(Weekday)) | [ClockTriggerBuilder](#clocktriggerbuilder) | Not Started | |

---
## Enums
| Enum | Status |
| --- | --- |
| [AuthMode](https://developers.google.com/apps-script/reference/script/auth-mode) | Completed |
| [AuthorizationStatus](https://developers.google.com/apps-script/reference/script/authorization-status) | Not Started |
| [EventType](https://developers.google.com/apps-script/reference/script/event-type) | Not Started |
| [TriggerSource](https://developers.google.com/apps-script/reference/script/trigger-source) | Not Started | |
