# Service: xml

## Class: Attribute

Supported Methods:
- `getName()`
- `getNamespace()`
- `getValue()`
- `setName(String)`
- `setNamespace(Namespace)`
- `setValue(String)`

## Class: Cdata

Supported Methods:
- `append(String)`
- `detach()`
- `getParentElement()`
- `getText()`
- `getValue()`
- `setText(String)`

## Class: DocType

Supported Methods:
- `detach()`
- `getElementName()`
- `getInternalSubset()`
- `getParentElement()`
- `getPublicId()`
- `getSystemId()`
- `getValue()`
- `setElementName(String)`
- `setInternalSubset(String)`
- `setPublicId(String)`
- `setSystemId(String)`

## Class: Document

Supported Methods:
- `addContent(Content)`
- `addContent(Integer,Content)`
- `cloneContent()`
- `detachRootElement()`
- `getAllContent()`
- `getContent(Integer)`
- `getContentSize()`
- `getDescendants()`
- `getDocType()`
- `getRootElement()`
- `hasRootElement()`
- `removeContent()`
- `removeContent(Content)`
- `removeContent(Integer)`
- `setDocType(DocType)`
- `setRootElement(Element)`

## Class: Element

Supported Methods:
- `addContent(Content)`
- `addContent(Integer,Content)`
- `getAttribute(String,Namespace)`
- `getAttribute(String)`
- `getAttributes()`
- `getChild(String,Namespace)`
- `getChild(String)`
- `getChildren()`
- `getChildren(String,Namespace)`
- `getChildren(String)`
- `getChildText(String,Namespace)`
- `getChildText(String)`
- `getName()`
- `getParentElement()`
- `getQualifiedName()`
- `getText()`
- `getValue()`
- `removeAttribute(Attribute)`
- `removeAttribute(String,Namespace)`
- `removeAttribute(String)`
- `setAttribute(Attribute)`
- `setAttribute(String,String,Namespace)`
- `setAttribute(String,String)`
- `setText(String)`

## Class: Format

Supported Methods:
- `format(Document)`
- `format(Element)`

## Class: Namespace

Supported Methods:
- `getPrefix()`
- `getURI()`

## Class: Text

Supported Methods:
- `getParentElement()`
- `getText()`
- `getValue()`
- `setText(String)`

## Class: XmlService

Supported Methods:
- `createCdata(String)`
- `createComment(String)`
- `createDocType(String,String,String)`
- `createDocType(String,String)`
- `createDocType(String)`
- `createDocument()`
- `createDocument(Element)`
- `createElement(String,Namespace)`
- `createElement(String)`
- `createText(String)`
- `getNamespace(String,String)`
- `getNamespace(String)`
- `getPrettyFormat()`
- `getRawFormat()`
- `parse(String)`

