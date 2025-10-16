# [HTML](https://developers.google.com/apps-script/reference/html)

This service allows Apps Script applications to return HTML, usually as a user interface. If you're new to using this class, we recommend you also see the guide to Html Service

## Class: [HtmlOutput](https://developers.google.com/apps-script/reference/html/html-output)

An HtmlOutput object that can be served from a script. Due to security considerations, scripts cannot directly return HTML to a browser. Instead, they must sanitize it so that it cannot perform malicious actions. You can return sanitized HTML like this:

| Method | Description | Return Type | Return Description | Status | Implementation |
|--- |--- |--- |--- |--- |--- |
| [addMetaTag(String,String)](https://developers.google.com/apps-script/reference/html/html-output#addMetaTag(String,String)) |  |  |  | not started |  |
| [append(String)](https://developers.google.com/apps-script/reference/html/html-output#append(String)) | Appends new content to the content of this HtmlOutput. Use this only for content from a trusted source, because it is not escaped. | [HtmlOutput](#class-htmloutput) | This output, for chaining. | not started |  |
| [appendUntrusted(String)](https://developers.google.com/apps-script/reference/html/html-output#appendUntrusted(String)) | Appends new content to the content of this HtmlOutput, using contextual escaping. | [HtmlOutput](#class-htmloutput) | This output, for chaining. | not started |  |
| [asTemplate()](https://developers.google.com/apps-script/reference/html/html-output#asTemplate()) | Returns an HtmlTemplate backed by this HtmlOutput. This method can be used to build up a template incrementally. Future changes to HtmlOutput affect the contents of the HtmlTemplate as well. | [HtmlTemplate](#class-htmltemplate) | The new HtmlTemplate. | not started |  |
| [clear()](https://developers.google.com/apps-script/reference/html/html-output#clear()) | Clears the current content. | [HtmlOutput](#class-htmloutput) | This output, for chaining. | not started |  |
| [getAs(String)](https://developers.google.com/apps-script/reference/html/html-output#getAs(String)) | Return the data inside this object as a blob converted to the specified content type. This method adds the appropriate extension to the filename—for example, "myfile.pdf". However, it assumes that the part of the filename that follows the last period (if any) is an existing extension that should be replaced. Consequently, "ShoppingList.12.25.2014" becomes "ShoppingList.12.25.pdf". | Blob | The data as a blob. | not started |  |
| [getBlob()](https://developers.google.com/apps-script/reference/html/html-output#getBlob()) | Return the data inside this object as a blob. | Blob | The data as a blob. | not started |  |
| [getContent()](https://developers.google.com/apps-script/reference/html/html-output#getContent()) | Gets the content of this HtmlOutput. | String | The content that is served. | not started |  |
| [getFaviconUrl()](https://developers.google.com/apps-script/reference/html/html-output#getFaviconUrl()) | Gets the URL for a favicon link tag added to the page by calling setFaviconUrl(iconUrl). Favicon link tags included directly in an Apps Script HTML file are ignored. | String | The URL of the favicon image. | not started |  |
| [getHeight()](https://developers.google.com/apps-script/reference/html/html-output#getHeight()) | Gets the initial height of the custom dialog in Google Docs, Sheets, or Forms. If the HtmlOutput is published as a web app instead, this method returns null. To resize a dialog that is already open, call google.script.host.setHeight(height) in client-side code. | Integer | The height, in pixels. | not started |  |
| [getMetaTags()](https://developers.google.com/apps-script/reference/html/html-output#getMetaTags()) | Gets an array of objects that represent meta tags added to the page by calling addMetaTag(name, content). Meta tags included directly in an Apps Script HTML file are ignored. | [HtmlOutputMetaTag[]](#class-htmloutputmetatag) | An array of objects that represent meta tags added to the page by calling addMetaTag(name, content). | not started |  |
| [getTitle()](https://developers.google.com/apps-script/reference/html/html-output#getTitle()) | Gets the title of the output page. Note that the <title> HTML element is ignored. | String | The title of the page. | not started |  |
| [getWidth()](https://developers.google.com/apps-script/reference/html/html-output#getWidth()) | Gets the initial width of the custom dialog in Google Docs, Sheets, or Forms. If the HtmlOutput is published as a web app instead, this method returns null. To resize a dialog that is already open, call google.script.host.setWidth(width) in client-side code. | Integer | The width in pixels. | not started |  |
| [setContent(String)](https://developers.google.com/apps-script/reference/html/html-output#setContent(String)) | Sets the content of this HtmlOutput. | [HtmlOutput](#class-htmloutput) | This output, for chaining. | not started |  |
| [setFaviconUrl(String)](https://developers.google.com/apps-script/reference/html/html-output#setFaviconUrl(String)) | Adds a link tag for a favicon to the page. Favicon link tags included directly in an Apps Script HTML file are ignored. | [HtmlOutput](#class-htmloutput) | This output, for chaining. | not started |  |
| [setHeight(Integer)](https://developers.google.com/apps-script/reference/html/html-output#setHeight(Integer)) | Sets the initial height of the custom dialog in Google Docs, Sheets, or Forms. If the HtmlOutput is published as a web app instead, this method has no effect. To resize a dialog that is already open, call google.script.host.setHeight(height) in client-side code. | [HtmlOutput](#class-htmloutput) | This output, for chaining. | not started |  |
| [setSandboxMode(SandboxMode)](https://developers.google.com/apps-script/reference/html/html-output#setSandboxMode(SandboxMode)) | This method now has no effect — previously it set the sandbox mode used for client-side scripts. To protect users from being served malicious HTML or JavaScript, client-side code served from HTML service executes in a security sandbox that imposes restrictions on the code. Originally this method allowed script authors to choose between different versions of the sandbox, but now all scripts now use IFRAME mode regardless of what sandbox mode is set. For more information, see the guide to restrictions in HTML service. | [HtmlOutput](#class-htmloutput) | This output, for chaining. | not started |  |
| [setTitle(String)](https://developers.google.com/apps-script/reference/html/html-output#setTitle(String)) | Sets the title of the output page. For web apps, this is the title of the entire page, while for HtmlOutput shown in Google Sheets, this is the dialog title. | [HtmlOutput](#class-htmloutput) | This output, for chaining. | not started |  |
| [setWidth(Integer)](https://developers.google.com/apps-script/reference/html/html-output#setWidth(Integer)) | Sets the initial width of a custom dialog in Google Docs, Sheets, or Forms. If the HtmlOutput is published as a web app instead, this method has no effect. To resize a dialog that is already open, call google.script.host.setWidth(width) in client-side code. | [HtmlOutput](#class-htmloutput) | This output, for chaining. | not started |  |
| [setXFrameOptionsMode(XFrameOptionsMode)](https://developers.google.com/apps-script/reference/html/html-output#setXFrameOptionsMode(XFrameOptionsMode)) | Sets the state of the page's X-Frame-Options header, which controls clickjacking prevention. | [HtmlOutput](#class-htmloutput) | This output, for chaining. | not started |  |

## Class: [HtmlOutputMetaTag](https://developers.google.com/apps-script/reference/html/html-output-meta-tag)

An object that represents a meta tag added to the page by calling HtmlOutput.addMetaTag(name, content).

| Method | Description | Return Type | Return Description | Status | Implementation |
|--- |--- |--- |--- |--- |--- |
| [getContent()](https://developers.google.com/apps-script/reference/html/html-output-meta-tag#getContent()) | Gets the content of this meta tag. | String | the content of this meta tag. | not started |  |
| [getName()](https://developers.google.com/apps-script/reference/html/html-output-meta-tag#getName()) | Gets the name of this HtmlOutputMetaTag. | String | the name of this meta tag. | not started |  |

## Class: [HtmlService](https://developers.google.com/apps-script/reference/html/html-service)

Service for returning HTML and other text content from a script.

| Method | Description | Return Type | Return Description | Status | Implementation |
|--- |--- |--- |--- |--- |--- |
| [createHtmlOutput()](https://developers.google.com/apps-script/reference/html/html-service#createHtmlOutput()) | Creates a new HtmlOutput object that can be returned from the script. | [HtmlOutput](#class-htmloutput) | the new HtmlOutput object | not started |  |
| [createHtmlOutput(BlobSource)](https://developers.google.com/apps-script/reference/html/html-service#createHtmlOutput(BlobSource)) | Creates a new HtmlOutput object from a BlobSource resource. | [HtmlOutput](#class-htmloutput) | the new HtmlOutput object | not started |  |
| [createHtmlOutput(String)](https://developers.google.com/apps-script/reference/html/html-service#createHtmlOutput(String)) | Creates a new HtmlOutput object that can be returned from the script. | [HtmlOutput](#class-htmloutput) | the new HtmlOutput object | not started |  |
| [createHtmlOutputFromFile(String)](https://developers.google.com/apps-script/reference/html/html-service#createHtmlOutputFromFile(String)) | Creates a new HtmlOutput object from a file in the code editor. | [HtmlOutput](#class-htmloutput) | the new HtmlOutput object | not started |  |
| [createTemplate(BlobSource)](https://developers.google.com/apps-script/reference/html/html-service#createTemplate(BlobSource)) | Creates a new HtmlTemplate object from a BlobSource resource. | [HtmlTemplate](#class-htmltemplate) | the new HtmlTemplate object | not started |  |
| [createTemplate(String)](https://developers.google.com/apps-script/reference/html/html-service#createTemplate(String)) | Creates a new HtmlTemplate object that can be returned from the script. | [HtmlTemplate](#class-htmltemplate) | the new HtmlTemplate object | not started |  |
| [createTemplateFromFile(String)](https://developers.google.com/apps-script/reference/html/html-service#createTemplateFromFile(String)) | Creates a new HtmlTemplate object from a file in the code editor. | [HtmlTemplate](#class-htmltemplate) | the new HtmlTemplate object | not started |  |
| [getUserAgent()](https://developers.google.com/apps-script/reference/html/html-service#getUserAgent()) | Gets the user-agent string for the current browser. Returns null for most script executions if not used in a web app's doGet() or doPost() function. | String | the user-agent string | not started |  |

## Class: [HtmlTemplate](https://developers.google.com/apps-script/reference/html/html-template)

A template object for dynamically constructing HTML. For more information, see the guide to templates.

| Method | Description | Return Type | Return Description | Status | Implementation |
|--- |--- |--- |--- |--- |--- |
| [evaluate()](https://developers.google.com/apps-script/reference/html/html-template#evaluate()) | Evaluates this template and returns an HtmlOutput object. Any properties set on this HtmlTemplate object will be in scope when evaluating. To debug errors in a template, examine the code using the getCode() method. | [HtmlOutput](#class-htmloutput) | an HtmlOutput object | not started |  |
| [getCode()](https://developers.google.com/apps-script/reference/html/html-template#getCode()) | Generates a string of JavaScript code, based on the template file, that can be evaluated. This method produces a string of JavaScript code based on the template file. Calling eval(<code>) will return a new HtmlOutput object with the content of the template after running all embedded server scripts. The generated code is intended to be human-readable, and so if you need to debug a template you can call Logger.log(<code>) to see what was produced. | String | a string based on the template, which can be evaluated | not started |  |
| [getCodeWithComments()](https://developers.google.com/apps-script/reference/html/html-template#getCodeWithComments()) | Generates a string of JavaScript code that can be evaluated, with each line of the code containing the original line from the template as a comment. This method produces a string of JavaScript code based on the template file. Calling eval(<code>) will return a new HtmlOutput object with the content of the template after running all embedded server scripts. The generated code is intended to be human-readable, and so if you need to debug a template you can call Logger.log(<code>) to see what was produced. | String | an string based on the template, which can be evaluated | not started |  |
| [getRawContent()](https://developers.google.com/apps-script/reference/html/html-template#getRawContent()) | Returns the unprocessed content of this template. | String | the template's raw content | not started |  |

## Enum: [SandboxMode](https://developers.google.com/apps-script/reference/html/sandbox-mode)

An enum representing the sandbox modes that can be used for client-side HtmlService scripts. These values can be accessed from HtmlService.SandboxMode, and set by calling HtmlOutput.setSandboxMode(mode).

| Property | Description | Status | Implementation |
|--- |--- |--- |--- |
| EMULATED | A legacy sandbox mode that emulates ECMAScript 5 strict mode using only the features available in ECMAScript 3. This mode was the default prior to February 2014. EMULATED was sunset as of December 10, 2015. All scripts attempting use EMULATED will now use IFRAME instead. | not started |  |
| IFRAME | A sandbox mode that uses iframe sandboxing instead of the Caja sandbox technology used by the EMULATED and NATIVE modes. This mode is the default for new scripts as of November 12, 2015 and for all scripts as of July 6, 2016. This mode imposes many fewer restrictions than the other sandbox modes and runs fastest, but does not work at all in certain older browsers, including Internet Explorer 9. | not started |  |
| NATIVE | A sandbox mode that is built on top of ECMAScript 5 strict mode. A sandbox mode built on top of ECMAScript 5 strict mode. This mode was sunset as of July 6, 2016. All scripts now use IFRAME mode. | not started |  |

## Enum: [XFrameOptionsMode](https://developers.google.com/apps-script/reference/html/x-frame-options-mode)

An enum representing the X-Frame-Options modes that can be used for client-side HtmlService scripts. These values can be accessed from HtmlService.XFrameOptionsMode, and set by calling HtmlOutput.setXFrameOptionsMode(mode).

| Property | Description | Status | Implementation |
|--- |--- |--- |--- |
| ALLOWALL | No X-Frame-Options header will be set. This will let any site iframe the page, so the developer should implement their own protection against clickjacking. | not started |  |
| DEFAULT | Sets the default value for the X-Frame-Options header, which preserves normal security assumptions. If a script does not set an X-Frame-Options mode, Apps Script uses this mode as the default. | not started |  |

