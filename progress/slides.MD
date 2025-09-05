# Slides Service Progress
**Documentation:** [Slides Service](https://developers.google.com/apps-script/reference/slides) - 4% completed
---
## [SlidesApp](https://developers.google.com/apps-script/reference/slides/slides-app)
Allows scripts to create, access, and modify Google Slides presentations.
100% completed

| method | return | status | comments |
| --- | --- | --- | --- |
| [create(name)](https://developers.google.com/apps-script/reference/slides/slides-app#create(String)) | [Presentation](#presentation) | Completed | |
| [getActivePresentation()](https://developers.google.com/apps-script/reference/slides/slides-app#getActivePresentation()) | [Presentation](#presentation) | Completed | |
| [getUi()](https://developers.google.com/apps-script/reference/slides/slides-app#getUi()) | [Ui](https://developers.google.com/apps-script/reference/base/ui) | Not Started | |
| [openById(id)](https://developers.google.com/apps-script/reference/slides/slides-app#openById(String)) | [Presentation](#presentation) | Completed | |
| [openByUrl(url)](https://developers.google.com/apps-script/reference/slides/slides-app#openByUrl(String)) | [Presentation](#presentation) | Completed | |

---
## [Presentation](https://developers.google.com/apps-script/reference/slides/presentation)
Represents a Google Slides presentation.
14% completed

| method | return | status | comments |
| --- | --- | --- | --- |
| [addEditor(emailAddress)](https://developers.google.com/apps-script/reference/slides/presentation#addEditor(String)) | [Presentation](#presentation) | Not Started | |
| [addEditors(emailAddresses)](https://developers.google.com/apps-script/reference/slides/presentation#addEditors(String)) | [Presentation](#presentation) | Not Started | |
| [addViewer(emailAddress)](https://developers.google.com/apps-script/reference/slides/presentation#addViewer(String)) | [Presentation](#presentation) | Not Started | |
| [addViewers(emailAddresses)](https://developers.google.com/apps-script/reference/slides/presentation#addViewers(String)) | [Presentation](#presentation) | Not Started | |
| [appendSlide()](https://developers.google.com/apps-script/reference/slides/presentation#appendSlide()) | [Slide](#slide) | Not Started | |
| [getEditors()](https://developers.google.com/apps-script/reference/slides/presentation#getEditors()) | [User[]](https://developers.google.com/apps-script/reference/base/user) | Not Started | |
| [getId()](https://developers.google.com/apps-script/reference/slides/presentation#getId()) | String | Completed | |
| [getMasters()](https://developers.google.com/apps-script/reference/slides/presentation#getMasters()) | [Master[]](#master) | Not Started | |
| [getName()](https://developers.google.com/apps-script/reference/slides/presentation#getName()) | String | Completed | |
| [getNotesMaster()](https://developers.google.com/apps-script/reference/slides/presentation#getNotesMaster()) | [NotesMaster](https://developers.google.com/apps-script/reference/slides/notes-master) | Not Started | |
| [getSelection()](https://developers.google.com/apps-script/reference/slides/presentation#getSelection()) | [Selection](https://developers.google.com/apps-script/reference/slides/selection) | Not Started | |
| [getSlideById(id)](https://developers.google.com/apps-script/reference/slides/presentation#getSlideById(String)) | [Slide](#slide) | Not Started | |
| [getSlides()](https://developers.google.com/apps-script/reference/slides/presentation#getSlides()) | [Slide[]](#slide) | Not Started | |
| [getUrl()](https://developers.google.com/apps-script/reference/slides/presentation#getUrl()) | String | Completed | |
| [getViewers()](https://developers.google.com/apps-script/reference/slides/presentation#getViewers()) | [User[]](https://developers.google.com/apps-script/reference/base/user) | Not Started | |
| [insertSlide(insertionIndex)](https://developers.google.com/apps-script/reference/slides/presentation#insertSlide(Integer)) | [Slide](#slide) | Not Started | |
| [removeEditor(emailAddress)](https://developers.google.com/apps-script/reference/slides/presentation#removeEditor(String)) | [Presentation](#presentation) | Not Started | |
| [removeViewer(emailAddress)](https://developers.google.com/apps-script/reference/slides/presentation#removeViewer(String)) | [Presentation](#presentation) | Not Started | |
| [saveAndClose()](https://developers.google.com/apps-script/reference/slides/presentation#saveAndClose()) | void | Completed | |
| [setName(name)](https://developers.google.com/apps-script/reference/slides/presentation#setName(String)) | void | Not Started | |

---
## [Slide](https://developers.google.com/apps-script/reference/slides/slide)
Represents a single slide in a presentation.
0% completed

| method | return | status | comments |
| --- | --- | --- | --- |
| [getShapes()](https://developers.google.com/apps-script/reference/slides/slide#getShapes()) | [Shape[]](#shape) | Not Started | |

---
## [PageElement](https://developers.google.com/apps-script/reference/slides/page-element)
A generic element on a page.
0% completed

| method | return | status | comments |
| --- | --- | --- | --- |
| [alignOnPage(alignmentPosition)](https://developers.google.com/apps-script/reference/slides/page-element#alignOnPage(AlignmentPosition)) | [PageElement](#pageelement) | Not Started | |

---
## [Shape](https://developers.google.com/apps-script/reference/slides/shape)
Represents a shape on a slide.
0% completed

| method | return | status | comments |
| --- | --- | --- | --- |
| [getText()](https://developers.google.com/apps-script/reference/slides/shape#getText()) | [TextRange](#textrange) | Not Started | |

---
## [Color](https://developers.google.com/apps-script/reference/slides/color)
A color, such as for a shape's fill.
100% completed

| method | return | status | comments |
| --- | --- | --- | --- |
| [asRgbColor()](https://developers.google.com/apps-script/reference/slides/color#asRgbColor()) | [RgbColor](#rgbcolor) | Completed | |
| [asThemeColor()](https://developers.google.com/apps-script/reference/slides/color#asThemeColor()) | [ThemeColor](#themecolor) | Completed | |
| [getColorType()](https://developers.google.com/apps-script/reference/slides/color#getColorType()) | [ColorType](#colortype) | Completed | |

---
## [RgbColor](https://developers.google.com/apps-script/reference/slides/rgb-color)
An RGB color.
100% completed

| method | return | status | comments |
| --- | --- | --- | --- |
| [asHexString()](https://developers.google.com/apps-script/reference/slides/rgb-color#asHexString()) | String | Completed | |
| [getBlue()](https://developers.google.com/apps-script/reference/slides/rgb-color#getBlue()) | Integer | Completed | |
| [getGreen()](https://developers.google.com/apps-script/reference/slides/rgb-color#getGreen()) | Integer | Completed | |
| [getRed()](https://developers.google.com/apps-script/reference/slides/rgb-color#getRed()) | Integer | Completed | |

---
## [ThemeColor](https://developers.google.com/apps-script/reference/slides/theme-color)
A theme color.
100% completed

| method | return | status | comments |
| --- | --- | --- | --- |
| [getThemeColorType()](https://developers.google.com/apps-script/reference/slides/theme-color#getThemeColorType()) | [ThemeColorType](#themecolortype) | Completed | |

---
## Enums
| Enum | Status |
| --- | --- |
| [AlignmentPosition](https://developers.google.com/apps-script/reference/slides/alignment-position) | Completed |
| [ArrowStyle](https://developers.google.com/apps-script/reference/slides/arrow-style) | Completed |
| [AudioSourceType](https://developers.google.com/apps-script/reference/slides/audio-source-type) | Completed |
| [AutoTextType](https://developers.google.com/apps-script/reference/slides/auto-text-type) | Completed |
| [AutofitType](https://developers.google.com/apps-script/reference/slides/autofit-type) | Completed |
| [CellMergeState](https://developers.google.com/apps-script/reference/slides/cell-merge-state) | Completed |
| [ColorType](https://developers.google.com/apps-script/reference/slides/color-type) | Completed |
| [ContentAlignment](https://developers.google.com/apps-script/reference/slides/content-alignment) | Completed |
| [DashStyle](https://developers.google.com/apps-script/reference/slides/dash-style) | Completed |
| [FillType](https://developers.google.com/apps-script/reference/slides/fill-type) | Completed |
| [LineCategory](https://developers.google.com/apps-script/reference/slides/line-category) | Completed |
| [LineFillType](https://developers.google.com/apps-script/reference/slides/line-fill-type) | Completed |
| [LineType](https://developers.google.com/apps-script/reference/slides/line-type) | Completed |
| [LinkType](https://developers.google.com/apps-script/reference/slides/link-type) | Completed |
| [ListPreset](https://developers.google.com/apps-script/reference/slides/list-preset) | Completed |
| [PageBackgroundType](https://developers.google.com/apps-script/reference/slides/page-background-type) | Completed |
| [PageElementType](https://developers.google.com/apps-script/reference/slides/page-element-type) | Completed |
| [PageType](https://developers.google.com/apps-script/reference/slides/page-type) | Completed |
| [ParagraphAlignment](https://developers.google.com/apps-script/reference/slides/paragraph-alignment) | Completed |
| [PlaceholderType](https://developers.google.com/apps-script/reference/slides/placeholder-type) | Completed |
| [PredefinedLayout](https://developers.google.com/apps-script/reference/slides/predefined-layout) | Completed |
| [RadialGradientCenter](https://developers.google.com/apps-script/reference/slides/radial-gradient-center) | Completed |
| [RectanglePosition](https://developers.google.com/apps-script/reference/slides/rectangle-position) | Completed |
| [SelectionType](https://developers.google.com/apps-script/reference/slides/selection-type) | Completed |
| [ShadowType](https://developers.google.com/apps-script/reference/slides/shadow-type) | Completed |
| [ShapeType](https://developers.google.com/apps-script/reference/slides/shape-type) | Completed |
| [SheetsChartEmbedType](https://developers.google.com/apps-script/reference/slides/sheets-chart-embed-type) | Completed |
| [SlideLinkingMode](https://developers.google.com/apps-script/reference/slides/slide-linking-mode) | Completed |
| [SlidePosition](https://developers.google.com/apps-script/reference/slides/slide-position) | Completed |
| [SpacingMode](https://developers.google.com/apps-script/reference/slides/spacing-mode) | Completed |
| [TextBaselineOffset](https://developers.google.com/apps-script/reference/slides/text-baseline-offset) | Completed |
| [TextDirection](https://developers.google.com/apps-script/reference/slides/text-direction) | Completed |
| [ThemeColorType](https://developers.google.com/apps-script/reference/slides/theme-color-type) | Completed |
| [VideoSourceType](https://developers.google.com/apps-script/reference/slides/video-source-type) | Completed |