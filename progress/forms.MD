# Forms Service Progress
**Documentation:** [Forms Service](https://developers.google.com/apps-script/reference/forms)
---
## [FormApp](https://developers.google.com/apps-script/reference/forms/form-app)
The main entry point for working with Google Forms in Apps Script.
36% completed

| method | return | status | comments |
| --- | --- | --- | --- |
| [create(title)](https://developers.google.com/apps-script/reference/forms/form-app#create(String)) | [Form](#Form) | Completed | |
| [getActiveForm()](https://developers.google.com/apps-script/reference/forms/form-app#getActiveForm()) | [Form](#Form) | Completed | |
| [getUi()](https://developers.google.com/apps-script/reference/forms/form-app#getUi()) | [Ui](https://developers.google.com/apps-script/reference/base/ui) | Not Started | |
| [openById(id)](https://developers.google.com/apps-script/reference/forms/form-app#openById(String)) | [Form](#Form) | Completed | |
| [openByUrl(url)](https://developers.google.com/apps-script/reference/forms/form-app#openByUrl(String)) | [Form](#Form) | Completed | |
| [createCheckboxGridValidation()](https://developers.google.com/apps-script/reference/forms/form-app#createCheckboxGridValidation()) | CheckboxGridValidationBuilder | Not Started | |
| [createCheckboxValidation()](https://developers.google.com/apps-script/reference/forms/form-app#createCheckboxValidation()) | CheckboxValidationBuilder | Not Started | |
| [createFeedback()](https://developers.google.com/apps-script/reference/forms/form-app#createFeedback()) | QuizFeedbackBuilder | Not Started | |
| [createGridValidation()](https://developers.google.com/apps-script/reference/forms/form-app#createGridValidation()) | GridValidationBuilder | Not Started | |
| [createParagraphTextValidation()](https://developers.google.com/apps-script/reference/forms/form-app#createParagraphTextValidation()) | ParagraphTextValidationBuilder | Not Started | |
| [createTextValidation()](https://developers.google.com/apps-script/reference/forms/form-app#createTextValidation()) | TextValidationBuilder | Not Started | |

---
## [Form](https://developers.google.com/apps-script/reference/forms/form)
Represents a single Google Form.
35% completed

| method | return | status | comments |
| --- | --- | --- | --- |
| [addCheckboxItem()](https://developers.google.com/apps-script/reference/forms/form#addCheckboxItem()) | [CheckboxItem](#CheckboxItem) | Completed | |
| [addDateItem()](https://developers.google.com/apps-script/reference/forms/form#addDateItem()) | [DateItem](#DateItem) | Not Started | |
| [addDateTimeItem()](https://developers.google.com/apps-script/reference/forms/form#addDateTimeItem()) | [DateTimeItem](#DateTimeItem) | Not Started | |
| [addGridItem()](https://developers.google.com/apps-script/reference/forms/form#addGridItem()) | [GridItem](#GridItem) | Not Started | |
| [addImageItem()](https://developers.google.com/apps-script/reference/forms/form#addImageItem()) | [ImageItem](#ImageItem) | Not Started | |
| [addListItem()](https://developers.google.com/apps-script/reference/forms/form#addListItem()) | [ListItem](#ListItem) | Not Started | |
| [addMultipleChoiceItem()](https://developers.google.com/apps-script/reference/forms/form#addMultipleChoiceItem()) | [MultipleChoiceItem](#MultipleChoiceItem) | Not Started | |
| [addPageBreakItem()](https://developers.google.com/apps-script/reference/forms/form#addPageBreakItem()) | [PageBreakItem](#PageBreakItem) | Not Started | |
| [addParagraphTextItem()](https://developers.google.com/apps-script/reference/forms/form#addParagraphTextItem()) | [ParagraphTextItem](#ParagraphTextItem) | Not Started | |
| [addScaleItem()](https://developers.google.com/apps-script/reference/forms/form#addScaleItem()) | [ScaleItem](#ScaleItem) | Not Started | |
| [addSectionHeaderItem()](https://developers.google.com/apps-script/reference/forms/form#addSectionHeaderItem()) | [SectionHeaderItem](#SectionHeaderItem) | Not Started | |
| [addTextItem()](https://developers.google.com/apps-script/reference/forms/form#addTextItem()) | [TextItem](#TextItem) | Not Started | |
| [addVideoItem()](https://developers.google.com/apps-script/reference/forms/form#addVideoItem()) | [VideoItem](#VideoItem) | Not Started | |
| [deleteAllResponses()](https://developers.google.com/apps-script/reference/forms/form#deleteAllResponses()) | [Form](#Form) | Not Started | |
| [deleteResponse(responseId)](https://developers.google.com/apps-script/reference/forms/form#deleteResponse(String)) | [Form](#Form) | Not Started | |
| [getConfirmationMessage()](https://developers.google.com/apps-script/reference/forms/form#getConfirmationMessage()) | String | Not Started | |
| [getCustomClosedFormMessage()](https://developers.google.com/apps-script/reference/forms/form#getCustomClosedFormMessage()) | String | Not Started | |
| [getDescription()](https://developers.google.com/apps-script/reference/forms/form#getDescription()) | String | Not Started | |
| [getEditUrl()](https://developers.google.com/apps-script/reference/forms/form#getEditUrl()) | String | Completed | |
| [getId()](https://developers.google.com/apps-script/reference/forms/form#getId()) | String | Completed | |
| [getItemById(id)](https://developers.google.com/apps-script/reference/forms/form#getItemById(Integer)) | [Item](#Item) | Completed | |
| [getItems()](https://developers.google.com/apps-script/reference/forms/form#getItems()) | [Item[]](#Item) | Completed | |
| [getPublishedUrl()](https://developers.google.com/apps-script/reference/forms/form#getPublishedUrl()) | String | Not Started | |
| [getResponse(responseId)](https://developers.google.com/apps-script/reference/forms/form#getResponse(String)) | [FormResponse](#FormResponse) | Not Started | |
| [getResponses()](https://developers.google.com/apps-script/reference/forms/form#getResponses()) | [FormResponse[]](#FormResponse) | Not Started | |
| [getSummaryUrl()](https://developers.google.com/apps-script/reference/forms/form#getSummaryUrl()) | String | Not Started | |
| [getTitle()](https://developers.google.com/apps-script/reference/forms/form#getTitle()) | String | Completed | |
| [hasLimitOneResponsePerUser()](https://developers.google.com/apps-script/reference/forms/form#hasLimitOneResponsePerUser()) | Boolean | Not Started | |
| [isAcceptingResponses()](https://developers.google.com/apps-script/reference/forms/form#isAcceptingResponses()) | Boolean | Not Started | |
| [isPublishingSummary()](https://developers.google.com/apps-script/reference/forms/form#isPublishingSummary()) | Boolean | Not Started | |
| [isQuiz()](https://developers.google.com/apps-script/reference/forms/form#isQuiz()) | Boolean | Not Started | |
| [requiresLogin()](https://developers.google.com/apps-script/reference/forms/form#requiresLogin()) | Boolean | Not Started | |
| [setAcceptingResponses(enabled)](https://developers.google.com/apps-script/reference/forms/form#setAcceptingResponses(Boolean)) | [Form](#Form) | Not Started | |
| [setAllowResponseEdits(enabled)](https://developers.google.com/apps-script/reference/forms/form#setAllowResponseEdits(Boolean)) | [Form](#Form) | Not Started | |
| [setConfirmationMessage(message)](https://developers.google.com/apps-script/reference/forms/form#setConfirmationMessage(String)) | [Form](#Form) | Not Started | |
| [setCustomClosedFormMessage(message)](https://developers.google.com/apps-script/reference/forms/form#setCustomClosedFormMessage(String)) | [Form](#Form) | Not Started | |
| [setDescription(description)](https://developers.google.com/apps-script/reference/forms/form#setDescription(String)) | [Form](#Form) | Not Started | |
| [setLimitOneResponsePerUser(enabled)](https://developers.google.com/apps-script/reference/forms/form#setLimitOneResponsePerUser(Boolean)) | [Form](#Form) | Not Started | |
| [setPublishingSummary(enabled)](https://developers.google.com/apps-script/reference/forms/form#setPublishingSummary(Boolean)) | [Form](#Form) | Not Started | |
| [setQuiz(isQuiz)](https://developers.google.com/apps-script/reference/forms/form#setQuiz(Boolean)) | [Form](#Form) | Not Started | |
| [setTitle(title)](https://developers.google.com/apps-script/reference/forms/form#setTitle(String)) | [Form](#Form) | Completed | |
| [submitGrades(responses)](https://developers.google.com/apps-script/reference/forms/form#submitGrades(FormResponse)) | [Form](#Form) | Not Started | |

---
## [Item](https://developers.google.com/apps-script/reference/forms/item)
A generic element within a form.
85% completed

| method | return | status | comments |
| --- | --- | --- | --- |
| [asCheckboxItem()](https://developers.google.com/apps-script/reference/forms/item#asCheckboxItem()) | [CheckboxItem](#CheckboxItem) | Completed | |
| [asDateItem()](https://developers.google.com/apps-script/reference/forms/item#asDateItem()) | [DateItem](#DateItem) | Not Started | |
| [asDateTimeItem()](https://developers.google.com/apps-script/reference/forms/item#asDateTimeItem()) | [DateTimeItem](#DateTimeItem) | Not Started | |
| [asGridItem()](https://developers.google.com/apps-script/reference/forms/item#asGridItem()) | [GridItem](#GridItem) | Not Started | |
| [asImageItem()](https://developers.google.com/apps-script/reference/forms/item#asImageItem()) | [ImageItem](#ImageItem) | Not Started | |
| [asListItem()](https://developers.google.com/apps-script/reference/forms/item#asListItem()) | [ListItem](#ListItem) | Not Started | |
| [asMultipleChoiceItem()](https://developers.google.com/apps-script/reference/forms/item#asMultipleChoiceItem()) | [MultipleChoiceItem](#MultipleChoiceItem) | Not Started | |
| [asPageBreakItem()](https://developers.google.com/apps-script/reference/forms/item#asPageBreakItem()) | [PageBreakItem](#PageBreakItem) | Not Started | |
| [asParagraphTextItem()](https://developers.google.com/apps-script/reference/forms/item#asParagraphTextItem()) | [ParagraphTextItem](#ParagraphTextItem) | Not Started | |
| [asScaleItem()](https://developers.google.com/apps-script/reference/forms/item#asScaleItem()) | [ScaleItem](#ScaleItem) | Not Started | |
| [asSectionHeaderItem()](https://developers.google.com/apps-script/reference/forms/item#asSectionHeaderItem()) | [SectionHeaderItem](#SectionHeaderItem) | Not Started | |
| [asTextItem()](https://developers.google.com/apps-script/reference/forms/item#asTextItem()) | [TextItem](#TextItem) | Not Started | |
| [asVideoItem()](https://developers.google.com/apps-script/reference/forms/item#asVideoItem()) | [VideoItem](#VideoItem) | Not Started | |
| [duplicate()](https://developers.google.com/apps-script/reference/forms/item#duplicate()) | [Item](#Item) | Completed | |
| [getHelpText()](https://developers.google.com/apps-script/reference/forms/item#getHelpText()) | String | Completed | |
| [getId()](https://developers.google.com/apps-script/reference/forms/item#getId()) | Integer | Completed | |
| [getIndex()](https://developers.google.com/apps-script/reference/forms/item#getIndex()) | Integer | Completed | |
| [getTitle()](https://developers.google.com/apps-script/reference/forms/item#getTitle()) | String | Completed | |
| [getType()](https://developers.google.com/apps-script/reference/forms/item#getType()) | [ItemType](#ItemType) | Completed | |
| [setHelpText(text)](https://developers.google.com/apps-script/reference/forms/item#setHelpText(String)) | [Item](#Item) | Completed | |
| [setTitle(title)](https://developers.google.com/apps-script/reference/forms/item#setTitle(String)) | [Item](#Item) | Completed | |

---
## [CheckboxItem](https://developers.google.com/apps-script/reference/forms/checkbox-item)
A question item that allows the respondent to select one or more checkboxes.
100% completed

| method | return | status | comments |
| --- | --- | --- | --- |
| [createChoice(value)](https://developers.google.com/apps-script/reference/forms/checkbox-item#createChoice(String)) | [Choice](#Choice) | Completed | |
| [getChoices()](https://developers.google.com/apps-script/reference/forms/checkbox-item#getChoices()) | [Choice[]](#Choice) | Completed | |
| [isRequired()](https://developers.google.com/apps-script/reference/forms/checkbox-item#isRequired()) | Boolean | Completed | |
| [setChoices(choices)](https://developers.google.com/apps-script/reference/forms/checkbox-item#setChoices(Choice)) | [CheckboxItem](#CheckboxItem) | Completed | |
| [setRequired(enabled)](https://developers.google.com/apps-script/reference/forms/checkbox-item#setRequired(Boolean)) | [CheckboxItem](#CheckboxItem) | Completed | |

---
## [Choice](https://developers.google.com/apps-script/reference/forms/choice)
A choice for a multiple-choice, checkbox, or list item.
100% completed

| method | return | status | comments |
| --- | --- | --- | --- |
| [getGotoPage()](https://developers.google.com/apps-script/reference/forms/choice#getGotoPage()) | [PageBreakItem](#PageBreakItem) | Completed | |
| [getIsCorrect()](https://developers.google.com/apps-script/reference/forms/choice#getIsCorrect()) | Boolean | Completed | |
| [getPageNavigationType()](https://developers.google.com/apps-script/reference/forms/choice#getPageNavigationType()) | [PageNavigationType](#PageNavigationType) | Completed | |
| [getValue()](https://developers.google.com/apps-script/reference/forms/choice#getValue()) | String | Completed | |

---
## [DateItem](https://developers.google.com/apps-script/reference/forms/date-item)
A question item that allows the respondent to enter a date.
0% completed

| method | return | status | comments |
| --- | --- | --- | --- |
| [createResponse(response)](https://developers.google.com/apps-script/reference/forms/date-item#createResponse(String)) | [ItemResponse](#ItemResponse) | Not Started | |
| [isRequired()](https://developers.google.com/apps-script/reference/forms/date-item#isRequired()) | Boolean | Not Started | |
| [setRequired(enabled)](https://developers.google.com/apps-script/reference/forms/date-item#setRequired(Boolean)) | [DateItem](#DateItem) | Not Started | |

---
## [DateTimeItem](https://developers.google.com/apps-script/reference/forms/date-time-item)
A question item that allows the respondent to enter a date and time.
0% completed

| method | return | status | comments |
| --- | --- | --- | --- |
| [createResponse(response)](https://developers.google.com/apps-script/reference/forms/date-time-item#createResponse(String)) | [ItemResponse](#ItemResponse) | Not Started | |
| [isRequired()](https://developers.google.com/apps-script/reference/forms/date-time-item#isRequired()) | Boolean | Not Started | |
| [setRequired(enabled)](https://developers.google.com/apps-script/reference/forms/date-time-item#setRequired(Boolean)) | [DateTimeItem](#DateTimeItem) | Not Started | |

---
## [DropDownItem](https://developers.google.com/apps-script/reference/forms/drop-down-item)
A question item that allows the respondent to select one choice from a drop-down list.
0% completed

| method | return | status | comments |
| --- | --- | --- | --- |
| [createChoice(value)](https://developers.google.com/apps-script/reference/forms/drop-down-item#createChoice(String)) | [Choice](#Choice) | Not Started | |
| [getChoices()](https://developers.google.com/apps-script/reference/forms/drop-down-item#getChoices()) | [Choice[]](#Choice) | Not Started | |
| [isRequired()](https://developers.google.com/apps-script/reference/forms/drop-down-item#isRequired()) | Boolean | Not Started | |
| [setChoices(choices)](https://developers.google.com/apps-script/reference/forms/drop-down-item#setChoices(Choice)) | [DropDownItem](#DropDownItem) | Not Started | |
| [setRequired(enabled)](https://developers.google.com/apps-script/reference/forms/drop-down-item#setRequired(Boolean)) | [DropDownItem](#DropDownItem) | Not Started | |

---
## [GridItem](https://developers.google.com/apps-script/reference/forms/grid-item)
A question item that allows the respondent to rate one or more items on a grid.
0% completed

| method | return | status | comments |
| --- | --- | --- | --- |
| [getColumns()](https://developers.google.com/apps-script/reference/forms/grid-item#getColumns()) | String[] | Not Started | |
| [getRows()](https://developers.google.com/apps-script/reference/forms/grid-item#getRows()) | String[] | Not Started | |
| [isRequired()](https://developers.google.com/apps-script/reference/forms/grid-item#isRequired()) | Boolean | Not Started | |
| [setColumns(columns)](https://developers.google.com/apps-script/reference/forms/grid-item#setColumns(String)) | [GridItem](#GridItem) | Not Started | |
| [setRequired(enabled)](https://developers.google.com/apps-script/reference/forms/grid-item#setRequired(Boolean)) | [GridItem](#GridItem) | Not Started | |
| [setRows(rows)](https://developers.google.com/apps-script/reference/forms/grid-item#setRows(String)) | [GridItem](#GridItem) | Not Started | |

---
## [ImageItem](https://developers.google.com/apps-script/reference/forms/image-item)
A layout item that displays an image.
0% completed

| method | return | status | comments |
| --- | --- | --- | --- |
| [getAlignment()](https://developers.google.com/apps-script/reference/forms/image-item#getAlignment()) | [Alignment](#Alignment) | Not Started | |
| [getImage()](https://developers.google.com/apps-script/reference/forms/image-item#getImage()) | [Blob](https://developers.google.com/apps-script/reference/base/blob) | Not Started | |
| [getWidth()](https://developers.google.com/apps-script/reference/forms/image-item#getWidth()) | Integer | Not Started | |
| [setAlignment(alignment)](https://developers.google.com/apps-script/reference/forms/image-item#setAlignment(Alignment)) | [ImageItem](#ImageItem) | Not Started | |
| [setImage(image)](https://developers.google.com/apps-script/reference/forms/image-item#setImage(BlobSource)) | [ImageItem](#ImageItem) | Not Started | |
| [setWidth(width)](https://developers.google.com/apps-script/reference/forms/image-item#setWidth(Integer)) | [ImageItem](#ImageItem) | Not Started | |

---
## [ListItem](https://developers.google.com/apps-script/reference/forms/list-item)
A question item that allows the respondent to select one choice from a list.
0% completed

| method | return | status | comments |
| --- | --- | --- | --- |
| [createChoice(value)](https://developers.google.com/apps-script/reference/forms/list-item#createChoice(String)) | [Choice](#Choice) | Not Started | |
| [getChoices()](https://developers.google.com/apps-script/reference/forms/list-item#getChoices()) | [Choice[]](#Choice) | Not Started | |
| [isRequired()](https://developers.google.com/apps-script/reference/forms/list-item#isRequired()) | Boolean | Not Started | |
| [setChoices(choices)](https://developers.google.com/apps-script/reference/forms/list-item#setChoices(Choice)) | [ListItem](#ListItem) | Not Started | |
| [setRequired(enabled)](https://developers.google.com/apps-script/reference/forms/list-item#setRequired(Boolean)) | [ListItem](#ListItem) | Not Started | |

---
## [MultipleChoiceItem](https://developers.google.com/apps-script/reference/forms/multiple-choice-item)
A question item that allows the respondent to select one choice from a list of options.
0% completed

| method | return | status | comments |
| --- | --- | --- | --- |
| [createChoice(value)](https://developers.google.com/apps-script/reference/forms/multiple-choice-item#createChoice(String)) | [Choice](#Choice) | Not Started | |
| [getChoices()](https://developers.google.com/apps-script/reference/forms/multiple-choice-item#getChoices()) | [Choice[]](#Choice) | Not Started | |
| [isRequired()](https://developers.google.com/apps-script/reference/forms/multiple-choice-item#isRequired()) | Boolean | Not Started | |
| [setChoices(choices)](https://developers.google.com/apps-script/reference/forms/multiple-choice-item#setChoices(Choice)) | [MultipleChoiceItem](#MultipleChoiceItem) | Not Started | |
| [setRequired(enabled)](https://developers.google.com/apps-script/reference/forms/multiple-choice-item#setRequired(Boolean)) | [MultipleChoiceItem](#MultipleChoiceItem) | Not Started | |

---
## [PageBreakItem](https://developers.google.com/apps-script/reference/forms/page-break-item)
A layout item that marks the beginning of a new page in a form.
0% completed

| method | return | status | comments |
| --- | --- | --- | --- |
| [getGoToPage()](https://developers.google.com/apps-script/reference/forms/page-break-item#getGoToPage()) | [PageBreakItem](#PageBreakItem) | Not Started | |
| [getPageNavigationType()](https://developers.google.com/apps-script/reference/forms/page-break-item#getPageNavigationType()) | [PageNavigationType](#PageNavigationType) | Not Started | |
| [setGoToPage(goToPage)](https://developers.google.com/apps-script/reference/forms/page-break-item#setGoToPage(PageBreakItem)) | [PageBreakItem](#PageBreakItem) | Not Started | |
| [setPageNavigationType(navigationType)](https://developers.google.com/apps-script/reference/forms/page-break-item#setPageNavigationType(PageNavigationType)) | [PageBreakItem](#PageBreakItem) | Not Started | |

---
## [ParagraphTextItem](https://developers.google.com/apps-script/reference/forms/paragraph-text-item)
A question item that allows the respondent to enter a block of text.
0% completed

| method | return | status | comments |
| --- | --- | --- | --- |
| [createResponse(response)](https://developers.google.com/apps-script/reference/forms/paragraph-text-item#createResponse(String)) | [ItemResponse](#ItemResponse) | Not Started | |
| [isRequired()](https://developers.google.com/apps-script/reference/forms/paragraph-text-item#isRequired()) | Boolean | Not Started | |
| [setRequired(enabled)](https://developers.google.com/apps-script/reference/forms/paragraph-text-item#setRequired(Boolean)) | [ParagraphTextItem](#ParagraphTextItem) | Not Started | |

---
## [ScaleItem](https://developers.google.com/apps-script/reference/forms/scale-item)
A question item that allows the respondent to choose a value from a numbered scale.
0% completed

| method | return | status | comments |
| --- | --- | --- | --- |
| [getLeftLabel()](https://developers.google.com/apps-script/reference/forms/scale-item#getLeftLabel()) | String | Not Started | |
| [getLowerBound()](https://developers.google.com/apps-script/reference/forms/scale-item#getLowerBound()) | Integer | Not Started | |
| [getRightLabel()](https://developers.google.com/apps-script/reference/forms/scale-item#getRightLabel()) | String | Not Started | |
| [getUpperBound()](https://developers.google.com/apps-script/reference/forms/scale-item#getUpperBound()) | Integer | Not Started | |
| [isRequired()](https://developers.google.com/apps-script/reference/forms/scale-item#isRequired()) | Boolean | Not Started | |
| [setBounds(lower, upper)](https://developers.google.com/apps-script/reference/forms/scale-item#setBounds(Integer,Integer)) | [ScaleItem](#ScaleItem) | Not Started | |
| [setLabels(lower, upper)](https://developers.google.com/apps-script/reference/forms/scale-item#setLabels(String,String)) | [ScaleItem](#ScaleItem) | Not Started | |
| [setRequired(enabled)](https://developers.google.com/apps-script/reference/forms/scale-item#setRequired(Boolean)) | [ScaleItem](#ScaleItem) | Not Started | |

---
## [SectionHeaderItem](https://developers.google.com/apps-script/reference/forms/section-header-item)
A layout item that displays a title and description.
0% completed

| method | return | status | comments |
| --- | --- | --- | --- |
| [getHelpText()](https://developers.google.com/apps-script/reference/forms/section-header-item#getHelpText()) | String | Not Started | |
| [getTitle()](https://developers.google.com/apps-script/reference/forms/section-header-item#getTitle()) | String | Not Started | |
| [setHelpText(text)](https://developers.google.com/apps-script/reference/forms/section-header-item#setHelpText(String)) | [SectionHeaderItem](#SectionHeaderItem) | Not Started | |
| [setTitle(title)](https://developers.google.com/apps-script/reference/forms/section-header-item#setTitle(String)) | [SectionHeaderItem](#SectionHeaderItem) | Not Started | |

---
## [TextItem](https://developers.google.com/apps-script/reference/forms/text-item)
A question item that allows the respondent to enter a single line of text.
0% completed

| method | return | status | comments |
| --- | --- | --- | --- |
| [createResponse(response)](https://developers.google.com/apps-script/reference/forms/text-item#createResponse(String)) | [ItemResponse](#ItemResponse) | Not Started | |
| [isRequired()](https://developers.google.com/apps-script/reference/forms/text-item#isRequired()) | Boolean | Not Started | |
| [setRequired(enabled)](https://developers.google.com/apps-script/reference/forms/text-item#setRequired(Boolean)) | [TextItem](#TextItem) | Not Started | |

---
## [TimeItem](https://developers.google.com/apps-script/reference/forms/time-item)
A question item that allows the respondent to enter a time of day.
0% completed

| method | return | status | comments |
| --- | --- | --- | --- |
| [createResponse(hour, minute)](https://developers.google.com/apps-script/reference/forms/time-item#createResponse(Integer,Integer)) | [ItemResponse](#ItemResponse) | Not Started | |
| [isRequired()](https://developers.google.com/apps-script/reference/forms/time-item#isRequired()) | Boolean | Not Started | |
| [setRequired(enabled)](https://developers.google.com/apps-script/reference/forms/time-item#setRequired(Boolean)) | [TimeItem](#TimeItem) | Not Started | |

---
## [VideoItem](https://developers.google.com/apps-script/reference/forms/video-item)
A layout item that displays a YouTube video.
0% completed

| method | return | status | comments |
| --- | --- | --- | --- |
| [getAlignment()](https://developers.google.com/apps-script/reference/forms/video-item#getAlignment()) | [Alignment](#Alignment) | Not Started | |
| [getVideoUrl()](https://developers.google.com/apps-script/reference/forms/video-item#getVideoUrl()) | String | Not Started | |
| [getWidth()](https://developers.google.com/apps-script/reference/forms/video-item#getWidth()) | Integer | Not Started | |
| [setAlignment(alignment)](https://developers.google.com/apps-script/reference/forms/video-item#setAlignment(Alignment)) | [VideoItem](#VideoItem) | Not Started | |
| [setVideoUrl(youtubeUrl)](https://developers.google.com/apps-script/reference/forms/video-item#setVideoUrl(String)) | [VideoItem](#VideoItem) | Not Started | |
| [setWidth(width)](https://developers.google.com/apps-script/reference/forms/video-item#setWidth(Integer)) | [VideoItem](#VideoItem) | Not Started | |

---
## [FormResponse](https://developers.google.com/apps-script/reference/forms/form-response)
A single response to a form.
0% completed

| method | return | status | comments |
| --- | --- | --- | --- |
| [getEditResponseUrl()](https://developers.google.com/apps-script/reference/forms/form-response#getEditResponseUrl()) | String | Not Started | |
| [getId()](https://developers.google.com/apps-script/reference/forms/form-response#getId()) | String | Not Started | |
| [getItemResponses()](https://developers.google.com/apps-script/reference/forms/form-response#getItemResponses()) | [ItemResponse[]](#ItemResponse) | Not Started | |
| [getRespondentEmail()](https://developers.google.com/apps-script/reference/forms/form-response#getRespondentEmail()) | String | Not Started | |
| [getTimestamp()](https://developers.google.com/apps-script/reference/forms/form-response#getTimestamp()) | Date | Not Started | |
| [submit()](https://developers.google.com/apps-script/reference/forms/form-response#submit()) | [FormResponse](#FormResponse) | Not Started | |
| [toPrefilledUrl()](https://developers.google.com/apps-script/reference/forms/form-response#toPrefilledUrl()) | String | Not Started | |
| [withItemResponse(response)](https://developers.google.com/apps-script/reference/forms/form-response#withItemResponse(ItemResponse)) | [FormResponse](#FormResponse) | Not Started | |

---
## [ItemResponse](https://developers.google.com/apps-script/reference/forms/item-response)
A single response to a question item.
0% completed

| method | return | status | comments |
| --- | --- | --- | --- |
| [getItem()](https://developers.google.com/apps-script/reference/forms/item-response#getItem()) | [Item](#Item) | Not Started | |
| [getResponse()](https://developers.google.com/apps-script/reference/forms/item-response#getResponse()) | Object | Not Started | |
| [isCorrect()](https://developers.google.com/apps-script/reference/forms/item-response#isCorrect()) | Boolean | Not Started | |
| [setScore(score)](https://developers.google.com/apps-script/reference/forms/item-response#setScore(Object)) | [ItemResponse](#ItemResponse) | Not Started | |

---
## Enums
| Enum | Status |
| --- | --- |
| [Alignment](https://developers.google.com/apps-script/reference/forms/alignment) | Completed |
| [DestinationType](https://developers.google.com/apps-script/reference/forms/destination-type) | Completed |
| [FeedbackType](https://developers.google.com/apps-script/reference/forms/feedback-type) | Completed |
| [ItemType](https://developers.google.com/apps-script/reference/forms/item-type) | Completed |
| [PageNavigationType](https://developers.google.com/apps-script/reference/forms/page-navigation-type) | Completed |
