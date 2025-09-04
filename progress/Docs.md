# Document Service Progress
**Documentation:** [Document Service](https://developers.google.com/apps-script/reference/document)
---
Overall Service Completion: 94% completed
## [Alignment](https://developers.google.com/apps-script/reference/document/alignment)
An enum representing the supported types of alignment.

100% completed

| method | return | status | comments |
|---|---|---|---|
| CENTER | [Alignment](#alignment) | Completed | |
| JUSTIFY | [Alignment](#alignment) | Completed | |
| LEFT | [Alignment](#alignment) | Completed | |
| RIGHT | [Alignment](#alignment) | Completed | |
---
## [Attribute](https://developers.google.com/apps-script/reference/document/attribute)
An enum representing the supported attribute types.

100% completed

| method | return | status | comments |
|---|---|---|---|
| BACKGROUND_COLOR | [Attribute](#attribute) | Completed | |
| BOLD | [Attribute](#attribute) | Completed | |
| BORDER_COLOR | [Attribute](#attribute) | Completed | |
| BORDER_WIDTH | [Attribute](#attribute) | Completed | |
| CODE | [Attribute](#attribute) | Completed | |
| FONT_FAMILY | [Attribute](#attribute) | Completed | |
| FONT_SIZE | [Attribute](#attribute) | Completed | |
| FOREGROUND_COLOR | [Attribute](#attribute) | Completed | |
| HEADING | [Attribute](#attribute) | Completed | |
| HEIGHT | [Attribute](#attribute) | Completed | |
| HORIZONTAL_ALIGNMENT | [Attribute](#attribute) | Completed | |
| INDENT_END | [Attribute](#attribute) | Completed | |
| INDENT_FIRST_LINE | [Attribute](#attribute) | Completed | |
| INDENT_START | [Attribute](#attribute) | Completed | |
| ITALIC | [Attribute](#attribute) | Completed | |
| GLYPH_TYPE | [Attribute](#attribute) | Completed | |
| LEFT_TO_RIGHT | [Attribute](#attribute) | Completed | |
| LINE_SPACING | [Attribute](#attribute) | Completed | |
| LINK_URL | [Attribute](#attribute) | Completed | |
| LIST_ID | [Attribute](#attribute) | Completed | |
| MARGIN_BOTTOM | [Attribute](#attribute) | Completed | |
| MARGIN_LEFT | [Attribute](#attribute) | Completed | |
| MARGIN_RIGHT | [Attribute](#attribute) | Completed | |
| MARGIN_TOP | [Attribute](#attribute) | Completed | |
| MINIMUM_HEIGHT | [Attribute](#attribute) | Completed | |
| NESTING_LEVEL | [Attribute](#attribute) | Completed | |
| PADDING_BOTTOM | [Attribute](#attribute) | Completed | |
| PADDING_LEFT | [Attribute](#attribute) | Completed | |
| PADDING_RIGHT | [Attribute](#attribute) | Completed | |
| PADDING_TOP | [Attribute](#attribute) | Completed | |
| PAGE_HEIGHT | [Attribute](#attribute) | Completed | |
| PAGE_WIDTH | [Attribute](#attribute) | Completed | |
| SPACING_AFTER | [Attribute](#attribute) | Completed | |
| SPACING_BEFORE | [Attribute](#attribute) | Completed | |
| STRIKETHROUGH | [Attribute](#attribute) | Completed | |
| UNDERLINE | [Attribute](#attribute) | Completed | |
| VERTICAL_ALIGNMENT | [Attribute](#attribute) | Completed | |
| WIDTH | [Attribute](#attribute) | Completed | |
---
## [Body](https://developers.google.com/apps-script/reference/document/body)
An element representing the main body of a Document.

100% completed

| method | return | status | comments |
|---|---|---|---|
| [appendHorizontalRule()](https://developers.google.com/apps-script/reference/document/body#appendHorizontalRule()) | [HorizontalRule](#horizontalrule) | Completed | |
| [appendImage(image)](https://developers.google.com/apps-script/reference/document/body#appendImage(InlineImage)) | [InlineImage](#inlineimage) | Completed | |
| [appendListItem(listItem)](https://developers.google.com/apps-script/reference/document/body#appendListItem(ListItem)) | [ListItem](#listitem) | Completed | |
| [appendListItem(text)](https://developers.google.com/apps-script/reference/document/body#appendListItem(String)) | [ListItem](#listitem) | Completed | |
| [appendPageBreak()](https://developers.google.com/apps-script/reference/document/body#appendPageBreak()) | [PageBreak](#pagebreak) | Completed | |
| [appendPageBreak(pageBreak)](https://developers.google.com/apps-script/reference/document/body#appendPageBreak(PageBreak)) | [PageBreak](#pagebreak) | Completed | |
| [appendParagraph(paragraph)](https://developers.google.com/apps-script/reference/document/body#appendParagraph(Paragraph)) | [Paragraph](#paragraph) | Completed | |
| [appendParagraph(text)](https://developers.google.com/apps-script/reference/document/body#appendParagraph(String)) | [Paragraph](#paragraph) | Completed | |
| [appendTable()](https://developers.google.com/apps-script/reference/document/body#appendTable()) | [Table](#table) | Completed | Emulation creates a 1x1 table, unlike live version. |
| [appendTable(cells)](https://developers.google.com/apps-script/reference/document/body#appendTable(String[][])) | [Table](#table) | Completed | |
| [appendTable(table)](https://developers.google.com/apps-script/reference/document/body#appendTable(Table)) | [Table](#table) | Completed | |
| [clear()](https://developers.google.com/apps-script/reference/document/body#clear()) | [Body](#body) | Completed | |
| [copy()](https://developers.google.com/apps-script/reference/document/body#copy()) | [Body](#body) | Completed | |
| [editAsText()](https://developers.google.com/apps-script/reference/document/body#editAsText()) | [Text](#text) | Completed | |
| [findElement(elementType)](https://developers.google.com/apps-script/reference/document/body#findElement(ElementType)) | [RangeElement](#rangeelement) | Completed | |
| [findElement(elementType, from)](https://developers.google.com/apps-script/reference/document/body#findElement(ElementType,RangeElement)) | [RangeElement](#rangeelement) | Completed | |
| [findText(searchPattern)](https://developers.google.com/apps-script/reference/document/body#findText(String)) | [RangeElement](#rangeelement) | Completed | |
| [findText(searchPattern, from)](https://developers.google.com/apps-script/reference/document/body#findText(String,RangeElement)) | [RangeElement](#rangeelement) | Completed | |
| [getAttributes()](https://developers.google.com/apps-script/reference/document/body#getAttributes()) | Object | Completed | |
| [getChild(childIndex)](https://developers.google.com/apps-script/reference/document/body#getChild(Integer)) | [Element](#element) | Completed | |
| [getChildIndex(child)](https://developers.google.com/apps-script/reference/document/body#getChildIndex(Element)) | Integer | Completed | |
| [getHeadingAttributes(paragraphHeading)](https://developers.google.com/apps-script/reference/document/body#getHeadingAttributes(ParagraphHeading)) | Object | Completed | |
| [getImages()](https://developers.google.com/apps-script/reference/document/body#getImages()) | [InlineImage[]](#inlineimage) | Completed | |
| [getListItems()](https://developers.google.com/apps-script/reference/document/body#getListItems()) | [ListItem[]](#listitem) | Completed | |
| [getMarginBottom()](https://developers.google.com/apps-script/reference/document/body#getMarginBottom()) | Number | Completed | |
| [getMarginLeft()](https://developers.google.com/apps-script/reference/document/body#getMarginLeft()) | Number | Completed | |
| [getMarginRight()](https://developers.google.com/apps-script/reference/document/body#getMarginRight()) | Number | Completed | |
| [getMarginTop()](https://developers.google.com/apps-script/reference/document/body#getMarginTop()) | Number | Completed | |
| [getNumChildren()](https://developers.google.com/apps-script/reference/document/body#getNumChildren()) | Integer | Completed | Live version returns 1 for a blank document, ignoring the initial section break. |
| [getPageHeight()](https://developers.google.com/apps-script/reference/document/body#getPageHeight()) | Number | Completed | |
| [getPageWidth()](https://developers.google.com/apps-script/reference/document/body#getPageWidth()) | Number | Completed | |
| [getParagraphs()](https://developers.google.com/apps-script/reference/document/body#getParagraphs()) | [Paragraph[]](#paragraph) | Completed | |
| [getParent()](https://developers.google.com/apps-script/reference/document/body#getParent()) | [ContainerElement](#containerelement) | Completed | |
| [getTables()](https://developers.google.com/apps-script/reference/document/body#getTables()) | [Table[]](#table) | Completed | |
| [getText()](https://developers.google.com/apps-script/reference/document/body#getText()) | String | Completed | |
| [getTextAlignment()](https://developers.google.com/apps-script/reference/document/body#getTextAlignment()) | [TextAlignment](#textalignment) | Completed | |
| [getType()](https://developers.google.com/apps-script/reference/document/body#getType()) | [ElementType](#elementtype) | Completed | |
| [insertHorizontalRule(childIndex)](https://developers.google.com/apps-script/reference/document/body#insertHorizontalRule(Integer)) | [HorizontalRule](#horizontalrule) | Completed | |
| [insertImage(childIndex, image)](https://developers.google.com/apps-script/reference/document/body#insertImage(Integer,InlineImage)) | [InlineImage](#inlineimage) | Completed | |
| [insertListItem(childIndex, listItem)](https://developers.google.com/apps-script/reference/document/body#insertListItem(Integer,ListItem)) | [ListItem](#listitem) | Completed | |
| [insertListItem(childIndex, text)](https://developers.google.com/apps-script/reference/document/body#insertListItem(Integer,String)) | [ListItem](#listitem) | Completed | |
| [insertPageBreak(childIndex)](https://developers.google.com/apps-script/reference/document/body#insertPageBreak(Integer)) | [PageBreak](#pagebreak) | Completed | |
| [insertPageBreak(childIndex, pageBreak)](https://developers.google.com/apps-script/reference/document/body#insertPageBreak(Integer,PageBreak)) | [PageBreak](#pagebreak) | Completed | |
| [insertParagraph(childIndex, paragraph)](https://developers.google.com/apps-script/reference/document/body#insertParagraph(Integer,Paragraph)) | [Paragraph](#paragraph) | Completed | |
| [insertParagraph(childIndex, text)](https://developers.google.com/apps-script/reference/document/body#insertParagraph(Integer,String)) | [Paragraph](#paragraph) | Completed | |
| [insertTable(childIndex)](https://developers.google.com/apps-script/reference/document/body#insertTable(Integer)) | [Table](#table) | Completed | |
| [insertTable(childIndex, cells)](https://developers.google.com/apps-script/reference/document/body#insertTable(Integer,String[][])) | [Table](#table) | Completed | |
| [insertTable(childIndex, table)](https://developers.google.com/apps-script/reference/document/body#insertTable(Integer,Table)) | [Table](#table) | Completed | |
| [isAtDocumentEnd()](https://developers.google.com/apps-script/reference/document/body#isAtDocumentEnd()) | Boolean | Completed | |
| [removeChild(child)](https://developers.google.com/apps-script/reference/document/body#removeChild(Element)) | [Body](#body) | Completed | |
| [replaceText(searchPattern, replacement)](https://developers.google.com/apps-script/reference/document/body#replaceText(String,String)) | [Element](#element) | Completed | |
| [setAttributes(attributes)](https://developers.google.com/apps-script/reference/document/body#setAttributes(Object)) | [Body](#body) | Completed | |
| [setHeadingAttributes(paragraphHeading, attributes)](https://developers.google.com/apps-script/reference/document/body#setHeadingAttributes(ParagraphHeading,Object)) | [Body](#body) | Completed | |
| [setMarginBottom(marginBottom)](https://developers.google.com/apps-script/reference/document/body#setMarginBottom(Number)) | [Body](#body) | Completed | |
| [setMarginLeft(marginLeft)](https://developers.google.com/apps-script/reference/document/body#setMarginLeft(Number)) | [Body](#body) | Completed | |
| [setMarginRight(marginRight)](https://developers.google.com/apps-script/reference/document/body#setMarginRight(Number)) | [Body](#body) | Completed | |
| [setMarginTop(marginTop)](https://developers.google.com/apps-script/reference/document/body#setMarginTop(Number)) | [Body](#body) | Completed | |
| [setPageHeight(pageHeight)](https://developers.google.com/apps-script/reference/document/body#setPageHeight(Number)) | [Body](#body) | Completed | |
| [setPageWidth(pageWidth)](https://developers.google.com/apps-script/reference/document/body#setPageWidth(Number)) | [Body](#body) | Completed | |
| [setText(text)](https://developers.google.com/apps-script/reference/document/body#setText(String)) | [Body](#body) | Completed | |
| [setTextAlignment(textAlignment)](https://developers.google.com/apps-script/reference/document/body#setTextAlignment(TextAlignment)) | [Body](#body) | Completed | |
---
## [Bookmark](https://developers.google.com/apps-script/reference/document/bookmark)
An element representing a bookmark.

0% completed

| method | return | status | comments |
|---|---|---|---|
| [getId()](https://developers.google.com/apps-script/reference/document/bookmark#getId()) | String | Not Started | Cannot be emulated via public Docs API. See issue [441253571](https://issuetracker.google.com/issues/441253571). |
| [getPosition()](https://developers.google.com/apps-script/reference/document/bookmark#getPosition()) | [Position](#position) | Not Started | Cannot be emulated via public Docs API. See issue [441253571](https://issuetracker.google.com/issues/441253571). |
| [remove()](https://developers.google.com/apps-script/reference/document/bookmark#remove()) | void | Not Started | Cannot be emulated via public Docs API. See issue [441253571](https://issuetracker.google.com/issues/441253571). |
---
## [ContainerElement](https://developers.google.com/apps-script/reference/document/container-element)
A generic element that can contain other elements.

100% completed

| method | return | status | comments |
|---|---|---|---|
| [asBody()](https://developers.google.com/apps-script/reference/document/container-element#asBody()) | [Body](#body) | Completed | |
| [asEquation()](https://developers.google.com/apps-script/reference/document/container-element#asEquation()) | [Equation](#equation) | Completed | |
| [asFooterSection()](https://developers.google.com/apps-script/reference/document/container-element#asFooterSection()) | [FooterSection](#footersection) | Completed | |
| [asHeaderSection()](https://developers.google.com/apps-script/reference/document/container-element#asHeaderSection()) | [HeaderSection](#headersection) | Completed | |
| [asListItem()](https://developers.google.com/apps-script/reference/document/container-element#asListItem()) | [ListItem](#listitem) | Completed | |
| [asParagraph()](https://developers.google.com/apps-script/reference/document/container-element#asParagraph()) | [Paragraph](#paragraph) | Completed | |
| [asTable()](https://developers.google.com/apps-script/reference/document/container-element#asTable()) | [Table](#table) | Completed | |
| [asTableCell()](https://developers.google.com/apps-script/reference/document/container-element#asTableCell()) | [TableCell](#tablecell) | Completed | |
| [asTableOfContents()](https://developers.google.com/apps-script/reference/document/container-element#asTableOfContents()) | [TableOfContents](#tableofcontents) | Completed | |
| [clear()](https://developers.google.com/apps-script/reference/document/container-element#clear()) | [ContainerElement](#containerelement) | Completed | |
| [copy()](https://developers.google.com/apps-script/reference/document/container-element#copy()) | [ContainerElement](#containerelement) | Completed | |
| [editAsText()](https://developers.google.com/apps-script/reference/document/container-element#editAsText()) | [Text](#text) | Completed | |
| [findElement(elementType)](https://developers.google.com/apps-script/reference/document/container-element#findElement(ElementType)) | [RangeElement](#rangeelement) | Completed | |
| [findElement(elementType, from)](https://developers.google.com/apps-script/reference/document/container-element#findElement(ElementType,RangeElement)) | [RangeElement](#rangeelement) | Completed | |
| [findText(searchPattern)](https://developers.google.com/apps-script/reference/document/container-element#findText(String)) | [RangeElement](#rangeelement) | Completed | |
| [findText(searchPattern, from)](https://developers.google.com/apps-script/reference/document/container-element#findText(String,RangeElement)) | [RangeElement](#rangeelement) | Completed | |
| [getAttributes()](https://developers.google.com/apps-script/reference/document/container-element#getAttributes()) | Object | Completed | |
| [getChild(childIndex)](https://developers.google.com/apps-script/reference/document/container-element#getChild(Integer)) | [Element](#element) | Completed | |
| [getChildIndex(child)](https://developers.google.com/apps-script/reference/document/container-element#getChildIndex(Element)) | Integer | Completed | |
| [getLinkUrl()](https://developers.google.com/apps-script/reference/document/container-element#getLinkUrl()) | String | Completed | |
| [getNextSibling()](https://developers.google.com/apps-script/reference/document/container-element#getNextSibling()) | [Element](#element) | Completed | |
| [getNumChildren()](https://developers.google.com/apps-script/reference/document/container-element#getNumChildren()) | Integer | Completed | |
| [getParent()](https://developers.google.com/apps-script/reference/document/container-element#getParent()) | [ContainerElement](#containerelement) | Completed | |
| [getPreviousSibling()](https://developers.google.com/apps-script/reference/document/container-element#getPreviousSibling()) | [Element](#element) | Completed | |
| [getText()](https://developers.google.com/apps-script/reference/document/container-element#getText()) | String | Completed | |
| [getTextAlignment()](https://developers.google.com/apps-script/reference/document/container-element#getTextAlignment()) | [TextAlignment](#textalignment) | Completed | |
| [getType()](https://developers.google.com/apps-script/reference/document/container-element#getType()) | [ElementType](#elementtype) | Completed | |
| [isAtDocumentEnd()](https://developers.google.com/apps-script/reference/document/container-element#isAtDocumentEnd()) | Boolean | Completed | |
| [merge()](https://developers.google.com/apps-script/reference/document/container-element#merge()) | [ContainerElement](#containerelement) | Completed | |
| [removeChild(child)](https://developers.google.com/apps-script/reference/document/container-element#removeChild(Element)) | [ContainerElement](#containerelement) | Completed | |
| [removeFromParent()](https://developers.google.com/apps-script/reference/document/container-element#removeFromParent()) | [ContainerElement](#containerelement) | Completed | |
| [replaceText(searchPattern, replacement)](https://developers.google.com/apps-script/reference/document/container-element#replaceText(String,String)) | [Element](#element) | Completed | |
| [setAttributes(attributes)](https://developers.google.com/apps-script/reference/document/container-element#setAttributes(Object)) | [ContainerElement](#containerelement) | Completed | |
| [setLinkUrl(url)](https://developers.google.com/apps-script/reference/document/container-element#setLinkUrl(String)) | [ContainerElement](#containerelement) | Completed | |
| [setText(text)](https://developers.google.com/apps-script/reference/document/container-element#setText(String)) | [ContainerElement](#containerelement) | Completed | |
| [setTextAlignment(textAlignment)](https://developers.google.com/apps-script/reference/document/container-element#setTextAlignment(TextAlignment)) | [ContainerElement](#containerelement) | Completed | |
---
## [Document](https://developers.google.com/apps-script/reference/document/document)
A document, containing all content and settings.

87% completed

| method | return | status | comments |
|---|---|---|---|
| [addBookmark(position)](https://developers.google.com/apps-script/reference/document/document#addBookmark(Position)) | [Bookmark](#bookmark) | Not Started | Cannot be emulated via public Docs API. See issue [441253571](https://issuetracker.google.com/issues/441253571). |
| [addEditor(emailAddress)](https://developers.google.com/apps-script/reference/document/document#addEditor(String)) | [Document](#document) | Completed | |
| [addEditor(user)](https://developers.google.com/apps-script/reference/document/document#addEditor(User)) | [Document](#document) | Completed | |
| [addEditors(emailAddresses)](https://developers.google.com/apps-script/reference/document/document#addEditors(String[])) | [Document](#document) | Completed | |
| [addFooter()](https://developers.google.com/apps-script/reference/document/document#addFooter()) | [FooterSection](#footersection) | Completed | |
| [addHeader()](https://developers.google.com/apps-script/reference/document/document#addHeader()) | [HeaderSection](#headersection) | Completed | |
| [addNamedRange(name, range)](https://developers.google.com/apps-script/reference/document/document#addNamedRange(String,Range)) | [NamedRange](#namedrange) | Completed | |
| [addViewer(emailAddress)](https://developers.google.com/apps-script/reference/document/document#addViewer(String)) | [Document](#document) | Completed | |
| [addViewer(user)](https://developers.google.com/apps-script/reference/document/document#addViewer(User)) | [Document](#document) | Completed | |
| [addViewers(emailAddresses)](https://developers.google.com/apps-script/reference/document/document#addViewers(String[])) | [Document](#document) | Completed | |
| [getAs(contentType)](https://developers.google.com/apps-script/reference/document/document#getAs(String)) | [Blob](https://developers.google.com/apps-script/reference/base/blob) | Completed | |
| [getBlob()](https://developers.google.com/apps-script/reference/document/document#getBlob()) | [Blob](https://developers.google.com/apps-script/reference/base/blob) | Completed | |
| [getBody()](https://developers.google.com/apps-script/reference/document/document#getBody()) | [Body](#body) | Completed | |
| [getBookmark(id)](https://developers.google.com/apps-script/reference/document/document#getBookmark(String)) | [Bookmark](#bookmark) | Not Started | Cannot be emulated via public Docs API. See issue [441253571](https://issuetracker.google.com/issues/441253571). |
| [getBookmarks()](https://developers.google.com/apps-script/reference/document/document#getBookmarks()) | [Bookmark[]](#bookmark) | Not Started | Cannot be emulated via public Docs API. See issue [441253571](https://issuetracker.google.com/issues/441253571). |
| [getCursor()](https://developers.google.com/apps-script/reference/document/document#getCursor()) | [Position](#position) | Completed | |
| [getEditors()](https://developers.google.com/apps-script/reference/document/document#getEditors()) | [User[]](https://developers.google.com/apps-script/reference/base/user) | Completed | |
| [getFooter()](https://developers.google.com/apps-script/reference/document/document#getFooter()) | [FooterSection](#footersection) | Completed | |
| [getFootnotes()](https://developers.google.com/apps-script/reference/document/document#getFootnotes()) | [Footnote[]](#footnote) | Completed | |
| [getHeader()](https://developers.google.com/apps-script/reference/document/document#getHeader()) | [HeaderSection](#headersection) | Completed | |
| [getId()](https://developers.google.com/apps-script/reference/document/document#getId()) | String | Completed | |
| [getLanguage()](https://developers.google.com/apps-script/reference/document/document#getLanguage()) | String | Not Started | |
| [getName()](https://developers.google.com/apps-script/reference/document/document#getName()) | String | Completed | |
| [getNamedRange(id)](https://developers.google.com/apps-script/reference/document/document#getNamedRange(String)) | [NamedRange](#namedrange) | Completed | |
| [getNamedRanges()](https://developers.google.com/apps-script/reference/document/document#getNamedRanges()) | [NamedRange[]](#namedrange) | Completed | |
| [getNamedRanges(name)](https://developers.google.com/apps-script/reference/document/document#getNamedRanges(String)) | [NamedRange[]](#namedrange) | Completed | |
| [getSelection()](https://developers.google.com/apps-script/reference/document/document#getSelection()) | [Range](#range) | Completed | |
| [getUrl()](https://developers.google.com/apps-script/reference/document/document#getUrl()) | String | Completed | |
| [getViewers()](https://developers.google.com/apps-script/reference/document/document#getViewers()) | [User[]](https://developers.google.com/apps-script/reference/base/user) | Completed | |
| [newPosition(element, offset)](https://developers.google.com/apps-script/reference/document/document#newPosition(Element,Integer)) | [Position](#position) | Completed | |
| [newRange()](https://developers.google.com/apps-script/reference/document/document#newRange()) | [RangeBuilder](https://developers.google.com/apps-script/reference/document/range-builder) | Completed | |
| [removeEditor(emailAddress)](https://developers.google.com/apps-script/reference/document/document#removeEditor(String)) | [Document](#document) | Completed | |
| [removeEditor(user)](https://developers.google.com/apps-script/reference/document/document#removeEditor(User)) | [Document](#document) | Completed | |
| [removeViewer(emailAddress)](https://developers.google.com/apps-script/reference/document/document#removeViewer(String)) | [Document](#document) | Completed | |
| [removeViewer(user)](https://developers.google.com/apps-script/reference/document/document#removeViewer(User)) | [Document](#document) | Completed | |
| [saveAndClose()](https://developers.google.com/apps-script/reference/document/document#saveAndClose()) | void | Completed | |
| [setCursor(position)](https://developers.google.com/apps-script/reference/document/document#setCursor(Position)) | [Document](#document) | Completed | |
| [setLanguage(languageCode)](https://developers.google.com/apps-script/reference/document/document#setLanguage(String)) | [Document](#document) | Not Started | |
| [setName(name)](https://developers.google.com/apps-script/reference/document/document#setName(String)) | [Document](#document) | Completed | |
| [setSelection(range)](https://developers.google.com/apps-script/reference/document/document#setSelection(Range)) | [Document](#document) | Completed | |
---
## [DocumentApp](https://developers.google.com/apps-script/reference/document/document-app)
The main class for accessing and creating Documents.

80% completed

| method | return | status | comments |
|---|---|---|---|
| [create(name)](https://developers.google.com/apps-script/reference/document/document-app#create(String)) | [Document](#document) | Completed | |
| [getActiveDocument()](https://developers.google.com/apps-script/reference/document/document-app#getActiveDocument()) | [Document](#document) | Completed | |
| [getUi()](https://developers.google.com/apps-script/reference/document/document-app#getUi()) | [Ui](https://developers.google.com/apps-script/reference/base/ui) | Not Started | |
| [openById(id)](https://developers.google.com/apps-script/reference/document/document-app#openById(String)) | [Document](#document) | Completed | |
| [openByUrl(url)](https://developers.google.com/apps-script/reference/document/document-app#openByUrl(String)) | [Document](#document) | Completed | |
---
## [Element](https://developers.google.com/apps-script/reference/document/element)
A generic element.

100% completed

| method | return | status | comments |
|---|---|---|---|
| [asBody()](https://developers.google.com/apps-script/reference/document/element#asBody()) | [Body](#body) | Completed | |
| [asEquation()](https://developers.google.com/apps-script/reference/document/element#asEquation()) | [Equation](#equation) | Completed | |
| [asEquationFunction()](https://developers.google.com/apps-script/reference/document/element#asEquationFunction()) | [EquationFunction](#equationfunction) | Completed | |
| [asEquationFunctionArgumentSeparator()](https://developers.google.com/apps-script/reference/document/element#asEquationFunctionArgumentSeparator()) | [EquationFunctionArgumentSeparator](#equationfunctionargumentseparator) | Completed | |
| [asEquationSymbol()](https://developers.google.com/apps-script/reference/document/element#asEquationSymbol()) | [EquationSymbol](#equationsymbol) | Completed | |
| [asFooterSection()](https://developers.google.com/apps-script/reference/document/element#asFooterSection()) | [FooterSection](#footersection) | Completed | |
| [asFootnote()](https://developers.google.com/apps-script/reference/document/element#asFootnote()) | [Footnote](#footnote) | Completed | |
| [asFootnoteSection()](https://developers.google.com/apps-script/reference/document/element#asFootnoteSection()) | [FootnoteSection](#footnotesection) | Completed | |
| [asHeaderSection()](https://developers.google.com/apps-script/reference/document/element#asHeaderSection()) | [HeaderSection](#headersection) | Completed | |
| [asHorizontalRule()](https://developers.google.com/apps-script/reference/document/element#asHorizontalRule()) | [HorizontalRule](#horizontalrule) | Completed | |
| [asInlineDrawing()](https://developers.google.com/apps-script/reference/document/element#asInlineDrawing()) | [InlineDrawing](#inlinedrawing) | Completed | |
| [asInlineImage()](https://developers.google.com/apps-script/reference/document/element#asInlineImage()) | [InlineImage](#inlineimage) | Completed | |
| [asListItem()](https://developers.google.com/apps-script/reference/document/element#asListItem()) | [ListItem](#listitem) | Completed | |
| [asPageBreak()](https://developers.google.com/apps-script/reference/document/element#asPageBreak()) | [PageBreak](#pagebreak) | Completed | |
| [asParagraph()](https://developers.google.com/apps-script/reference/document/element#asParagraph()) | [Paragraph](#paragraph) | Completed | |
| [asTable()](https://developers.google.com/apps-script/reference/document/element#asTable()) | [Table](#table) | Completed | |
| [asTableCell()](https://developers.google.com/apps-script/reference/document/element#asTableCell()) | [TableCell](#tablecell) | Completed | |
| [asTableOfContents()](https://developers.google.com/apps-script/reference/document/element#asTableOfContents()) | [TableOfContents](#tableofcontents) | Completed | |
| [asTableRow()](https://developers.google.com/apps-script/reference/document/element#asTableRow()) | [TableRow](#tablerow) | Completed | |
| [asText()](https://developers.google.com/apps-script/reference/document/element#asText()) | [Text](#text) | Completed | |
| [asUnsupportedElement()](https://developers.google.com/apps-script/reference/document/element#asUnsupportedElement()) | [UnsupportedElement](#unsupportedelement) | Completed | |
| [copy()](https://developers.google.com/apps-script/reference/document/element#copy()) | [Element](#element) | Completed | |
| [getAttributes()](https://developers.google.com/apps-script/reference/document/element#getAttributes()) | Object | Completed | |
| [getNextSibling()](https://developers.google.com/apps-script/reference/document/element#getNextSibling()) | [Element](#element) | Completed | |
| [getParent()](https://developers.google.com/apps-script/reference/document/element#getParent()) | [ContainerElement](#containerelement) | Completed | |
| [getPreviousSibling()](https://developers.google.com/apps-script/reference/document/element#getPreviousSibling()) | [Element](#element) | Completed | |
| [getType()](https://developers.google.com/apps-script/reference/document/element#getType()) | [ElementType](#elementtype) | Completed | |
| [isAtDocumentEnd()](https://developers.google.com/apps-script/reference/document/element#isAtDocumentEnd()) | Boolean | Completed | |
| [merge()](https://developers.google.com/apps-script/reference/document/element#merge()) | [Element](#element) | Completed | |
| [removeFromParent()](https://developers.google.com/apps-script/reference/document/element#removeFromParent()) | [Element](#element) | Completed | |
| [setAttributes(attributes)](https://developers.google.com/apps-script/reference/document/element#setAttributes(Object)) | [Element](#element) | Completed | |
---
## [ElementType](https://developers.google.com/apps-script/reference/document/element-type)
An enum representing the types of elements.

100% completed

| method | return | status | comments |
|---|---|---|---|
| BODY_SECTION | [ElementType](#elementtype) | Completed | |
| COMMENT_SECTION | [ElementType](#elementtype) | Completed | |
| DOCUMENT | [ElementType](#elementtype) | Completed | |
| EQUATION | [ElementType](#elementtype) | Completed | |
| EQUATION_FUNCTION | [ElementType](#elementtype) | Completed | |
| EQUATION_FUNCTION_ARGUMENT_SEPARATOR | [ElementType](#elementtype) | Completed | |
| EQUATION_SYMBOL | [ElementType](#elementtype) | Completed | |
| FOOTER_SECTION | [ElementType](#elementtype) | Completed | |
| FOOTNOTE_SECTION | [ElementType](#elementtype) | Completed | |
| HEADER_SECTION | [ElementType](#elementtype) | Completed | |
| HORIZONTAL_RULE | [ElementType](#elementtype) | Completed | |
| INLINE_DRAWING | [ElementType](#elementtype) | Completed | |
| INLINE_IMAGE | [ElementType](#elementtype) | Completed | |
| LIST_ITEM | [ElementType](#elementtype) | Completed | |
| PAGE_BREAK | [ElementType](#elementtype) | Completed | |
| PARAGRAPH | [ElementType](#elementtype) | Completed | |
| TABLE | [ElementType](#elementtype) | Completed | |
| TABLE_CELL | [ElementType](#elementtype) | Completed | |
| TABLE_OF_CONTENTS | [ElementType](#elementtype) | Completed | |
| TABLE_ROW | [ElementType](#elementtype) | Completed | |
| TEXT | [ElementType](#elementtype) | Completed | |
| UNSUPPORTED | [ElementType](#elementtype) | Completed | |
---
## [Equation](https://developers.google.com/apps-script/reference/document/equation)
An element representing a mathematical expression.

100% completed

| method | return | status | comments |
|---|---|---|---|
| [clear()](https://developers.google.com/apps-script/reference/document/equation#clear()) | [Equation](#equation) | Completed | |
| [copy()](https://developers.google.com/apps-script/reference/document/equation#copy()) | [Equation](#equation) | Completed | |
| [editAsText()](https://developers.google.com/apps-script/reference/document/equation#editAsText()) | [Text](#text) | Completed | |
| [findElement(elementType)](https://developers.google.com/apps-script/reference/document/equation#findElement(ElementType)) | [RangeElement](#rangeelement) | Completed | |
| [findElement(elementType, from)](https://developers.google.com/apps-script/reference/document/equation#findElement(ElementType,RangeElement)) | [RangeElement](#rangeelement) | Completed | |
| [findText(searchPattern)](https://developers.google.com/apps-script/reference/document/equation#findText(String)) | [RangeElement](#rangeelement) | Completed | |
| [findText(searchPattern, from)](https://developers.google.com/apps-script/reference/document/equation#findText(String,RangeElement)) | [RangeElement](#rangeelement) | Completed | |
| [getAttributes()](https://developers.google.com/apps-script/reference/document/equation#getAttributes()) | Object | Completed | |
| [getChild(childIndex)](https://developers.google.com/apps-script/reference/document/equation#getChild(Integer)) | [Element](#element) | Completed | |
| [getChildIndex(child)](https://developers.google.com/apps-script/reference/document/equation#getChildIndex(Element)) | Integer | Completed | |
| [getLinkUrl()](https://developers.google.com/apps-script/reference/document/equation#getLinkUrl()) | String | Completed | |
| [getNextSibling()](https://developers.google.com/apps-script/reference/document/equation#getNextSibling()) | [Element](#element) | Completed | |
| [getNumChildren()](https://developers.google.com/apps-script/reference/document/equation#getNumChildren()) | Integer | Completed | |
| [getParent()](https://developers.google.com/apps-script/reference/document/equation#getParent()) | [ContainerElement](#containerelement) | Completed | |
| [getPreviousSibling()](https://developers.google.com/apps-script/reference/document/equation#getPreviousSibling()) | [Element](#element) | Completed | |
| [getText()](https://developers.google.com/apps-script/reference/document/equation#getText()) | String | Completed | |
| [getTextAlignment()](https://developers.google.com/apps-script/reference/document/equation#getTextAlignment()) | [TextAlignment](#textalignment) | Completed | |
| [getType()](https://developers.google.com/apps-script/reference/document/equation#getType()) | [ElementType](#elementtype) | Completed | |
| [isAtDocumentEnd()](https://developers.google.com/apps-script/reference/document/equation#isAtDocumentEnd()) | Boolean | Completed | |
| [merge()](https://developers.google.com/apps-script/reference/document/equation#merge()) | [Equation](#equation) | Completed | |
| [removeChild(child)](https://developers.google.com/apps-script/reference/document/equation#removeChild(Element)) | [Equation](#equation) | Completed | |
| [removeFromParent()](https://developers.google.com/apps-script/reference/document/equation#removeFromParent()) | [Equation](#equation) | Completed | |
| [replaceText(searchPattern, replacement)](https://developers.google.com/apps-script/reference/document/equation#replaceText(String,String)) | [Element](#element) | Completed | |
| [setAttributes(attributes)](https://developers.google.com/apps-script/reference/document/equation#setAttributes(Object)) | [Equation](#equation) | Completed | |
| [setLinkUrl(url)](https://developers.google.com/apps-script/reference/document/equation#setLinkUrl(String)) | [Equation](#equation) | Completed | |
| [setText(text)](https://developers.google.com/apps-script/reference/document/equation#setText(String)) | void | Completed | |
| [setTextAlignment(textAlignment)](https://developers.google.com/apps-script/reference/document/equation#setTextAlignment(TextAlignment)) | [Equation](#equation) | Completed | |
---
## [FooterSection](https://developers.google.com/apps-script/reference/document/footer-section)
An element representing a footer section.

100% completed

| method | return | status | comments |
|---|---|---|---|
| [appendHorizontalRule()](https://developers.google.com/apps-script/reference/document/footer-section#appendHorizontalRule()) | [HorizontalRule](#horizontalrule) | Completed | |
| [appendImage(image)](https://developers.google.com/apps-script/reference/document/footer-section#appendImage(InlineImage)) | [InlineImage](#inlineimage) | Completed | |
| [appendListItem(listItem)](https://developers.google.com/apps-script/reference/document/footer-section#appendListItem(ListItem)) | [ListItem](#listitem) | Completed | |
| [appendListItem(text)](https://developers.google.com/apps-script/reference/document/footer-section#appendListItem(String)) | [ListItem](#listitem) | Completed | |
| [appendParagraph(paragraph)](https://developers.google.com/apps-script/reference/document/footer-section#appendParagraph(Paragraph)) | [Paragraph](#paragraph) | Completed | |
| [appendParagraph(text)](https://developers.google.com/apps-script/reference/document/footer-section#appendParagraph(String)) | [Paragraph](#paragraph) | Completed | |
| [appendTable()](https://developers.google.com/apps-script/reference/document/footer-section#appendTable()) | [Table](#table) | Completed | |
| [appendTable(cells)](https://developers.google.com/apps-script/reference/document/footer-section#appendTable(String[][])) | [Table](#table) | Completed | |
| [appendTable(table)](https://developers.google.com/apps-script/reference/document/footer-section#appendTable(Table)) | [Table](#table) | Completed | |
| [clear()](https://developers.google.com/apps-script/reference/document/footer-section#clear()) | [FooterSection](#footersection) | Completed | |
| [copy()](https://developers.google.com/apps-script/reference/document/footer-section#copy()) | [FooterSection](#footersection) | Completed | |
| [editAsText()](https://developers.google.com/apps-script/reference/document/footer-section#editAsText()) | [Text](#text) | Completed | |
| [findElement(elementType)](https://developers.google.com/apps-script/reference/document/footer-section#findElement(ElementType)) | [RangeElement](#rangeelement) | Completed | |
| [findElement(elementType, from)](https://developers.google.com/apps-script/reference/document/footer-section#findElement(ElementType,RangeElement)) | [RangeElement](#rangeelement) | Completed | |
| [findText(searchPattern)](https://developers.google.com/apps-script/reference/document/footer-section#findText(String)) | [RangeElement](#rangeelement) | Completed | |
| [findText(searchPattern, from)](https://developers.google.com/apps-script/reference/document/footer-section#findText(String,RangeElement)) | [RangeElement](#rangeelement) | Completed | |
| [getAttributes()](https://developers.google.com/apps-script/reference/document/footer-section#getAttributes()) | Object | Completed | |
| [getChild(childIndex)](https://developers.google.com/apps-script/reference/document/footer-section#getChild(Integer)) | [Element](#element) | Completed | |
| [getChildIndex(child)](https://developers.google.com/apps-script/reference/document/footer-section#getChildIndex(Element)) | Integer | Completed | |
| [getImages()](https://developers.google.com/apps-script/reference/document/footer-section#getImages()) | [InlineImage[]](#inlineimage) | Completed | |
| [getListItems()](https://developers.google.com/apps-script/reference/document/footer-section#getListItems()) | [ListItem[]](#listitem) | Completed | |
| [getNumChildren()](https://developers.google.com/apps-script/reference/document/footer-section#getNumChildren()) | Integer | Completed | |
| [getParagraphs()](https://developers.google.com/apps-script/reference/document/footer-section#getParagraphs()) | [Paragraph[]](#paragraph) | Completed | |
| [getParent()](https://developers.google.com/apps-script/reference/document/footer-section#getParent()) | [ContainerElement](#containerelement) | Completed | |
| [getTables()](https://developers.google.com/apps-script/reference/document/footer-section#getTables()) | [Table[]](#table) | Completed | |
| [getText()](https://developers.google.com/apps-script/reference/document/footer-section#getText()) | String | Completed | |
| [getTextAlignment()](https://developers.google.com/apps-script/reference/document/footer-section#getTextAlignment()) | [TextAlignment](#textalignment) | Completed | |
| [getType()](https://developers.google.com/apps-script/reference/document/footer-section#getType()) | [ElementType](#elementtype) | Completed | |
| [insertHorizontalRule(childIndex)](https://developers.google.com/apps-script/reference/document/footer-section#insertHorizontalRule(Integer)) | [HorizontalRule](#horizontalrule) | Completed | |
| [insertImage(childIndex, image)](https://developers.google.com/apps-script/reference/document/footer-section#insertImage(Integer,InlineImage)) | [InlineImage](#inlineimage) | Completed | |
| [insertListItem(childIndex, listItem)](https://developers.google.com/apps-script/reference/document/footer-section#insertListItem(Integer,ListItem)) | [ListItem](#listitem) | Completed | |
| [insertListItem(childIndex, text)](https://developers.google.com/apps-script/reference/document/footer-section#insertListItem(Integer,String)) | [ListItem](#listitem) | Completed | |
| [insertParagraph(childIndex, paragraph)](https://developers.google.com/apps-script/reference/document/footer-section#insertParagraph(Integer,Paragraph)) | [Paragraph](#paragraph) | Completed | |
| [insertParagraph(childIndex, text)](https://developers.google.com/apps-script/reference/document/footer-section#insertParagraph(Integer,String)) | [Paragraph](#paragraph) | Completed | |
| [insertTable(childIndex)](https://developers.google.com/apps-script/reference/document/footer-section#insertTable(Integer)) | [Table](#table) | Completed | |
| [insertTable(childIndex, cells)](https://developers.google.com/apps-script/reference/document/footer-section#insertTable(Integer,String[][])) | [Table](#table) | Completed | |
| [insertTable(childIndex, table)](https://developers.google.com/apps-script/reference/document/footer-section#insertTable(Integer,Table)) | [Table](#table) | Completed | |
| [isAtDocumentEnd()](https://developers.google.com/apps-script/reference/document/footer-section#isAtDocumentEnd()) | Boolean | Completed | |
| [removeChild(child)](https://developers.google.com/apps-script/reference/document/footer-section#removeChild(Element)) | [FooterSection](#footersection) | Completed | |
| [removeFromParent()](https://developers.google.com/apps-script/reference/document/footer-section#removeFromParent()) | [FooterSection](#footersection) | Completed | |
| [replaceText(searchPattern, replacement)](https://developers.google.com/apps-script/reference/document/footer-section#replaceText(String,String)) | [Element](#element) | Completed | |
| [setAttributes(attributes)](https://developers.google.com/apps-script/reference/document/footer-section#setAttributes(Object)) | [FooterSection](#footersection) | Completed | |
| [setText(text)](https://developers.google.com/apps-script/reference/document/footer-section#setText(String)) | [FooterSection](#footersection) | Completed | |
| [setTextAlignment(textAlignment)](https://developers.google.com/apps-script/reference/document/footer-section#setTextAlignment(TextAlignment)) | [FooterSection](#footersection) | Completed | |
---
## [Footnote](https://developers.google.com/apps-script/reference/document/footnote)
An element representing a footnote.

8% completed

| method | return | status | comments |
|---|---|---|---|
| [copy()](https://developers.google.com/apps-script/reference/document/footnote#copy()) | [Footnote](#footnote) | Completed | |
| [getAttributes()](https://developers.google.com/apps-script/reference/document/footnote#getAttributes()) | Object | Not Started | |
| [getFootnoteContents()](https://developers.google.com/apps-script/reference/document/footnote#getFootnoteContents()) | [FootnoteSection](#footnotesection) | Not Started | |
| [getNextSibling()](https://developers.google.com/apps-script/reference/document/footnote#getNextSibling()) | [Element](#element) | Not Started | |
| [getParent()](https://developers.google.com/apps-script/reference/document/footnote#getParent()) | [ContainerElement](#containerelement) | Not Started | |
| [getPreviousSibling()](https://developers.google.com/apps-script/reference/document/footnote#getPreviousSibling()) | [Element](#element) | Not Started | |
| [getText()](https://developers.google.com/apps-script/reference/document/footnote#getText()) | String | Not Started | |
| [getType()](https://developers.google.com/apps-script/reference/document/footnote#getType()) | [ElementType](#elementtype) | Not Started | |
| [isAtDocumentEnd()](https://developers.google.com/apps-script/reference/document/footnote#isAtDocumentEnd()) | Boolean | Not Started | |
| [merge()](https://developers.google.com/apps-script/reference/document/footnote#merge()) | [Footnote](#footnote) | Not Started | |
| [removeFromParent()](https://developers.google.com/apps-script/reference/document/footnote#removeFromParent()) | [Footnote](#footnote) | Not Started | |
| [setAttributes(attributes)](https://developers.google.com/apps-script/reference/document/footnote#setAttributes(Object)) | [Footnote](#footnote) | Not Started | |
---
## [HeaderSection](https://developers.google.com/apps-script/reference/document/header-section)
An element representing a header section.

100% completed

| method | return | status | comments |
|---|---|---|---|
| [appendHorizontalRule()](https://developers.google.com/apps-script/reference/document/header-section#appendHorizontalRule()) | [HorizontalRule](#horizontalrule) | Completed | |
| [appendImage(image)](https://developers.google.com/apps-script/reference/document/header-section#appendImage(InlineImage)) | [InlineImage](#inlineimage) | Completed | |
| [appendListItem(listItem)](https://developers.google.com/apps-script/reference/document/header-section#appendListItem(ListItem)) | [ListItem](#listitem) | Completed | |
| [appendListItem(text)](https://developers.google.com/apps-script/reference/document/header-section#appendListItem(String)) | [ListItem](#listitem) | Completed | |
| [appendParagraph(paragraph)](https://developers.google.com/apps-script/reference/document/header-section#appendParagraph(Paragraph)) | [Paragraph](#paragraph) | Completed | |
| [appendParagraph(text)](https://developers.google.com/apps-script/reference/document/header-section#appendParagraph(String)) | [Paragraph](#paragraph) | Completed | |
| [appendTable()](https://developers.google.com/apps-script/reference/document/header-section#appendTable()) | [Table](#table) | Completed | |
| [appendTable(cells)](https://developers.google.com/apps-script/reference/document/header-section#appendTable(String[][])) | [Table](#table) | Completed | |
| [appendTable(table)](https://developers.google.com/apps-script/reference/document/header-section#appendTable(Table)) | [Table](#table) | Completed | |
| [clear()](https://developers.google.com/apps-script/reference/document/header-section#clear()) | [HeaderSection](#headersection) | Completed | |
| [copy()](https://developers.google.com/apps-script/reference/document/header-section#copy()) | [HeaderSection](#headersection) | Completed | |
| [editAsText()](https://developers.google.com/apps-script/reference/document/header-section#editAsText()) | [Text](#text) | Completed | |
| [findElement(elementType)](https://developers.google.com/apps-script/reference/document/header-section#findElement(ElementType)) | [RangeElement](#rangeelement) | Completed | |
| [findElement(elementType, from)](https://developers.google.com/apps-script/reference/document/header-section#findElement(ElementType,RangeElement)) | [RangeElement](#rangeelement) | Completed | |
| [findText(searchPattern)](https://developers.google.com/apps-script/reference/document/header-section#findText(String)) | [RangeElement](#rangeelement) | Completed | |
| [findText(searchPattern, from)](https://developers.google.com/apps-script/reference/document/header-section#findText(String,RangeElement)) | [RangeElement](#rangeelement) | Completed | |
| [getAttributes()](https://developers.google.com/apps-script/reference/document/header-section#getAttributes()) | Object | Completed | |
| [getChild(childIndex)](https://developers.google.com/apps-script/reference/document/header-section#getChild(Integer)) | [Element](#element) | Completed | |
| [getChildIndex(child)](https://developers.google.com/apps-script/reference/document/header-section#getChildIndex(Element)) | Integer | Completed | |
| [getImages()](https://developers.google.com/apps-script/reference/document/header-section#getImages()) | [InlineImage[]](#inlineimage) | Completed | |
| [getListItems()](https://developers.google.com/apps-script/reference/document/header-section#getListItems()) | [ListItem[]](#listitem) | Completed | |
| [getNumChildren()](https://developers.google.com/apps-script/reference/document/header-section#getNumChildren()) | Integer | Completed | |
| [getParagraphs()](https://developers.google.com/apps-script/reference/document/header-section#getParagraphs()) | [Paragraph[]](#paragraph) | Completed | |
| [getParent()](https://developers.google.com/apps-script/reference/document/header-section#getParent()) | [ContainerElement](#containerelement) | Completed | |
| [getTables()](https://developers.google.com/apps-script/reference/document/header-section#getTables()) | [Table[]](#table) | Completed | |
| [getText()](https://developers.google.com/apps-script/reference/document/header-section#getText()) | String | Completed | |
| [getTextAlignment()](https://developers.google.com/apps-script/reference/document/header-section#getTextAlignment()) | [TextAlignment](#textalignment) | Completed | |
| [getType()](https://developers.google.com/apps-script/reference/document/header-section#getType()) | [ElementType](#elementtype) | Completed | |
| [insertHorizontalRule(childIndex)](https://developers.google.com/apps-script/reference/document/header-section#insertHorizontalRule(Integer)) | [HorizontalRule](#horizontalrule) | Completed | |
| [insertImage(childIndex, image)](https://developers.google.com/apps-script/reference/document/header-section#insertImage(Integer,InlineImage)) | [InlineImage](#inlineimage) | Completed | |
| [insertListItem(childIndex, listItem)](https://developers.google.com/apps-script/reference/document/header-section#insertListItem(Integer,ListItem)) | [ListItem](#listitem) | Completed | |
| [insertListItem(childIndex, text)](https://developers.google.com/apps-script/reference/document/header-section#insertListItem(Integer,String)) | [ListItem](#listitem) | Completed | |
| [insertParagraph(childIndex, paragraph)](https://developers.google.com/apps-script/reference/document/header-section#insertParagraph(Integer,Paragraph)) | [Paragraph](#paragraph) | Completed | |
| [insertParagraph(childIndex, text)](https://developers.google.com/apps-script/reference/document/header-section#insertParagraph(Integer,String)) | [Paragraph](#paragraph) | Completed | |
| [insertTable(childIndex)](https://developers.google.com/apps-script/reference/document/header-section#insertTable(Integer)) | [Table](#table) | Completed | |
| [insertTable(childIndex, cells)](https://developers.google.com/apps-script/reference/document/header-section#insertTable(Integer,String[][])) | [Table](#table) | Completed | |
| [insertTable(childIndex, table)](https://developers.google.com/apps-script/reference/document/header-section#insertTable(Integer,Table)) | [Table](#table) | Completed | |
| [isAtDocumentEnd()](https://developers.google.com/apps-script/reference/document/header-section#isAtDocumentEnd()) | Boolean | Completed | |
| [removeChild(child)](https://developers.google.com/apps-script/reference/document/header-section#removeChild(Element)) | [HeaderSection](#headersection) | Completed | |
| [removeFromParent()](https://developers.google.com/apps-script/reference/document/header-section#removeFromParent()) | [HeaderSection](#headersection) | Completed | |
| [replaceText(searchPattern, replacement)](https://developers.google.com/apps-script/reference/document/header-section#replaceText(String,String)) | [Element](#element) | Completed | |
| [setAttributes(attributes)](https://developers.google.com/apps-script/reference/document/header-section#setAttributes(Object)) | [HeaderSection](#headersection) | Completed | |
| [setText(text)](https://developers.google.com/apps-script/reference/document/header-section#setText(String)) | [HeaderSection](#headersection) | Completed | |
| [setTextAlignment(textAlignment)](https://developers.google.com/apps-script/reference/document/header-section#setTextAlignment(TextAlignment)) | [HeaderSection](#headersection) | Completed | |
---
## [Paragraph](https://developers.google.com/apps-script/reference/document/paragraph)
An element representing a paragraph.

98% completed

| method | return | status | comments |
|---|---|---|---|
| [addPositionedImage(image)](https://developers.google.com/apps-script/reference/document/paragraph#addPositionedImage(BlobSource)) | [PositionedImage](#positionedimage) | Not Started | Cannot be emulated via public Docs API. See issue [442065544](https://issuetracker.google.com/issues/442065544). |
| [appendHorizontalRule()](https://developers.google.com/apps-script/reference/document/paragraph#appendHorizontalRule()) | [HorizontalRule](#horizontalrule) | Completed | |
| [appendInlineImage(image)](https://developers.google.com/apps-script/reference/document/paragraph#appendInlineImage(InlineImage)) | [InlineImage](#inlineimage) | Completed | |
| [appendPageBreak()](https://developers.google.com/apps-script/reference/document/paragraph#appendPageBreak()) | [PageBreak](#pagebreak) | Completed | |
| [appendText(text)](https://developers.google.com/apps-script/reference/document/paragraph#appendText(String)) | [Text](#text) | Completed | |
| [clear()](https://developers.google.com/apps-script/reference/document/paragraph#clear()) | [Paragraph](#paragraph) | Completed | |
| [copy()](https://developers.google.com/apps-script/reference/document/paragraph#copy()) | [Paragraph](#paragraph) | Completed | |
| [editAsText()](https://developers.google.com/apps-script/reference/document/paragraph#editAsText()) | [Text](#text) | Completed | |
| [findElement(elementType)](https://developers.google.com/apps-script/reference/document/paragraph#findElement(ElementType)) | [RangeElement](#rangeelement) | Completed | |
| [findElement(elementType, from)](https://developers.google.com/apps-script/reference/document/paragraph#findElement(ElementType,RangeElement)) | [RangeElement](#rangeelement) | Completed | |
| [findText(searchPattern)](https://developers.google.com/apps-script/reference/document/paragraph#findText(String)) | [RangeElement](#rangeelement) | Completed | |
| [findText(searchPattern, from)](https://developers.google.com/apps-script/reference/document/paragraph#findText(String,RangeElement)) | [RangeElement](#rangeelement) | Completed | |
| [getAttributes()](https://developers.google.com/apps-script/reference/document/paragraph#getAttributes()) | Object | Completed | |
| [getChild(childIndex)](https://developers.google.com/apps-script/reference/document/paragraph#getChild(Integer)) | [Element](#element) | Completed | |
| [getChildIndex(child)](https://developers.google.com/apps-script/reference/document/paragraph#getChildIndex(Element)) | Integer | Completed | |
| [getHeading()](https://developers.google.com/apps-script/reference/document/paragraph#getHeading()) | [ParagraphHeading](#paragraphheading) | Completed | |
| [getImages()](https://developers.google.com/apps-script/reference/document/paragraph#getImages()) | [InlineImage[]](#inlineimage) | Completed | |
| [getIndentEnd()](https://developers.google.com/apps-script/reference/document/paragraph#getIndentEnd()) | Number | Completed | |
| [getIndentFirstLine()](https://developers.google.com/apps-script/reference/document/paragraph#getIndentFirstLine()) | Number | Completed | |
| [getIndentStart()](https://developers.google.com/apps-script/reference/document/paragraph#getIndentStart()) | Number | Completed | |
| [getLineSpacing()](https://developers.google.com/apps-script/reference/document/paragraph#getLineSpacing()) | Number | Completed | |
| [getLinkUrl()](https://developers.google.com/apps-script/reference/document/paragraph#getLinkUrl()) | String | Completed | |
| [getNextSibling()](https://developers.google.com/apps-script/reference/document/paragraph#getNextSibling()) | [Element](#element) | Completed | |
| [getNumChildren()](https://developers.google.com/apps-script/reference/document/paragraph#getNumChildren()) | Integer | Completed | |
| [getParent()](https://developers.google.com/apps-script/reference/document/paragraph#getParent()) | [ContainerElement](#containerelement) | Completed | |
| [getPreviousSibling()](https://developers.google.com/apps-script/reference/document/paragraph#getPreviousSibling()) | [Element](#element) | Completed | |
| [getSpacingAfter()](https://developers.google.com/apps-script/reference/document/paragraph#getSpacingAfter()) | Number | Completed | |
| [getSpacingBefore()](https://developers.google.com/apps-script/reference/document/paragraph#getSpacingBefore()) | Number | Completed | |
| [getText()](https://developers.google.com/apps-script/reference/document/paragraph#getText()) | String | Completed | |
| [getTextAlignment()](https://developers.google.com/apps-script/reference/document/paragraph#getTextAlignment()) | [TextAlignment](#textalignment) | Completed | |
| [getType()](https://developers.google.com/apps-script/reference/document/paragraph#getType()) | [ElementType](#elementtype) | Completed | |
| [insertHorizontalRule(childIndex)](https://developers.google.com/apps-script/reference/document/paragraph#insertHorizontalRule(Integer)) | [HorizontalRule](#horizontalrule) | Completed | |
| [insertInlineImage(childIndex, image)](https://developers.google.com/apps-script/reference/document/paragraph#insertInlineImage(Integer,InlineImage)) | [InlineImage](#inlineimage) | Completed | |
| [insertPageBreak(childIndex)](https://developers.google.com/apps-script/reference/document/paragraph#insertPageBreak(Integer)) | [PageBreak](#pagebreak) | Completed | |
| [insertText(childIndex, text)](https://developers.google.com/apps-script/reference/document/paragraph#insertText(Integer,String)) | [Text](#text) | Completed | |
| [isAtDocumentEnd()](https://developers.google.com/apps-script/reference/document/paragraph#isAtDocumentEnd()) | Boolean | Completed | |
| [isLeftToRight()](https://developers.google.com/apps-script/reference/document/paragraph#isLeftToRight()) | Boolean | Completed | |
| [merge()](https://developers.google.com/apps-script/reference/document/paragraph#merge()) | [Paragraph](#paragraph) | Completed | |
| [removeChild(child)](https://developers.google.com/apps-script/reference/document/paragraph#removeChild(Element)) | [Paragraph](#paragraph) | Completed | |
| [removeFromParent()](https://developers.google.com/apps-script/reference/document/paragraph#removeFromParent()) | [Paragraph](#paragraph) | Completed | |
| [replaceText(searchPattern, replacement)](https://developers.google.com/apps-script/reference/document/paragraph#replaceText(String,String)) | [Element](#element) | Completed | |
| [setAttributes(attributes)](https://developers.google.com/apps-script/reference/document/paragraph#setAttributes(Object)) | [Paragraph](#paragraph) | Completed | |
| [setHeading(heading)](https://developers.google.com/apps-script/reference/document/paragraph#setHeading(ParagraphHeading)) | [Paragraph](#paragraph) | Completed | |
| [setIndentEnd(indentEnd)](https://developers.google.com/apps-script/reference/document/paragraph#setIndentEnd(Number)) | [Paragraph](#paragraph) | Completed | |
| [setIndentFirstLine(indentFirstLine)](https://developers.google.com/apps-script/reference/document/paragraph#setIndentFirstLine(Number)) | [Paragraph](#paragraph) | Completed | |
| [setIndentStart(indentStart)](https://developers.google.com/apps-script/reference/document/paragraph#setIndentStart(Number)) | [Paragraph](#paragraph) | Completed | |
| [setLeftToRight(leftToRight)](https://developers.google.com/apps-script/reference/document/paragraph#setLeftToRight(Boolean)) | [Paragraph](#paragraph) | Completed | |
| [setLineSpacing(lineSpacing)](https://developers.google.com/apps-script/reference/document/paragraph#setLineSpacing(Number)) | [Paragraph](#paragraph) | Completed | |
| [setLinkUrl(url)](https://developers.google.com/apps-script/reference/document/paragraph#setLinkUrl(String)) | [Paragraph](#paragraph) | Completed | |
| [setSpacingAfter(spacingAfter)](https://developers.google.com/apps-script/reference/document/paragraph#setSpacingAfter(Number)) | [Paragraph](#paragraph) | Completed | |
| [setSpacingBefore(spacingBefore)](https://developers.google.com/apps-script/reference/document/paragraph#setSpacingBefore(Number)) | [Paragraph](#paragraph) | Completed | |
| [setText(text)](https://developers.google.com/apps-script/reference/document/paragraph#setText(String)) | void | Completed | |
| [setTextAlignment(textAlignment)](https://developers.google.com/apps-script/reference/document/paragraph#setTextAlignment(TextAlignment)) | [Paragraph](#paragraph) | Completed | |
---
## [ParagraphHeading](https://developers.google.com/apps-script/reference/document/paragraph-heading)
An enum representing the supported paragraph headings.

100% completed

| method | return | status | comments |
|---|---|---|---|
| HEADING1 | [ParagraphHeading](#paragraphheading) | Completed | |
| HEADING2 | [ParagraphHeading](#paragraphheading) | Completed | |
| HEADING3 | [ParagraphHeading](#paragraphheading) | Completed | |
| HEADING4 | [ParagraphHeading](#paragraphheading) | Completed | |
| HEADING5 | [ParagraphHeading](#paragraphheading) | Completed | |
| HEADING6 | [ParagraphHeading](#paragraphheading) | Completed | |
| NORMAL | [ParagraphHeading](#paragraphheading) | Completed | |
| SUBTITLE | [ParagraphHeading](#paragraphheading) | Completed | |
| TITLE | [ParagraphHeading](#paragraphheading) | Completed | |
---
## [Position](https://developers.google.com/apps-script/reference/document/position)
An object that represents a location in a document.

86% completed

| method | return | status | comments |
|---|---|---|---|
| [getElement()](https://developers.google.com/apps-script/reference/document/position#getElement()) | [Element](#element) | Completed | |
| [getOffset()](https://developers.google.com/apps-script/reference/document/position#getOffset()) | Integer | Completed | |
| [getSurroundingText()](https://developers.google.com/apps-script/reference/document/position#getSurroundingText()) | [Text](#text) | Completed | |
| [getSurroundingTextOffset()](https://developers.google.com/apps-script/reference/document/position#getSurroundingTextOffset()) | Integer | Completed | |
| [insertBookmark()](https://developers.google.com/apps-script/reference/document/position#insertBookmark()) | [Bookmark](#bookmark) | Not Started | Cannot be emulated via public Docs API. See issue [441253571](https://issuetracker.google.com/issues/441253571). |
| [insertInlineImage(image)](https://developers.google.com/apps-script/reference/document/position#insertInlineImage(BlobSource)) | [InlineImage](#inlineimage) | Completed | |
| [insertText(text)](https://developers.google.com/apps-script/reference/document/position#insertText(String)) | [Text](#text) | Completed | |
---
## [VerticalAlignment](https://developers.google.com/apps-script/reference/document/vertical-alignment)
An enum representing the supported vertical alignment types.

100% completed

| method | return | status | comments |
|---|---|---|---|
| BOTTOM | [VerticalAlignment](#verticalalignment) | Completed | |
| CENTER | [VerticalAlignment](#verticalalignment) | Completed | |
| TOP | [VerticalAlignment](#verticalalignment) | Completed | |
