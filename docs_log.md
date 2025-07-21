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
- are the startIndex and endIndex relative to the document/the tab/the container element?
- are section break elements always ignore by apps script or is it some other attribute that missed them