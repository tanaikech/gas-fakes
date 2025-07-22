# thoughts on creating docs fakes

This one is pretty tough, so I figured I should keep a log on my thought process

## bringing back sections of data nd maintaining partial cache

Unlike sheets, it not so easy to retrieve only parts of a document. What's more there isnt a persistent id for elements of the document. So my approach is going to be to rely on caching from the api to maintain the current state of the entire document, and rely on an automatic refresh after an update. This differs from the approach for Drive or Sheets which maintains both a fetch cache to prevent foing the same fetch more than once if there's been no updates, as well as persistent state in the various classes. 

This means I need to always fetch dynamic data for the whole document (which will usually come from cache anyway) in each of the buried classes. Since we don't have ids on each element, then we  need to assign them on a non cache update to allow the subclasses to rebuild themselves. I don't know at this point if this implementable. 

## elements

There are really 3 kinds of elements
- containers - the purpose of these is simply to contain other elements. So a body is a container. A paragraph element is an example of a hybrid that contains both child elements and contents - so these would also be subclasses of containers
- elements - these are the elements that hold content 
- subclass - these are things paragraph and are created with methods like asParagraph

The addition of tabs also creates a new container in the heirarchy to worry about. so the heirachy would be something like
document -> body -> tab ->  paragraph -> element

the challenge is to ensure that the content of element always contains the refreshed state of the document

### structural elements versus apps script elements

A structural element is one that comes from the api - the apps script element is created from a structural element. I started off thinking I would work in both throughout the heirachy, but I'm coming to realize that I need to work in structural elements until the last moment where I can convert to an apps script equivalent. Similarily when i receive an apps script element, I need to immediately convert to its structural element equivalent to work within the document.

I've no idea at this point what all this translates into but lets see.

### so many questions

- what happens to a para thats already neen instanctiated when the underlying data changes - does it keep its prrior value ?
- further to above what would get childIndex return to the above situation if say, the document is now cleared
- are the startIndex and endIndex relative to the document/the tab/the container element? - SEE BELOW - they appear to be relative to the body, not the paragraph. Yet to be investigated for what happens with headers,footers,tabs etc.
- are section break elements always ignore by apps script or is it some other attribute that missed them

# approach

Let's consider the idea of a shadowdocument. This would more or less mirror the main classes in apps script, except it would retain the api represetnation of the document. So for example a Shadowbody would contain document.body as it came from the api. An Apps Script body would contain all the apps script body, plus a _shadowbody property which could be used to feed the apps script methods. This could be a better approach than trying to carry around apps script classes - in other words we'll do 'just in time' conversion to apps script.
 

# resource info

Just some info to see what the api actually returns

## structure

### keys Empty document no tabs
````
[ 'documentId',
  'suggestionsViewMode',
  'revisionId',
  'namedStyles',
  'title',
  'documentStyle',
  'body' ]
````
### keys Empty document.body.content [0]
Apps Script appears to ignore section break elements - but sectionbreaks seem to contain styling information

````
[ 'endIndex', 'sectionBreak' ]
````
### keys Empty document.body.content [1]
The presence of a key like 'paragraph' defines element type
````
	[ 'paragraph', 'startIndex', 'endIndex' ]
````
### keys Empty document.body.content [1].paragraph
 A paragraph can contain other elements
````
[ 'paragraphStyle', 'elements' ]
````
### keys Empty document.body.content [1].paragraph.elements [0]
````
[ 'textRun', 'endIndex', 'startIndex' ]
````
### keys Empty document.body.content [1].paragraph.elements [0].textRun
````
[ 'textStyle', 'content' ]
````
### Empty document.body.content [1].paragraph.elements [0].textRun.content
the 1st paragraph is a `\n`
````
\n
````
### document.body.content[1]
Since the indices of the 1st element in the paragraph match the paragraphs indices,  the start and end index are relative to the whole body - not the parent container
````
	{"endIndex":2,"startIndex":1,"paragraph":{"paragraphStyle":{"namedStyleType":"NORMAL_TEXT","direction":"LEFT_TO_RIGHT"},"elements":[{"textRun":{"content":"\n","textStyle":{}},"endIndex":2,"startIndex":1}]}}
````
### document.body.content
Appending a new paragraph - in this case appended the text "para2", the 2nd para element appends \n in the text and confirms that indices are relative to the whole body

````
            "elements": [
                {
                    "endIndex": 8,
                    "textRun": {
                        "textStyle": {},
                        "content": "para2\n"
                    },
                    "startIndex": 2
                }
            ]
````
## questions

### are instaciated paras dynamic

This is to see what happens to element already extracted when their parent is modified

#### body.clear


We can take from this, that when the body is cleared, the content of the para is also cleared, but the para still exists. It's just empty.
````
    const p2 = body.appendParagraph ("para2")
    console.log (p2.getText()) // para2
    body.clear()
    console.log (p2.getText()) // ""
````

##### body.getChildIndex

When the body is cleared, only the appended para (p2) is still accessible by the child index - (p1) gives an exception yet we can still get empty text with bot p1.getText() and p2.getText()

````
    const p1 = body.getChild(0)
    const p2 = body.appendParagraph ("para2")
    console.log (body.getChildIndex(p2),body.getChildIndex(p1)) // 1,0
    body.clear()
    console.log (p1,p2) // both ""
    console.log (body.getChildIndex(p2)) // 0
    console.log (body.getChildIndex(p1)) // Exception: Element does not contain the specified child element.
````