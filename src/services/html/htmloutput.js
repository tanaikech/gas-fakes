import { FakeHtmlTemplate } from './htmltemplate.js';
import { FakeHtmlOutputMetaTag } from './htmloutputmetatag.js';

export class FakeHtmlOutput {
  constructor(content = '') {
    this._content = content;
    this._title = '';
    this._width = 600;
    this._height = 450;
    this._metaData = {};
    this._faviconUrl = '';
    this._xFrameOptionsMode = null;
    this._sandboxMode = null;
    this.__isHtmlOutput = true;
  }

  getContent() {
    return this._content
      .replace(/<script([^>]*)>([\s\S]*?)<\/script>/gi, (match, attrs, body) => {
        if (attrs.includes('src=')) return match;
        if (body.includes('//# sourceURL=')) return match;
        const sourceUrl = `\n//# sourceURL=__gas_fakes_dynamic_script_${Date.now()}.js`;
        return `<script${attrs}>${body}${sourceUrl}</script>`;
      })
      .replace(/<style([^>]*)>([\s\S]*?)<\/style>/gi, (match, attrs, body) => {
        if (body.includes('/*# sourceURL=')) return match;
        const sourceUrl = `\n/*# sourceURL=__gas_fakes_dynamic_style_${Date.now()}.css */`;
        return `<style${attrs}>${body}${sourceUrl}</style>`;
      });
  }

  setContent(content) {
    this._content = content;
    return this;
  }

  append(content) {
    this._content += content;
    return this;
  }

  appendUntrusted(content) {
    this._content += String(content)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
    return this;
  }

  clear() {
    this._content = '';
    return this;
  }

  setTitle(title) {
    this._title = title;
    return this;
  }

  getTitle() {
    return this._title;
  }

  setWidth(width) {
    this._width = width;
    return this;
  }

  getWidth() {
    return this._width;
  }

  setHeight(height) {
    this._height = height;
    return this;
  }

  getHeight() {
    return this._height;
  }

  setFaviconUrl(iconUrl) {
    this._faviconUrl = iconUrl;
    return this;
  }

  getFaviconUrl() {
    return this._faviconUrl;
  }

  addMetaTag(name, content) {
    this._metaData[name] = content;
    return this;
  }

  getMetaTags() {
    return Object.keys(this._metaData).map(name => new FakeHtmlOutputMetaTag(name, this._metaData[name]));
  }

  setXFrameOptionsMode(mode) {
    this._xFrameOptionsMode = mode;
    return this;
  }

  setSandboxMode(mode) {
    this._sandboxMode = mode;
    return this;
  }

  asTemplate() {
    return new FakeHtmlTemplate(this._content);
  }

  getBlob() {
    return globalThis.Utilities.newBlob(this._content, 'text/html', (this._title || 'output') + '.html');
  }

  getAs(contentType) {
    // In live GAS, getAs performs server-side conversion (e.g. to PDF).
    // Locally, we just return a blob with the new mimeType for parity checking.
    const b = this.getBlob();
    b.setContentType(contentType);
    return b;
  }
}
