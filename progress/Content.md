# [Content](https://developers.google.com/apps-script/reference/content)

This service allows scripts to serve text in various forms, such as text, XML, or JSON. See also the guide to Content Service. If you deploy the following script as a web app, you will see "Hello, world!" in the browser:

## Class: [ContentService](https://developers.google.com/apps-script/reference/content/content-service)

Service for returning text content from a script.

| Method | Description | Return Type | Return Description | Status | Implementation |
|--- |--- |--- |--- |--- |--- |
| [createTextOutput()](https://developers.google.com/apps-script/reference/content/content-service#createTextOutput()) | Create a new TextOutput object. | [TextOutput](#class-textoutput) | the new TextOutput object. | not started |  |
| [createTextOutput(String)](https://developers.google.com/apps-script/reference/content/content-service#createTextOutput(String)) | Create a new TextOutput object that can serve the given content. | [TextOutput](#class-textoutput) | the new TextOutput object. | not started |  |

## Class: [TextOutput](https://developers.google.com/apps-script/reference/content/text-output)

A TextOutput object that can be served from a script.

| Method | Description | Return Type | Return Description | Status | Implementation |
|--- |--- |--- |--- |--- |--- |
| [append(String)](https://developers.google.com/apps-script/reference/content/text-output#append(String)) | Appends new content to the content that will be served. | [TextOutput](#class-textoutput) | this TextOutput itself, useful for chaining | not started |  |
| [clear()](https://developers.google.com/apps-script/reference/content/text-output#clear()) | Clears the current content. | [TextOutput](#class-textoutput) | this TextOutput itself, useful for chaining | not started |  |
| [downloadAsFile(String)](https://developers.google.com/apps-script/reference/content/text-output#downloadAsFile(String)) | Tells browsers to download rather than display this content. | [TextOutput](#class-textoutput) | the TextOutput object, useful for chaining | not started |  |
| [getContent()](https://developers.google.com/apps-script/reference/content/text-output#getContent()) | Gets the content that will be served. | String | the content that will be served | not started |  |
| [getFileName()](https://developers.google.com/apps-script/reference/content/text-output#getFileName()) | Returns the file name to download this file as, or null if it should be displayed rather than downloaded. | String | the file name | not started |  |
| [getMimeType()](https://developers.google.com/apps-script/reference/content/text-output#getMimeType()) | Get the mime type this content will be served with. | [MimeType](#enum-mimetype) | the mime type this will be served with | not started |  |
| [setContent(String)](https://developers.google.com/apps-script/reference/content/text-output#setContent(String)) | Sets the content that will be served. | [TextOutput](#class-textoutput) | this TextOutput itself, useful for chaining | not started |  |
| [setMimeType(MimeType)](https://developers.google.com/apps-script/reference/content/text-output#setMimeType(MimeType)) | Sets the mime type for content that will be served. The default is plain text. | [TextOutput](#class-textoutput) | this TextOutput itself, useful for chaining | not started |  |

## Enum: [MimeType](https://developers.google.com/apps-script/reference/content/mime-type)

An enum for mime types that can be served from a script.

| Property | Description | Status | Implementation |
|--- |--- |--- |--- |
| CSV | CSV Mime Type | not started |  |
| ICAL | ICAL Mime Type | not started |  |
| JAVASCRIPT | JAVASCRIPT Mime Type | not started |  |
| JSON | JSON Mime Type | not started |  |
| TEXT | TEXT Mime Type | not started |  |
| VCARD | VCARD Mime Type | not started |  |

