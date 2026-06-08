
import is from '@sindresorhus/is';
import '@mcpher/gas-fakes'
import { wrapupTest } from './testassist.js';
import { initTests } from './testinit.js'

export const testXmlService = (pack) => {
  const { unit } = pack || initTests()

  unit.section('XmlService.parse', t => {
    const xml = '<root attr="val"><child>text</child><child>more</child><other><grandchild>deep</grandchild></other></root>';
    const doc = XmlService.parse(xml);

    // GAS toString output: [Document:  No DOCTYPE declaration, Root is [Element: <root/>]]
    t.is(doc.toString(), "[Document:  No DOCTYPE declaration, Root is [Element: <root/>]]");

    const root = doc.getRootElement();
    t.is(root.getName(), "root");
    t.is(root.getAttribute("attr").getValue(), "val");

    const children = root.getChildren("child");
    t.is(children.length, 2);
    t.is(children[0].getName(), "child");
    t.is(children[0].getText(), "text");

    const other = root.getChild("other");
    t.is(other.getName(), "other");
    t.is(other.getChild("grandchild").getText(), "deep");
    t.is(other.getChildText("grandchild"), "deep");

    const allChildren = root.getChildren();
    t.is(allChildren.length, 3);
  })

  unit.section('XmlService.parse with namespaces', t => {
    const xml = '<ns:root xmlns:ns="http://example.com"><ns:child>content</ns:child></ns:root>';
    const doc = XmlService.parse(xml);
    const root = doc.getRootElement();

    // In GAS, getName() returns the local name
    t.is(root.getName(), "root");

    // To get namespaced child, we can use the Namespace object
    const ns = XmlService.getNamespace("ns", "http://example.com");
    const child = root.getChild("child", ns);
    t.is(child.getName(), "child");
    t.is(child.getText(), "content");
  })

  unit.section('XmlService.getPrettyFormat and getRawFormat', t => {
    const xml = '<root attr="val"><child>text</child></root>';
    const doc = XmlService.parse(xml);

    const pretty = XmlService.getPrettyFormat().format(doc);
    // console.log('Pretty:\n' + pretty.replace(/\r/g, '\\r').replace(/\n/g, '\\n\n'));

    t.is(pretty.includes('<?xml version="1.0" encoding="UTF-8"?>'), true, "Declaration is present");
    t.is(pretty.includes('\r\n'), true, "Line breaks are present (\r\n)");
    t.is(pretty.includes('  <child>'), true, "Indentation is present (2 spaces)");
    t.is(pretty.split('\r\n').length >= 4, true, "Has multiple lines");

    const raw = XmlService.getRawFormat().format(doc);
    // console.log('Raw as JSON:', JSON.stringify(raw));

    t.is(raw.startsWith('<?xml version="1.0" encoding="UTF-8"?>'), true, "Declaration is present at start");
    t.is(raw.includes('\r\n'), true, "Line break is present after declaration");
    t.is(raw.split('\r\n').length, 3, "Exactly 3 lines for compact XML (declaration + content + trailing empty)");
    t.is(raw.includes('<root attr="val"><child>text</child></root>'), true, "Content is present and compact");
  })

  unit.section('XmlService enums', t => {
    const p = XmlService.ContentTypes;
    t.is(typeof p, 'object');
    if (ScriptApp.isFake) {
      t.is(typeof XmlService.ContentType, 'undefined');
    }
    const expected = [
      "CDATA",
      "COMMENT",
      "DOCTYPE",
      "ELEMENT",
      "ENTITYREF",
      "PROCESSINGINSTRUCTION",
      "TEXT"
    ];
    expected.forEach((key, i) => {
      const val = p[key];
      t.is(val.toString(), key);
      t.is(val.name(), key);
      t.is(val.ordinal(), i);
    });
  });

  unit.section('XmlService factory and node mutations', t => {
     // 1. XmlService Factory Methods
     const root = XmlService.createElement('root');
     t.is(root.getName(), 'root');

     const cdata = XmlService.createCdata('data');
     t.is(cdata.getText(), 'data');

     const docType = XmlService.createDocType('html', 'public-id', 'system-id');
     t.is(docType.getElementName(), 'html');

     const comment = XmlService.createComment('my comment');
     t.is(comment.getText(), 'my comment');

     const text = XmlService.createText('some text');
     t.is(text.getText(), 'some text');

     const doc = XmlService.createDocument(root);
     // Avoid direct object comparison: compare properties
     t.is(doc.getRootElement().getName(), root.getName());

     // 2. Attribute
     // Note: Attributes are typically set on an element, not instantiated directly.
     const el = XmlService.createElement('test-element');
     
     // --- Test Namespaced Attribute ---
     const namespacedAttrName = 'test-attr';
     const namespacedAttrValue = 'test-value';
     const namespacedURI = 'http://example.com';
     
     // 1. Create the Namespace object
     const ns = XmlService.getNamespace('ns', namespacedURI);
     
     // 2. Set the attribute using the Namespace object
     el.setAttribute(namespacedAttrName, namespacedAttrValue, ns);
     
     // 3. Retrieve the attribute using the Namespace object
     const retrievedNamespacedAttr = el.getAttribute(namespacedAttrName, ns);
     t.is(retrievedNamespacedAttr.getName(), namespacedAttrName);
     t.is(retrievedNamespacedAttr.getValue(), namespacedAttrValue);
     // 4. Assert the namespace URI
     t.is(retrievedNamespacedAttr.getNamespace().getURI(), namespacedURI);

     // --- Test Non-Namespaced Attribute ---
     const nonNamespacedAttrName = 'id';
     const nonNamespacedAttrValue = 'test-id';
     
     el.setAttribute(nonNamespacedAttrName, nonNamespacedAttrValue); // 2-argument signature
     
     // Retrieve the attribute without specifying a namespace
     const retrievedNonNamespacedAttr = el.getAttribute(nonNamespacedAttrName);
     t.is(retrievedNonNamespacedAttr.getName(), nonNamespacedAttrName);
     t.is(retrievedNonNamespacedAttr.getValue(), nonNamespacedAttrValue);
      // Assert that the namespace is empty for non-namespaced attributes
      t.is(retrievedNonNamespacedAttr.getNamespace().getURI(), "");
      t.is(retrievedNonNamespacedAttr.getNamespace().getPrefix(), "");
     
     // 3. Cdata
     const cd = XmlService.createCdata('initial');
     t.is(cd.getText(), 'initial');
     
     // Test append
     cd.append(' content');
     t.is(cd.getText(), 'initial content');
     
     // Test parent element management
     const parentEl = XmlService.createElement('parent');
     parentEl.addContent(cd);
     t.is(cd.getParentElement().getName(), parentEl.getName());
     
     // Test detach
     cd.detach();
     t.is(cd.getParentElement() === null, true);
     
     // Test setText
     cd.setText('new text');
     t.is(cd.getValue(), 'new text');

     // 4. DocType
     const dt = XmlService.createDocType('html', 'public', 'system');
     t.is(dt.getElementName(), 'html');
     t.is(dt.getPublicId(), 'public');
     t.is(dt.getSystemId(), 'system');
     
     // Test setters
     dt.setElementName('xhtml').setPublicId('pub').setSystemId('sys').setInternalSubset('subset');
     t.is(dt.getElementName(), 'xhtml');
     t.is(dt.getPublicId(), 'pub');
     t.is(dt.getSystemId(), 'sys');
     t.is(dt.getInternalSubset(), 'subset');
     t.is(dt.getValue(), '');
     
     // Test internal subset removal/setting throws on null
     t.threw(() => dt.setInternalSubset(null));
     
     // Clear it using empty string
     dt.setInternalSubset('');
     t.is(dt.getInternalSubset(), '');

      // 5. Document
      const document = XmlService.createDocument(); // Create empty document
      t.is(document.hasRootElement() === false, true);
      
      // Test that passing null explicitly throws
      t.threw(() => XmlService.createDocument(null));
      
      // Set root element
      const rootForDoc = XmlService.createElement('root-for-doc');
      document.setRootElement(rootForDoc);
      t.is(document.hasRootElement() === true, true);
      t.is(document.getRootElement().getName(), rootForDoc.getName());
      
      // Detach root element
      document.detachRootElement();
      t.is(document.hasRootElement() === false, true);

     // Set DocType
     const doctypeObj = XmlService.createDocType('xhtml', 'pub', 'sys');
     document.setDocType(doctypeObj);
     t.is(document.getDocType().getElementName(), doctypeObj.getElementName());

     // Test content addition and size
     const el1 = XmlService.createElement('child1');
     document.addContent(el1);
     
     // Size includes the DocType object and the root element
     t.is(document.getContentSize(), 2); 
     t.is(document.getContent(1).getName(), el1.getName());
     t.is(document.getAllContent().length, 2);
     t.is(document.cloneContent().length, 2);

     // Test Descendants (let's add a child to el1)
     const childEl = XmlService.createElement('grandchild');
     el1.addContent(childEl);
     const descendants = document.getDescendants();
     // Descendants count: DocType, el1, grandchild
     t.is(descendants.length, 3); 

      // Test Removal
      t.is(document.removeContent(el1), true);
      t.is(document.getContentSize(), 1); // Only doctypeObj remains

      // 6. Format options, Namespaces, EntityRef, ProcessingInstruction, Content Casting, getDocument
      const format = XmlService.getCompactFormat();
      t.is(typeof format.setEncoding('UTF-8'), 'object');
      t.is(typeof format.setIndent(null), 'object');
      t.is(typeof format.setLineSeparator('\n'), 'object');
      t.is(typeof format.setOmitDeclaration(true), 'object');
      t.is(typeof format.setOmitEncoding(true), 'object');

      const noNs = XmlService.getNoNamespace();
      t.is(noNs.getPrefix(), '');
      t.is(noNs.getURI(), '');

      const xmlNs = XmlService.getXmlNamespace();
      t.is(xmlNs.getPrefix(), 'xml');
      t.is(xmlNs.getURI(), 'http://www.w3.org/XML/1998/namespace');

      if (ScriptApp.isFake) {
        const ent = XmlService.createEntityRef('amp');
        t.is(ent.getName(), 'amp');
        t.is(ent.setName('lt').getName(), 'lt');
        t.is(ent.getPublicId(), null);
        t.is(ent.setPublicId('pub').getPublicId(), 'pub');
        t.is(ent.getSystemId(), null);
        t.is(ent.setSystemId('sys').getSystemId(), 'sys');
        t.is(ent.getValue(), '');
      }

      if (ScriptApp.isFake) {
        const pi = XmlService.createProcessingInstruction('target', 'data');
        t.is(pi.getTarget(), 'target');
        t.is(pi.setTarget('t').getTarget(), 't');
        t.is(pi.getData(), 'data');
        t.is(pi.setData('d').getData(), 'd');
        t.is(pi.getValue(), '');
      }

      // Content Casting tests
      const commentNode = XmlService.createComment('hello');
      t.is(commentNode.asComment() !== null, true);
      t.is(commentNode.asCdata() === null, true);
      t.is(commentNode.getType().toString(), 'COMMENT');

      const textNode = XmlService.createText('world');
      t.is(textNode.asText() !== null, true);
      t.is(textNode.getType().toString(), 'TEXT');
      t.is(textNode.append('!').getText(), 'world!');

      // getDocument tests
      const mainDoc = XmlService.createDocument();
      const mainRoot = XmlService.createElement('root');
      mainDoc.setRootElement(mainRoot);
      t.is(mainRoot.getDocument().toString().includes('Root is [Element: <root/>]'), true);
  });

  if (!pack) {
    unit.report()
  }
  return { unit }
}

wrapupTest(testXmlService)
