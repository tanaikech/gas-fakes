import { Proxies } from '../../support/proxies.js';

export const newFakeLine = (...args) => {
  return Proxies.guard(new FakeLine(...args));
};

export class FakeLine {
  constructor(resource, page) {
    this.__id = resource.objectId;
    this.__page = page;
  }

  get __resource() {
    const pageResource = this.__page.__resource;
    const element = (pageResource.pageElements || []).find(e => e.objectId === this.__id);
    if (!element) {
      throw new Error(`Line with ID ${this.__id} not found on page`);
    }
    return element;
  }

  get __line() {
    return this.__resource.line;
  }

  getObjectId() {
    return this.__id;
  }

  getLineCategory() {
    return this.__line.lineCategory;
  }

  getLineType() {
    return this.__line.lineType;
  }

  isConnector() {
    return this.getLineCategory() !== 'NON_CONNECTOR';
  }

  getStartConnection() {
    const conn = this.__line.lineProperties?.startConnection;
    if (!conn) return null;

    // We need to find the connected element
    const element = this.__page.getPageElements().find(e => e.getObjectId() === conn.connectedObjectId);
    if (!element) return null;

    // And the connection site
    const sites = element.getConnectionSites();
    const site = sites.find(s => s.getIndex() === conn.connectionSiteIndex);

    return site || null;
  }

  getEndConnection() {
    const conn = this.__line.lineProperties?.endConnection;
    if (!conn) return null;

    const element = this.__page.getPageElements().find(e => e.getObjectId() === conn.connectedObjectId);
    if (!element) return null;

    const sites = element.getConnectionSites();
    const site = sites.find(s => s.getIndex() === conn.connectionSiteIndex);

    return site || null;
  }

  setStartConnection(connectionSite) {
    const presentationId = this.__page.__presentation.getId();
    Slides.Presentations.batchUpdate([{
      updateLineProperties: {
        objectId: this.getObjectId(),
        lineProperties: {
          startConnection: {
            connectedObjectId: connectionSite.getPageElement().getObjectId(),
            connectionSiteIndex: connectionSite.getIndex()
          }
        },
        fields: 'startConnection'
      }
    }], presentationId);
    return this;
  }

  setEndConnection(connectionSite) {
    const presentationId = this.__page.__presentation.getId();
    Slides.Presentations.batchUpdate([{
      updateLineProperties: {
        objectId: this.getObjectId(),
        lineProperties: {
          endConnection: {
            connectedObjectId: connectionSite.getPageElement().getObjectId(),
            connectionSiteIndex: connectionSite.getIndex()
          }
        },
        fields: 'endConnection'
      }
    }], presentationId);
    return this;
  }

  toString() {
    return 'Line';
  }
}
