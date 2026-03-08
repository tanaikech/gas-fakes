import { XMLBuilder } from 'fast-xml-parser';

/**
 * Fake Format class for XmlService
 */
export class FakeFormat {
  constructor(options = {}) {
    this._options = options;
  }

  /**
   * Formats the given document as an XML string.
   * @param {FakeDocument} document The document to format.
   * @return {string} The formatted XML string.
   */
  format(document) {
    if (!document || typeof document.getRootElement !== 'function') {
      throw new Error("XmlService: Invalid document provided to format().");
    }

    const root = document.getRootElement();
    const builderOptions = {
      ignoreAttributes: false,
      attributeNamePrefix: "@_",
      textNodeName: "#text",
      format: this._options.pretty || false,
      indentBy: this._options.pretty ? "  " : "",
      suppressEmptyNode: false // GAS usually outputs <tag></tag> or <tag/>? Actually GAS uses <tag/> for empty elements usually.
    };

    const builder = new XMLBuilder(builderOptions);

    // Construct the object for building
    // We access the internal _data property of FakeElement
    const data = {
      [root.getQualifiedName()]: root._data
    };

    let xml = builder.build(data);

    // GAS adds XML declaration followed by a line separator (\r\n)
    const declaration = '<?xml version="1.0" encoding="UTF-8"?>\r\n';

    if (this._options.pretty) {
      // GAS pretty format uses \r\n and has a newline after declaration
      // XMLBuilder uses \n, so we replace it.
      return declaration + xml.replace(/\n/g, '\r\n') + '\r\n';
    } else {
      // Raw format - declaration, compact XML, and trailing newline
      return declaration + xml + '\r\n';
    }
  }
}
