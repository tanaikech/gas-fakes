import is from '@sindresorhus/is';
export const whichType = (element) => {
  const ts = ["paragraph", "pageBreak", "textRun", "table", "tableRows", "tableCells", "content"]
  const [t] = ts.filter(f => Reflect.has(element, f))
  return t
}

export const report = (doc, what) => {
  let newdoc = doc
  let body = doc.body
  let tabs = doc.tabs
  // handle case where tabs is handling legacy doc.
  if (!body) {
    if (!tabs) {
      console.log('missing tabs')
      console.log(JSON.stringify(doc))
    } else {
      console.log('getting body from tabs')
      newdoc = tabs[0].documentTab
      body = newdoc.body
    }
  }

  // drop the section break
  const children = body.content.slice(1)
  what += ` -children:${children.length}`
  console.log(what)
  let text = '  '
  console.log(stringCircular(children))
  const childProps = ["elements", "tableRows", "tableCells", "content", "listItem"]
  const typer = (child, text, spaces = " ") => {
    const type = whichType(child)
    if (type) {
      text += `\n${spaces}-${type} ${child.startIndex}:${child.endIndex}`
      if (type === 'textRun') {
        text += ` ${JSON.stringify(child[type].content)}`
      }
      const key = Reflect.ownKeys(child[type]).find(f => childProps.includes(f))
      let arr = key && child[type][key]
      if (!arr && is.array(child[type])) arr = child[type]

      if (is.array(arr)) {
        //text += spaces
        arr.forEach(f => text = typer(f, text, spaces + "  "))
        //text += ''
      }
    }
    return text
  }
  return children.map(f => typer(f, text)).join("\n")
}


export const scl = (doc) => {
  if (!DocumentApp.isFake) {
    const id = doc.getId()
    doc.saveAndClose()
    doc = DocumentApp.openById(id)
  }
  return doc
}

// The custom replacer function
const getCircularReplacer = () => {
  const seen = new WeakSet(); // Use WeakSet to avoid memory leaks
  return (_, value) => {
    // If the value is an object and not null
    if (typeof value === "object" && value !== null) {
      // If we have already seen this object, it's a circular reference
      if (seen.has(value)) {
        return "[Circular]"; // Replace it with a placeholder
      }
      // If it's a new object, add it to our cache
      seen.add(value);
    }
    // Return the value to be serialized
    return value;
  };
};

export const stringCircular = (ob) => JSON.stringify(ob, getCircularReplacer());