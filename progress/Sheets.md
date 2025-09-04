# Spreadsheet Service Progress
**Documentation:** [Spreadsheet Service](https://developers.google.com/apps-script/reference/spreadsheet)
---
Overall Service Completion: 56% completed
## [Alignment](https://developers.google.com/apps-script/reference/spreadsheet/alignment)
An enum representing the supported types of image alignment.

100% completed

| method | return | status | comments |
|---|---|---|---|
| LEFT | [Alignment](#alignment) | Completed | |
| RIGHT | [Alignment](#alignment) | Completed | |
| CENTER | [Alignment](#alignment) | Completed | |
---
## [Banding](https://developers.google.com/apps-script/reference/spreadsheet/banding)
A banding in a sheet.


| method | return | status | comments |
|---|---|---|---|
| [getBandingTheme()](https://developers.google.com/apps-script/reference/spreadsheet/banding#getBandingTheme()) | [BandingTheme](#bandingtheme) | Completed | |
| [getFirstColumnColor()](https://developers.google.com/apps-script/reference/spreadsheet/banding#getFirstColumnColor()) | String | Completed | |
| [getFirstRowColor()](https://developers.google.com/apps-script/reference/spreadsheet/banding#getFirstRowColor()) | String | Completed | |
| [getRange()](https://developers.google.com/apps-script/reference/spreadsheet/banding#getRange()) | [Range](#range) | Completed | |
| [getSecondColumnColor()](https://developers.google.com/apps-script/reference/spreadsheet/banding#getSecondColumnColor()) | String | Completed | |
| [getSecondRowColor()](https://developers.google.com/apps-script/reference/spreadsheet/banding#getSecondRowColor()) | String | Completed | |
| [isFirstColumnColor()](https://developers.google.com/apps-script/reference/spreadsheet/banding#isFirstColumnColor()) | Boolean | Completed | |
| [isFirstRowColor()](https://developers.google.com/apps-script/reference/spreadsheet/banding#isFirstRowColor()) | Boolean | Completed | |
| [isSecondColumnColor()](https://developers.google.com/apps-script/reference/spreadsheet/banding#isSecondColumnColor()) | Boolean | Completed | |
| [isSecondRowColor()](https://developers.google.com/apps-script/reference/spreadsheet/banding#isSecondRowColor()) | Boolean | Completed | |
| [remove()](https://developers.google.com/apps-script/reference/spreadsheet/banding#remove()) | void | Completed | |
| [setBandingTheme(bandingTheme)](https://developers.google.com/apps-script/reference/spreadsheet/banding#setBandingTheme(BandingTheme)) | [Banding](#banding) | Completed | |
| [setFirstColumnColor(color)](https://developers.google.com/apps-script/reference/spreadsheet/banding#setFirstColumnColor(String)) | [Banding](#banding) | Completed | |
| [setFirstRowColor(color)](https://developers.google.com/apps-script/reference/spreadsheet/banding#setFirstRowColor(String)) | [Banding](#banding) | Completed | |
| [setSecondColumnColor(color)](https://developers.google.com/apps-script/reference/spreadsheet/banding#setSecondColumnColor(String)) | [Banding](#banding) | Completed | |
| [setSecondRowColor(color)](https://developers.google.com/apps-script/reference/spreadsheet/banding#setSecondRowColor(String)) | [Banding](#banding) | Completed | |
---
## [BandingTheme](https://developers.google.com/apps-script/reference/spreadsheet/banding-theme)
An enum representing the supported banding themes.

100% completed

| method | return | status | comments |
|---|---|---|---|
| BLUE | [BandingTheme](#bandingtheme) | Completed | |
| BROWN | [BandingTheme](#bandingtheme) | Completed | |
| CYAN | [BandingTheme](#bandingtheme) | Completed | |
## [Border](https://developers.google.com/apps-script/reference/spreadsheet/border)
A border in a range.


| method | return | status | comments |
|---|---|---|---|
| [getColor()](https://developers.google.com/apps-script/reference/spreadsheet/border#getColor()) | String | Completed | |
| [getLineStyle()](https://developers.google.com/apps-script/reference/spreadsheet/border#getLineStyle()) | [BorderStyle](#borderstyle) | Completed | |
| [isBlack()](https://developers.google.com/apps-script/reference/spreadsheet/border#isBlack()) | Boolean | Completed | |
| [isSolid()](https://developers.google.com/apps-script/reference/spreadsheet/border#isSolid()) | Boolean | Completed | |
| [isSolidMedium()](https://developers.google.com/apps-script/reference/spreadsheet/border#isSolidMedium()) | Boolean | Completed | |
| [isSolidThick()](https://developers.google.com/apps-script/reference/spreadsheet/border#isSolidThick()) | Boolean | Completed | |
---
## [BorderStyle](https://developers.google.com/apps-script/reference/spreadsheet/border-style)
An enum representing the supported border styles.

100% completed

| method | return | status | comments |
|---|---|---|---|
| DASHED | [BorderStyle](#borderstyle) | Completed | |
| DOTTED | [BorderStyle](#borderstyle) | Completed | |
| DOUBLE | [BorderStyle](#borderstyle) | Completed | |
---
## [BooleanCondition](https://developers.google.com/apps-script/reference/spreadsheet/boolean-condition)
A boolean condition in a conditional format rule.


| method | return | status | comments |
|---|---|---|---|
| [getCriteriaType()](https://developers.google.com/apps-script/reference/spreadsheet/boolean-condition#getCriteriaType()) | [BooleanCriteria](#booleancriteria) | Completed | |
| [getValues()](https://developers.google.com/apps-script/reference/spreadsheet/boolean-condition#getValues()) | String[] | Completed | |
---
## [BooleanCriteria](https://developers.google.com/apps-script/reference/spreadsheet/boolean-criteria)
An enum representing supported boolean criteria for conditional formatting.

100% completed

| method | return | status | comments |
|---|---|---|---|
| CELL_EMPTY | [BooleanCriteria](#booleancriteria) | Completed | |
| CELL_NOT_EMPTY | [BooleanCriteria](#booleancriteria) | Completed | |
| DATE_AFTER | [BooleanCriteria](#booleancriteria) | Completed | |
## [Cell](https://developers.google.com/apps-script/reference/spreadsheet/cell)
A single cell in a sheet.


| method | return | status | comments |
|---|---|---|---|
| [getFormula()](https://developers.google.com/apps-script/reference/spreadsheet/cell#getFormula()) | String | Completed | |
| [getFormulaR1C1()](https://developers.google.com/apps-script/reference/spreadsheet/cell#getFormulaR1C1()) | String | Completed | |
| [getValue()](https://developers.google.com/apps-script/reference/spreadsheet/cell#getValue()) | Object | Completed | |
| [setFormula(formula)](https://developers.google.com/apps-script/reference/spreadsheet/cell#setFormula(String)) | [Cell](#cell) | Completed | |
| [setFormulaR1C1(formula)](https://developers.google.com/apps-script/reference/spreadsheet/cell#setFormulaR1C1(String)) | [Cell](#cell) | Completed | |
| [setValue(value)](https://developers.google.com/apps-script/reference/spreadsheet/cell#setValue(Object)) | [Cell](#cell) | Completed | |
---
## [Color](https://developers.google.com/apps-script/reference/spreadsheet/color)
A color in a sheet.


| method | return | status | comments |
|---|---|---|---|
| [asRgbColor()](https://developers.google.com/apps-script/reference/spreadsheet/color#asRgbColor()) | [RgbColor](https://developers.google.com/apps-script/reference/base/rgb-color) | Completed | |
| [asThemeColor()](https://developers.google.com/apps-script/reference/spreadsheet/color#asThemeColor()) | [ThemeColor](https://developers.google.com/apps-script/reference/base/theme-color) | Completed | |
| [getColorType()](https://developers.google.com/apps-script/reference/spreadsheet/color#getColorType()) | [ColorType](https://developers.google.com/apps-script/reference/base/color-type) | Completed | |
---
## [ConditionalFormatRule](https://developers.google.com/apps-script/reference/spreadsheet/conditional-format-rule)
A conditional format rule.


| method | return | status | comments |
|---|---|---|---|
| [copy()](https://developers.google.com/apps-script/reference/spreadsheet/conditional-format-rule#copy()) | [ConditionalFormatRuleBuilder](#conditionalformatrulebuilder) | Completed | |
| [getRanges()](https://developers.google.com/apps-script/reference/spreadsheet/conditional-format-rule#getRanges()) | [Range[]](#range) | Completed | |
---
## [ConditionalFormatRuleBuilder](https://developers.google.com/apps-script/reference/spreadsheet/conditional-format-rule-builder)
A builder for a conditional format rule.


| method | return | status | comments |
|---|---|---|---|
| [build()](https://developers.google.com/apps-script/reference/spreadsheet/conditional-format-rule-builder#build()) | [ConditionalFormatRule](#conditionalformatrule) | Completed | |
| [setBackground(color)](https://developers.google.com/apps-script/reference/spreadsheet/conditional-format-rule-builder#setBackground(String)) | [ConditionalFormatRuleBuilder](#conditionalformatrulebuilder) | Completed | |
| [setBackground(color)](https://developers.google.com/apps-script/reference/spreadsheet/conditional-format-rule-builder#setBackground(Color)) | [ConditionalFormatRuleBuilder](#conditionalformatrulebuilder) | Completed | |
| [setBold(bold)](https://developers.google.com/apps-script/reference/spreadsheet/conditional-format-rule-builder#setBold(Boolean)) | [ConditionalFormatRuleBuilder](#conditionalformatrulebuilder) | Completed | |
| [setFontColor(color)](https://developers.google.com/apps-script/reference/spreadsheet/conditional-format-rule-builder#setFontColor(String)) | [ConditionalFormatRuleBuilder](#conditionalformatrulebuilder) | Completed | |
| [setFontColor(color)](https://developers.google.com/apps-script/reference/spreadsheet/conditional-format-rule-builder#setFontColor(Color)) | [ConditionalFormatRuleBuilder](#conditionalformatrulebuilder) | Completed | |
| [setItalic(italic)](https://developers.google.com/apps-script/reference/spreadsheet/conditional-format-rule-builder#setItalic(Boolean)) | [ConditionalFormatRuleBuilder](#conditionalformatrulebuilder) | Completed | |
| [setRanges(ranges)](https://developers.google.com/apps-script/reference/spreadsheet/conditional-format-rule-builder#setRanges(Range[])) | [ConditionalFormatRuleBuilder](#conditionalformatrulebuilder) | Completed | |
| [setStrikethrough(strikethrough)](https://developers.google.com/apps-script/reference/spreadsheet/conditional-format-rule-builder#setStrikethrough(Boolean)) | [ConditionalFormatRuleBuilder](#conditionalformatrulebuilder) | Completed | |
| [setUnderline(underline)](https://developers.google.com/apps-script/reference/spreadsheet/conditional-format-rule-builder#setUnderline(Boolean)) | [ConditionalFormatRuleBuilder](#conditionalformatrulebuilder) | Completed | |
| [whenCellEmpty()](https://developers.google.com/apps-script/reference/spreadsheet/conditional-format-rule-builder#whenCellEmpty()) | [ConditionalFormatRuleBuilder](#conditionalformatrulebuilder) | Completed | |
| [whenCellNotEmpty()](https://developers.google.com/apps-script/reference/spreadsheet/conditional-format-rule-builder#whenCellNotEmpty()) | [ConditionalFormatRuleBuilder](#conditionalformatrulebuilder) | Completed | |
| [whenDateAfter(date)](https://developers.google.com/apps-script/reference/spreadsheet/conditional-format-rule-builder#whenDateAfter(Date)) | [ConditionalFormatRuleBuilder](#conditionalformatrulebuilder) | Completed | |
| [whenDateAfter(date)](https://developers.google.com/apps-script/reference/spreadsheet/conditional-format-rule-builder#whenDateAfter(RelativeDate)) | [ConditionalFormatRuleBuilder](#conditionalformatrulebuilder) | Completed | |
| [whenDateBefore(date)](https://developers.google.com/apps-script/reference/spreadsheet/conditional-format-rule-builder#whenDateBefore(Date)) | [ConditionalFormatRuleBuilder](#conditionalformatrulebuilder) | Completed | |
| [whenDateBefore(date)](https://developers.google.com/apps-script/reference/spreadsheet/conditional-format-rule-builder#whenDateBefore(RelativeDate)) | [ConditionalFormatRuleBuilder](#conditionalformatrulebuilder) | Completed | |
| [whenDateEqualTo(date)](https://developers.google.com/apps-script/reference/spreadsheet/conditional-format-rule-builder#whenDateEqualTo(Date)) | [ConditionalFormatRuleBuilder](#conditionalformatrulebuilder) | Completed | |
| [whenDateEqualTo(date)](https://developers.google.com/apps-script/reference/spreadsheet/conditional-format-rule-builder#whenDateEqualTo(RelativeDate)) | [ConditionalFormatRuleBuilder](#conditionalformatrulebuilder) | Completed | |
| [whenDateNotEqualTo(date)](https://developers.google.com/apps-script/reference/spreadsheet/conditional-format-rule-builder#whenDateNotEqualTo(Date)) | [ConditionalFormatRuleBuilder](#conditionalformatrulebuilder) | Completed | |
| [whenDateNotEqualTo(date)](https://developers.google.com/apps-script/reference/spreadsheet/conditional-format-rule-builder#whenDateNotEqualTo(RelativeDate)) | [ConditionalFormatRuleBuilder](#conditionalformatrulebuilder) | Completed | |
| [whenFormulaSatisfied(formula)](https://developers.google.com/apps-script/reference/spreadsheet/conditional-format-rule-builder#whenFormulaSatisfied(String)) | [ConditionalFormatRuleBuilder](#conditionalformatrulebuilder) | Completed | |
| [whenNumberBetween(start, end)](https://developers.google.com/apps-script/reference/spreadsheet/conditional-format-rule-builder#whenNumberBetween(Number,Number)) | [ConditionalFormatRuleBuilder](#conditionalformatrulebuilder) | Completed | |
| [whenNumberEqualTo(number)](https://developers.google.com/apps-script/reference/spreadsheet/conditional-format-rule-builder#whenNumberEqualTo(Number)) | [ConditionalFormatRuleBuilder](#conditionalformatrulebuilder) | Completed | |
| [whenNumberGreaterThan(number)](https://developers.google.com/apps-script/reference/spreadsheet/conditional-format-rule-builder#whenNumberGreaterThan(Number)) | [ConditionalFormatRuleBuilder](#conditionalformatrulebuilder) | Completed | |
| [whenNumberGreaterThanOrEqualTo(number)](https://developers.google.com/apps-script/reference/spreadsheet/conditional-format-rule-builder#whenNumberGreaterThanOrEqualTo(Number)) | [ConditionalFormatRuleBuilder](#conditionalformatrulebuilder) | Completed | |
| [whenNumberLessThan(number)](https://developers.google.com/apps-script/reference/spreadsheet/conditional-format-rule-builder#whenNumberLessThan(Number)) | [ConditionalFormatRuleBuilder](#conditionalformatrulebuilder) | Completed | |
| [whenNumberLessThanOrEqualTo(number)](https://developers.google.com/apps-script/reference/spreadsheet/conditional-format-rule-builder#whenNumberLessThanOrEqualTo(Number)) | [ConditionalFormatRuleBuilder](#conditionalformatrulebuilder) | Completed | |
| [whenNumberNotBetween(start, end)](https://developers.google.com/apps-script/reference/spreadsheet/conditional-format-rule-builder#whenNumberNotBetween(Number,Number)) | [ConditionalFormatRuleBuilder](#conditionalformatrulebuilder) | Completed | |
| [whenNumberNotEqualTo(number)](https://developers.google.com/apps-script/reference/spreadsheet/conditional-format-rule-builder#whenNumberNotEqualTo(Number)) | [ConditionalFormatRuleBuilder](#conditionalformatrulebuilder) | Completed | |
| [whenTextContains(text)](https://developers.google.com/apps-script/reference/spreadsheet/conditional-format-rule-builder#whenTextContains(String)) | [ConditionalFormatRuleBuilder](#conditionalformatrulebuilder) | Completed | |
| [whenTextDoesNotContain(text)](https://developers.google.com/apps-script/reference/spreadsheet/conditional-format-rule-builder#whenTextDoesNotContain(String)) | [ConditionalFormatRuleBuilder](#conditionalformatrulebuilder) | Completed | |
| [whenTextEndsWith(text)](https://developers.google.com/apps-script/reference/spreadsheet/conditional-format-rule-builder#whenTextEndsWith(String)) | [ConditionalFormatRuleBuilder](#conditionalformatrulebuilder) | Completed | |
| [whenTextStartsWith(text)](https://developers.google.com/apps-script/reference/spreadsheet/conditional-format-rule-builder#whenTextStartsWith(String)) | [ConditionalFormatRuleBuilder](#conditionalformatrulebuilder) | Completed | |
---
## [CopyPasteType](https://developers.google.com/apps-script/reference/spreadsheet/copy-paste-type)
An enum representing the supported paste types.

100% completed

| method | return | status | comments |
|---|---|---|---|
| PASTE_AS_VALUES | [CopyPasteType](#copypastetype) | Completed | |
| PASTE_COLUMN_WIDTHS | [CopyPasteType](#copypastetype) | Completed | |
| PASTE_CONDITIONAL_FORMATTING | [CopyPasteType](#copypastetype) | Completed | |
## [DataValidation](https://developers.google.com/apps-script/reference/spreadsheet/data-validation)
A data validation rule.


| method | return | status | comments |
|---|---|---|---|
| [copy()](https://developers.google.com/apps-script/reference/spreadsheet/data-validation#copy()) | [DataValidationBuilder](#datavalidationbuilder) | Completed | |
| [getAllowInvalid()](https://developers.google.com/apps-script/reference/spreadsheet/data-validation#getAllowInvalid()) | Boolean | Completed | |
| [getCriteriaType()](https://developers.google.com/apps-script/reference/spreadsheet/data-validation#getCriteriaType()) | [DataValidationCriteria](#datavalidationcriteria) | Completed | |
| [getCriteriaValues()](https://developers.google.com/apps-script/reference/spreadsheet/data-validation#getCriteriaValues()) | Object[] | Completed | |
| [getHelpText()](https://developers.google.com/apps-script/reference/spreadsheet/data-validation#getHelpText()) | String | Completed | |
| [isShowCustomUi()](https://developers.google.com/apps-script/reference/spreadsheet/data-validation#isShowCustomUi()) | Boolean | Completed | |
---
## [DataValidationBuilder](https://developers.google.com/apps-script/reference/spreadsheet/data-validation-builder)
A builder for a data validation rule.


| method | return | status | comments |
|---|---|---|---|
| [build()](https://developers.google.com/apps-script/reference/spreadsheet/data-validation-builder#build()) | [DataValidation](#datavalidation) | Completed | |
| [requireCheckbox()](https://developers.google.com/apps-script/reference/spreadsheet/data-validation-builder#requireCheckbox()) | [DataValidationBuilder](#datavalidationbuilder) | Completed | |
| [requireDateAfter(date)](https://developers.google.com/apps-script/reference/spreadsheet/data-validation-builder#requireDateAfter(Date)) | [DataValidationBuilder](#datavalidationbuilder) | Completed | |
| [requireDateBefore(date)](https://developers.google.com/apps-script/reference/spreadsheet/data-validation-builder#requireDateBefore(Date)) | [DataValidationBuilder](#datavalidationbuilder) | Completed | |
| [requireDateBetween(start, end)](https://developers.google.com/apps-script/reference/spreadsheet/data-validation-builder#requireDateBetween(Date,Date)) | [DataValidationBuilder](#datavalidationbuilder) | Completed | |
| [requireDateEqualTo(date)](https://developers.google.com/apps-script/reference/spreadsheet/data-validation-builder#requireDateEqualTo(Date)) | [DataValidationBuilder](#datavalidationbuilder) | Completed | |
| [requireDateNotBetween(start, end)](https://developers.google.com/apps-script/reference/spreadsheet/data-validation-builder#requireDateNotBetween(Date,Date)) | [DataValidationBuilder](#datavalidationbuilder) | Completed | |
| [requireDateOnOrAfter(date)](https://developers.google.com/apps-script/reference/spreadsheet/data-validation-builder#requireDateOnOrAfter(Date)) | [DataValidationBuilder](#datavalidationbuilder) | Completed | |
| [requireDateOnOrBefore(date)](https://developers.google.com/apps-script/reference/spreadsheet/data-validation-builder#requireDateOnOrBefore(Date)) | [DataValidationBuilder](#datavalidationbuilder) | Completed | |
| [requireFormulaText(formula)](https://developers.google.com/apps-script/reference/spreadsheet/data-validation-builder#requireFormulaText(String)) | [DataValidationBuilder](#datavalidationbuilder) | Completed | |
| [requireNumberBetween(start, end)](https://developers.google.com/apps-script/reference/spreadsheet/data-validation-builder#requireNumberBetween(Number,Number)) | [DataValidationBuilder](#datavalidationbuilder) | Completed | |
| [requireNumberEqualTo(number)](https://developers.google.com/apps-script/reference/spreadsheet/data-validation-builder#requireNumberEqualTo(Number)) | [DataValidationBuilder](#datavalidationbuilder) | Completed | |
| [requireNumberGreaterThan(number)](https://developers.google.com/apps-script/reference/spreadsheet/data-validation-builder#requireNumberGreaterThan(Number)) | [DataValidationBuilder](#datavalidationbuilder) | Completed | |
| [requireNumberGreaterThanOrEqualTo(number)](https://developers.google.com/apps-script/reference/spreadsheet/data-validation-builder#requireNumberGreaterThanOrEqualTo(Number)) | [DataValidationBuilder](#datavalidationbuilder) | Completed | |
| [requireNumberLessThan(number)](https://developers.google.com/apps-script/reference/spreadsheet/data-validation-builder#requireNumberLessThan(Number)) | [DataValidationBuilder](#datavalidationbuilder) | Completed | |
| [requireNumberLessThanOrEqualTo(number)](https://developers.google.com/apps-script/reference/spreadsheet/data-validation-builder#requireNumberLessThanOrEqualTo(Number)) | [DataValidationBuilder](#datavalidationbuilder) | Completed | |
| [requireNumberNotBetween(start, end)](https://developers.google.com/apps-script/reference/spreadsheet/data-validation-builder#requireNumberNotBetween(Number,Number)) | [DataValidationBuilder](#datavalidationbuilder) | Completed | |
| [requireNumberNotEqualTo(number)](https://developers.google.com/apps-script/reference/spreadsheet/data-validation-builder#requireNumberNotEqualTo(Number)) | [DataValidationBuilder](#datavalidationbuilder) | Completed | |
| [requireTextContains(text)](https://developers.google.com/apps-script/reference/spreadsheet/data-validation-builder#requireTextContains(String)) | [DataValidationBuilder](#datavalidationbuilder) | Completed | |
| [requireTextDoesNotContain(text)](https://developers.google.com/apps-script/reference/spreadsheet/data-validation-builder#requireTextDoesNotContain(String)) | [DataValidationBuilder](#datavalidationbuilder) | Completed | |
| [requireTextIsEmail()](https://developers.google.com/apps-script/reference/spreadsheet/data-validation-builder#requireTextIsEmail()) | [DataValidationBuilder](#datavalidationbuilder) | Completed | |
| [requireTextIsUrl()](https://developers.google.com/apps-script/reference/spreadsheet/data-validation-builder#requireTextIsUrl()) | [DataValidationBuilder](#datavalidationbuilder) | Completed | |
| [requireValueInList(values)](https://developers.google.com/apps-script/reference/spreadsheet/data-validation-builder#requireValueInList(String[])) | [DataValidationBuilder](#datavalidationbuilder) | Completed | |
| [requireValueInList(values, showDropdown)](https://developers.google.com/apps-script/reference/spreadsheet/data-validation-builder#requireValueInList(String[],Boolean)) | [DataValidationBuilder](#datavalidationbuilder) | Completed | |
| [requireValueInRange(range)](https://developers.google.com/apps-script/reference/spreadsheet/data-validation-builder#requireValueInRange(Range)) | [DataValidationBuilder](#datavalidationbuilder) | Completed | |
| [requireValueInRange(range, showDropdown)](https://developers.google.com/apps-script/reference/spreadsheet/data-validation-builder#requireValueInRange(Range,Boolean)) | [DataValidationBuilder](#datavalidationbuilder) | Completed | |
| [requireWholeNumber()](https://developers.google.com/apps-script/reference/spreadsheet/data-validation-builder#requireWholeNumber()) | [DataValidationBuilder](#datavalidationbuilder) | Completed | |
| [setAllowInvalid(allowInvalid)](https://developers.google.com/apps-script/reference/spreadsheet/data-validation-builder#setAllowInvalid(Boolean)) | [DataValidationBuilder](#datavalidationbuilder) | Completed | |
| [setHelpText(helpText)](https://developers.google.com/apps-script/reference/spreadsheet/data-validation-builder#setHelpText(String)) | [DataValidationBuilder](#datavalidationbuilder) | Completed | |
| [setWholedataValidation(dataValidation)](https://developers.google.com/apps-script/reference/spreadsheet/data-validation-builder#setWholedataValidation(DataValidation)) | [DataValidationBuilder](#datavalidationbuilder) | Completed | |
---
## [DataValidationCriteria](https://developers.google.com/apps-script/reference/spreadsheet/data-validation-criteria)
An enum representing supported data validation criteria.

100% completed

| method | return | status | comments |
|---|---|---|---|
| CHECKBOX | [DataValidationCriteria](#datavalidationcriteria) | Completed | |
| DATE_AFTER | [DataValidationCriteria](#datavalidationcriteria) | Completed | |
| DATE_BEFORE | [DataValidationCriteria](#datavalidationcriteria) | Completed | |
## [DeveloperMetadata](https://developers.google.com/apps-script/reference/spreadsheet/developer-metadata)
A developer metadata entry.


| method | return | status | comments |
|---|---|---|---|
| [delete()](https://developers.google.com/apps-script/reference/spreadsheet/developer-metadata#delete()) | void | Completed | |
| [getId()](https://developers.google.com/apps-script/reference/spreadsheet/developer-metadata#getId()) | Integer | Completed | |
| [getKey()](https://developers.google.com/apps-script/reference/spreadsheet/developer-metadata#getKey()) | String | Completed | |
| [getLocation()](https://developers.google.com/apps-script/reference/spreadsheet/developer-metadata#getLocation()) | [DeveloperMetadataLocation](#developermetadatalocation) | Completed | |
| [getValue()](https://developers.google.com/apps-script/reference/spreadsheet/developer-metadata#getValue()) | String | Completed | |
| [getVisibility()](https://developers.google.com/apps-script/reference/spreadsheet/developer-metadata#getVisibility()) | [DeveloperMetadataVisibility](#developermetadatavisibility) | Completed | |
| [setValue(value)](https://developers.google.com/apps-script/reference/spreadsheet/developer-metadata#setValue(String)) | [DeveloperMetadata](#developermetadata) | Completed | |
| [setVisibility(visibility)](https://developers.google.com/apps-script/reference/spreadsheet/developer-metadata#setVisibility(DeveloperMetadataVisibility)) | [DeveloperMetadata](#developermetadata) | Completed | |
---
## [DeveloperMetadataLocation](https://developers.google.com/apps-script/reference/spreadsheet/developer-metadata-location)
A developer metadata location.


| method | return | status | comments |
|---|---|---|---|
| [getColumn()](https://developers.google.com/apps-script/reference/spreadsheet/developer-metadata-location#getColumn()) | [Range](#range) | Completed | |
| [getLocationType()](https://developers.google.com/apps-script/reference/spreadsheet/developer-metadata-location#getLocationType()) | [DeveloperMetadataLocationType](https://developers.google.com/apps-script/reference/spreadsheet/developer-metadata-location-type) | Completed | |
| [getRange()](https://developers.google.com/apps-script/reference/spreadsheet/developer-metadata-location#getRange()) | [Range](#range) | Completed | |
| [getRow()](https://developers.google.com/apps-script/reference/spreadsheet/developer-metadata-location#getRow()) | [Range](#range) | Completed | |
| [getSpreadsheet()](https://developers.google.com/apps-script/reference/spreadsheet/developer-metadata-location#getSpreadsheet()) | [Spreadsheet](#spreadsheet) | Completed | |
| [getSheet()](https://developers.google.com/apps-script/reference/spreadsheet/developer-metadata-location#getSheet()) | [Sheet](#sheet) | Completed | |
---
## [DeveloperMetadataVisibility](https://developers.google.com/apps-script/reference/spreadsheet/developer-metadata-visibility)
An enum representing the visibility of developer metadata.

100% completed

| method | return | status | comments |
|---|---|---|---|
| DOCUMENT | [DeveloperMetadataVisibility](#developermetadatavisibility) | Completed | |
| PROJECT | [DeveloperMetadataVisibility](#developermetadatavisibility) | Completed | |
---
## [Filter](https://developers.google.com/apps-script/reference/spreadsheet/filter)
A filter in a sheet.


| method | return | status | comments |
|---|---|---|---|
| [getRange()](https://developers.google.com/apps-script/reference/spreadsheet/filter#getRange()) | [Range](#range) | Completed | |
| [remove()](https://developers.google.com/apps-script/reference/spreadsheet/filter#remove()) | void | Completed | |
| [sort(column, ascending)](https://developers.google.com/apps-script/reference/spreadsheet/filter#sort(Integer,Boolean)) | [Filter](#filter) | Completed | |
| [sort(sortSpec)](https://developers.google.com/apps-script/reference/spreadsheet/filter#sort(Object[])) | [Filter](#filter) | Completed | |
---
## [FilterCriteria](https://developers.google.com/apps-script/reference/spreadsheet/filter-criteria)
A filter criteria in a filter.


| method | return | status | comments |
|---|---|---|---|
| [copy()](https://developers.google.com/apps-script/reference/spreadsheet/filter-criteria#copy()) | [FilterCriteriaBuilder](#filtercriteriabuilder) | Completed | |
| [getCriteriaType()](https://developers.google.com/apps-script/reference/spreadsheet/filter-criteria#getCriteriaType()) | [BooleanCriteria](#booleancriteria) | Completed | |
| [getCriteriaValues()](https://developers.google.com/apps-script/reference/spreadsheet/filter-criteria#getCriteriaValues()) | String[] | Completed | |
| [getHiddenValues()](https://developers.google.com/apps-script/reference/spreadsheet/filter-criteria#getHiddenValues()) | String[] | Completed | |
| [getVisibleValues()](https://developers.google.com/apps-script/reference/spreadsheet/filter-criteria#getVisibleValues()) | String[] | Completed | |
---
## [FilterCriteriaBuilder](https://developers.google.com/apps-script/reference/spreadsheet/filter-criteria-builder)
A builder for a filter criteria.


| method | return | status | comments |
|---|---|---|---|
| [build()](https://developers.google.com/apps-script/reference/spreadsheet/filter-criteria-builder#build()) | [FilterCriteria](#filtercriteria) | Completed | |
| [setCustomFormula(formula)](https://developers.google.com/apps-script/reference/spreadsheet/filter-criteria-builder#setCustomFormula(String)) | [FilterCriteriaBuilder](#filtercriteriabuilder) | Completed | |
| [setHiddenValues(values)](https://developers.google.com/apps-script/reference/spreadsheet/filter-criteria-builder#setHiddenValues(String[])) | [FilterCriteriaBuilder](#filtercriteriabuilder) | Completed | |
| [setNumberCondition(condition, values)](https://developers.google.com/apps-script/reference/spreadsheet/filter-criteria-builder#setNumberCondition(BooleanCriteria,Number[])) | [FilterCriteriaBuilder](#filtercriteriabuilder) | Completed | |
| [setTextCondition(condition, values)](https://developers.google.com/apps-script/reference/spreadsheet/filter-criteria-builder#setTextCondition(BooleanCriteria,String[])) | [FilterCriteriaBuilder](#filtercriteriabuilder) | Completed | |
| [setVisibleValues(values)](https://developers.google.com/apps-script/reference/spreadsheet/filter-criteria-builder#setVisibleValues(String[])) | [FilterCriteriaBuilder](#filtercriteriabuilder) | Completed | |
---
## [FilterCriterion](https://developers.google.com/apps-script/reference/spreadsheet/filter-criterion)
A filter criterion in a filter.


| method | return | status | comments |
|---|---|---|---|
| [copy()](https://developers.google.com/apps-script/reference/spreadsheet/filter-criterion#copy()) | [FilterCriterionBuilder](#filtercriterionbuilder) | Completed | |
| [getCriteriaType()](https://developers.google.com/apps-script/reference/spreadsheet/filter-criterion#getCriteriaType()) | [BooleanCriteria](#booleancriteria) | Completed | |
| [getCriteriaValues()](https://developers.google.com/apps-script/reference/spreadsheet/filter-criterion#getCriteriaValues()) | String[] | Completed | |
| [getHiddenValues()](https://developers.google.com/apps-script/reference/spreadsheet/filter-criterion#getHiddenValues()) | String[] | Completed | |
| [getVisibleValues()](https://developers.google.com/apps-script/reference/spreadsheet/filter-criterion#getVisibleValues()) | String[] | Completed | |
---
## [FilterCriterionBuilder](https://developers.google.com/apps-script/reference/spreadsheet/filter-criterion-builder)
A builder for a filter criterion.


| method | return | status | comments |
|---|---|---|---|
| [build()](https://developers.google.com/apps-script/reference/spreadsheet/filter-criterion-builder#build()) | [FilterCriterion](#filtercriterion) | Completed | |
| [setCustomFormula(formula)](https://developers.google.com/apps-script/reference/spreadsheet/filter-criterion-builder#setCustomFormula(String)) | [FilterCriterionBuilder](#filtercriterionbuilder) | Completed | |
| [setHiddenValues(values)](https://developers.google.com/apps-script/reference/spreadsheet/filter-criterion-builder#setHiddenValues(String[])) | [FilterCriterionBuilder](#filtercriterionbuilder) | Completed | |
| [setNumberCondition(condition, values)](https://developers.google.com/apps-script/reference/spreadsheet/filter-criterion-builder#setNumberCondition(BooleanCriteria,Number[])) | [FilterCriterionBuilder](#filtercriterionbuilder) | Completed | |
| [setTextCondition(condition, values)](https://developers.google.com/apps-script/reference/spreadsheet/filter-criterion-builder#setTextCondition(BooleanCriteria,String[])) | [FilterCriterionBuilder](#filtercriterionbuilder) | Completed | |
| [setVisibleValues(values)](https://developers.google.com/apps-script/reference/spreadsheet/filter-criterion-builder#setVisibleValues(String[])) | [FilterCriterionBuilder](#filtercriterionbuilder) | Completed | |
---
## [FilterMode](https://developers.google.com/apps-script/reference/spreadsheet/filter-mode)
An enum representing the supported filter modes.

100% completed

| method | return | status | comments |
|---|---|---|---|
| FILTER | [FilterMode](#filtermode) | Completed | |
| OFF | [FilterMode](#filtermode) | Completed | |
---
## [NamedRange](https://developers.google.com/apps-script/reference/spreadsheet/named-range)
A named range in a spreadsheet.


| method | return | status | comments |
|---|---|---|---|
| [getRange()](https://developers.google.com/apps-script/reference/spreadsheet/named-range#getRange()) | [Range](#range) | Completed | |
| [getName()](https://developers.google.com/apps-script/reference/spreadsheet/named-range#getName()) | String | Completed | |
| [remove()](https://developers.google.com/apps-script/reference/spreadsheet/named-range#remove()) | void | Completed | |
| [setRange(range)](https://developers.google.com/apps-script/reference/spreadsheet/named-range#setRange(Range)) | [NamedRange](#namedrange) | Completed | |
| [setName(name)](https://developers.google.com/apps-script/reference/spreadsheet/named-range#setName(String)) | [NamedRange](#namedrange) | Completed | |
---
## [NumberFormat](https://developers.google.com/apps-script/reference/spreadsheet/number-format)
An enum representing the supported number formats.

100% completed

| method | return | status | comments |
|---|---|---|---|
| ACCOUNTING | [NumberFormat](#numberformat) | Completed | |
| CURRENCY | [NumberFormat](#numberformat) | Completed | |
| DATE | [NumberFormat](#numberformat) | Completed | |
## [Protection](https://developers.google.com/apps-script/reference/spreadsheet/protection)
A protection in a sheet.


| method | return | status | comments |
|---|---|---|---|
| [addEditor(email)](https://developers.google.com/apps-script/reference/spreadsheet/protection#addEditor(String)) | [Protection](#protection) | Completed | |
| [addEditor(user)](https://developers.google.com/apps-script/reference/spreadsheet/protection#addEditor(User)) | [Protection](#protection) | Completed | |
| [addEditors(emailAddresses)](https://developers.google.com/apps-script/reference/spreadsheet/protection#addEditors(String[])) | [Protection](#protection) | Completed | |
| [canEdit()](https://developers.google.com/apps-script/reference/spreadsheet/protection#canEdit()) | Boolean | Completed | |
| [getDescription()](https://developers.google.com/apps-script/reference/spreadsheet/protection#getDescription()) | String | Completed | |
| [getEditors()](https://developers.google.com/apps-script/reference/spreadsheet/protection#getEditors()) | [User[]](https://developers.google.com/apps-script/reference/base/user) | Completed | |
| [getProtectionType()](https://developers.google.com/apps-script/reference/spreadsheet/protection#getProtectionType()) | [ProtectionType](#protectiontype) | Completed | |
| [getRange()](https://developers.google.com/apps-script/reference/spreadsheet/protection#getRange()) | [Range](#range) | Completed | |
| [getUnprotectedRanges()](https://developers.google.com/apps-script/reference/spreadsheet/protection#getUnprotectedRanges()) | [Range[]](#range) | Completed | |
| [isWarningOnly()](https://developers.google.com/apps-script/reference/spreadsheet/protection#isWarningOnly()) | Boolean | Completed | |
| [remove()](https://developers.google.com/apps-script/reference/spreadsheet/protection#remove()) | void | Completed | |
| [removeEditor(email)](https://developers.google.com/apps-script/reference/spreadsheet/protection#removeEditor(String)) | [Protection](#protection) | Completed | |
| [removeEditor(user)](https://developers.google.com/apps-script/reference/spreadsheet/protection#removeEditor(User)) | [Protection](#protection) | Completed | |
| [removeEditors(emailAddresses)](https://developers.google.com/apps-script/reference/spreadsheet/protection#removeEditors(String[])) | [Protection](#protection) | Completed | |
| [setDescription(description)](https://developers.google.com/apps-script/reference/spreadsheet/protection#setDescription(String)) | [Protection](#protection) | Completed | |
| [setUnprotectedRanges(ranges)](https://developers.google.com/apps-script/reference/spreadsheet/protection#setUnprotectedRanges(Range[])) | [Protection](#protection) | Completed | |
| [setWarningOnly(warningOnly)](https://developers.google.com/apps-script/reference/spreadsheet/protection#setWarningOnly(Boolean)) | [Protection](#protection) | Completed | |
---
## [ProtectionType](https://developers.google.com/apps-script/reference/spreadsheet/protection-type)
An enum representing the supported protection types.

100% completed

| method | return | status | comments |
|---|---|---|---|
| RANGE | [ProtectionType](#protectiontype) | Completed | |
| SHEET | [ProtectionType](#protectiontype) | Completed | |
---
## [Range](https://developers.google.com/apps-script/reference/spreadsheet/range)
A range in a sheet.


| method | return | status | comments |
|---|---|---|---|
| [activate()](https://developers.google.com/apps-script/reference/spreadsheet/range#activate()) | [Range](#range) | Not Started | |
| [applyRowBanding()](https://developers.google.com/apps-script/reference/spreadsheet/range#applyRowBanding()) | [Banding](#banding) | Completed | |
| [applyRowBanding(bandingTheme)](https://developers.google.com/apps-script/reference/spreadsheet/range#applyRowBanding(BandingTheme)) | [Banding](#banding) | Completed | |
| [breakApart()](https://developers.google.com/apps-script/reference/spreadsheet/range#breakApart()) | [Range](#range) | Completed | |
| [clear()](https://developers.google.com/apps-script/reference/spreadsheet/range#clear()) | [Range](#range) | Completed | |
| [clear(options)](https://developers.google.com/apps-script/reference/spreadsheet/range#clear(Object)) | [Range](#range) | Completed | |
| [clearContent()](https://developers.google.com/apps-script/reference/spreadsheet/range#clearContent()) | [Range](#range) | Completed | |
| [clearDataValidations()](https://developers.google.com/apps-script/reference/spreadsheet/range#clearDataValidations()) | [Range](#range) | Completed | |
| [clearFormat()](https://developers.google.com/apps-script/reference/spreadsheet/range#clearFormat()) | [Range](#range) | Completed | |
| [clearNote()](https://developers.google.com/apps-script/reference/spreadsheet/range#clearNote()) | [Range](#range) | Completed | |
| [copyFormatToRange(sheet, column, columnEnd, row, rowEnd)](https://developers.google.com/apps-script/reference/spreadsheet/range#copyFormatToRange(Sheet,Integer,Integer,Integer,Integer)) | void | Completed | |
| [copyFormatToRange(sheet, row, column)](https://developers.google.com/apps-script/reference/spreadsheet/range#copyFormatToRange(Sheet,Integer,Integer)) | void | Completed | |
| [copyTo(destination)](https://developers.google.com/apps-script/reference/spreadsheet/range#copyTo(Range)) | void | Completed | |
| [copyTo(destination, options)](https://developers.google.com/apps-script/reference/spreadsheet/range#copyTo(Range,Object)) | void | Completed | |
| [copyTo(destination, copyPasteType, transposed)](https://developers.google.com/apps-script/reference/spreadsheet/range#copyTo(Range,CopyPasteType,Boolean)) | void | Completed | |
| [copyValuesToRange(sheet, column, columnEnd, row, rowEnd)](https://developers.google.com/apps-script/reference/spreadsheet/range#copyValuesToRange(Sheet,Integer,Integer,Integer,Integer)) | void | Completed | |
| [copyValuesToRange(sheet, row, column)](https://developers.google.com/apps-script/reference/spreadsheet/range#copyValuesToRange(Sheet,Integer,Integer)) | void | Completed | |
| [getA1Notation()](https://developers.google.com/apps-script/reference/spreadsheet/range#getA1Notation()) | String | Completed | |
| [getBandings()](https://developers.google.com/apps-script/reference/spreadsheet/range#getBandings()) | [Banding[]](#banding) | Completed | |
| [getBackground()](https://developers.google.com/apps-script/reference/spreadsheet/range#getBackground()) | String | Completed | |
| [getBackgrounds()](https://developers.google.com/apps-script/reference/spreadsheet/range#getBackgrounds()) | String[][] | Completed | |
| [getBorder(location)](https://developers.google.com/apps-script/reference/spreadsheet/range#getBorder(Location)) | [Border](#border) | Completed | |
| [getBottomBorder()](https://developers.google.com/apps-script/reference/spreadsheet/range#getBottomBorder()) | [Border](#border) | Completed | |
| [getCell(row, column)](https://developers.google.com/apps-script/reference/spreadsheet/range#getCell(Integer,Integer)) | [Cell](#cell) | Completed | |
| [getColumn()](https://developers.google.com/apps-script/reference/spreadsheet/range#getColumn()) | Integer | Completed | |
| [getColumnEnd()](https://developers.google.com/apps-script/reference/spreadsheet/range#getColumnEnd()) | Integer | Completed | |
| [getColumnIndex()](https://developers.google.com/apps-script/reference/spreadsheet/range#getColumnIndex()) | Integer | Completed | |
| [getDataValidation()](https://developers.google.com/apps-script/reference/spreadsheet/range#getDataValidation()) | [DataValidation](#datavalidation) | Completed | |
| [getDataValidations()](https://developers.google.com/apps-script/reference/spreadsheet/range#getDataValidations()) | [DataValidation[][]](#datavalidation) | Completed | |
| [getDataSourceTables()](https://developers.google.com/apps-script/reference/spreadsheet/range#getDataSourceTables()) | [DataSourceTable[]](https://developers.google.com/apps-script/reference/spreadsheet/data-source-table) | Not Started | |
| [getDeveloperMetadata()](https://developers.google.com/apps-script/reference/spreadsheet/range#getDeveloperMetadata()) | [DeveloperMetadata[]](#developermetadata) | Completed | |
| [getDeveloperMetadataByKey(key)](https://developers.google.com/apps-script/reference/spreadsheet/range#getDeveloperMetadataByKey(String)) | [DeveloperMetadata[]](#developermetadata) | Completed | |
| [getDeveloperMetadataByKey(key, visibility)](https://developers.google.com/apps-script/reference/spreadsheet/range#getDeveloperMetadataByKey(String,DeveloperMetadataVisibility)) | [DeveloperMetadata[]](#developermetadata) | Completed | |
| [getDeveloperMetadataById(id)](https://developers.google.com/apps-script/reference/spreadsheet/range#getDeveloperMetadataById(Integer)) | [DeveloperMetadata](#developermetadata) | Completed | |
| [getDeveloperMetadataByLocation(locationType)](https://developers.google.com/apps-script/reference/spreadsheet/range#getDeveloperMetadataByLocation(DeveloperMetadataLocationType)) | [DeveloperMetadata[]](#developermetadata) | Completed | |
| [getDeveloperMetadataByLocation(locationType, visibility)](https://developers.google.com/apps-script/reference/spreadsheet/range#getDeveloperMetadataByLocation(DeveloperMetadataLocationType,DeveloperMetadataVisibility)) | [DeveloperMetadata[]](#developermetadata) | Completed | |
| [getDisplayValue()](https://developers.google.com/apps-script/reference/spreadsheet/range#getDisplayValue()) | String | Completed | |
| [getDisplayValues()](https://developers.google.com/apps-script/reference/spreadsheet/range#getDisplayValues()) | String[][] | Completed | |
| [getFilter()](https://developers.google.com/apps-script/reference/spreadsheet/range#getFilter()) | [Filter](#filter) | Completed | |
| [getFontColor()](https://developers.google.com/apps-script/reference/spreadsheet/range#getFontColor()) | String | Completed | |
| [getFontColors()](https://developers.google.com/apps-script/reference/spreadsheet/range#getFontColors()) | String[][] | Completed | |
| [getFontFamilies()](https://developers.google.com/apps-script/reference/spreadsheet/range#getFontFamilies()) | String[][] | Completed | |
| [getFontFamily()](https://developers.google.com/apps-script/reference/spreadsheet/range#getFontFamily()) | String | Completed | |
| [getFontLine()](https://developers.google.com/apps-script/reference/spreadsheet/range#getFontLine()) | String | Completed | |
| [getFontLines()](https://developers.google.com/apps-script/reference/spreadsheet/range#getFontLines()) | String[][] | Completed | |
| [getFontSize()](https://developers.google.com/apps-script/reference/spreadsheet/range#getFontSize()) | Integer | Completed | |
| [getFontSizes()](https://developers.google.com/apps-script/reference/spreadsheet/range#getFontSizes()) | Integer[][] | Completed | |
| [getFontStyle()](https://developers.google.com/apps-script/reference/spreadsheet/range#getFontStyle()) | String | Completed | |
| [getFontStyles()](https://developers.google.com/apps-script/reference/spreadsheet/range#getFontStyles()) | String[][] | Completed | |
| [getFontWeight()](https://developers.google.com/apps-script/reference/spreadsheet/range#getFontWeight()) | String | Completed | |
| [getFontWeights()](https://developers.google.com/apps-script/reference/spreadsheet/range#getFontWeights()) | String[][] | Completed | |
| [getFormula()](https://developers.google.com/apps-script/reference/spreadsheet/range#getFormula()) | String | Completed | |
| [getFormulaR1C1()](https://developers.google.com/apps-script/reference/spreadsheet/range#getFormulaR1C1()) | String | Completed | |
| [getFormulas()](https://developers.google.com/apps-script/reference/spreadsheet/range#getFormulas()) | String[][] | Completed | |
| [getFormulasR1C1()](https://developers.google.com/apps-script/reference/spreadsheet/range#getFormulasR1C1()) | String[][] | Completed | |
| [getGridId()](https://developers.google.com/apps-script/reference/spreadsheet/range#getGridId()) | Integer | Completed | |
| [getHeight()](https://developers.google.com/apps-script/reference/spreadsheet/range#getHeight()) | Integer | Completed | |
| [getHorizontalAlignment()](https://developers.google.com/apps-script/reference/spreadsheet/range#getHorizontalAlignment()) | String | Completed | |
| [getHorizontalAlignments()](https://developers.google.com/apps-script/reference/spreadsheet/range#getHorizontalAlignments()) | String[][] | Completed | |
| [getLastColumn()](https://developers.google.com/apps-script/reference/spreadsheet/range#getLastColumn()) | Integer | Completed | |
| [getLastRow()](https://developers.google.com/apps-script/reference/spreadsheet/range#getLastRow()) | Integer | Completed | |
| [getLeftBorder()](https://developers.google.com/apps-script/reference/spreadsheet/range#getLeftBorder()) | [Border](#border) | Completed | |
| [getMergedRanges()](https://developers.google.com/apps-script/reference/spreadsheet/range#getMergedRanges()) | [Range[]](#range) | Completed | |
| [getNamedRanges()](https://developers.google.com/apps-script/reference/spreadsheet/range#getNamedRanges()) | [NamedRange[]](#namedrange) | Completed | |
| [getNote()](https://developers.google.com/apps-script/reference/spreadsheet/range#getNote()) | String | Completed | |
| [getNotes()](https://developers.google.com/apps-script/reference/spreadsheet/range#getNotes()) | String[][] | Completed | |
| [getNumberFormat()](https://developers.google.com/apps-script/reference/spreadsheet/range#getNumberFormat()) | String | Completed | |
| [getNumberFormats()](https://developers.google.com/apps-script/reference/spreadsheet/range#getNumberFormats()) | String[][] | Completed | |
| [getNumColumns()](https://developers.google.com/apps-script/reference/spreadsheet/range#getNumColumns()) | Integer | Completed | |
| [getNumRows()](https://developers.google.com/apps-script/reference/spreadsheet/range#getNumRows()) | Integer | Completed | |
| [getRichTextValue()](https://developers.google.com/apps-script/reference/spreadsheet/range#getRichTextValue()) | [RichTextValue](https://developers.google.com/apps-script/reference/spreadsheet/rich-text-value) | Completed | |
| [getRichTextValues()](https://developers.google.com/apps-script/reference/spreadsheet/range#getRichTextValues()) | [RichTextValue[][]](https://developers.google.com/apps-script/reference/spreadsheet/rich-text-value) | Completed | |
| [getRightBorder()](https://developers.google.com/apps-script/reference/spreadsheet/range#getRightBorder()) | [Border](#border) | Completed | |
| [getRow()](https://developers.google.com/apps-script/reference/spreadsheet/range#getRow()) | Integer | Completed | |
| [getRowEnd()](https://developers.google.com/apps-script/reference/spreadsheet/range#getRowEnd()) | Integer | Completed | |
| [getRowIndex()](https://developers.google.com/apps-script/reference/spreadsheet/range#getRowIndex()) | Integer | Completed | |
| [getSheet()](https://developers.google.com/apps-script/reference/spreadsheet/range#getSheet()) | [Sheet](#sheet) | Completed | |
| [getTextDirection()](https://developers.google.com/apps-script/reference/spreadsheet/range#getTextDirection()) | [TextDirection](#textdirection) | Completed | |
| [getTextDirections()](https://developers.google.com/apps-script/reference/spreadsheet/range#getTextDirections()) | [TextDirection[][]](#textdirection) | Completed | |
| [getTextRotation()](https://developers.google.com/apps-script/reference/spreadsheet/range#getTextRotation()) | [TextRotation](#textrotation) | Completed | |
| [getTextRotations()](https://developers.google.com/apps-script/reference/spreadsheet/range#getTextRotations()) | [TextRotation[][]](#textrotation) | Completed | |
| [getTextTruncateOption()](https://developers.google.com/apps-script/reference/spreadsheet/range#getTextTruncateOption()) | [TextTruncateOption](#texttruncateoption) | Not Started | |
| [getTextTruncateOptions()](https://developers.google.com/apps-script/reference/spreadsheet/range#getTextTruncateOptions()) | [TextTruncateOption[][]](#texttruncateoption) | Not Started | |
| [getTopBorder()](https://developers.google.com/apps-script/reference/spreadsheet/range#getTopBorder()) | [Border](#border) | Completed | |
| [getValue()](https://developers.google.com/apps-script/reference/spreadsheet/range#getValue()) | Object | Completed | |
| [getValues()](https://developers.google.com/apps-script/reference/spreadsheet/range#getValues()) | Object[][] | Completed | |
| [getVerticalAlignment()](https://developers.google.com/apps-script/reference/spreadsheet/range#getVerticalAlignment()) | String | Completed | |
| [getVerticalAlignments()](https://developers.google.com/apps-script/reference/spreadsheet/range#getVerticalAlignments()) | String[][] | Completed | |
| [getWidth()](https://developers.google.com/apps-script/reference/spreadsheet/range#getWidth()) | Integer | Completed | |
| [getWrap()](https://developers.google.com/apps-script/reference/spreadsheet/range#getWrap()) | Boolean | Completed | |
| [getWraps()](https://developers.google.com/apps-script/reference/spreadsheet/range#getWraps()) | Boolean[][] | Completed | |
| [getWrapStrategy()](https://developers.google.com/apps-script/reference/spreadsheet/range#getWrapStrategy()) | [WrapStrategy](#wrapstrategy) | Completed | |
| [getWrapStrategies()](https://developers.google.com/apps-script/reference/spreadsheet/range#getWrapStrategies()) | [WrapStrategy[][]](#wrapstrategy) | Completed | |
| [insertCells(shiftDimension)](https://developers.google.com/apps-script/reference/spreadsheet/range#insertCells(Dimension)) | [Range](#range) | Completed | |
| [isBlank()](https://developers.google.com/apps-script/reference/spreadsheet/range#isBlank()) | Boolean | Completed | |
| [isEndColumnBounded()](https://developers.google.com/apps-script/reference/spreadsheet/range#isEndColumnBounded()) | Boolean | Completed | |
| [isEndRowBounded()](https://developers.google.com/apps-script/reference/spreadsheet/range#isEndRowBounded()) | Boolean | Completed | |
| [isStartColumnBounded()](https://developers.google.com/apps-script/reference/spreadsheet/range#isStartColumnBounded()) | Boolean | Completed | |
| [isStartRowBounded()](https://developers.google.com/apps-script/reference/spreadsheet/range#isStartRowBounded()) | Boolean | Completed | |
| [merge()](https://developers.google.com/apps-script/reference/spreadsheet/range#merge()) | [Range](#range) | Completed | |
| [mergeAcross()](https://developers.google.com/apps-script/reference/spreadsheet/range#mergeAcross()) | [Range](#range) | Completed | |
| [mergeVertically()](https://developers.google.com/apps-script/reference/spreadsheet/range#mergeVertically()) | [Range](#range) | Completed | |
| [offset(rowOffset, columnOffset)](https://developers.google.com/apps-script/reference/spreadsheet/range#offset(Integer,Integer)) | [Range](#range) | Completed | |
| [offset(rowOffset, columnOffset, numRows)](https://developers.google.com/apps-script/reference/spreadsheet/range#offset(Integer,Integer,Integer)) | [Range](#range) | Completed | |
| [offset(rowOffset, columnOffset, numRows, numColumns)](https://developers.google.com/apps-script/reference/spreadsheet/range#offset(Integer,Integer,Integer,Integer)) | [Range](#range) | Completed | |
| [randomize()](https://developers.google.com/apps-script/reference/spreadsheet/range#randomize()) | [Range](#range) | Completed | |
| [removeCells(shiftDimension)](https://developers.google.com/apps-script/reference/spreadsheet/range#removeCells(Dimension)) | [Range](#range) | Completed | |
| [removeDuplicates()](https://developers.google.com/apps-script/reference/spreadsheet/range#removeDuplicates()) | [Range](#range) | Completed | |
| [removeDuplicates(columnsToCompare)](https://developers.google.com/apps-script/reference/spreadsheet/range#removeDuplicates(Integer[])) | [Range](#range) | Completed | |
| [setBackground(color)](https://developers.google.com/apps-script/reference/spreadsheet/range#setBackground(String)) | [Range](#range) | Completed | |
| [setBackgrounds(colors)](https://developers.google.com/apps-script/reference/spreadsheet/range#setBackgrounds(String[][])) | [Range](#range) | Completed | |
| [setBorder(top, left, bottom, right, vertical, horizontal)](https://developers.google.com/apps-script/reference/spreadsheet/range#setBorder(Boolean,Boolean,Boolean,Boolean,Boolean,Boolean)) | [Range](#range) | Completed | |
| [setBorder(top, left, bottom, right, vertical, horizontal, color, style)](https://developers.google.com/apps-script/reference/spreadsheet/range#setBorder(Boolean,Boolean,Boolean,Boolean,Boolean,Boolean,String,BorderStyle)) | [Range](#range) | Completed | |
| [setDataValidation(rule)](https://developers.google.com/apps-script/reference/spreadsheet/range#setDataValidation(DataValidation)) | [Range](#range) | Completed | |
| [setDataValidations(rules)](https://developers.google.com/apps-script/reference/spreadsheet/range#setDataValidations(DataValidation[][])) | [Range](#range) | Completed | |
| [setFontColor(color)](https://developers.google.com/apps-script/reference/spreadsheet/range#setFontColor(String)) | [Range](#range) | Completed | |
| [setFontColors(colors)](https://developers.google.com/apps-script/reference/spreadsheet/range#setFontColors(String[][])) | [Range](#range) | Completed | |
| [setFontFamilies(fontFamilies)](https://developers.google.com/apps-script/reference/spreadsheet/range#setFontFamilies(String[][])) | [Range](#range) | Completed | |
| [setFontFamily(fontFamily)](https://developers.google.com/apps-script/reference/spreadsheet/range#setFontFamily(String)) | [Range](#range) | Completed | |
| [setFontLine(fontLine)](https://developers.google.com/apps-script/reference/spreadsheet/range#setFontLine(String)) | [Range](#range) | Completed | |
| [setFontLines(fontLines)](https://developers.google.com/apps-script/reference/spreadsheet/range#setFontLines(String[][])) | [Range](#range) | Completed | |
| [setFontSize(size)](https://developers.google.com/apps-script/reference/spreadsheet/range#setFontSize(Integer)) | [Range](#range) | Completed | |
| [setFontSizes(sizes)](https://developers.google.com/apps-script/reference/spreadsheet/range#setFontSizes(Integer[][])) | [Range](#range) | Completed | |
| [setFontStyle(fontStyle)](https://developers.google.com/apps-script/reference/spreadsheet/range#setFontStyle(String)) | [Range](#range) | Completed | |
| [setFontStyles(fontStyles)](https://developers.google.com/apps-script/reference/spreadsheet/range#setFontStyles(String[][])) | [Range](#range) | Completed | |
| [setFontWeight(fontWeight)](https://developers.google.com/apps-script/reference/spreadsheet/range#setFontWeight(String)) | [Range](#range) | Completed | |
| [setFontWeights(fontWeights)](https://developers.google.com/apps-script/reference/spreadsheet/range#setFontWeights(String[][])) | [Range](#range) | Completed | |
| [setFormula(formula)](https://developers.google.com/apps-script/reference/spreadsheet/range#setFormula(String)) | [Range](#range) | Completed | |
| [setFormulaR1C1(formula)](https://developers.google.com/apps-script/reference/spreadsheet/range#setFormulaR1C1(String)) | [Range](#range) | Completed | |
| [setFormulas(formulas)](https://developers.google.com/apps-script/reference/spreadsheet/range#setFormulas(String[][])) | [Range](#range) | Completed | |
| [setFormulasR1C1(formulas)](https://developers.google.com/apps-script/reference/spreadsheet/range#setFormulasR1C1(String[][])) | [Range](#range) | Completed | |
| [setHorizontalAlignment(alignment)](https://developers.google.com/apps-script/reference/spreadsheet/range#setHorizontalAlignment(String)) | [Range](#range) | Completed | |
| [setHorizontalAlignments(alignments)](https://developers.google.com/apps-script/reference/spreadsheet/range#setHorizontalAlignments(String[][])) | [Range](#range) | Completed | |
| [setNote(note)](https://developers.google.com/apps-script/reference/spreadsheet/range#setNote(String)) | [Range](#range) | Completed | |
| [setNotes(notes)](https://developers.google.com/apps-script/reference/spreadsheet/range#setNotes(String[][])) | [Range](#range) | Completed | |
| [setNumberFormat(numberFormat)](https://developers.google.com/apps-script/reference/spreadsheet/range#setNumberFormat(String)) | [Range](#range) | Completed | |
| [setNumberFormats(numberFormats)](https://developers.google.com/apps-script/reference/spreadsheet/range#setNumberFormats(String[][])) | [Range](#range) | Completed | |
| [setRichTextValue(value)](https://developers.google.com/apps-script/reference/spreadsheet/range#setRichTextValue(RichTextValue)) | [Range](#range) | Completed | |
| [setRichTextValues(values)](https://developers.google.com/apps-script/reference/spreadsheet/range#setRichTextValues(RichTextValue[][])) | [Range](#range) | Completed | |
| [setTextDirection(direction)](https://developers.google.com/apps-script/reference/spreadsheet/range#setTextDirection(TextDirection)) | [Range](#range) | Completed | |
| [setTextDirections(directions)](https://developers.google.com/apps-script/reference/spreadsheet/range#setTextDirections(TextDirection[][])) | [Range](#range) | Completed | |
| [setTextRotation(degrees)](https://developers.google.com/apps-script/reference/spreadsheet/range#setTextRotation(Integer)) | [Range](#range) | Completed | |
| [setTextRotation(rotation)](https://developers.google.com/apps-script/reference/spreadsheet/range#setTextRotation(TextRotation)) | [Range](#range) | Completed | |
| [setTextRotations(rotations)](https://developers.google.com/apps-script/reference/spreadsheet/range#setTextRotations(TextRotation[][])) | [Range](#range) | Completed | |
| [setTextTruncateOption(truncateOption)](https://developers.google.com/apps-script/reference/spreadsheet/range#setTextTruncateOption(TextTruncateOption)) | [Range](#range) | Not Started | |
| [setTextTruncateOptions(truncateOptions)](https://developers.google.com/apps-script/reference/spreadsheet/range#setTextTruncateOptions(TextTruncateOption[][])) | [Range](#range) | Not Started | |
| [setValue(value)](https://developers.google.com/apps-script/reference/spreadsheet/range#setValue(Object)) | [Range](#range) | Completed | |
| [setValues(values)](https://developers.google.com/apps-script/reference/spreadsheet/range#setValues(Object[][])) | [Range](#range) | Completed | |
| [setVerticalAlignment(alignment)](https://developers.google.com/apps-script/reference/spreadsheet/range#setVerticalAlignment(String)) | [Range](#range) | Completed | |
| [setVerticalAlignments(alignments)](https://developers.google.com/apps-script/reference/spreadsheet/range#setVerticalAlignments(String[][])) | [Range](#range) | Completed | |
| [setWrap(isWrapEnabled)](https://developers.google.com/apps-script/reference/spreadsheet/range#setWrap(Boolean)) | [Range](#range) | Completed | |
| [setWraps(wraps)](https://developers.google.com/apps-script/reference/spreadsheet/range#setWraps(Boolean[][])) | [Range](#range) | Completed | |
| [setWrapStrategy(strategy)](https://developers.google.com/apps-script/reference/spreadsheet/range#setWrapStrategy(WrapStrategy)) | [Range](#range) | Completed | |
| [setWrapStrategies(strategies)](https://developers.google.com/apps-script/reference/spreadsheet/range#setWrapStrategies(WrapStrategy[][])) | [Range](#range) | Completed | |
| [sort(sortSpec)](https://developers.google.com/apps-script/reference/spreadsheet/range#sort(Object)) | [Range](#range) | Completed | |
| [sort(sortSpec)](https://developers.google.com/apps-script/reference/spreadsheet/range#sort(Object[])) | [Range](#range) | Completed | |
| [trimWhitespace()](https://developers.google.com/apps-script/reference/spreadsheet/range#trimWhitespace()) | [Range](#range) | Completed | |
## [Sheet](https://developers.google.com/apps-script/reference/spreadsheet/sheet)
A sheet in a spreadsheet.


| method | return | status | comments |
|---|---|---|---|
| [activate()](https://developers.google.com/apps-script/reference/spreadsheet/sheet#activate()) | [Sheet](#sheet) | Completed | |
| [appendRow(rowContents)](https://developers.google.com/apps-script/reference/spreadsheet/sheet#appendRow(String[])) | [Sheet](#sheet) | Completed | |
| [autoResizeColumn(columnPosition)](https://developers.google.com/apps-script/reference/spreadsheet/sheet#autoResizeColumn(Integer)) | [Sheet](#sheet) | Completed | |
| [autoResizeColumns(startColumn, numColumns)](https://developers.google.com/apps-script/reference/spreadsheet/sheet#autoResizeColumns(Integer,Integer)) | [Sheet](#sheet) | Completed | |
| [autoResizeRows(startRow, numRows)](https://developers.google.com/apps-script/reference/spreadsheet/sheet#autoResizeRows(Integer,Integer)) | [Sheet](#sheet) | Not Started | |
| [clearConditionalFormatRules()](https://developers.google.com/apps-script/reference/spreadsheet/sheet#clearConditionalFormatRules()) | void | Not Started | |
| [clearContents()](https://developers.google.com/apps-script/reference/spreadsheet/sheet#clearContents()) | [Sheet](#sheet) | Completed | |
| [clearFormats()](https://developers.google.com/apps-script/reference/spreadsheet/sheet#clearFormats()) | [Sheet](#sheet) | Completed | |
| [clearNotes()](https://developers.google.com/apps-script/reference/spreadsheet/sheet#clearNotes()) | [Sheet](#sheet) | Completed | |
| [copyTo(spreadsheet)](https://developers.google.com/apps-script/reference/spreadsheet/sheet#copyTo(Spreadsheet)) | [Sheet](#sheet) | Completed | |
| [deleteColumn(columnPosition)](https://developers.google.com/apps-script/reference/spreadsheet/sheet#deleteColumn(Integer)) | [Sheet](#sheet) | Completed | |
| [deleteColumns(columnPosition, numColumns)](https://developers.google.com/apps-script/reference/spreadsheet/sheet#deleteColumns(Integer,Integer)) | [Sheet](#sheet) | Completed | |
| [deleteRow(rowPosition)](https://developers.google.com/apps-script/reference/spreadsheet/sheet#deleteRow(Integer)) | [Sheet](#sheet) | Completed | |
| [deleteRows(rowPosition, numRows)](https://developers.google.com/apps-script/reference/spreadsheet/sheet#deleteRows(Integer,Integer)) | [Sheet](#sheet) | Completed | |
| [getBandings()](https://developers.google.com/apps-script/reference/spreadsheet/sheet#getBandings()) | [Banding[]](#banding) | Completed | |
| [getColumnWidth(columnPosition)](https://developers.google.com/apps-script/reference/spreadsheet/sheet#getColumnWidth(Integer)) | Integer | Completed | |
| [getConditionalFormatRules()](https://developers.google.com/apps-script/reference/spreadsheet/sheet#getConditionalFormatRules()) | [ConditionalFormatRule[]](#conditionalformatrule) | Not Started | |
| [getCurrentCell()](https://developers.google.com/apps-script/reference/spreadsheet/sheet#getCurrentCell()) | [Range](#range) | Completed | |
| [getDataRange()](https://developers.google.com/apps-script/reference/spreadsheet/sheet#getDataRange()) | [Range](#range) | Completed | |
| [getDataSourceTables()](https://developers.google.com/apps-script/reference/spreadsheet/sheet#getDataSourceTables()) | [DataSourceTable[]](https://developers.google.com/apps-script/reference/spreadsheet/data-source-table) | Not Started | |
| [getDeveloperMetadata()](https://developers.google.com/apps-script/reference/spreadsheet/sheet#getDeveloperMetadata()) | [DeveloperMetadata[]](#developermetadata) | Completed | |
| [getDeveloperMetadataByKey(key)](https://developers.google.com/apps-script/reference/spreadsheet/sheet#getDeveloperMetadataByKey(String)) | [DeveloperMetadata[]](#developermetadata) | Completed | |
| [getDeveloperMetadataByKey(key, visibility)](https://developers.google.com/apps-script/reference/spreadsheet/sheet#getDeveloperMetadataByKey(String,DeveloperMetadataVisibility)) | [DeveloperMetadata[]](#developermetadata) | Completed | |
| [getDeveloperMetadataById(id)](https://developers.google.com/apps-script/reference/spreadsheet/sheet#getDeveloperMetadataById(Integer)) | [DeveloperMetadata](#developermetadata) | Completed | |
| [getDeveloperMetadataByLocation(locationType)](https://developers.google.com/apps-script/reference/spreadsheet/sheet#getDeveloperMetadataByLocation(DeveloperMetadataLocationType)) | [DeveloperMetadata[]](#developermetadata) | Completed | |
| [getDeveloperMetadataByLocation(locationType, visibility)](https://developers.google.com/apps-script/reference/spreadsheet/sheet#getDeveloperMetadataByLocation(DeveloperMetadataLocationType,DeveloperMetadataVisibility)) | [DeveloperMetadata[]](#developermetadata) | Completed | |
| [getDrawings()](https://developers.google.com/apps-script/reference/spreadsheet/sheet#getDrawings()) | [Drawing[]](https://developers.google.com/apps-script/reference/spreadsheet/drawing) | Not Started | |
| [getFilter()](https://developers.google.com/apps-script/reference/spreadsheet/sheet#getFilter()) | [Filter](#filter) | Completed | |
| [getFrozenColumns()](https://developers.google.com/apps-script/reference/spreadsheet/sheet#getFrozenColumns()) | Integer | Completed | |
| [getFrozenRows()](https://developers.google.com/apps-script/reference/spreadsheet/sheet#getFrozenRows()) | Integer | Completed | |
| [getImages()](https://developers.google.com/apps-script/reference/spreadsheet/sheet#getImages()) | [Image[]](#image) | Not Started | |
| [getIndex()](https://developers.google.com/apps-script/reference/spreadsheet/sheet#getIndex()) | Integer | Completed | |
| [getLastColumn()](https://developers.google.com/apps-script/reference/spreadsheet/sheet#getLastColumn()) | Integer | Completed | |
| [getName()](https://developers.google.com/apps-script/reference/spreadsheet/sheet#getName()) | String | Completed | |
| [getPageBreaks()](https://developers.google.com/apps-script/reference/spreadsheet/sheet#getPageBreaks()) | [PageBreak[]](#pagebreak) | Not Started | |
| [getParent()](https://developers.google.com/apps-script/reference/spreadsheet/sheet#getParent()) | [Spreadsheet](#spreadsheet) | Completed | |
| [getProtections(type)](https://developers.google.com/apps-script/reference/spreadsheet/sheet#getProtections(ProtectionType)) | [Protection[]](#protection) | Completed | |
| [getRange(row, column)](https://developers.google.com/apps-script/reference/spreadsheet/sheet#getRange(Integer,Integer)) | [Range](#range) | Completed | |
| [getRange(row, column, numRows)](https://developers.google.com/apps-script/reference/spreadsheet/sheet#getRange(Integer,Integer,Integer)) | [Range](#range) | Completed | |
| [getRange(row, column, numRows, numColumns)](https://developers.google.com/apps-script/reference/spreadsheet/sheet#getRange(Integer,Integer,Integer,Integer)) | [Range](#range) | Completed | |
| [getRange(a1Notation)](https://developers.google.com/apps-script/reference/spreadsheet/sheet#getRange(String)) | [Range](#range) | Completed | |
| [getRangeList(a1Notations)](https://developers.google.com/apps-script/reference/spreadsheet/sheet#getRangeList(String[])) | [RangeList](#rangelist) | Completed | |
| [getRowHeight(rowPosition)](https://developers.google.com/apps-script/reference/spreadsheet/sheet#getRowHeight(Integer)) | Integer | Completed | |
| [getSheetId()](https://developers.google.com/apps-script/reference/spreadsheet/sheet#getSheetId()) | Integer | Completed | |
| [getSheetName()](https://developers.google.com/apps-script/reference/spreadsheet/sheet#getSheetName()) | String | Completed | |
| [getTabColor()](https://developers.google.com/apps-script/reference/spreadsheet/sheet#getTabColor()) | String | Not Started | |
| [getType()](https://developers.google.com/apps-script/reference/spreadsheet/sheet#getType()) | [SheetType](#sheettype) | Completed | |
| [hideColumn(column)](https://developers.google.com/apps-script/reference/spreadsheet/sheet#hideColumn(Range)) | void | Completed | |
| [hideColumns(columnIndex, numColumns)](https://developers.google.com/apps-script/reference/spreadsheet/sheet#hideColumns(Integer,Integer)) | void | Completed | |
| [hideRow(row)](https://developers.google.com/apps-script/reference/spreadsheet/sheet#hideRow(Range)) | void | Completed | |
| [hideRows(rowIndex, numRows)](https://developers.google.com/apps-script/reference/spreadsheet/sheet#hideRows(Integer,Integer)) | void | Completed | |
| [insertColumnAfter(afterPosition)](https://developers.google.com/apps-script/reference/spreadsheet/sheet#insertColumnAfter(Integer)) | [Sheet](#sheet) | Completed | |
| [insertColumnBefore(beforePosition)](https://developers.google.com/apps-script/reference/spreadsheet/sheet#insertColumnBefore(Integer)) | [Sheet](#sheet) | Completed | |
| [insertColumns(afterPosition, numColumns)](https://developers.google.com/apps-script/reference/spreadsheet/sheet#insertColumns(Integer,Integer)) | [Sheet](#sheet) | Completed | |
| [insertColumnsAfter(afterPosition, numColumns)](https://developers.google.com/apps-script/reference/spreadsheet/sheet#insertColumnsAfter(Integer,Integer)) | [Sheet](#sheet) | Completed | |
| [insertColumnsBefore(beforePosition, numColumns)](https://developers.google.com/apps-script/reference/spreadsheet/sheet#insertColumnsBefore(Integer,Integer)) | [Sheet](#sheet) | Completed | |
| [insertImage(blob, column, row)](https://developers.google.com/apps-script/reference/spreadsheet/sheet#insertImage(BlobSource,Integer,Integer)) | [Image](#image) | Not Started | |
| [insertImage(blob, range)](https://developers.google.com/apps-script/reference/spreadsheet/sheet#insertImage(BlobSource,Range)) | [Image](#image) | Not Started | |
| [insertImage(url, column, row)](https://developers.google.com/apps-script/reference/spreadsheet/sheet#insertImage(String,Integer,Integer)) | [Image](#image) | Not Started | |
| [insertImage(url, range)](https://developers.google.com/apps-script/reference/spreadsheet/sheet#insertImage(String,Range)) | [Image](#image) | Not Started | |
| [insertRowAfter(afterPosition)](https://developers.google.com/apps-script/reference/spreadsheet/sheet#insertRowAfter(Integer)) | [Sheet](#sheet) | Completed | |
| [insertRowBefore(beforePosition)](https://developers.google.com/apps-script/reference/spreadsheet/sheet#insertRowBefore(Integer)) | [Sheet](#sheet) | Completed | |
| [insertRows(afterPosition, numRows)](https://developers.google.com/apps-script/reference/spreadsheet/sheet#insertRows(Integer,Integer)) | [Sheet](#sheet) | Completed | |
| [insertRowsAfter(afterPosition, numRows)](https://developers.google.com/apps-script/reference/spreadsheet/sheet#insertRowsAfter(Integer,Integer)) | [Sheet](#sheet) | Completed | |
| [insertRowsBefore(beforePosition, numRows)](https://developers.google.com/apps-script/reference/spreadsheet/sheet#insertRowsBefore(Integer,Integer)) | [Sheet](#sheet) | Completed | |
| [isColumnHiddenByUser(columnPosition)](https://developers.google.com/apps-script/reference/spreadsheet/sheet#isColumnHiddenByUser(Integer)) | Boolean | Completed | |
| [isRightToLeft()](https://developers.google.com/apps-script/reference/spreadsheet/sheet#isRightToLeft()) | Boolean | Not Started | |
| [isRowHiddenByFilter(rowPosition)](https://developers.google.com/apps-script/reference/spreadsheet/sheet#isRowHiddenByFilter(Integer)) | Boolean | Completed | |
| [isRowHiddenByUser(rowPosition)](https://developers.google.com/apps-script/reference/spreadsheet/sheet#isRowHiddenByUser(Integer)) | Boolean | Completed | |
| [isTabHidden()](https://developers.google.com/apps-script/reference/spreadsheet/sheet#isTabHidden()) | Boolean | Completed | |
| [newConditionalFormatRule()](https://developers.google.com/apps-script/reference/spreadsheet/sheet#newConditionalFormatRule()) | [ConditionalFormatRuleBuilder](#conditionalformatrulebuilder) | Not Started | |
| [protect()](https://developers.google.com/apps-script/reference/spreadsheet/sheet#protect()) | [Protection](#protection) | Completed | |
| [setColumnWidth(columnPosition, width)](https://developers.google.com/apps-script/reference/spreadsheet/sheet#setColumnWidth(Integer,Integer)) | [Sheet](#sheet) | Completed | |
| [setColumnWidths(startColumn, numColumns, width)](https://developers.google.com/apps-script/reference/spreadsheet/sheet#setColumnWidths(Integer,Integer,Integer)) | [Sheet](#sheet) | Completed | |
| [setConditionalFormatRules(rules)](https://developers.google.com/apps-script/reference/spreadsheet/sheet#setConditionalFormatRules(ConditionalFormatRule[])) | void | Not Started | |
| [setFrozenColumns(numColumns)](https://developers.google.com/apps-script/reference/spreadsheet/sheet#setFrozenColumns(Integer)) | [Sheet](#sheet) | Completed | |
| [setFrozenRows(numRows)](https://developers.google.com/apps-script/reference/spreadsheet/sheet#setFrozenRows(Integer)) | [Sheet](#sheet) | Completed | |
| [setName(name)](https://developers.google.com/apps-script/reference/spreadsheet/sheet#setName(String)) | [Sheet](#sheet) | Completed | |
| [setRightToLeft(rightToLeft)](https://developers.google.com/apps-script/reference/spreadsheet/sheet#setRightToLeft(Boolean)) | [Sheet](#sheet) | Not Started | |
| [setRowHeight(rowPosition, height)](https://developers.google.com/apps-script/reference/spreadsheet/sheet#setRowHeight(Integer,Integer)) | [Sheet](#sheet) | Completed | |
| [setRowHeightsForced(startRow, numRows, height)](https://developers.google.com/apps-script/reference/spreadsheet/sheet#setRowHeightsForced(Integer,Integer,Integer)) | [Sheet](#sheet) | Completed | |
| [setTabColor(color)](https://developers.google.com/apps-script/reference/spreadsheet/sheet#setTabColor(String)) | [Sheet](#sheet) | Not Started | |
| [setTabHidden(hidden)](https://developers.google.com/apps-script/reference/spreadsheet/sheet#setTabHidden(Boolean)) | [Sheet](#sheet) | Completed | |
| [showColumns(columnIndex, numColumns)](https://developers.google.com/apps-script/reference/spreadsheet/sheet#showColumns(Integer,Integer)) | void | Completed | |
| [showRows(rowIndex, numRows)](https://developers.google.com/apps-script/reference/spreadsheet/sheet#showRows(Integer,Integer)) | void | Completed | |
| [sort(column, ascending)](https://developers.google.com/apps-script/reference/spreadsheet/sheet#sort(Integer,Boolean)) | [Sheet](#sheet) | Completed | |
| [sort(sortSpec)](https://developers.google.com/apps-script/reference/spreadsheet/sheet#sort(Object)) | [Sheet](#sheet) | Completed | |
---
## [SheetType](https://developers.google.com/apps-script/reference/spreadsheet/sheet-type)
An enum representing the supported sheet types.

100% completed

| method | return | status | comments |
|---|---|---|---|
| CHART | [SheetType](#sheettype) | Completed | |
| GRID | [SheetType](#sheettype) | Completed | |
| PIVOT_TABLE | [SheetType](#sheettype) | Completed | |
100% completed

| method | return | status | comments |
|---|---|---|---|
| [get(spreadsheetId)](https://developers.google.com/apps-script/reference/spreadsheet/sheets#get(String)) | Object | Completed | |
| [getVersion()](https://developers.google.com/apps-script/reference/spreadsheet/sheets#getVersion()) | String | Completed | |
| [isFake()](https://developers.google.com/apps-script/reference/spreadsheet/sheets#isFake()) | Boolean | Completed | |
100% completed

| method | return | status | comments |
|---|---|---|---|
| ASCENDING | [SortOrder](#sortorder) | Completed | |
| DESCENDING | [SortOrder](#sortorder) | Completed | |
---
A spreadsheet.


| method | return | status | comments |
|---|---|---|---|
| [addEditor(user)](https://developers.google.com/apps-script/reference/spreadsheet/spreadsheet#addEditor(User)) | [Spreadsheet](#spreadsheet) | Not Started | |
| [addEditors(emailAddresses)](https://developers.google.com/apps-script/reference/spreadsheet/spreadsheet#addEditors(String[])) | [Spreadsheet](#spreadsheet) | Not Started | |
| [addViewer(emailAddress)](https://developers.google.com/apps-script/reference/spreadsheet/spreadsheet#addViewer(String)) | [Spreadsheet](#spreadsheet) | Not Started | |
| [addViewer(user)](https://developers.google.com/apps-script/reference/spreadsheet/spreadsheet#addViewer(User)) | [Spreadsheet](#spreadsheet) | Completed | |
| [addViewers(emailAddresses)](https://developers.google.com/apps-script/reference/spreadsheet/spreadsheet#addViewers(String[])) | [Spreadsheet](#spreadsheet) | Not Started | |
| [appendRow(rowContents)](https://developers.google.com/apps-script/reference/spreadsheet/spreadsheet#appendRow(String[])) | [Sheet](#sheet) | Completed | |
| [copy(name)](https://developers.google.com/apps-script/reference/spreadsheet/spreadsheet#copy(String)) | [Spreadsheet](#spreadsheet) | Not Started | |
| [deleteActiveSheet()](https://developers.google.com/apps-script/reference/spreadsheet/spreadsheet#deleteActiveSheet()) | void | Completed | |
| [deleteSheet(sheet)](https://developers.google.com/apps-script/reference/spreadsheet/spreadsheet#deleteSheet(Sheet)) | void | Completed | |
| [getAccess(emailAddress)](https://developers.google.com/apps-script/reference/spreadsheet/spreadsheet#getAccess(String)) | [Permission](https://developers.google.com/apps-script/reference/drive/permission) | Not Started | |
| [getAccess(user)](https://developers.google.com/apps-script/reference/spreadsheet/spreadsheet#getAccess(User)) | [Permission](https://developers.google.com/apps-script/reference/drive/permission) | Not Started | |
| [getActiveRange()](https://developers.google.com/apps-script/reference/spreadsheet/spreadsheet#getActiveRange()) | [Range](#range) | Not Started | |
| [getActiveSheet()](https://developers.google.com/apps-script/reference/spreadsheet/spreadsheet#getActiveSheet()) | [Sheet](#sheet) | Not Started | |
| [getAs(contentType)](https://developers.google.com/apps-script/reference/spreadsheet/spreadsheet#getAs(String)) | [Blob](https://developers.google.com/apps-script/reference/base/blob) | Not Started | |
| [getBandings()](https://developers.google.com/apps-script/reference/spreadsheet/spreadsheet#getBandings()) | [Banding[]](#banding) | Completed | |
| [getBlob()](https://developers.google.com/apps-script/reference/spreadsheet/spreadsheet#getBlob()) | [Blob](https://developers.google.com/apps-script/reference/base/blob) | Not Started | |
| [getEditors()](https://developers.google.com/apps-script/reference/spreadsheet/spreadsheet#getEditors()) | [User[]](https://developers.google.com/apps-script/reference/base/user) | Completed | |
| [getId()](https://developers.google.com/apps-script/reference/spreadsheet/spreadsheet#getId()) | String | Completed | |
| [getKey()](https://developers.google.com/apps-script/reference/spreadsheet/spreadsheet#getKey()) | String | Completed | |
| [getName()](https://developers.google.com/apps-script/reference/spreadsheet/spreadsheet#getName()) | String | Completed | |
| [getNamedRanges()](https://developers.google.com/apps-script/reference/spreadsheet/spreadsheet#getNamedRanges()) | [NamedRange[]](#namedrange) | Completed | |
| [getNumSheets()](https://developers.google.com/apps-script/reference/spreadsheet/spreadsheet#getNumSheets()) | Integer | Completed | |
| [getOwner()](https://developers.google.com/apps-script/reference/spreadsheet/spreadsheet#getOwner()) | [User](https://developers.google.com/apps-script/reference/base/user) | Completed | |
| [getProtection()](https://developers.google.com/apps-script/reference/spreadsheet/spreadsheet#getProtection()) | [Protection](#protection) | Completed | |
| [getRange(a1Notation)](https://developers.google.com/apps-script/reference/spreadsheet/spreadsheet#getRange(String)) | [Range](#range) | Completed | |
| [getRangeByName(name)](https://developers.google.com/apps-script/reference/spreadsheet/spreadsheet#getRangeByName(String)) | [Range](#range) | Completed | |
| [getRecalculationInterval()](https://developers.google.com/apps-script/reference/spreadsheet/spreadsheet#getRecalculationInterval()) | [RecalculationInterval](#recalculationinterval) | Not Started | |
| [getSheets()](https://developers.google.com/apps-script/reference/spreadsheet/spreadsheet#getSheets()) | [Sheet[]](#sheet) | Completed | |
| [getSheetByName(name)](https://developers.google.com/apps-script/reference/spreadsheet/spreadsheet#getSheetByName(String)) | [Sheet](#sheet) | Completed | |
| [getSpreadsheetLocale()](https://developers.google.com/apps-script/reference/spreadsheet/spreadsheet#getSpreadsheetLocale()) | String | Not Started | |
| [getSpreadsheetTimeZone()](https://developers.google.com/apps-script/reference/spreadsheet/spreadsheet#getSpreadsheetTimeZone()) | String | Not Started | |
| [getUrl()](https://developers.google.com/apps-script/reference/spreadsheet/spreadsheet#getUrl()) | String | Completed | |
| [getViewers()](https://developers.google.com/apps-script/reference/spreadsheet/spreadsheet#getViewers()) | [User[]](https://developers.google.com/apps-script/reference/base/user) | Completed | |
| [insertSheet()](https://developers.google.com/apps-script/reference/spreadsheet/spreadsheet#insertSheet()) | [Sheet](#sheet) | Completed | |
| [insertSheet(sheetName)](https://developers.google.com/apps-script/reference/spreadsheet/spreadsheet#insertSheet(String)) | [Sheet](#sheet) | Completed | |
| [insertSheet(index, sheetName)](https://developers.google.com/apps-script/reference/spreadsheet/spreadsheet#insertSheet(Integer,String)) | [Sheet](#sheet) | Completed | |
| [removeEditor(emailAddress)](https://developers.google.com/apps-script/reference/spreadsheet/spreadsheet#removeEditor(String)) | [Spreadsheet](#spreadsheet) | Not Started | |
| [removeEditor(user)](https://developers.google.com/apps-script/reference/spreadsheet/spreadsheet#removeEditor(User)) | [Spreadsheet](#spreadsheet) | Not Started | |
| [removeViewer(emailAddress)](https://developers.google.com/apps-script/reference/spreadsheet/spreadsheet#removeViewer(String)) | [Spreadsheet](#spreadsheet) | Not Started | |
| [removeViewer(user)](https://developers.google.com/apps-script/reference/spreadsheet/spreadsheet#removeViewer(User)) | [Spreadsheet](#spreadsheet) | Completed | |
| [rename(newName)](https://developers.google.com/apps-script/reference/spreadsheet/spreadsheet#rename(String)) | void | Completed | |
| [renameActiveSheet(newName)](https://developers.google.com/apps-script/reference/spreadsheet/spreadsheet#renameActiveSheet(String)) | void | Completed | |
| [setActiveRange(range)](https://developers.google.com/apps-script/reference/spreadsheet/spreadsheet#setActiveRange(Range)) | [Range](#range) | Not Started | |
| [setActiveRangeList(rangeList)](https://developers.google.com/apps-script/reference/spreadsheet/spreadsheet#setActiveRangeList(RangeList)) | [RangeList](#rangelist) | Not Started | |
| [setActiveSheet(sheet)](https://developers.google.com/apps-script/reference/spreadsheet/spreadsheet#setActiveSheet(Sheet)) | [Sheet](#sheet) | Not Started | |
## [SpreadsheetApp](https://developers.google.com/apps-script/reference/spreadsheet/spreadsheet-app)
The main class for accessing and creating Spreadsheets.


| method | return | status | comments |
|---|---|---|---|
| [create(name)](https://developers.google.com/apps-script/reference/spreadsheet/spreadsheet-app#create(String)) | [Spreadsheet](#spreadsheet) | Completed | |
| [create(name, rows, columns)](https://developers.google.com/apps-script/reference/spreadsheet/spreadsheet-app#create(String,Integer,Integer)) | [Spreadsheet](#spreadsheet) | Completed | |
| [getActive()](https://developers.google.com/apps-script/reference/spreadsheet/spreadsheet-app#getActive()) | [Spreadsheet](#spreadsheet) | Completed | |
| [getActiveRange()](https://developers.google.com/apps-script/reference/spreadsheet/spreadsheet-app#getActiveRange()) | [Range](#range) | Completed | |
| [getActiveRangeList()](https://developers.google.com/apps-script/reference/spreadsheet/spreadsheet-app#getActiveRangeList()) | [RangeList](#rangelist) | Completed | |
| [getActiveSheet()](https://developers.google.com/apps-script/reference/spreadsheet/spreadsheet-app#getActiveSheet()) | [Sheet](#sheet) | Completed | |
| [getUi()](https://developers.google.com/apps-script/reference/spreadsheet/spreadsheet-app#getUi()) | [Ui](https://developers.google.com/apps-script/reference/base/ui) | Not Started | |
| [isFake()](https://developers.google.com/apps-script/reference/spreadsheet/spreadsheet-app#isFake()) | Boolean | Completed | |
| [newDataValidation()](https://developers.google.com/apps-script/reference/spreadsheet/spreadsheet-app#newDataValidation()) | [DataValidationBuilder](#datavalidationbuilder) | Completed | |
| [newFilterCriteria()](https://developers.google.com/apps-script/reference/spreadsheet/spreadsheet-app#newFilterCriteria()) | [FilterCriteriaBuilder](#filtercriteriabuilder) | Completed | |
| [newFilterCriterion()](https://developers.google.com/apps-script/reference/spreadsheet/spreadsheet-app#newFilterCriterion()) | [FilterCriterionBuilder](#filtercriterionbuilder) | Completed | |
| [newConditionalFormatRule()](https://developers.google.com/apps-script/reference/spreadsheet/spreadsheet-app#newConditionalFormatRule()) | [ConditionalFormatRuleBuilder](#conditionalformatrulebuilder) | Completed | |
| [open(file)](https://developers.google.com/apps-script/reference/spreadsheet/spreadsheet-app#open(File)) | [Spreadsheet](#spreadsheet) | Completed | |
| [openById(id)](https://developers.google.com/apps-script/reference/spreadsheet/spreadsheet-app#openById(String)) | [Spreadsheet](#spreadsheet) | Completed | |
| [openByUrl(url)](https://developers.google.com/apps-script/reference/spreadsheet/spreadsheet-app#openByUrl(String)) | [Spreadsheet](#spreadsheet) | Completed | |
| [openByKey(key)](https://developers.google.com/apps-script/reference/spreadsheet/spreadsheet-app#openByKey(String)) | [Spreadsheet](#spreadsheet) | Completed | |
| [setActiveRange(range)](https://developers.google.com/apps-script/reference/spreadsheet/spreadsheet-app#setActiveRange(Range)) | [Range](#range) | Completed | |
| [setActiveRangeList(rangeList)](https://developers.google.com/apps-script/reference/spreadsheet/spreadsheet-app#setActiveRangeList(RangeList)) | [RangeList](#rangelist) | Completed | |
| [setActiveSheet(sheet)](https://developers.google.com/apps-script/reference/spreadsheet/spreadsheet-app#setActiveSheet(Sheet)) | [Sheet](#sheet) | Completed | |
---
## [TextDirection](https://developers.google.com/apps-script/reference/spreadsheet/text-direction)
An enum representing the supported text directions.

100% completed

| method | return | status | comments |
|---|---|---|---|
| LEFT_TO_RIGHT | [TextDirection](#textdirection) | Completed | |
| RIGHT_TO_LEFT | [TextDirection](#textdirection) | Completed | |
---
A text rotation in a range.


| method | return | status | comments |
|---|---|---|---|
| [getDegrees()](https://developers.google.com/apps-script/reference/spreadsheet/text-rotation#getDegrees()) | Integer | Completed | |
| [isVertical()](https://developers.google.com/apps-script/reference/spreadsheet/text-rotation#isVertical()) | Boolean | Completed | |
---
## [TextTruncateOption](https://developers.google.com/apps-script/reference/spreadsheet/text-truncate-option)
An enum representing the supported text truncate options.

100% completed

| method | return | status | comments |
|---|---|---|---|
| CLIP | [TextTruncateOption](#texttruncateoption) | Completed | |
| OVERFLOW | [TextTruncateOption](#texttruncateoption) | Completed | |
---
100% completed

| method | return | status | comments |
|---|---|---|---|
| MAX | [ValueType](#valuetype) | Completed | |
| MIN | [ValueType](#valuetype) | Completed | |
| NUMBER | [ValueType](#valuetype) | Completed | |
100% completed

| method | return | status | comments |
|---|---|---|---|
| BOTTOM | [VerticalAlignment](#verticalalignment) | Completed | |
| MIDDLE | [VerticalAlignment](#verticalalignment) | Completed | |
| TOP | [VerticalAlignment](#verticalalignment) | Completed | |
100% completed

| method | return | status | comments |
|---|---|---|---|
| CLIP | [WrapStrategy](#wrapstrategy) | Completed | |
| OVERFLOW | [WrapStrategy](#wrapstrategy) | Completed | |
| WRAP | [WrapStrategy](#wrapstrategy) | Completed | |

