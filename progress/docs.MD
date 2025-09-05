# Document Service Progress
**Documentation:** [Document Service](https://developers.google.com/apps-script/reference/document)
---
## [DocumentApp](https://developers.google.com/apps-script/reference/document/document-app)
Allows scripts to create, access, and modify Google Docs files.
100% completed

| method | return | status | comments |
| --- | --- | --- | --- |
| [create(name)](https://developers.google.com/apps-script/reference/document/document-app#create(String)) | [Document](#Document) | Completed | |
| [getActiveDocument()](https://developers.google.com/apps-script/reference/document/document-app#getActiveDocument()) | [Document](#Document) | Completed | |
| [getUi()](https://developers.google.com/apps-script/reference/document/document-app#getUi()) | [Ui](https://developers.google.com/apps-script/reference/base/ui) | Completed | |
| [openById(id)](https://developers.google.com/apps-script/reference/document/document-app#openById(String)) | [Document](#Document) | Completed | |
| [openByUrl(url)](https://developers.google.com/apps-script/reference/document/document-app#openByUrl(String)) | [Document](#Document) | Completed | |

---
## [Document](https://developers.google.com/apps-script/reference/document/document)
Represents a Google Docs file.
83% completed

| method | return | status | comments |
| --- | --- | --- | --- |
| [addEditor(emailAddress)](https://developers.google.com/apps-script/reference/document/document#addEditor(String)) | [Document](#Document) | Completed | |
| [addEditors(emailAddresses)](https://developers.google.com/apps-script/reference/document/document#addEditors(String)) | [Document](#Document) | Completed | |
| [addFooter()](https://developers.google.com/apps-script/reference/document/document#addFooter()) | [FooterSection](#FooterSection) | Completed | |
| [addHeader()](https://developers.google.com/apps-script/reference/document/document#addHeader()) | [HeaderSection](#HeaderSection) | Completed | |
| [addViewer(emailAddress)](https://developers.google.com/apps-script/reference/document/document#addViewer(String)) | [Document](#Document) | Completed | |
| [addViewers(emailAddresses)](https://developers.google.com/apps-script/reference/document/document#addViewers(String)) | [Document](#Document) | Completed | |
| [getBody()](https://developers.google.com/apps-script/reference/document/document#getBody()) | [Body](#Body) | Completed | |
| [getCursor()](https://developers.google.com/apps-script/reference/document/document#getCursor()) | [Position](#Position) | Not Started | |
| [getEditors()](https://developers.google.com/apps-script/reference/document/document#getEditors()) | [User[]](https://developers.google.com/apps-script/reference/base/user) | Completed | |
| [getFooter()](https://developers.google.com/apps-script/reference/document/document#getFooter()) | [FooterSection](#FooterSection) | Completed | |
| [getHeader()](https://developers.google.com/apps-script/reference/document/document#getHeader()) | [HeaderSection](#HeaderSection) | Completed | |
| [getId()](https://developers.google.com/apps-script/reference/document/document#getId()) | String | Completed | |
| [getName()](https://developers.google.com/apps-script/reference/document/document#getName()) | String | Completed | |
| [getSelection()](https://developers.google.com/apps-script/reference/document/document#getSelection()) | [Range](#Range) | Not Started | |
| [getUrl()](https://developers.google.com/apps-script/reference/document/document#getUrl()) | String | Completed | |
| [getViewers()](https://developers.google.com/apps-script/reference/document/document#getViewers()) | [User[]](https://developers.google.com/apps-script/reference/base/user) | Completed | |
| [newRange()](https://developers.google.com/apps-script/reference/document/document#newRange()) | [RangeBuilder](#RangeBuilder) | Completed | |
| [removeEditor(emailAddress)](https://developers.google.com/apps-script/reference/document/document#removeEditor(String)) | [Document](#Document) | Completed | |
| [removeViewer(emailAddress)](https://developers.google.com/apps-script/reference/document/document#removeViewer(String)) | [Document](#Document) | Completed | |
| [saveAndClose()](https://developers.google.com/apps-script/reference/document/document#saveAndClose()) | void | Completed | |
| [setCursor(position)](https://developers.google.com/apps-script/reference/document/document#setCursor(Position)) | void | Not Started | |
| [setName(name)](https://developers.google.com/apps-script/reference/document/document#setName(String)) | [Document](#Document) | Completed | |
| [setSelection(range)](https://developers.google.com/apps-script/reference/document/document#setSelection(Range)) | void | Not Started | |

---
## [Body](https://developers.google.com/apps-script/reference/document/body)
The main content of a document.
71% completed

| method | return | status | comments |
| --- | --- | --- | --- |
| [appendHorizontalRule()](https://developers.google.com/apps-script/reference/document/body#appendHorizontalRule()) | [HorizontalRule](#HorizontalRule) | Completed | |
| [appendImage(image)](https://developers.google.com/apps-script/reference/document/body#appendImage(BlobSource)) | [InlineImage](#InlineImage) | Completed | |
| [appendListItem(listItem)](https://developers.google.com/apps-script/reference/document/body#appendListItem(ListItem)) | [ListItem](#ListItem) | Completed | |
| [appendPageBreak()](https://developers.google.com/apps-script/reference/document/body#appendPageBreak()) | [PageBreak](#PageBreak) | Completed | |
| [appendParagraph(paragraph)](https://developers.google.com/apps-script/reference/document/body#appendParagraph(Paragraph)) | [Paragraph](#Paragraph) | Completed | |
| [appendTable(table)](https://developers.google.com/apps-script/reference/document/body#appendTable(Table)) | [Table](#Table) | Completed | |
| [clear()](https://developers.google.com/apps-script/reference/document/body#clear()) | [Body](#Body) | Completed | |
| [editAsText()](https://developers.google.com/apps-script/reference/document/body#editAsText()) | [Text](#Text) | Not Started | |
| [findText(searchPattern)](https://developers.google.com/apps-script/reference/document/body#findText(String)) | [RangeElement](#RangeElement) | Not Started | |
| [getChild(childIndex)](https://developers.google.com/apps-script/reference/document/body#getChild(Integer)) | [Element](#Element) | Completed | |
| [getFootnoteSection()](https://developers.google.com/apps-script/reference/document/body#getFootnoteSection()) | [FootnoteSection](#FootnoteSection) | Completed | |
| [getImages()](https://developers.google.com/apps-script/reference/document/body#getImages()) | [InlineImage[]](#InlineImage) | Not Started | |
| [getListItems()](https://developers.google.com/apps-script/reference/document/body#getListItems()) | [ListItem[]](#ListItem) | Not Started | |
| [getParagraphs()](https://developers.google.com/apps-script/reference/document/body#getParagraphs()) | [Paragraph[]](#Paragraph) | Not Started | |
| [getTables()](https://developers.google.com/apps-script/reference/document/body#getTables()) | [Table[]](#Table) | Not Started | |
| [getText()](https://developers.google.com/apps-script/reference/document/body#getText()) | String | Completed | |
| [insertHorizontalRule(childIndex)](https://developers.google.com/apps-script/reference/document/body#insertHorizontalRule(Integer)) | [HorizontalRule](#HorizontalRule) | Completed | |
| [insertImage(childIndex, image)](https://developers.google.com/apps-script/reference/document/body#insertImage(Integer,BlobSource)) | [InlineImage](#InlineImage) | Completed | |
| [insertListItem(childIndex, listItem)](https://developers.google.com/apps-script/reference/document/body#insertListItem(Integer,ListItem)) | [ListItem](#ListItem) | Completed | |
| [insertPageBreak(childIndex)](https://developers.google.com/apps-script/reference/document/body#insertPageBreak(Integer)) | [PageBreak](#PageBreak) | Completed | |
| [insertParagraph(childIndex, paragraph)](https://developers.google.com/apps-script/reference/document/body#insertParagraph(Integer,Paragraph)) | [Paragraph](#Paragraph) | Completed | |
| [insertTable(childIndex, table)](https://developers.google.com/apps-script/reference/document/body#insertTable(Integer,Table)) | [Table](#Table) | Completed | |
| [replaceText(searchPattern, replacement)](https://developers.google.com/apps-script/reference/document/body#replaceText(String,String)) | [Element](#Element) | Not Started | |
| [setText(text)](https://developers.google.com/apps-script/reference/document/body#setText(String)) | [Body](#Body) | Completed | |

---
## [Paragraph](https://developers.google.com/apps-script/reference/document/paragraph)
Represents a paragraph of text.
55% completed

| method | return | status | comments |
| --- | --- | --- | --- |
| [addPositionedImage(image)](https://developers.google.com/apps-script/reference/document/paragraph#addPositionedImage(BlobSource)) | [PositionedImage](#PositionedImage) | Completed | |
| [appendInlineImage(image)](https://developers.google.com/apps-script/reference/document/paragraph#appendInlineImage(BlobSource)) | [InlineImage](#InlineImage) | Completed | |
| [appendPageBreak()](https://developers.google.com/apps-script/reference/document/paragraph#appendPageBreak()) | [PageBreak](#PageBreak) | Completed | |
| [appendText(text)](https://developers.google.com/apps-script/reference/document/paragraph#appendText(String)) | [Text](#Text) | Completed | |
| [clear()](https://developers.google.com/apps-script/reference/document/paragraph#clear()) | [Paragraph](#Paragraph) | Completed | |
| [editAsText()](https://developers.google.com/apps-script/reference/document/paragraph#editAsText()) | [Text](#Text) | Not Started | |
| [findText(searchPattern)](https://developers.google.com/apps-script/reference/document/paragraph#findText(String)) | [RangeElement](#RangeElement) | Not Started | |
| [getHeading()](https://developers.google.com/apps-script/reference/document/paragraph#getHeading()) | [ParagraphHeading](#ParagraphHeading) | Not Started | |
| [getImages()](https://developers.google.com/apps-script/reference/document/paragraph#getImages()) | [InlineImage[]](#InlineImage) | Not Started | |
| [getPositionedImages()](https://developers.google.com/apps-script/reference/document/paragraph#getPositionedImages()) | [PositionedImage[]](#PositionedImage) | Completed | |
| [getText()](https://developers.google.com/apps-script/reference/document/paragraph#getText()) | String | Completed | |
| [insertInlineImage(childIndex, image)](https://developers.google.com/apps-script/reference/document/paragraph#insertInlineImage(Integer,BlobSource)) | [InlineImage](#InlineImage) | Completed | |
| [insertPageBreak(childIndex)](https://developers.google.com/apps-script/reference/document/paragraph#insertPageBreak(Integer)) | [PageBreak](#PageBreak) | Completed | |
| [insertText(childIndex, text)](https://developers.google.com/apps-script/reference/document/paragraph#insertText(Integer,String)) | [Text](#Text) | Not Started | |
| [isLeftToRight()](https://developers.google.com/apps-script/reference/document/paragraph#isLeftToRight()) | Boolean | Not Started | |
| [removeFromParent()](https://developers.google.com/apps-script/reference/document/paragraph#removeFromParent()) | [Paragraph](#Paragraph) | Completed | |
| [replaceText(searchPattern, replacement)](https://developers.google.com/apps-script/reference/document/paragraph#replaceText(String,String)) | [Element](#Element) | Not Started | |
| [setHeading(heading)](https://developers.google.com/apps-script/reference/document/paragraph#setHeading(ParagraphHeading)) | [Paragraph](#Paragraph) | Not Started | |
| [setLeftToRight(leftToRight)](https://developers.google.com/apps-script/reference/document/paragraph#setLeftToRight(Boolean)) | [Paragraph](#Paragraph) | Not Started | |
| [setText(text)](https://developers.google.com/apps-script/reference/document/paragraph#setText(String)) | [Paragraph](#Paragraph) | Completed | |

---
## [Text](https://developers.google.com/apps-script/reference/document/text)
Represents a text element within a paragraph.
14% completed

| method | return | status | comments |
| --- | --- | --- | --- |
| [appendText(text)](https://developers.google.com/apps-script/reference/document/text#appendText(String)) | [Text](#Text) | Not Started | |
| [deleteText(startOffset, endOffsetInclusive)](https://developers.google.com/apps-script/reference/document/text#deleteText(Integer,Integer)) | [Text](#Text) | Not Started | |
| [getText()](https://developers.google.com/apps-script/reference/document/text#getText()) | String | Completed | |
| [insertText(offset, text)](https://developers.google.com/apps-script/reference/document/text#insertText(Integer,String)) | [Text](#Text) | Not Started | |
| [isPartial()](https://developers.google.com/apps-script/reference/document/text#isPartial()) | Boolean | Not Started | |
| [replaceText(searchPattern, replacement)](https://developers.google.com/apps-script/reference/document/text#replaceText(String,String)) | [Element](#Element) | Not Started | |
| [setText(text)](https://developers.google.com/apps-script/reference/document/text#setText(String)) | [Text](#Text) | Not Started | |

---
## [Table](https://developers.google.com/apps-script/reference/document/table)
Represents a table in the document.
73% completed

| method | return | status | comments |
| --- | --- | --- | --- |
| [appendRow(tableRow)](https://developers.google.com/apps-script/reference/document/table#appendRow(TableRow)) | [TableRow](#TableRow) | Completed | |
| [clear()](https://developers.google.com/apps-script/reference/document/table#clear()) | [Table](#Table) | Completed | |
| [editAsText()](https://developers.google.com/apps-script/reference/document/table#editAsText()) | [Text](#Text) | Not Started | |
| [findText(searchPattern)](https://developers.google.com/apps-script/reference/document/table#findText(String)) | [RangeElement](#RangeElement) | Not Started | |
| [getCell(rowIndex, cellIndex)](https://developers.google.com/apps-script/reference/document/table#getCell(Integer,Integer)) | [TableCell](#TableCell) | Completed | |
| [getNumRows()](https://developers.google.com/apps-script/reference/document/table#getNumRows()) | Integer | Completed | |
| [getRow(rowIndex)](https://developers.google.com/apps-script/reference/document/table#getRow(Integer)) | [TableRow](#TableRow) | Completed | |
| [getText()](https://developers.google.com/apps-script/reference/document/table#getText()) | String | Completed | |
| [insertRow(childIndex, tableRow)](https://developers.google.com/apps-script/reference/document/table#insertRow(Integer,TableRow)) | [TableRow](#TableRow) | Completed | |
| [removeRow(rowIndex)](https://developers.google.com/apps-script/reference/document/table#removeRow(Integer)) | [TableRow](#TableRow) | Completed | |
| [replaceText(searchPattern, replacement)](https://developers.google.com/apps-script/reference/document/table#replaceText(String,String)) | [Element](#Element) | Not Started | |

---
## [TableRow](https://developers.google.com/apps-script/reference/document/table-row)
Represents a table row.
80% completed

| method | return | status | comments |
| --- | --- | --- | --- |
| [appendTableCell()](https://developers.google.com/apps-script/reference/document/table-row#appendTableCell()) | [TableCell](#TableCell) | Completed | |
| [clear()](https://developers.google.com/apps-script/reference/document/table-row#clear()) | [TableRow](#TableRow) | Completed | |
| [editAsText()](https://developers.google.com/apps-script/reference/document/table-row#editAsText()) | [Text](#Text) | Not Started | |
| [findText(searchPattern)](https://developers.google.com/apps-script/reference/document/table-row#findText(String)) | [RangeElement](#RangeElement) | Not Started | |
| [getCell(cellIndex)](https://developers.google.com/apps-script/reference/document/table-row#getCell(Integer)) | [TableCell](#TableCell) | Completed | |
| [getNumCells()](https://developers.google.com/apps-script/reference/document/table-row#getNumCells()) | Integer | Completed | |
| [getText()](https://developers.google.com/apps-script/reference/document/table-row#getText()) | String | Completed | |
| [insertTableCell(childIndex)](https://developers.google.com/apps-script/reference/document/table-row#insertTableCell(Integer)) | [TableCell](#TableCell) | Completed | |
| [removeCell(cellIndex)](https://developers.google.com/apps-script/reference/document/table-row#removeCell(Integer)) | [TableCell](#TableCell) | Completed | |
| [replaceText(searchPattern, replacement)](https://developers.google.com/apps-script/reference/document/table-row#replaceText(String,String)) | [Element](#Element) | Not Started | |

---
## [TableCell](https://developers.google.com/apps-script/reference/document/table-cell)
Represents a table cell.
67% completed

| method | return | status | comments |
| --- | --- | --- | --- |
| [clear()](https://developers.google.com/apps-script/reference/document/table-cell#clear()) | [TableCell](#TableCell) | Completed | |
| [editAsText()](https://developers.google.com/apps-script/reference/document/table-cell#editAsText()) | [Text](#Text) | Not Started | |
| [findText(searchPattern)](https://developers.google.com/apps-script/reference/document/table-cell#findText(String)) | [RangeElement](#RangeElement) | Not Started | |
| [getText()](https://developers.google.com/apps-script/reference/document/table-cell#getText()) | String | Completed | |
| [replaceText(searchPattern, replacement)](https://developers.google.com/apps-script/reference/document/table-cell#replaceText(String,String)) | [Element](#Element) | Not Started | |
| [setText(text)](https://developers.google.com/apps-script/reference/document/table-cell#setText(String)) | [TableCell](#TableCell) | Completed | |

---
## [ListItem](https://developers.google.com/apps-script/reference/document/list-item)
Represents an item in a list.
46% completed

| method | return | status | comments |
| --- | --- | --- | --- |
| [clear()](https://developers.google.com/apps-script/reference/document/list-item#clear()) | [ListItem](#ListItem) | Completed | |
| [editAsText()](https://developers.google.com/apps-script/reference/document/list-item#editAsText()) | [Text](#Text) | Not Started | |
| [findText(searchPattern)](https://developers.google.com/apps-script/reference/document/list-item#findText(String)) | [RangeElement](#RangeElement) | Not Started | |
| [getGlyphType()](https://developers.google.com/apps-script/reference/document/list-item#getGlyphType()) | [GlyphType](#GlyphType) | Completed | |
| [getListId()](https://developers.google.com/apps-script/reference/document/list-item#getListId()) | String | Completed | |
| [getNestingLevel()](https://developers.google.com/apps-script/reference/document/list-item#getNestingLevel()) | Integer | Completed | |
| [getText()](https://developers.google.com/apps-script/reference/document/list-item#getText()) | String | Completed | |
| [isLeftToRight()](https://developers.google.com/apps-script/reference/document/list-item#isLeftToRight()) | Boolean | Not Started | |
| [replaceText(searchPattern, replacement)](https://developers.google.com/apps-script/reference/document/list-item#replaceText(String,String)) | [Element](#Element) | Not Started | |
| [setGlyphType(glyphType)](https://developers.google.com/apps-script/reference/document/list-item#setGlyphType(GlyphType)) | [ListItem](#ListItem) | Not Started | |
| [setLeftToRight(leftToRight)](https://developers.google.com/apps-script/reference/document/list-item#setLeftToRight(Boolean)) | [ListItem](#ListItem) | Not Started | |
| [setNestingLevel(nestingLevel)](https://developers.google.com/apps-script/reference/document/list-item#setNestingLevel(Integer)) | [ListItem](#ListItem) | Not Started | |
| [setText(text)](https://developers.google.com/apps-script/reference/document/list-item#setText(String)) | [ListItem](#ListItem) | Completed | |

---
## [InlineImage](https://developers.google.com/apps-script/reference/document/inline-image)
Represents an image that is embedded within the text.
100% completed

| method | return | status | comments |
| --- | --- | --- | --- |
| [getAltDescription()](https://developers.google.com/apps-script/reference/document/inline-image#getAltDescription()) | String | Completed | |
| [getAltTitle()](https://developers.google.com/apps-script/reference/document/inline-image#getAltTitle()) | String | Completed | |
| [getBlob()](https://developers.google.com/apps-script/reference/document/inline-image#getBlob()) | [Blob](https://developers.google.com/apps-script/reference/base/blob) | Completed | |
| [getAs(contentType)](https://developers.google.com/apps-script/reference/document/inline-image#getAs(String)) | [Blob](https://developers.google.com/apps-script/reference/base/blob) | Completed | |
| [getHeight()](https://developers.google.com/apps-script/reference/document/inline-image#getHeight()) | Integer | Completed | |
| [getLinkUrl()](https://developers.google.com/apps-script/reference/document/inline-image#getLinkUrl()) | String | Completed | |
| [getWidth()](https://developers.google.com/apps-script/reference/document/inline-image#getWidth()) | Integer | Completed | |
| [setAltDescription(description)](https://developers.google.com/apps-script/reference/document/inline-image#setAltDescription(String)) | [InlineImage](#InlineImage) | Completed | |
| [setAltTitle(title)](https://developers.google.com/apps-script/reference/document/inline-image#setAltTitle(String)) | [InlineImage](#InlineImage) | Completed | |
| [setHeight(height)](https://developers.google.com/apps-script/reference/document/inline-image#setHeight(Integer)) | [InlineImage](#InlineImage) | Completed | |
| [setLinkUrl(url)](https://developers.google.com/apps-script/reference/document/inline-image#setLinkUrl(String)) | [InlineImage](#InlineImage) | Completed | |
| [setWidth(width)](https://developers.google.com/apps-script/reference/document/inline-image#setWidth(Integer)) | [InlineImage](#InlineImage) | Completed | |

---
## [Element](https://developers.google.com/apps-script/reference/document/element)
A generic element in a Google Document.
84% completed

| method | return | status | comments |
| --- | --- | --- | --- |
| [asBody()](https://developers.google.com/apps-script/reference/document/element#asBody()) | [Body](#Body) | Completed | |
| [asEquation()](https://developers.google.com/apps-script/reference/document/element#asEquation()) | [Equation](#Equation) | Not Started | |
| [asFooterSection()](https://developers.google.com/apps-script/reference/document/element#asFooterSection()) | [FooterSection](#FooterSection) | Completed | |
| [asHeaderSection()](https://developers.google.com/apps-script/reference/document/element#asHeaderSection()) | [HeaderSection](#HeaderSection) | Completed | |
| [asHorizontalRule()](https://developers.google.com/apps-script/reference/document/element#asHorizontalRule()) | [HorizontalRule](#HorizontalRule) | Completed | |
| [asInlineImage()](https://developers.google.com/apps-script/reference/document/element#asInlineImage()) | [InlineImage](#InlineImage) | Completed | |
| [asListItem()](https://developers.google.com/apps-script/reference/document/element#asListItem()) | [ListItem](#ListItem) | Completed | |
| [asPageBreak()](https://developers.google.com/apps-script/reference/document/element#asPageBreak()) | [PageBreak](#PageBreak) | Completed | |
| [asParagraph()](https://developers.google.com/apps-script/reference/document/element#asParagraph()) | [Paragraph](#Paragraph) | Completed | |
| [asTable()](https://developers.google.com/apps-script/reference/document/element#asTable()) | [Table](#Table) | Completed | |
| [asTableCell()](https://developers.google.com/apps-script/reference/document/element#asTableCell()) | [TableCell](#TableCell) | Completed | |
| [asTableRow()](https://developers.google.com/apps-script/reference/document/element#asTableRow()) | [TableRow](#TableRow) | Completed | |
| [asText()](https://developers.google.com/apps-script/reference/document/element#asText()) | [Text](#Text) | Completed | |
| [copy()](https://developers.google.com/apps-script/reference/document/element#copy()) | [Element](#Element) | Completed | |
| [getParent()](https://developers.google.com/apps-script/reference/document/element#getParent()) | [ContainerElement](#ContainerElement) | Completed | |
| [getType()](https://developers.google.com/apps-script/reference/document/element#getType()) | [ElementType](#ElementType) | Completed | |
| [isAtDocumentEnd()](https://developers.google.com/apps-script/reference/document/element#isAtDocumentEnd()) | Boolean | Not Started | |
| [merge()](https://developers.google.com/apps-script/reference/document/element#merge()) | [Element](#Element) | Not Started | |
| [removeFromParent()](https://developers.google.com/apps-script/reference/document/element#removeFromParent()) | [Element](#Element) | Completed | |

---
## Enums
| Enum | Status |
| --- | --- |
| [Attribute](https://developers.google.com/apps-script/reference/document/attribute) | Completed |
| [ElementType](https://developers.google.com/apps-script/reference/document/element-type) | Completed |
| [FontFamily](https://developers.google.com/apps-script/reference/document/font-family) | Completed |
| [GlyphType](https://developers.google.com/apps-script/reference/document/glyph-type) | Completed |
| [HorizontalAlignment](https://developers.google.com/apps-script/reference/document/horizontal-alignment) | Completed |
| [ParagraphHeading](https://developers.google.com/apps-script/reference/document/paragraph-heading) | Completed |
| [PositionedLayout](https://developers.google.com/apps-script/reference/document/positioned-layout) | Completed |
| [TabType](https://developers.google.com/apps-script/reference/document/tab-type) | Completed |
| [TextAlignment](https://developers.google.com/apps-script/reference/document/text-alignment) | Completed |
| [VerticalAlignment](https://developers.google.com/apps-script/reference/document/vertical-alignment) | Completed |