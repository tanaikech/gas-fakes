# Service: document

## Class: Body

Supported Methods:
- `appendImage(BlobSource)`
- `appendImage(InlineImage)`
- `appendListItem(ListItem)`
- `appendListItem(String)`
- `appendPageBreak()`
- `appendPageBreak(PageBreak)`
- `appendParagraph(Paragraph)`
- `appendParagraph(String)`
- `appendTable()`
- `appendTable(String)`
- `appendTable(Table)`
- `clear()`
- `copy()`
- `getChild(Integer)`
- `getChildIndex(Element)`
- `getImages()`
- `getListItems()`
- `getMarginBottom()`
- `getMarginLeft()`
- `getMarginRight()`
- `getMarginTop()`
- `getNumChildren()`
- `getPageHeight()`
- `getPageWidth()`
- `getParagraphs()`
- `getParent()`
- `getTables()`
- `getText()`
- `getType()`
- `insertImage(Integer,BlobSource)`
- `insertImage(Integer,InlineImage)`
- `insertListItem(Integer,ListItem)`
- `insertListItem(Integer,String)`
- `insertPageBreak(Integer,PageBreak)`
- `insertPageBreak(Integer)`
- `insertParagraph(Integer,Paragraph)`
- `insertParagraph(Integer,String)`
- `insertTable(Integer,String)`
- `insertTable(Integer,Table)`
- `insertTable(Integer)`
- `setAttributes(Object)`
- `setHeadingAttributes(ParagraphHeading,Object)`
- `setMarginBottom(Number)`
- `setMarginLeft(Number)`
- `setMarginRight(Number)`
- `setMarginTop(Number)`
- `setPageHeight(Number)`
- `setPageWidth(Number)`
- `setText(String)`
- `setTextAlignment(TextAlignment)`

## Class: Bookmark

Supported Methods:
- `getId()`
- `getPosition()`
- `remove()`

## Class: ContainerElement

Supported Methods:
- `copy()`
- `getChild(Integer)`
- `getChildIndex(Element)`
- `getLinkUrl()`
- `getNumChildren()`
- `getParent()`
- `getType()`
- `setLinkUrl(String)`

## Class: Document

Supported Methods:
- `addEditor(String)`
- `addEditor(User)`
- `addEditors(String)`
- `addFooter()`
- `addHeader()`
- `addViewer(String)`
- `addViewer(User)`
- `addViewers(String)`
- `getBody()`
- `getEditors()`
- `getFooter()`
- `getFootnotes()`
- `getHeader()`
- `getId()`
- `getName()`
- `getTabs()`
- `getUrl()`
- `getViewers()`
- `newRange()`
- `removeEditor(String)`
- `removeEditor(User)`
- `removeViewer(String)`
- `removeViewer(User)`
- `saveAndClose()`
- `setName(String)`

## Class: DocumentApp

Supported Methods:
- `create(String)`
- `getActiveDocument()`
- `getUi()`
- `openById(String)`
- `openByUrl(String)`

## Class: DocumentTab

Supported Methods:
- `addHeader()`
- `getBody()`
- `getHeader()`

## Class: FooterSection

Supported Methods:
- `copy()`
- `getChild(Integer)`
- `getChildIndex(Element)`
- `getImages()`
- `getListItems()`
- `getNumChildren()`
- `getParagraphs()`
- `getParent()`
- `getTables()`
- `getType()`

## Class: Footnote

Supported Methods:
- `copy()`
- `getFootnoteContents()`
- `getParent()`
- `getType()`

## Class: FootnoteSection

Supported Methods:
- `appendParagraph(Paragraph)`
- `appendParagraph(String)`
- `clear()`
- `copy()`
- `getChild(Integer)`
- `getChildIndex(Element)`
- `getNumChildren()`
- `getParagraphs()`
- `getParent()`
- `getText()`
- `getType()`
- `setText(String)`

## Class: HeaderSection

Supported Methods:
- `copy()`
- `getChild(Integer)`
- `getChildIndex(Element)`
- `getImages()`
- `getListItems()`
- `getNumChildren()`
- `getParagraphs()`
- `getParent()`
- `getTables()`
- `getType()`

## Class: HorizontalRule

Supported Methods:
- `copy()`
- `getParent()`
- `getType()`

## Class: InlineImage

Supported Methods:
- `copy()`
- `getAltDescription()`
- `getAltTitle()`
- `getAs(String)`
- `getBlob()`
- `getHeight()`
- `getLinkUrl()`
- `getParent()`
- `getType()`
- `getWidth()`
- `setAltDescription(String)`
- `setAltTitle(String)`
- `setHeight(Integer)`
- `setLinkUrl(String)`
- `setWidth(Integer)`

## Class: ListItem

Supported Methods:
- `addPositionedImage(BlobSource)`
- `appendInlineImage(BlobSource)`
- `appendInlineImage(InlineImage)`
- `appendText(String)`
- `appendText(Text)`
- `clear()`
- `copy()`
- `editAsText()`
- `getAlignment()`
- `getAttributes()`
- `getChild(Integer)`
- `getChildIndex(Element)`
- `getGlyphType()`
- `getHeading()`
- `getIndentEnd()`
- `getIndentFirstLine()`
- `getIndentStart()`
- `getLineSpacing()`
- `getLinkUrl()`
- `getListId()`
- `getNestingLevel()`
- `getNumChildren()`
- `getParent()`
- `getSpacingAfter()`
- `getSpacingBefore()`
- `getText()`
- `getType()`
- `insertInlineImage(Integer,BlobSource)`
- `insertInlineImage(Integer,InlineImage)`
- `isLeftToRight()`
- `setAlignment(HorizontalAlignment)`
- `setGlyphType(GlyphType)`
- `setHeading(ParagraphHeading)`
- `setIndentEnd(Number)`
- `setIndentFirstLine(Number)`
- `setIndentStart(Number)`
- `setLeftToRight(Boolean)`
- `setLineSpacing(Number)`
- `setLinkUrl(String)`
- `setListId(ListItem)`
- `setNestingLevel(Integer)`
- `setSpacingAfter(Number)`
- `setSpacingBefore(Number)`
- `setText(String)`

## Class: PageBreak

Supported Methods:
- `copy()`
- `getParent()`
- `getType()`

## Class: Paragraph

Supported Methods:
- `addPositionedImage(BlobSource)`
- `appendInlineImage(BlobSource)`
- `appendInlineImage(InlineImage)`
- `appendText(String)`
- `appendText(Text)`
- `copy()`
- `editAsText()`
- `getAlignment()`
- `getAttributes()`
- `getChild(Integer)`
- `getChildIndex(Element)`
- `getHeading()`
- `getIndentEnd()`
- `getIndentFirstLine()`
- `getIndentStart()`
- `getLineSpacing()`
- `getLinkUrl()`
- `getNumChildren()`
- `getParent()`
- `getSpacingAfter()`
- `getSpacingBefore()`
- `getText()`
- `getType()`
- `insertInlineImage(Integer,BlobSource)`
- `insertInlineImage(Integer,InlineImage)`
- `isLeftToRight()`
- `setAlignment(HorizontalAlignment)`
- `setHeading(ParagraphHeading)`
- `setIndentEnd(Number)`
- `setIndentFirstLine(Number)`
- `setIndentStart(Number)`
- `setLeftToRight(Boolean)`
- `setLineSpacing(Number)`
- `setLinkUrl(String)`
- `setSpacingAfter(Number)`
- `setSpacingBefore(Number)`

## Class: Position

Supported Methods:
- `getElement()`
- `getOffset()`
- `insertBookmark()`

## Class: PositionedImage

Supported Methods:
- `getAs(String)`
- `getBlob()`
- `getHeight()`
- `getLayout()`
- `getLeftOffset()`
- `getTopOffset()`
- `getWidth()`

## Class: Range

Supported Methods:
- `getRangeElements()`

## Class: RangeBuilder

Supported Methods:
- `addElement(Element)`
- `addElement(Text,Integer,Integer)`
- `addRange(Range)`
- `build()`

## Class: RangeElement

Supported Methods:
- `getElement()`

## Class: Tab

Supported Methods:
- `asDocumentTab()`
- `getChildTabs()`
- `getId()`
- `getIndex()`
- `getTitle()`

## Class: Table

Supported Methods:
- `copy()`
- `getBorderColor()`
- `getBorderWidth()`
- `getCell(Integer,Integer)`
- `getChild(Integer)`
- `getChildIndex(Element)`
- `getLinkUrl()`
- `getNumChildren()`
- `getNumRows()`
- `getParent()`
- `getRow(Integer)`
- `getText()`
- `getType()`
- `setBorderColor(String)`
- `setBorderWidth(Number)`
- `setLinkUrl(String)`

## Class: TableCell

Supported Methods:
- `copy()`
- `getBackgroundColor()`
- `getChild(Integer)`
- `getChildIndex(Element)`
- `getLinkUrl()`
- `getNumChildren()`
- `getPaddingBottom()`
- `getPaddingLeft()`
- `getPaddingRight()`
- `getPaddingTop()`
- `getParent()`
- `getText()`
- `getType()`
- `getVerticalAlignment()`
- `getWidth()`
- `setBackgroundColor(String)`
- `setLinkUrl(String)`
- `setPaddingBottom(Number)`
- `setPaddingLeft(Number)`
- `setPaddingRight(Number)`
- `setPaddingTop(Number)`
- `setVerticalAlignment(VerticalAlignment)`
- `setWidth(Number)`

## Class: TableRow

Supported Methods:
- `copy()`
- `getCell(Integer)`
- `getChild(Integer)`
- `getChildIndex(Element)`
- `getLinkUrl()`
- `getMinimumHeight()`
- `getNumCells()`
- `getNumChildren()`
- `getParent()`
- `getText()`
- `getType()`
- `setLinkUrl(String)`
- `setMinimumHeight(Number)`

## Class: Text

Supported Methods:
- `copy()`
- `getAttributes()`
- `getAttributes(Integer)`
- `getBackgroundColor()`
- `getBackgroundColor(Integer)`
- `getFontFamily()`
- `getFontFamily(Integer)`
- `getFontSize()`
- `getFontSize(Integer)`
- `getForegroundColor()`
- `getForegroundColor(Integer)`
- `getLinkUrl()`
- `getLinkUrl(Integer)`
- `getParent()`
- `getText()`
- `getType()`
- `isBold()`
- `isBold(Integer)`
- `isItalic()`
- `isItalic(Integer)`
- `isStrikethrough()`
- `isStrikethrough(Integer)`
- `isUnderline()`
- `isUnderline(Integer)`
- `setAttributes(Integer,Integer,Object)`
- `setAttributes(Object)`
- `setBackgroundColor(Integer,Integer,String)`
- `setBackgroundColor(String)`
- `setBold(Boolean)`
- `setBold(Integer,Integer,Boolean)`
- `setFontFamily(Integer,Integer,String)`
- `setFontFamily(String)`
- `setFontSize(Integer,Integer,Number)`
- `setFontSize(Number)`
- `setForegroundColor(Integer,Integer,String)`
- `setForegroundColor(String)`
- `setItalic(Boolean)`
- `setItalic(Integer,Integer,Boolean)`
- `setLinkUrl(Integer,Integer,String)`
- `setLinkUrl(String)`
- `setStrikethrough(Boolean)`
- `setStrikethrough(Integer,Integer,Boolean)`
- `setUnderline(Boolean)`
- `setUnderline(Integer,Integer,Boolean)`

