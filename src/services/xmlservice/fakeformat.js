import { XMLBuilder } from 'fast-xml-parser';

/**
 * Fake Format class for XmlService
 */
export class FakeFormat {
  constructor(options = {}) {
    this._encoding = 'UTF-8';
    this._indent = options.pretty ? '  ' : null;
    this._lineSeparator = '\r\n';
    this._omitDeclaration = false;
    this._omitEncoding = false;
  }

  setEncoding(encoding) {
    this._encoding = encoding || 'UTF-8';
    return this;
  }

  setIndent(indent) {
    this._indent = indent;
    return this;
  }

  setLineSeparator(separator) {
    this._lineSeparator = separator || '\r\n';
    return this;
  }

  setOmitDeclaration(omit) {
    this._omitDeclaration = !!omit;
    return this;
  }

  setOmitEncoding(omit) {
    this._omitEncoding = !!omit;
    return this;
  }

  /**
   * Formats the given document or element as an XML string.
   * @param {FakeDocument|FakeElement} documentOrElement
   * @return {string} The formatted XML string.
   */
  format(documentOrElement) {
    if (!documentOrElement) {
      throw new Error("XmlService: Invalid argument provided to format().");
    }

    let root;
    if (typeof documentOrElement.getRootElement === 'function') {
      root = documentOrElement.getRootElement();
    } else if (typeof documentOrElement.getQualifiedName === 'function') {
      root = documentOrElement;
    } else {
      throw new Error("XmlService: Invalid document/element provided to format().");
    }

    if (!root) return '';

    const isPretty = this._indent !== null && this._indent !== '';
    const indentBy = isPretty ? this._indent : '';

    const builderOptions = {
      ignoreAttributes: false,
      attributeNamePrefix: "@_",
      textNodeName: "#text",
      format: isPretty,
      indentBy: indentBy,
      suppressEmptyNode: false
    };

    const builder = new XMLBuilder(builderOptions);
    const data = {
      [root.getQualifiedName()]: root._data
    };

    let xml = builder.build(data);

    if (isPretty) {
      // XMLBuilder uses \n, replace with line separator if different
      if (this._lineSeparator !== '\n') {
        xml = xml.replace(/\n/g, this._lineSeparator);
      }
    }

    let declaration = '';
    if (!this._omitDeclaration) {
      if (this._omitEncoding) {
        declaration = '<?xml version="1.0"?>' + this._lineSeparator;
      } else {
        declaration = `<?xml version="1.0" encoding="${this._encoding}"?>` + this._lineSeparator;
      }
    }

    return declaration + xml + this._lineSeparator;
  }
}
