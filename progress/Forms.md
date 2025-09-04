# Forms Service Progress
**Documentation:** [Forms Service](https://developers.google.com/apps-script/reference/forms)
---
## [Alignment](https://developers.google.com/apps-script/reference/forms/alignment)
An enum representing the supported types of image alignment.

100% completed

| method | return | status | comments |
|---|---|---|---|
| LEFT | [Alignment](#alignment) | Completed | |
| RIGHT | [Alignment](#alignment) | Completed | |
| CENTER | [Alignment](#alignment) | Completed | |
---
## [CheckboxGridItem](https://developers.google.com/apps-script/reference/forms/checkbox-grid-item)
A question item that allows the respondent to select one or more checkboxes per row in a grid.

0% completed

| method | return | status | comments |
|---|---|---|---|
| [clearValidation()](https://developers.google.com/apps-script/reference/forms/checkbox-grid-item#clearValidation()) | [CheckboxGridItem](#checkboxgriditem) | Not Started | |
| [createResponse(responses)](https://developers.google.com/apps-script/reference/forms/checkbox-grid-item#createResponse(String[])) | [ItemResponse](#itemresponse) | Not Started | |
| [getColumns()](https://developers.google.com/apps-script/reference/forms/checkbox-grid-item#getColumns()) | String[] | Not Started | |
| [getFeedbackForCorrect()](https://developers.google.com/apps-script/reference/forms/checkbox-grid-item#getFeedbackForCorrect()) | [QuizFeedback](#quizfeedback) | Not Started | |
| [getFeedbackForIncorrect()](https://developers.google.com/apps-script/reference/forms/checkbox-grid-item#getFeedbackForIncorrect()) | [QuizFeedback](#quizfeedback) | Not Started | |
| [getPoints()](https://developers.google.com/apps-script/reference/forms/checkbox-grid-item#getPoints()) | Integer | Not Started | |
| [getRows()](https://developers.google.com/apps-script/reference/forms/checkbox-grid-item#getRows()) | String[] | Not Started | |
| [isRequired()](https://developers.google.com/apps-script/reference/forms/checkbox-grid-item#isRequired()) | Boolean | Not Started | |
| [setColumns(columns)](https://developers.google.com/apps-script/reference/forms/checkbox-grid-item#setColumns(String[])) | [CheckboxGridItem](#checkboxgriditem) | Not Started | |
| [setFeedbackForCorrect(feedback)](https://developers.google.com/apps-script/reference/forms/checkbox-grid-item#setFeedbackForCorrect(QuizFeedback)) | [CheckboxGridItem](#checkboxgriditem) | Not Started | |
| [setFeedbackForIncorrect(feedback)](https://developers.google.com/apps-script/reference/forms/checkbox-grid-item#setFeedbackForIncorrect(QuizFeedback)) | [CheckboxGridItem](#checkboxgriditem) | Not Started | |
| [setPoints(points)](https://developers.google.com/apps-script/reference/forms/checkbox-grid-item#setPoints(Integer)) | [CheckboxGridItem](#checkboxgriditem) | Not Started | |
| [setRequired(enabled)](https://developers.google.com/apps-script/reference/forms/checkbox-grid-item#setRequired(Boolean)) | [CheckboxGridItem](#checkboxgriditem) | Not Started | |
| [setRows(rows)](https://developers.google.com/apps-script/reference/forms/checkbox-grid-item#setRows(String[])) | [CheckboxGridItem](#checkboxgriditem) | Not Started | |
| [setValidation(validation)](https://developers.google.com/apps-script/reference/forms/checkbox-grid-item#setValidation(GridValidation)) | [CheckboxGridItem](#checkboxgriditem) | Not Started | |
---
## [CheckboxItem](https://developers.google.com/apps-script/reference/forms/checkbox-item)
A question item that allows the respondent to select one or more checkboxes.

38% completed

| method | return | status | comments |
|---|---|---|---|
| [createChoice(value)](https://developers.google.com/apps-script/reference/forms/checkbox-item#createChoice(String)) | [Choice](#choice) | Completed | |
| [createResponse(responses)](https://developers.google.com/apps-script/reference/forms/checkbox-item#createResponse(String[])) | [ItemResponse](#itemresponse) | Not Started | |
| [getChoices()](https://developers.google.com/apps-script/reference/forms/checkbox-item#getChoices()) | [Choice[]](#choice) | Completed | |
| [getFeedbackForCorrect()](https://developers.google.com/apps-script/reference/forms/checkbox-item#getFeedbackForCorrect()) | [QuizFeedback](#quizfeedback) | Not Started | |
| [getFeedbackForIncorrect()](https://developers.google.com/apps-script/reference/forms/checkbox-item#getFeedbackForIncorrect()) | [QuizFeedback](#quizfeedback) | Not Started | |
| [getPoints()](https://developers.google.com/apps-script/reference/forms/checkbox-item#getPoints()) | Integer | Not Started | |
| [isRequired()](https://developers.google.com/apps-script/reference/forms/checkbox-item#isRequired()) | Boolean | Completed | |
| [setChoices(choices)](https://developers.google.com/apps-script/reference/forms/checkbox-item#setChoices(Choice[])) | [CheckboxItem](#checkboxitem) | Completed | |
| [setFeedbackForCorrect(feedback)](https://developers.google.com/apps-script/reference/forms/checkbox-item#setFeedbackForCorrect(QuizFeedback)) | [CheckboxItem](#checkboxitem) | Not Started | |
| [setFeedbackForIncorrect(feedback)](https://developers.google.com/apps-script/reference/forms/checkbox-item#setFeedbackForIncorrect(QuizFeedback)) | [CheckboxItem](#checkboxitem) | Not Started | |
| [setPoints(points)](https://developers.google.com/apps-script/reference/forms/checkbox-item#setPoints(Integer)) | [CheckboxItem](#checkboxitem) | Not Started | |
| [setRequired(enabled)](https://developers.google.com/apps-script/reference/forms/checkbox-item#setRequired(Boolean)) | [CheckboxItem](#checkboxitem) | Completed | |
| [setValidation(validation)](https://developers.google.com/apps-script/reference/forms/checkbox-item#setValidation(CheckboxValidation)) | [CheckboxItem](#checkboxitem) | Not Started | |
---
## [CheckboxValidation](https://developers.google.com/apps-script/reference/forms/checkbox-validation)
A validation rule for a CheckboxItem that requires the user to select a minimum, maximum, or exact number of checkboxes.

0% completed

| method | return | status | comments |
|---|---|---|---|
| [requireSelectAtLeast(number)](https://developers.google.com/apps-script/reference/forms/checkbox-validation#requireSelectAtLeast(Integer)) | [CheckboxValidationBuilder](#checkboxvalidationbuilder) | Not Started | |
| [requireSelectAtMost(number)](https://developers.google.com/apps-script/reference/forms/checkbox-validation#requireSelectAtMost(Integer)) | [CheckboxValidationBuilder](#checkboxvalidationbuilder) | Not Started | |
| [requireSelectExactly(number)](https://developers.google.com/apps-script/reference/forms/checkbox-validation#requireSelectExactly(Integer)) | [CheckboxValidationBuilder](#checkboxvalidationbuilder) | Not Started | |
---
## [CheckboxValidationBuilder](https://developers.google.com/apps-script/reference/forms/checkbox-validation-builder)
A builder for a checkbox validation rule.

0% completed

| method | return | status | comments |
|---|---|---|---|
| [build()](https://developers.google.com/apps-script/reference/forms/checkbox-validation-builder#build()) | [CheckboxValidation](#checkboxvalidation) | Not Started | |
| [copy()](https://developers.google.com/apps-script/reference/forms/checkbox-validation-builder#copy()) | [CheckboxValidationBuilder](#checkboxvalidationbuilder) | Not Started | |
| [requireSelectAtLeast(number)](https://developers.google.com/apps-script/reference/forms/checkbox-validation-builder#requireSelectAtLeast(Integer)) | [CheckboxValidationBuilder](#checkboxvalidationbuilder) | Not Started | |
| [requireSelectAtMost(number)](https://developers.google.com/apps-script/reference/forms/checkbox-validation-builder#requireSelectAtMost(Integer)) | [CheckboxValidationBuilder](#checkboxvalidationbuilder) | Not Started | |
| [requireSelectExactly(number)](https://developers.google.com/apps-script/reference/forms/checkbox-validation-builder#requireSelectExactly(Integer)) | [CheckboxValidationBuilder](#checkboxvalidationbuilder) | Not Started | |
| [withHelpText(text)](https://developers.google.com/apps-script/reference/forms/checkbox-validation-builder#withHelpText(String)) | [CheckboxValidationBuilder](#checkboxvalidationbuilder) | Not Started | |
---
## [Choice](https://developers.google.com/apps-script/reference/forms/choice)
A choice for a multiple-choice, checkbox, or list item.

25% completed

| method | return | status | comments |
|---|---|---|---|
| [getGotoPage()](https://developers.google.com/apps-script/reference/forms/choice#getGotoPage()) | [PageBreakItem](#pagebreakitem) | Not Started | |
| [getIsCorrect()](https://developers.google.com/apps-script/reference/forms/choice#getIsCorrect()) | Boolean | Not Started | |
| [getPageNavigationType()](https://developers.google.com/apps-script/reference/forms/choice#getPageNavigationType()) | [PageNavigationType](#pagenavigationtype) | Not Started | |
| [getValue()](https://developers.google.com/apps-script/reference/forms/choice#getValue()) | String | Completed | |
---
## [DateItem](https://developers.google.com/apps-script/reference/forms/date-item)
A question item that allows the respondent to indicate a date.

0% completed

| method | return | status | comments |
|---|---|---|---|
| [createResponse(response)](https://developers.google.com/apps-script/reference/forms/date-item#createResponse(Date)) | [ItemResponse](#itemresponse) | Not Started | |
| [getGeneralFeedback()](https://developers.google.com/apps-script/reference/forms/date-item#getGeneralFeedback()) | [QuizFeedback](#quizfeedback) | Not Started | |
| [getPoints()](https://developers.google.com/apps-script/reference/forms/date-item#getPoints()) | Integer | Not Started | |
| [includesYear()](https://developers.google.com/apps-script/reference/forms/date-item#includesYear()) | Boolean | Not Started | |
| [isRequired()](https://developers.google.com/apps-script/reference/forms/date-item#isRequired()) | Boolean | Not Started | |
| [setGeneralFeedback(feedback)](https://developers.google.com/apps-script/reference/forms/date-item#setGeneralFeedback(QuizFeedback)) | [DateItem](#dateitem) | Not Started | |
| [setIncludesYear(enableYear)](https://developers.google.com/apps-script/reference/forms/date-item#setIncludesYear(Boolean)) | [DateItem](#dateitem) | Not Started | |
| [setPoints(points)](https://developers.google.com/apps-script/reference/forms/date-item#setPoints(Integer)) | [DateItem](#dateitem) | Not Started | |
| [setRequired(enabled)](https://developers.google.com/apps-script/reference/forms/date-item#setRequired(Boolean)) | [DateItem](#dateitem) | Not Started | |
---
## [DateTimeItem](https://developers.google.com/apps-script/reference/forms/date-time-item)
A question item that allows the respondent to indicate a date and time.

0% completed

| method | return | status | comments |
|---|---|---|---|
| [createResponse(response)](https://developers.google.com/apps-script/reference/forms/date-time-item#createResponse(Date)) | [ItemResponse](#itemresponse) | Not Started | |
| [getGeneralFeedback()](https://developers.google.com/apps-script/reference/forms/date-time-item#getGeneralFeedback()) | [QuizFeedback](#quizfeedback) | Not Started | |
| [getPoints()](https://developers.google.com/apps-script/reference/forms/date-time-item#getPoints()) | Integer | Not Started | |
| [includesYear()](https://developers.google.com/apps-script/reference/forms/date-time-item#includesYear()) | Boolean | Not Started | |
| [isRequired()](https://developers.google.com/apps-script/reference/forms/date-time-item#isRequired()) | Boolean | Not Started | |
| [setGeneralFeedback(feedback)](https://developers.google.com/apps-script/reference/forms/date-time-item#setGeneralFeedback(QuizFeedback)) | [DateTimeItem](#datetimeitem) | Not Started | |
| [setIncludesYear(enableYear)](https://developers.google.com/apps-script/reference/forms/date-time-item#setIncludesYear(Boolean)) | [DateTimeItem](#datetimeitem) | Not Started | |
| [setPoints(points)](https://developers.google.com/apps-script/reference/forms/date-time-item#setPoints(Integer)) | [DateTimeItem](#datetimeitem) | Not Started | |
| [setRequired(enabled)](https://developers.google.com/apps-script/reference/forms/date-time-item#setRequired(Boolean)) | [DateTimeItem](#datetimeitem) | Not Started | |
---
## [DestinationType](https://developers.google.com/apps-script/reference/forms/destination-type)
An enum representing the type of form-response destination.

100% completed

| method | return | status | comments |
|---|---|---|---|
| SPREADSHEET | [DestinationType](#destinationtype) | Completed | |
---
## [DurationItem](https://developers.google.com/apps-script/reference/forms/duration-item)
A question item that allows the respondent to indicate a length of time.

0% completed

| method | return | status | comments |
|---|---|---|---|
| [createResponse(hours, minutes, seconds)](https://developers.google.com/apps-script/reference/forms/duration-item#createResponse(Integer,Integer,Integer)) | [ItemResponse](#itemresponse) | Not Started | |
| [getGeneralFeedback()](https://developers.google.com/apps-script/reference/forms/duration-item#getGeneralFeedback()) | [QuizFeedback](#quizfeedback) | Not Started | |
| [getPoints()](https://developers.google.com/apps-script/reference/forms/duration-item#getPoints()) | Integer | Not Started | |
| [isRequired()](https://developers.google.com/apps-script/reference/forms/duration-item#isRequired()) | Boolean | Not Started | |
| [setGeneralFeedback(feedback)](https://developers.google.com/apps-script/reference/forms/duration-item#setGeneralFeedback(QuizFeedback)) | [DurationItem](#durationitem) | Not Started | |
| [setPoints(points)](https://developers.google.com/apps-script/reference/forms/duration-item#setPoints(Integer)) | [DurationItem](#durationitem) | Not Started | |
| [setRequired(enabled)](https://developers.google.com/apps-script/reference/forms/duration-item#setRequired(Boolean)) | [DurationItem](#durationitem) | Not Started | |
---
## [Form](https://developers.google.com/apps-script/reference/forms/form)
A form that can be sent to users and record their responses.

9% completed

| method | return | status | comments |
|---|---|---|---|
| [addCheckboxGridItem()](https://developers.google.com/apps-script/reference/forms/form#addCheckboxGridItem()) | [CheckboxGridItem](#checkboxgriditem) | Not Started | |
| [addCheckboxItem()](https://developers.google.com/apps-script/reference/forms/form#addCheckboxItem()) | [CheckboxItem](#checkboxitem) | Completed | |
| [addDateItem()](https://developers.google.com/apps-script/reference/forms/form#addDateItem()) | [DateItem](#dateitem) | Not Started | |
| [addDateTimeItem()](https://developers.google.com/apps-script/reference/forms/form#addDateTimeItem()) | [DateTimeItem](#datetimeitem) | Not Started | |
| [addDurationItem()](https://developers.google.com/apps-script/reference/forms/form#addDurationItem()) | [DurationItem](#durationitem) | Not Started | |
| [addEditor(emailAddress)](https://developers.google.com/apps-script/reference/forms/form#addEditor(String)) | [Form](#form) | Not Started | |
| [addEditor(user)](https://developers.google.com/apps-script/reference/forms/form#addEditor(User)) | [Form](#form) | Not Started | |
| [addEditors(emailAddresses)](https://developers.google.com/apps-script/reference/forms/form#addEditors(String[])) | [Form](#form) | Not Started | |
| [addGridItem()](https://developers.google.com/apps-script/reference/forms/form#addGridItem()) | [GridItem](#griditem) | Not Started | |
| [addImageItem()](https://developers.google.com/apps-script/reference/forms/form#addImageItem()) | [ImageItem](#imageitem) | Not Started | |
| [addListItem()](https://developers.google.com/apps-script/reference/forms/form#addListItem()) | [ListItem](#listitem) | Not Started | |
| [addMultipleChoiceItem()](https://developers.google.com/apps-script/reference/forms/form#addMultipleChoiceItem()) | [MultipleChoiceItem](#multiplechoiceitem) | Not Started | |
| [addPageBreakItem()](https://developers.google.com/apps-script/reference/forms/form#addPageBreakItem()) | [PageBreakItem](#pagebreakitem) | Not Started | |
| [addParagraphTextItem()](https://developers.google.com/apps-script/reference/forms/form#addParagraphTextItem()) | [ParagraphTextItem](#paragraphtextitem) | Not Started | |
| [addScaleItem()](https://developers.google.com/apps-script/reference/forms/form#addScaleItem()) | [ScaleItem](#scaleitem) | Not Started | |
| [addSectionHeaderItem()](https://developers.google.com/apps-script/reference/forms/form#addSectionHeaderItem()) | [SectionHeaderItem](#sectionheaderitem) | Not Started | |
| [addTextItem()](https://developers.google.com/apps-script/reference/forms/form#addTextItem()) | [TextItem](#textitem) | Not Started | |
| [addVideoItem()](https://developers.google.com/apps-script/reference/forms/form#addVideoItem()) | [VideoItem](#videoitem) | Not Started | |
| [canEditResponse()](https://developers.google.com/apps-script/reference/forms/form#canEditResponse()) | Boolean | Not Started | |
| [collectsEmail()](https://developers.google.com/apps-script/reference/forms/form#collectsEmail()) | Boolean | Not Started | |
| [createResponse()](https://developers.google.com/apps-script/reference/forms/form#createResponse()) | [FormResponse](#formresponse) | Not Started | |
| [deleteAllResponses()](https://developers.google.com/apps-script/reference/forms/form#deleteAllResponses()) | [Form](#form) | Not Started | |
| [deleteItem(index)](https://developers.google.com/apps-script/reference/forms/form#deleteItem(Integer)) | void | Not Started | |
| [deleteItem(item)](https://developers.google.com/apps-script/reference/forms/form#deleteItem(Item)) | void | Not Started | |
| [deleteResponse(responseId)](https://developers.google.com/apps-script/reference/forms/form#deleteResponse(String)) | void | Not Started | |
| [getConfirmationMessage()](https://developers.google.com/apps-script/reference/forms/form#getConfirmationMessage()) | String | Not Started | |
| [getCustomClosedFormMessage()](https://developers.google.com/apps-script/reference/forms/form#getCustomClosedFormMessage()) | String | Not Started | |
| [getDescription()](https://developers.google.com/apps-script/reference/forms/form#getDescription()) | String | Not Started | |
| [getDestinationId()](https://developers.google.com/apps-script/reference/forms/form#getDestinationId()) | String | Not Started | |
| [getDestinationType()](https://developers.google.com/apps-script/reference/forms/form#getDestinationType()) | [DestinationType](#destinationtype) | Not Started | |
| [getEditUrl()](https://developers.google.com/apps-script/reference/forms/form#getEditUrl()) | String | Completed | |
| [getEditors()](https://developers.google.com/apps-script/reference/forms/form#getEditors()) | [User[]](https://developers.google.com/apps-script/reference/base/user) | Not Started | |
| [getId()](https://developers.google.com/apps-script/reference/forms/form#getId()) | String | Completed | |
| [getItemById(id)](https://developers.google.com/apps-script/reference/forms/form#getItemById(Integer)) | [Item](#item) | Completed | |
| [getItems()](https://developers.google.com/apps-script/reference/forms/form#getItems()) | [Item[]](#item) | Completed | |
| [getItems(itemType)](https://developers.google.com/apps-script/reference/forms/form#getItems(ItemType)) | [Item[]](#item) | Not Started | |
| [getPublishedUrl()](https://developers.google.com/apps-script/reference/forms/form#getPublishedUrl()) | String | Not Started | |
| [getRespondentViewers()](https://developers.google.com/apps-script/reference/forms/form#getRespondentViewers()) | [User[]](https://developers.google.com/apps-script/reference/base/user) | Not Started | |
| [getResponse(responseId)](https://developers.google.com/apps-script/reference/forms/form#getResponse(String)) | [FormResponse](#formresponse) | Not Started | |
| [getResponses()](https://developers.google.com/apps-script/reference/forms/form#getResponses()) | [FormResponse[]](#formresponse) | Not Started | |
| [getResponses(timestamp)](https://developers.google.com/apps-script/reference/forms/form#getResponses(Date)) | [FormResponse[]](#formresponse) | Not Started | |
| [getShuffleQuestions()](https://developers.google.com/apps-script/reference/forms/form#getShuffleQuestions()) | Boolean | Not Started | |
| [getSummaryUrl()](https://developers.google.com/apps-script/reference/forms/form#getSummaryUrl()) | String | Not Started | |
| [getTitle()](https://developers.google.com/apps-script/reference/forms/form#getTitle()) | String | Completed | |
| [hasLimitOneResponsePerUser()](https://developers.google.com/apps-script/reference/forms/form#hasLimitOneResponsePerUser()) | Boolean | Not Started | |
| [hasProgressBar()](https://developers.google.com/apps-script/reference/forms/form#hasProgressBar()) | Boolean | Not Started | |
| [hasRespondOnce()](https://developers.google.com/apps-script/reference/forms/form#hasRespondOnce()) | Boolean | Not Started | |
| [isAcceptingResponses()](https://developers.google.com/apps-script/reference/forms/form#isAcceptingResponses()) | Boolean | Not Started | |
| [isPublishingResponses()](https://developers.google.com/apps-script/reference/forms/form#isPublishingResponses()) | Boolean | Not Started | |
| [isQuiz()](https://developers.google.com/apps-script/reference/forms/form#isQuiz()) | Boolean | Not Started | |
| [isSendingEmailOnFormResponse()](https://developers.google.com/apps-script/reference/forms/form#isSendingEmailOnFormResponse()) | Boolean | Not Started | |
| [moveItem(from, to)](https://developers.google.com/apps-script/reference/forms/form#moveItem(Integer,Integer)) | [Item](#item) | Not Started | |
| [moveItem(item, toIndex)](https://developers.google.com/apps-script/reference/forms/form#moveItem(Item,Integer)) | [Item](#item) | Not Started | |
| [removeDestination()](https://developers.google.com/apps-script/reference/forms/form#removeDestination()) | [Form](#form) | Not Started | |
| [removeEditor(emailAddress)](https://developers.google.com/apps-script/reference/forms/form#removeEditor(String)) | [Form](#form) | Not Started | |
| [removeEditor(user)](https://developers.google.com/apps-script/reference/forms/form#removeEditor(User)) | [Form](#form) | Not Started | |
| [removeRespondentViewer(emailAddress)](https://developers.google.com/apps-script/reference/forms/form#removeRespondentViewer(String)) | [Form](#form) | Not Started | |
| [removeRespondentViewer(user)](https://developers.google.com/apps-script/reference/forms/form#removeRespondentViewer(User)) | [Form](#form) | Not Started | |
| [requiresLogin()](https://developers.google.com/apps-script/reference/forms/form#requiresLogin()) | Boolean | Not Started | |
| [setAcceptingResponses(enabled)](https://developers.google.com/apps-script/reference/forms/form#setAcceptingResponses(Boolean)) | [Form](#form) | Not Started | |
| [setAllowResponseEdits(enabled)](https://developers.google.com/apps-script/reference/forms/form#setAllowResponseEdits(Boolean)) | [Form](#form) | Not Started | |
| [setCollectEmail(collect)](https://developers.google.com/apps-script/reference/forms/form#setCollectEmail(Boolean)) | [Form](#form) | Not Started | |
| [setConfirmationMessage(message)](https://developers.google.com/apps-script/reference/forms/form#setConfirmationMessage(String)) | [Form](#form) | Not Started | |
| [setCustomClosedFormMessage(message)](https://developers.google.com/apps-script/reference/forms/form#setCustomClosedFormMessage(String)) | [Form](#form) | Not Started | |
| [setDescription(description)](https://developers.google.com/apps-script/reference/forms/form#setDescription(String)) | [Form](#form) | Not Started | |
| [setDestination(type, id)](https://developers.google.com/apps-script/reference/forms/form#setDestination(DestinationType,String)) | [Form](#form) | Not Started | |
| [setIsQuiz(enabled)](https://developers.google.com/apps-script/reference/forms/form#setIsQuiz(Boolean)) | [Form](#form) | Not Started | |
| [setLimitOneResponsePerUser(enabled)](https://developers.google.com/apps-script/reference/forms/form#setLimitOneResponsePerUser(Boolean)) | [Form](#form) | Not Started | |
| [setProgressBar(enabled)](https://developers.google.com/apps-script/reference/forms/form#setProgressBar(Boolean)) | [Form](#form) | Not Started | |
| [setPublishingResponses(enabled)](https://developers.google.com/apps-script/reference/forms/form#setPublishingResponses(Boolean)) | [Form](#form) | Not Started | |
| [setRequireLogin(requireLogin)](https://developers.google.com/apps-script/reference/forms/form#setRequireLogin(Boolean)) | [Form](#form) | Not Started | |
| [setRespondentViewers(emailAddresses)](https://developers.google.com/apps-script/reference/forms/form#setRespondentViewers(String[])) | [Form](#form) | Not Started | |
| [setSendingEmailOnFormResponse(enabled)](https://developers.google.com/apps-script/reference/forms/form#setSendingEmailOnFormResponse(Boolean)) | [Form](#form) | Not Started | |
| [setShuffleQuestions(shuffle)](https://developers.google.com/apps-script/reference/forms/form#setShuffleQuestions(Boolean)) | [Form](#form) | Not Started | |
| [setTitle(title)](https://developers.google.com/apps-script/reference/forms/form#setTitle(String)) | [Form](#form) | Completed | |
| [submitGrades(responses)](https://developers.google.com/apps-script/reference/forms/form#submitGrades(ItemResponse[])) | [Form](#form) | Not Started | |
---
## [FormApp](https://developers.google.com/apps-script/reference/forms/form-app)
The main class for accessing and creating Forms.

80% completed

| method | return | status | comments |
|---|---|---|---|
| [create(title)](https://developers.google.com/apps-script/reference/forms/form-app#create(String)) | [Form](#form) | Completed | |
| [getActiveForm()](https://developers.google.com/apps-script/reference/forms/form-app#getActiveForm()) | [Form](#form) | Completed | |
| [getUi()](https://developers.google.com/apps-script/reference/forms/form-app#getUi()) | [Ui](https://developers.google.com/apps-script/reference/base/ui) | Not Started | |
| [openById(id)](https://developers.google.com/apps-script/reference/forms/form-app#openById(String)) | [Form](#form) | Completed | |
| [openByUrl(url)](https://developers.google.com/apps-script/reference/forms/form-app#openByUrl(String)) | [Form](#form) | Completed | |
---
## [FormResponse](https://developers.google.com/apps-script/reference/forms/form-response)
A response to the form as a whole.

0% completed

| method | return | status | comments |
|---|---|---|---|
| [deleteResponse()](https://developers.google.com/apps-script/reference/forms/form-response#deleteResponse()) | void | Not Started | |
| [getEditResponseUrl()](https://developers.google.com/apps-script/reference/forms/form-response#getEditResponseUrl()) | String | Not Started | |
| [getGradableItemResponses()](https://developers.google.com/apps-script/reference/forms/form-response#getGradableItemResponses()) | [ItemResponse[]](#itemresponse) | Not Started | |
| [getGradableResponse(item)](https://developers.google.com/apps-script/reference/forms/form-response#getGradableResponse(Item)) | [ItemResponse](#itemresponse) | Not Started | |
| [getId()](https://developers.google.com/apps-script/reference/forms/form-response#getId()) | String | Not Started | |
| [getItemResponses()](https://developers.google.com/apps-script/reference/forms/form-response#getItemResponses()) | [ItemResponse[]](#itemresponse) | Not Started | |
| [getRespondentEmail()](https://developers.google.com/apps-script/reference/forms/form-response#getRespondentEmail()) | String | Not Started | |
| [getResponseForItem(item)](https://developers.google.com/apps-script/reference/forms/form-response#getResponseForItem(Item)) | [ItemResponse](#itemresponse) | Not Started | |
| [getTimestamp()](https://developers.google.com/apps-script/reference/forms/form-response#getTimestamp()) | [Date](https://developers.google.com/apps-script/reference/base/date) | Not Started | |
| [submit()](https://developers.google.com/apps-script/reference/forms/form-response#submit()) | [FormResponse](#formresponse) | Not Started | |
| [toPrefilledUrl()](https://developers.google.com/apps-script/reference/forms/form-response#toPrefilledUrl()) | String | Not Started | |
| [withItemGrade(gradedResponse)](https://developers.google.com/apps-script/reference/forms/form-response#withItemGrade(ItemResponse)) | [FormResponse](#formresponse) | Not Started | |
| [withItemResponse(response)](https://developers.google.com/apps-script/reference/forms/form-response#withItemResponse(ItemResponse)) | [FormResponse](#formresponse) | Not Started | |
---
## [GridItem](https://developers.google.com/apps-script/reference/forms/grid-item)
A question item that allows the respondent to select one choice per row from a grid of choices.

0% completed

| method | return | status | comments |
|---|---|---|---|
| [createResponse(responses)](https://developers.google.com/apps-script/reference/forms/grid-item#createResponse(String[])) | [ItemResponse](#itemresponse) | Not Started | |
| [getColumns()](https://developers.google.com/apps-script/reference/forms/grid-item#getColumns()) | String[] | Not Started | |
| [getRows()](https://developers.google.com/apps-script/reference/forms/grid-item#getRows()) | String[] | Not Started | |
| [isRequired()](https://developers.google.com/apps-script/reference/forms/grid-item#isRequired()) | Boolean | Not Started | |
| [setColumns(columns)](https://developers.google.com/apps-script/reference/forms/grid-item#setColumns(String[])) | [GridItem](#griditem) | Not Started | |
| [setRequired(enabled)](https://developers.google.com/apps-script/reference/forms/grid-item#setRequired(Boolean)) | [GridItem](#griditem) | Not Started | |
| [setRows(rows)](https://developers.google.com/apps-script/reference/forms/grid-item#setRows(String[])) | [GridItem](#griditem) | Not Started | |
---
## [GridValidation](https://developers.google.com/apps-script/reference/forms/grid-validation)
A validation rule for a GridItem that requires the user to select one choice per row.

0% completed

| method | return | status | comments |
|---|---|---|---|
| [requireValueInEachRow()](https://developers.google.com/apps-script/reference/forms/grid-validation#requireValueInEachRow()) | [GridValidationBuilder](#gridvalidationbuilder) | Not Started | |
---
## [GridValidationBuilder](https://developers.google.com/apps-script/reference/forms/grid-validation-builder)
A builder for a grid validation rule.

0% completed

| method | return | status | comments |
|---|---|---|---|
| [build()](https://developers.google.com/apps-script/reference/forms/grid-validation-builder#build()) | [GridValidation](#gridvalidation) | Not Started | |
| [copy()](https://developers.google.com/apps-script/reference/forms/grid-validation-builder#copy()) | [GridValidationBuilder](#gridvalidationbuilder) | Not Started | |
| [requireValueInEachRow()](https://developers.google.com/apps-script/reference/forms/grid-validation-builder#requireValueInEachRow()) | [GridValidationBuilder](#gridvalidationbuilder) | Not Started | |
| [withHelpText(text)](https://developers.google.com/apps-script/reference/forms/grid-validation-builder#withHelpText(String)) | [GridValidationBuilder](#gridvalidationbuilder) | Not Started | |
---
## [ImageItem](https://developers.google.com/apps-script/reference/forms/image-item)
A layout item that displays an image.

0% completed

| method | return | status | comments |
|---|---|---|---|
| [getAlignment()](https://developers.google.com/apps-script/reference/forms/image-item#getAlignment()) | [Alignment](#alignment) | Not Started | |
| [getImage()](https://developers.google.com/apps-script/reference/forms/image-item#getImage()) | [Blob](https://developers.google.com/apps-script/reference/base/blob) | Not Started | |
| [getWidth()](https://developers.google.com/apps-script/reference/forms/image-item#getWidth()) | Integer | Not Started | |
| [setAlignment(alignment)](https://developers.google.com/apps-script/reference/forms/image-item#setAlignment(Alignment)) | [ImageItem](#imageitem) | Not Started | |
| [setImage(image)](https://developers.google.com/apps-script/reference/forms/image-item#setImage(BlobSource)) | [ImageItem](#imageitem) | Not Started | |
| [setWidth(width)](https://developers.google.com/apps-script/reference/forms/image-item#setWidth(Integer)) | [ImageItem](#imageitem) | Not Started | |
---
## [Item](https://developers.google.com/apps-script/reference/forms/item)
A generic form item that can be converted to a specific type, like a CheckboxItem or a PageBreakItem.

21% completed

| method | return | status | comments |
|---|---|---|---|
| [asCheckboxGridItem()](https://developers.google.com/apps-script/reference/forms/item#asCheckboxGridItem()) | [CheckboxGridItem](#checkboxgriditem) | Not Started | |
| [asCheckboxItem()](https://developers.google.com/apps-script/reference/forms/item#asCheckboxItem()) | [CheckboxItem](#checkboxitem) | Completed | |
| [asDateItem()](https://developers.google.com/apps-script/reference/forms/item#asDateItem()) | [DateItem](#dateitem) | Not Started | |
| [asDateTimeItem()](https://developers.google.com/apps-script/reference/forms/item#asDateTimeItem()) | [DateTimeItem](#datetimeitem) | Not Started | |
| [asDurationItem()](https://developers.google.com/apps-script/reference/forms/item#asDurationItem()) | [DurationItem](#durationitem) | Not Started | |
| [asGridItem()](https://developers.google.com/apps-script/reference/forms/item#asGridItem()) | [GridItem](#griditem) | Not Started | |
| [asImageItem()](https://developers.google.com/apps-script/reference/forms/item#asImageItem()) | [ImageItem](#imageitem) | Not Started | |
| [asListItem()](https://developers.google.com/apps-script/reference/forms/item#asListItem()) | [ListItem](#listitem) | Not Started | |
| [asMultipleChoiceItem()](https://developers.google.com/apps-script/reference/forms/item#asMultipleChoiceItem()) | [MultipleChoiceItem](#multiplechoiceitem) | Not Started | |
| [asPageBreakItem()](https://developers.google.com/apps-script/reference/forms/item#asPageBreakItem()) | [PageBreakItem](#pagebreakitem) | Not Started | |
| [asParagraphTextItem()](https://developers.google.com/apps-script/reference/forms/item#asParagraphTextItem()) | [ParagraphTextItem](#paragraphtextitem) | Not Started | |
| [asScaleItem()](https://developers.google.com/apps-script/reference/forms/item#asScaleItem()) | [ScaleItem](#scaleitem) | Not Started | |
| [asSectionHeaderItem()](https://developers.google.com/apps-script/reference/forms/item#asSectionHeaderItem()) | [SectionHeaderItem](#sectionheaderitem) | Not Started | |
| [asTextItem()](https://developers.google.com/apps-script/reference/forms/item#asTextItem()) | [TextItem](#textitem) | Not Started | |
| [asTimeItem()](https://developers.google.com/apps-script/reference/forms/item#asTimeItem()) | [TimeItem](#timeitem) | Not Started | |
| [asVideoItem()](https://developers.google.com/apps-script/reference/forms/item#asVideoItem()) | [VideoItem](#videoitem) | Not Started | |
| [duplicate()](https://developers.google.com/apps-script/reference/forms/item#duplicate()) | [Item](#item) | Not Started | |
| [getHelpText()](https://developers.google.com/apps-script/reference/forms/item#getHelpText()) | String | Not Started | |
| [getId()](https://developers.google.com/apps-script/reference/forms/item#getId()) | Integer | Completed | |
| [getIndex()](https://developers.google.com/apps-script/reference/forms/item#getIndex()) | Integer | Completed | |
| [getTitle()](https://developers.google.com/apps-script/reference/forms/item#getTitle()) | String | Completed | |
| [getType()](https://developers.google.com/apps-script/reference/forms/item#getType()) | [ItemType](#itemtype) | Completed | |
| [setHelpText(text)](https://developers.google.com/apps-script/reference/forms/item#setHelpText(String)) | [Item](#item) | Not Started | |
| [setTitle(title)](https://developers.google.com/apps-script/reference/forms/item#setTitle(String)) | [Item](#item) | Completed | |
---
## [ItemResponse](https://developers.google.com/apps-script/reference/forms/item-response)
A response to one question item.

0% completed

| method | return | status | comments |
|---|---|---|---|
| [getFeedback()](https://developers.google.com/apps-script/reference/forms/item-response#getFeedback()) | String | Not Started | |
| [getItem()](https://developers.google.com/apps-script/reference/forms/item-response#getItem()) | [Item](#item) | Not Started | |
| [getResponse()](https://developers.google.com/apps-script/reference/forms/item-response#getResponse()) | Object | Not Started | |
| [getScore()](https://developers.google.com/apps-script/reference/forms/item-response#getScore()) | Number | Not Started | |
| [setFeedback(feedback)](https://developers.google.com/apps-script/reference/forms/item-response#setFeedback(Object)) | [ItemResponse](#itemresponse) | Not Started | |
| [setScore(score)](https://developers.google.com/apps-script/reference/forms/item-response#setScore(Object)) | [ItemResponse](#itemresponse) | Not Started | |
---
## [ItemType](https://developers.google.com/apps-script/reference/forms/item-type)
An enum representing the different types of items that can be added to a form.

100% completed

| method | return | status | comments |
|---|---|---|---|
| CHECKBOX | [ItemType](#itemtype) | Completed | |
| CHECKBOX_GRID | [ItemType](#itemtype) | Completed | |
| DATE | [ItemType](#itemtype) | Completed | |
| DATETIME | [ItemType](#itemtype) | Completed | |
| DURATION | [ItemType](#itemtype) | Completed | |
| GRID | [ItemType](#itemtype) | Completed | |
| IMAGE | [ItemType](#itemtype) | Completed | |
| LIST | [ItemType](#itemtype) | Completed | |
| MULTIPLE_CHOICE | [ItemType](#itemtype) | Completed | |
| PAGE_BREAK | [ItemType](#itemtype) | Completed | |
| PARAGRAPH_TEXT | [ItemType](#itemtype) | Completed | |
| SCALE | [ItemType](#itemtype) | Completed | |
| SECTION_HEADER | [ItemType](#itemtype) | Completed | |
| TEXT | [ItemType](#itemtype) | Completed | |
| TIME | [ItemType](#itemtype) | Completed | |
| VIDEO | [ItemType](#itemtype) | Completed | |
---
## [ListItem](https://developers.google.com/apps-script/reference/forms/list-item)
A question item that allows the respondent to select one choice from a list of presented options.

0% completed

| method | return | status | comments |
|---|---|---|---|
| [createChoice(value)](https://developers.google.com/apps-script/reference/forms/list-item#createChoice(String)) | [Choice](#choice) | Not Started | |
| [createChoice(value, isCorrect)](https://developers.google.com/apps-script/reference/forms/list-item#createChoice(String,Boolean)) | [Choice](#choice) | Not Started | |
| [createChoice(value, navigationType)](https://developers.google.com/apps-script/reference/forms/list-item#createChoice(String,PageNavigationType)) | [Choice](#choice) | Not Started | |
| [createChoice(value, page)](https://developers.google.com/apps-script/reference/forms/list-item#createChoice(String,PageBreakItem)) | [Choice](#choice) | Not Started | |
| [createResponse(response)](https://developers.google.com/apps-script/reference/forms/list-item#createResponse(String)) | [ItemResponse](#itemresponse) | Not Started | |
| [getChoices()](https://developers.google.com/apps-script/reference/forms/list-item#getChoices()) | [Choice[]](#choice) | Not Started | |
| [getFeedbackForCorrect()](https://developers.google.com/apps-script/reference/forms/list-item#getFeedbackForCorrect()) | [QuizFeedback](#quizfeedback) | Not Started | |
| [getFeedbackForIncorrect()](https://developers.google.com/apps-script/reference/forms/list-item#getFeedbackForIncorrect()) | [QuizFeedback](#quizfeedback) | Not Started | |
| [getPoints()](https://developers.google.com/apps-script/reference/forms/list-item#getPoints()) | Integer | Not Started | |
| [isRequired()](https://developers.google.com/apps-script/reference/forms/list-item#isRequired()) | Boolean | Not Started | |
| [setChoiceValues(values)](https://developers.google.com/apps-script/reference/forms/list-item#setChoiceValues(String[])) | [ListItem](#listitem) | Not Started | |
| [setChoices(choices)](https://developers.google.com/apps-script/reference/forms/list-item#setChoices(Choice[])) | [ListItem](#listitem) | Not Started | |
| [setFeedbackForCorrect(feedback)](https://developers.google.com/apps-script/reference/forms/list-item#setFeedbackForCorrect(QuizFeedback)) | [ListItem](#listitem) | Not Started | |
| [setFeedbackForIncorrect(feedback)](https://developers.google.com/apps-script/reference/forms/list-item#setFeedbackForIncorrect(QuizFeedback)) | [ListItem](#listitem) | Not Started | |
| [setPoints(points)](https://developers.google.com/apps-script/reference/forms/list-item#setPoints(Integer)) | [ListItem](#listitem) | Not Started | |
| [setRequired(enabled)](https://developers.google.com/apps-script/reference/forms/list-item#setRequired(Boolean)) | [ListItem](#listitem) | Not Started | |
---
## [MultipleChoiceItem](https://developers.google.com/apps-script/reference/forms/multiple-choice-item)
A question item that allows the respondent to select one choice from a list of presented options.

0% completed

| method | return | status | comments |
|---|---|---|---|
| [createChoice(value)](https://developers.google.com/apps-script/reference/forms/multiple-choice-item#createChoice(String)) | [Choice](#choice) | Not Started | |
| [createChoice(value, isCorrect)](https://developers.google.com/apps-script/reference/forms/multiple-choice-item#createChoice(String,Boolean)) | [Choice](#choice) | Not Started | |
| [createChoice(value, navigationType)](https://developers.google.com/apps-script/reference/forms/multiple-choice-item#createChoice(String,PageNavigationType)) | [Choice](#choice) | Not Started | |
| [createChoice(value, page)](https://developers.google.com/apps-script/reference/forms/multiple-choice-item#createChoice(String,PageBreakItem)) | [Choice](#choice) | Not Started | |
| [createResponse(response)](https://developers.google.com/apps-script/reference/forms/multiple-choice-item#createResponse(String)) | [ItemResponse](#itemresponse) | Not Started | |
| [getChoices()](https://developers.google.com/apps-script/reference/forms/multiple-choice-item#getChoices()) | [Choice[]](#choice) | Not Started | |
| [getFeedbackForCorrect()](https://developers.google.com/apps-script/reference/forms/multiple-choice-item#getFeedbackForCorrect()) | [QuizFeedback](#quizfeedback) | Not Started | |
| [getFeedbackForIncorrect()](https://developers.google.com/apps-script/reference/forms/multiple-choice-item#getFeedbackForIncorrect()) | [QuizFeedback](#quizfeedback) | Not Started | |
| [getPoints()](https://developers.google.com/apps-script/reference/forms/multiple-choice-item#getPoints()) | Integer | Not Started | |
| [hasOtherOption()](https://developers.google.com/apps-script/reference/forms/multiple-choice-item#hasOtherOption()) | Boolean | Not Started | |
| [isRequired()](https://developers.google.com/apps-script/reference/forms/multiple-choice-item#isRequired()) | Boolean | Not Started | |
| [setChoiceValues(values)](https://developers.google.com/apps-script/reference/forms/multiple-choice-item#setChoiceValues(String[])) | [MultipleChoiceItem](#multiplechoiceitem) | Not Started | |
| [setChoices(choices)](https://developers.google.com/apps-script/reference/forms/multiple-choice-item#setChoices(Choice[])) | [MultipleChoiceItem](#multiplechoiceitem) | Not Started | |
| [setFeedbackForCorrect(feedback)](https://developers.google.com/apps-script/reference/forms/multiple-choice-item#setFeedbackForCorrect(QuizFeedback)) | [MultipleChoiceItem](#multiplechoiceitem) | Not Started | |
| [setFeedbackForIncorrect(feedback)](https://developers.google.com/apps-script/reference/forms/multiple-choice-item#setFeedbackForIncorrect(QuizFeedback)) | [MultipleChoiceItem](#multiplechoiceitem) | Not Started | |
| [setPoints(points)](https://developers.google.com/apps-script/reference/forms/multiple-choice-item#setPoints(Integer)) | [MultipleChoiceItem](#multiplechoiceitem) | Not Started | |
| [setRequired(enabled)](https://developers.google.com/apps-script/reference/forms/multiple-choice-item#setRequired(Boolean)) | [MultipleChoiceItem](#multiplechoiceitem) | Not Started | |
| [showOtherOption(enabled)](https://developers.google.com/apps-script/reference/forms/multiple-choice-item#showOtherOption(Boolean)) | [MultipleChoiceItem](#multiplechoiceitem) | Not Started | |
---
## [PageBreakItem](https://developers.google.com/apps-script/reference/forms/page-break-item)
A layout item that marks the start of a new page in a form.

0% completed

| method | return | status | comments |
|---|---|---|---|
| [getGoToPage()](https://developers.google.com/apps-script/reference/forms/page-break-item#getGoToPage()) | [PageBreakItem](#pagebreakitem) | Not Started | |
| [getPageNavigationType()](https://developers.google.com/apps-script/reference/forms/page-break-item#getPageNavigationType()) | [PageNavigationType](#pagenavigationtype) | Not Started | |
| [setGoToPage(goToPage)](https://developers.google.com/apps-script/reference/forms/page-break-item#setGoToPage(PageBreakItem)) | [PageBreakItem](#pagebreakitem) | Not Started | |
| [setGoToPage(navigationType)](https://developers.google.com/apps-script/reference/forms/page-break-item#setGoToPage(PageNavigationType)) | [PageBreakItem](#pagebreakitem) | Not Started | |
---
## [PageNavigationType](https://developers.google.com/apps-script/reference/forms/page-navigation-type)
An enum representing the supported types of page navigation.

100% completed

| method | return | status | comments |
|---|---|---|---|
| CONTINUE | [PageNavigationType](#pagenavigationtype) | Completed | |
| GO_TO_PAGE | [PageNavigationType](#pagenavigationtype) | Completed | |
| RESTART | [PageNavigationType](#pagenavigationtype) | Completed | |
| SUBMIT | [PageNavigationType](#pagenavigationtype) | Completed | |
---
## [ParagraphTextItem](https://developers.google.com/apps-script/reference/forms/paragraph-text-item)
A question item that allows the respondent to enter a block of text.

0% completed

| method | return | status | comments |
|---|---|---|---|
| [createResponse(response)](https://developers.google.com/apps-script/reference/forms/paragraph-text-item#createResponse(String)) | [ItemResponse](#itemresponse) | Not Started | |
| [getGeneralFeedback()](https://developers.google.com/apps-script/reference/forms/paragraph-text-item#getGeneralFeedback()) | [QuizFeedback](#quizfeedback) | Not Started | |
| [getPoints()](https://developers.google.com/apps-script/reference/forms/paragraph-text-item#getPoints()) | Integer | Not Started | |
| [isRequired()](https://developers.google.com/apps-script/reference/forms/paragraph-text-item#isRequired()) | Boolean | Not Started | |
| [setGeneralFeedback(feedback)](https://developers.google.com/apps-script/reference/forms/paragraph-text-item#setGeneralFeedback(QuizFeedback)) | [ParagraphTextItem](#paragraphtextitem) | Not Started | |
| [setPoints(points)](https://developers.google.com/apps-script/reference/forms/paragraph-text-item#setPoints(Integer)) | [ParagraphTextItem](#paragraphtextitem) | Not Started | |
| [setRequired(enabled)](https://developers.google.com/apps-script/reference/forms/paragraph-text-item#setRequired(Boolean)) | [ParagraphTextItem](#paragraphtextitem) | Not Started | |
| [setValidation(validation)](https://developers.google.com/apps-script/reference/forms/paragraph-text-item#setValidation(ParagraphTextValidation)) | [ParagraphTextItem](#paragraphtextitem) | Not Started | |
---
## [ParagraphTextValidation](https://developers.google.com/apps-script/reference/forms/paragraph-text-validation)
A validation rule for a ParagraphTextItem that requires the user to enter a response that conforms to a regular expression.

0% completed

| method | return | status | comments |
|---|---|---|---|
| [requireTextContainsPattern(pattern)](https://developers.google.com/apps-script/reference/forms/paragraph-text-validation#requireTextContainsPattern(String)) | [ParagraphTextValidationBuilder](#paragraphtextvalidationbuilder) | Not Started | |
| [requireTextDoesNotContainPattern(pattern)](https://developers.google.com/apps-script/reference/forms/paragraph-text-validation#requireTextDoesNotContainPattern(String)) | [ParagraphTextValidationBuilder](#paragraphtextvalidationbuilder) | Not Started | |
| [requireTextMatchesPattern(pattern)](https://developers.google.com/apps-script/reference/forms/paragraph-text-validation#requireTextMatchesPattern(String)) | [ParagraphTextValidationBuilder](#paragraphtextvalidationbuilder) | Not Started | |
---
## [ParagraphTextValidationBuilder](https://developers.google.com/apps-script/reference/forms/paragraph-text-validation-builder)
A builder for a paragraph-text validation rule.

0% completed

| method | return | status | comments |
|---|---|---|---|
| [build()](https://developers.google.com/apps-script/reference/forms/paragraph-text-validation-builder#build()) | [ParagraphTextValidation](#paragraphtextvalidation) | Not Started | |
| [copy()](https://developers.google.com/apps-script/reference/forms/paragraph-text-validation-builder#copy()) | [ParagraphTextValidationBuilder](#paragraphtextvalidationbuilder) | Not Started | |
| [requireTextContainsPattern(pattern)](https://developers.google.com/apps-script/reference/forms/paragraph-text-validation-builder#requireTextContainsPattern(String)) | [ParagraphTextValidationBuilder](#paragraphtextvalidationbuilder) | Not Started | |
| [requireTextDoesNotContainPattern(pattern)](https://developers.google.com/apps-script/reference/forms/paragraph-text-validation-builder#requireTextDoesNotContainPattern(String)) | [ParagraphTextValidationBuilder](#paragraphtextvalidationbuilder) | Not Started | |
| [requireTextMatchesPattern(pattern)](https://developers.google.com/apps-script/reference/forms/paragraph-text-validation-builder#requireTextMatchesPattern(String)) | [ParagraphTextValidationBuilder](#paragraphtextvalidationbuilder) | Not Started | |
| [withHelpText(text)](https://developers.google.com/apps-script/reference/forms/paragraph-text-validation-builder#withHelpText(String)) | [ParagraphTextValidationBuilder](#paragraphtextvalidationbuilder) | Not Started | |
---
## [QuizFeedback](https://developers.google.com/apps-script/reference/forms/quiz-feedback)
A feedback object that can be attached to a Form question or to a Choice of a multiple-choice, checkbox, or list item.

0% completed

| method | return | status | comments |
|---|---|---|---|
| [getLinkUrls()](https://developers.google.com/apps-script/reference/forms/quiz-feedback#getLinkUrls()) | String[] | Not Started | |
| [getText()](https://developers.google.com/apps-script/reference/forms/quiz-feedback#getText()) | String | Not Started | |
---
## [QuizFeedbackBuilder](https://developers.google.com/apps-script/reference/forms/quiz-feedback-builder)
Builds a QuizFeedback object.

0% completed

| method | return | status | comments |
|---|---|---|---|
| [addLink(url)](https://developers.google.com/apps-script/reference/forms/quiz-feedback-builder#addLink(String)) | [QuizFeedbackBuilder](#quizfeedbackbuilder) | Not Started | |
| [addLink(url, displayText)](https://developers.google.com/apps-script/reference/forms/quiz-feedback-builder#addLink(String,String)) | [QuizFeedbackBuilder](#quizfeedbackbuilder) | Not Started | |
| [build()](https://developers.google.com/apps-script/reference/forms/quiz-feedback-builder#build()) | [QuizFeedback](#quizfeedback) | Not Started | |
| [copy()](https://developers.google.com/apps-script/reference/forms/quiz-feedback-builder#copy()) | [QuizFeedbackBuilder](#quizfeedbackbuilder) | Not Started | |
| [setLinkUrls(urls)](https://developers.google.com/apps-script/reference/forms/quiz-feedback-builder#setLinkUrls(String[])) | [QuizFeedbackBuilder](#quizfeedbackbuilder) | Not Started | |
| [setText(text)](https://developers.google.com/apps-script/reference/forms/quiz-feedback-builder#setText(String)) | [QuizFeedbackBuilder](#quizfeedbackbuilder) | Not Started | |
---
## [ScaleItem](https://developers.google.com/apps-script/reference/forms/scale-item)
A question item that allows the respondent to choose one option from a numbered scale.

0% completed

| method | return | status | comments |
|---|---|---|---|
| [createResponse(response)](https://developers.google.com/apps-script/reference/forms/scale-item#createResponse(Integer)) | [ItemResponse](#itemresponse) | Not Started | |
| [getGeneralFeedback()](https://developers.google.com/apps-script/reference/forms/scale-item#getGeneralFeedback()) | [QuizFeedback](#quizfeedback) | Not Started | |
| [getLeftLabel()](https://developers.google.com/apps-script/reference/forms/scale-item#getLeftLabel()) | String | Not Started | |
| [getLowerBound()](https://developers.google.com/apps-script/reference/forms/scale-item#getLowerBound()) | Integer | Not Started | |
| [getPoints()](https://developers.google.com/apps-script/reference/forms/scale-item#getPoints()) | Integer | Not Started | |
| [getRightLabel()](https://developers.google.com/apps-script/reference/forms/scale-item#getRightLabel()) | String | Not Started | |
| [getUpperBound()](https://developers.google.com/apps-script/reference/forms/scale-item#getUpperBound()) | Integer | Not Started | |
| [isRequired()](https://developers.google.com/apps-script/reference/forms/scale-item#isRequired()) | Boolean | Not Started | |
| [setBounds(lower, upper)](https://developers.google.com/apps-script/reference/forms/scale-item#setBounds(Integer,Integer)) | [ScaleItem](#scaleitem) | Not Started | |
| [setGeneralFeedback(feedback)](https://developers.google.com/apps-script/reference/forms/scale-item#setGeneralFeedback(QuizFeedback)) | [ScaleItem](#scaleitem) | Not Started | |
| [setLabels(lower, upper)](https://developers.google.com/apps-script/reference/forms/scale-item#setLabels(String,String)) | [ScaleItem](#scaleitem) | Not Started | |
| [setPoints(points)](https://developers.google.com/apps-script/reference/forms/scale-item#setPoints(Integer)) | [ScaleItem](#scaleitem) | Not Started | |
| [setRequired(enabled)](https://developers.google.com/apps-script/reference/forms/scale-item#setRequired(Boolean)) | [ScaleItem](#scaleitem) | Not Started | |
---
## [SectionHeaderItem](https://developers.google.com/apps-script/reference/forms/section-header-item)
A layout item that displays a title and description.

0% completed

| method | return | status | comments |
|---|---|---|---|
---
## [TextItem](https://developers.google.com/apps-script/reference/forms/text-item)
A question item that allows the respondent to enter a single line of text.

0% completed

| method | return | status | comments |
|---|---|---|---|
| [createResponse(response)](https://developers.google.com/apps-script/reference/forms/text-item#createResponse(String)) | [ItemResponse](#itemresponse) | Not Started | |
| [getGeneralFeedback()](https://developers.google.com/apps-script/reference/forms/text-item#getGeneralFeedback()) | [QuizFeedback](#quizfeedback) | Not Started | |
| [getPoints()](https://developers.google.com/apps-script/reference/forms/text-item#getPoints()) | Integer | Not Started | |
| [isRequired()](https://developers.google.com/apps-script/reference/forms/text-item#isRequired()) | Boolean | Not Started | |
| [setGeneralFeedback(feedback)](https://developers.google.com/apps-script/reference/forms/text-item#setGeneralFeedback(QuizFeedback)) | [TextItem](#textitem) | Not Started | |
| [setPoints(points)](https://developers.google.com/apps-script/reference/forms/text-item#setPoints(Integer)) | [TextItem](#textitem) | Not Started | |
| [setRequired(enabled)](https://developers.google.com/apps-script/reference/forms/text-item#setRequired(Boolean)) | [TextItem](#textitem) | Not Started | |
| [setValidation(validation)](https://developers.google.com/apps-script/reference/forms/text-item#setValidation(TextValidation)) | [TextItem](#textitem) | Not Started | |
---
## [TextValidation](https://developers.google.com/apps-script/reference/forms/text-validation)
A validation rule for a TextItem that requires the user to enter a response that conforms to a regular expression.

0% completed

| method | return | status | comments |
|---|---|---|---|
| [requireTextContainsPattern(pattern)](https://developers.google.com/apps-script/reference/forms/text-validation#requireTextContainsPattern(String)) | [TextValidationBuilder](#textvalidationbuilder) | Not Started | |
| [requireTextDoesNotContainPattern(pattern)](https://developers.google.com/apps-script/reference/forms/text-validation#requireTextDoesNotContainPattern(String)) | [TextValidationBuilder](#textvalidationbuilder) | Not Started | |
| [requireTextDoesNotMatchPattern(pattern)](https://developers.google.com/apps-script/reference/forms/text-validation#requireTextDoesNotMatchPattern(String)) | [TextValidationBuilder](#textvalidationbuilder) | Not Started | |
| [requireTextIsEmail()](https://developers.google.com/apps-script/reference/forms/text-validation#requireTextIsEmail()) | [TextValidationBuilder](#textvalidationbuilder) | Not Started | |
| [requireTextIsUrl()](https://developers.google.com/apps-script/reference/forms/text-validation#requireTextIsUrl()) | [TextValidationBuilder](#textvalidationbuilder) | Not Started | |
| [requireTextMatchesPattern(pattern)](https://developers.google.com/apps-script/reference/forms/text-validation#requireTextMatchesPattern(String)) | [TextValidationBuilder](#textvalidationbuilder) | Not Started | |
| [requireWholeNumber()](https://developers.google.com/apps-script/reference/forms/text-validation#requireWholeNumber()) | [TextValidationBuilder](#textvalidationbuilder) | Not Started | |
---
## [TextValidationBuilder](https://developers.google.com/apps-script/reference/forms/text-validation-builder)
A builder for a text validation rule.

0% completed

| method | return | status | comments |
|---|---|---|---|
| [build()](https://developers.google.com/apps-script/reference/forms/text-validation-builder#build()) | [TextValidation](#textvalidation) | Not Started | |
| [copy()](https://developers.google.com/apps-script/reference/forms/text-validation-builder#copy()) | [TextValidationBuilder](#textvalidationbuilder) | Not Started | |
| [requireTextContainsPattern(pattern)](https://developers.google.com/apps-script/reference/forms/text-validation-builder#requireTextContainsPattern(String)) | [TextValidationBuilder](#textvalidationbuilder) | Not Started | |
| [requireTextDoesNotContainPattern(pattern)](https://developers.google.com/apps-script/reference/forms/text-validation-builder#requireTextDoesNotContainPattern(String)) | [TextValidationBuilder](#textvalidationbuilder) | Not Started | |
| [requireTextDoesNotMatchPattern(pattern)](https://developers.google.com/apps-script/reference/forms/text-validation-builder#requireTextDoesNotMatchPattern(String)) | [TextValidationBuilder](#textvalidationbuilder) | Not Started | |
| [requireTextIsEmail()](https://developers.google.com/apps-script/reference/forms/text-validation-builder#requireTextIsEmail()) | [TextValidationBuilder](#textvalidationbuilder) | Not Started | |
| [requireTextIsUrl()](https://developers.google.com/apps-script/reference/forms/text-validation-builder#requireTextIsUrl()) | [TextValidationBuilder](#textvalidationbuilder) | Not Started | |
| [requireTextMatchesPattern(pattern)](https://developers.google.com/apps-script/reference/forms/text-validation-builder#requireTextMatchesPattern(String)) | [TextValidationBuilder](#textvalidationbuilder) | Not Started | |
| [requireWholeNumber()](https://developers.google.com/apps-script/reference/forms/text-validation-builder#requireWholeNumber()) | [TextValidationBuilder](#textvalidationbuilder) | Not Started | |
| [withHelpText(text)](https://developers.google.com/apps-script/reference/forms/text-validation-builder#withHelpText(String)) | [TextValidationBuilder](#textvalidationbuilder) | Not Started | |
---
## [TimeItem](https://developers.google.com/apps-script/reference/forms/time-item)
A question item that allows the respondent to indicate a time of day.

0% completed

| method | return | status | comments |
|---|---|---|---|
| [createResponse(hour, minute)](https://developers.google.com/apps-script/reference/forms/time-item#createResponse(Integer,Integer)) | [ItemResponse](#itemresponse) | Not Started | |
| [getGeneralFeedback()](https://developers.google.com/apps-script/reference/forms/time-item#getGeneralFeedback()) | [QuizFeedback](#quizfeedback) | Not Started | |
| [getPoints()](https://developers.google.com/apps-script/reference/forms/time-item#getPoints()) | Integer | Not Started | |
| [isRequired()](https://developers.google.com/apps-script/reference/forms/time-item#isRequired()) | Boolean | Not Started | |
| [setGeneralFeedback(feedback)](https://developers.google.com/apps-script/reference/forms/time-item#setGeneralFeedback(QuizFeedback)) | [TimeItem](#timeitem) | Not Started | |
| [setPoints(points)](https://developers.google.com/apps-script/reference/forms/time-item#setPoints(Integer)) | [TimeItem](#timeitem) | Not Started | |
| [setRequired(enabled)](https://developers.google.com/apps-script/reference/forms/time-item#setRequired(Boolean)) | [TimeItem](#timeitem) | Not Started | |
---
## [VideoItem](https://developers.google.com/apps-script/reference/forms/video-item)
A layout item that displays a video.

0% completed

| method | return | status | comments |
|---|---|---|---|
| [getAlignment()](https://developers.google.com/apps-script/reference/forms/video-item#getAlignment()) | [Alignment](#alignment) | Not Started | |
| [getVideoUrl()](https://developers.google.com/apps-script/reference/forms/video-item#getVideoUrl()) | String | Not Started | |
| [getWidth()](https://developers.google.com/apps-script/reference/forms/video-item#getWidth()) | Integer | Not Started | |
| [setAlignment(alignment)](https://developers.google.com/apps-script/reference/forms/video-item#setAlignment(Alignment)) | [VideoItem](#videoitem) | Not Started | |
| [setVideoUrl(youtubeUrl)](https://developers.google.com/apps-script/reference/forms/video-item#setVideoUrl(String)) | [VideoItem](#videoitem) | Not Started | |
| [setWidth(width)](https://developers.google.com/apps-script/reference/forms/video-item#setWidth(Integer)) | [VideoItem](#videoitem) | Not Started | |

