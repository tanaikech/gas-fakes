import { Proxies } from '../../support/proxies.js';
import { FakeDocument } from './fakedocument.js';
import { FakeElement } from './fakeelement.js';
import { FakeNamespace } from './fakenamespace.js';
import { FakeFormat } from './fakeformat.js';
import { FakeAttribute } from './fakeattribute.js';
import { FakeCdata } from './fakecdata.js';
import { FakeDocType } from './fakedoctype.js';
import { FakeComment } from './fakecomment.js';
import { FakeText } from './faketext.js';
import { FakeEntityRef } from './fakeentityref.js';
import { FakeProcessingInstruction } from './fakeprocessinginstruction.js';
import { XMLParser } from 'fast-xml-parser';
import * as Enums from '../enums/xmlenums.js';

class FakeXmlService {
  constructor(contentType = Enums.ContentTypes) {
    this.ContentTypes = contentType;
  }

  parse(xml) {
    const options = {
      ignoreAttributes: false,
      attributeNamePrefix: "@_",
      textNodeName: "#text",
      alwaysCreateTextNode: true,
      removeNSPrefix: false
    };
    const parser = new XMLParser(options);
    const jsonObj = parser.parse(xml);

    const rootName = Object.keys(jsonObj).find(key => !key.startsWith('?'));
    if (!rootName) {
      throw new Error("XmlService: No root element found in XML.");
    }

    const rootData = jsonObj[rootName];
    const rootElement = new FakeElement(rootName, rootData);
    return new FakeDocument(rootElement);
  }

  getNamespace(prefix, uri) {
    return new FakeNamespace(prefix, uri);
  }

  getPrettyFormat() {
    return new FakeFormat({ pretty: true });
  }

  getRawFormat() {
    return new FakeFormat({ pretty: false });
  }

  getCompactFormat() {
    // defaults to UTF-8 encoding, no indentation, and no additional line breaks, but includes the XML declaration and its encoding
    const fmt = new FakeFormat({ pretty: false });
    fmt.setIndent(null);
    fmt.setLineSeparator('');
    return fmt;
  }

  getNoNamespace() {
    return new FakeNamespace('', '');
  }

  getXmlNamespace() {
    return new FakeNamespace('xml', 'http://www.w3.org/XML/1998/namespace');
  }

  // Factory methods implemented as instance methods
  createDocument(rootElement) {
    if (arguments.length > 0 && (rootElement === null || rootElement === undefined)) {
      throw new Error("Argument cannot be null: rootElement");
    }
    return new FakeDocument(rootElement || null);
  }

  createElement(name, namespace = null) {
    const qname = namespace && namespace.getPrefix() ? `${namespace.getPrefix()}:${name}` : name;
    const el = new FakeElement(qname, {}, null);
    if (namespace) {
      el.setNamespace(namespace);
    }
    return el;
  }

  createCdata(text) {
    return new FakeCdata(text);
  }

  createComment(text) {
    return new FakeComment(text);
  }

  createDocType(name, publicId = null, systemId = null) {
    return new FakeDocType(name, publicId, systemId);
  }

  createText(text) {
    return new FakeText(text);
  }

  createEntityRef(name, publicId = null, systemId = null) {
    return new FakeEntityRef(name, publicId, systemId);
  }

  createProcessingInstruction(target, data = '') {
    return new FakeProcessingInstruction(target, data);
  }

  toString() {
    return "XmlService";
  }
}

export const newFakeXmlService = (...args) => {
  return Proxies.guard(new FakeXmlService(...args));
};
