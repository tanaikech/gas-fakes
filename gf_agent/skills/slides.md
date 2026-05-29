# Service: slides

## Class: AffineTransform

Supported Methods:
- `getScaleX()`
- `getScaleY()`
- `getShearX()`
- `getShearY()`
- `getTranslateX()`
- `getTranslateY()`
- `toBuilder()`

## Class: AffineTransformBuilder

Supported Methods:
- `build()`
- `setScaleX(Number)`
- `setScaleY(Number)`
- `setShearX(Number)`
- `setShearY(Number)`
- `setTranslateX(Number)`
- `setTranslateY(Number)`

## Class: Autofit

Supported Methods:
- `disableAutofit()`
- `getAutofitType()`
- `getFontScale()`
- `getLineSpacingReduction()`

## Class: AutoText

Supported Methods:
- `getAutoTextType()`
- `getIndex()`
- `getRange()`

## Class: Color

Supported Methods:
- `asRgbColor()`
- `asThemeColor()`
- `getColorType()`

## Class: ColorScheme

Supported Methods:
- `getConcreteColor(ThemeColorType)`
- `getThemeColors()`
- `setConcreteColor(ThemeColorType,Color)`
- `setConcreteColor(ThemeColorType,Integer,Integer,Integer)`
- `setConcreteColor(ThemeColorType,String)`

## Class: ConnectionSite

Supported Methods:
- `getIndex()`
- `getPageElement()`

## Class: Fill

Supported Methods:
- `getSolidFill()`
- `getType()`
- `isVisible()`
- `setSolidFill(Color,Number)`
- `setSolidFill(Color)`
- `setSolidFill(Integer,Integer,Integer,Number)`
- `setSolidFill(Integer,Integer,Integer)`
- `setSolidFill(String,Number)`
- `setSolidFill(String)`
- `setSolidFill(ThemeColorType,Number)`
- `setSolidFill(ThemeColorType)`
- `setTransparent()`

## Class: Group

Supported Methods:
- `getChildren()`
- `getObjectId()`
- `ungroup()`

## Class: Layout

Supported Methods:
- `getColorScheme()`
- `getMaster()`
- `getObjectId()`

## Class: Line

Supported Methods:
- `getConnectionSites()`
- `getDashStyle()`
- `getEnd()`
- `getEndArrow()`
- `getEndConnection()`
- `getHeight()`
- `getLeft()`
- `getLineCategory()`
- `getLineFill()`
- `getLineType()`
- `getObjectId()`
- `getStart()`
- `getStartArrow()`
- `getStartConnection()`
- `getTop()`
- `getWeight()`
- `getWidth()`
- `isConnector()`
- `reroute()`
- `setDashStyle(DashStyle)`
- `setEnd(Number,Number)`
- `setEnd(Point)`
- `setEndArrow(ArrowStyle)`
- `setEndConnection(ConnectionSite)`
- `setHeight(Number)`
- `setStart(Number,Number)`
- `setStart(Point)`
- `setStartArrow(ArrowStyle)`
- `setStartConnection(ConnectionSite)`
- `setWeight(Number)`
- `setWidth(Number)`

## Class: LineFill

Supported Methods:
- `getFillType()`
- `getSolidFill()`
- `setSolidFill(Color,Number)`
- `setSolidFill(Color)`
- `setSolidFill(Integer,Integer,Integer,Number)`
- `setSolidFill(Integer,Integer,Integer)`
- `setSolidFill(String,Number)`
- `setSolidFill(String)`
- `setSolidFill(ThemeColorType,Number)`
- `setSolidFill(ThemeColorType)`

## Class: Link

Supported Methods:
- `getLinkType()`
- `getSlideId()`
- `getUrl()`

## Class: Master

Supported Methods:
- `getColorScheme()`
- `getObjectId()`

## Class: PageElement

Supported Methods:
- `alignOnPage(AlignmentPosition)`
- `asGroup()`
- `asLine()`
- `asShape()`
- `asTable()`
- `bringForward()`
- `bringToFront()`
- `getConnectionSites()`
- `getDescription()`
- `getHeight()`
- `getLeft()`
- `getObjectId()`
- `getPageElementType()`
- `getParentGroup()`
- `getParentPage()`
- `getRotation()`
- `getTitle()`
- `getTop()`
- `getTransform()`
- `getWidth()`
- `preconcatenateTransform(AffineTransform)`
- `remove()`
- `sendBackward()`
- `sendToBack()`
- `setDescription(String)`
- `setHeight(Number)`
- `setLeft(Number)`
- `setRotation(Number)`
- `setTitle(String)`
- `setTop(Number)`
- `setTransform(AffineTransform)`
- `setWidth(Number)`

## Class: Paragraph

Supported Methods:
- `getIndex()`
- `getRange()`

## Class: Point

Supported Methods:
- `getX()`
- `getY()`

## Class: Presentation

Supported Methods:
- `appendSlide()`
- `appendSlide(Layout)`
- `appendSlide(PredefinedLayout)`
- `appendSlide(Slide,SlideLinkingMode)`
- `appendSlide(Slide)`
- `getId()`
- `getMasters()`
- `getName()`
- `getSlideById(String)`
- `getSlides()`
- `getUrl()`
- `insertSlide(Integer,Layout)`
- `insertSlide(Integer,PredefinedLayout)`
- `insertSlide(Integer,Slide,SlideLinkingMode)`
- `insertSlide(Integer,Slide)`
- `insertSlide(Integer)`
- `saveAndClose()`

## Class: Shape

Supported Methods:
- `getAutofit()`
- `getConnectionSites()`
- `getFill()`
- `getText()`

## Class: Slide

Supported Methods:
- `duplicate()`
- `getBackground()`
- `getColorScheme()`
- `getLayout()`
- `getNotesPage()`
- `getObjectId()`
- `getPageElements()`
- `getShapes()`
- `getTables()`
- `group(PageElement)`
- `insertLine(Line)`
- `insertLine(LineCategory,ConnectionSite,ConnectionSite)`
- `insertLine(LineCategory,Number,Number,Number,Number)`
- `insertShape(Shape)`
- `insertShape(ShapeType,Number,Number,Number,Number)`
- `insertShape(ShapeType)`
- `insertTable(Integer,Integer,Number,Number,Number,Number)`
- `insertTable(Integer,Integer)`
- `insertTable(Table)`
- `insertTextBox(String,Number,Number,Number,Number)`
- `insertTextBox(String)`
- `move(Integer)`
- `remove()`
- `replaceAllText(String,String,Boolean)`
- `replaceAllText(String,String)`

## Class: SlidesApp

Supported Methods:
- `create(String)`
- `getActivePresentation()`
- `getUi()`
- `newAffineTransformBuilder()`
- `openById(String)`
- `openByUrl(String)`

## Class: SolidFill

Supported Methods:
- `getAlpha()`
- `getColor()`

## Class: Table

Supported Methods:
- `getNumColumns()`
- `getNumRows()`
- `getRow(Integer)`

## Class: TableCell

Supported Methods:
- `getText()`

## Class: TableRow

Supported Methods:
- `getCell(Integer)`
- `getNumCells()`

## Class: TextRange

Supported Methods:
- `asRenderedString()`
- `asString()`
- `clear()`
- `clear(Integer,Integer)`
- `find(String,Integer)`
- `find(String)`
- `getAutoTexts()`
- `getEndIndex()`
- `getParagraphs()`
- `getStartIndex()`
- `insertText(Integer,String)`
- `isEmpty()`
- `setText(String)`

## Class: TextStyle

Supported Methods:
- `getFontFamily()`
- `getFontSize()`
- `getForegroundColor()`
- `getLink()`
- `isBold()`
- `isItalic()`
- `isStrikethrough()`
- `isUnderline()`
- `setBold(Boolean)`
- `setFontFamily(String)`
- `setFontSize(Number)`
- `setForegroundColor(Color)`
- `setForegroundColor(Integer,Integer,Integer)`
- `setForegroundColor(String)`
- `setForegroundColor(ThemeColorType)`
- `setItalic(Boolean)`
- `setStrikethrough(Boolean)`
- `setUnderline(Boolean)`

## Class: ThemeColor

Supported Methods:
- `getColorType()`
- `getThemeColorType()`

