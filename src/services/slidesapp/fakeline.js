import { Proxies } from '../../support/proxies.js';
import { FakePageElement, PageElementRegistry } from './fakepageelement.js';
import { newFakeLineFill } from './fakelinefill.js';
import { newFakePoint } from './fakepoint.js';

export const newFakeLine = (...args) => {
  const line = Proxies.guard(new FakeLine(...args));
  return line;
};

PageElementRegistry.newFakeLine = newFakeLine;

export class FakeLine extends FakePageElement {
  constructor(resource, page) {
    super(resource, page);
  }

  get __line() {
    return this.__resource.line;
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

  getLineFill() {
    return newFakeLineFill(this);
  }

  getWeight() {
    return this.__normalize(this.__line.lineProperties?.weight);
  }

  setWeight(weight) {
    this.__updateLineProps({ weight: { magnitude: weight, unit: 'PT' } }, 'weight');
    return this;
  }

  getDashStyle() {
    const style = this.__line.lineProperties?.dashStyle || 'SOLID';
    return SlidesApp.DashStyle[style] || SlidesApp.DashStyle.SOLID;
  }

  setDashStyle(dashStyle) {
    this.__updateLineProps({ dashStyle: dashStyle }, 'dashStyle');
    return this;
  }

  getStartArrow() {
    const style = this.__line.lineProperties?.startArrow || 'NONE';
    return SlidesApp.ArrowStyle[style] || SlidesApp.ArrowStyle.NONE;
  }

  setStartArrow(arrowStyle) {
    this.__updateLineProps({ startArrow: arrowStyle }, 'startArrow');
    return this;
  }

  getEndArrow() {
    const style = this.__line.lineProperties?.endArrow || 'NONE';
    return SlidesApp.ArrowStyle[style] || SlidesApp.ArrowStyle.NONE;
  }

  setEndArrow(arrowStyle) {
    this.__updateLineProps({ endArrow: arrowStyle }, 'endArrow');
    return this;
  }

  getStart() {
    // Start point of the line. 
    // Usually lines are defined by transform and size.
    // For now, let's just return normalized coordinates
    return newFakePoint(this.getLeft(), this.getTop());
  }

  setStart(xOrPoint, y) {
    let xValue, yValue;
    if (typeof xOrPoint === 'object') {
      xValue = xOrPoint.getX();
      yValue = xOrPoint.getY();
    } else {
      xValue = xOrPoint;
      yValue = y;
    }
    this.__updateLineProps({
      startPoint: {
        x: { magnitude: xValue, unit: 'PT' },
        y: { magnitude: yValue, unit: 'PT' }
      }
    }, 'startPoint');
    return this;
  }

  getEnd() {
    return newFakePoint(this.getLeft() + this.getWidth(), this.getTop() + this.getHeight());
  }

  setEnd(xOrPoint, y) {
    let xValue, yValue;
    if (typeof xOrPoint === 'object') {
      xValue = xOrPoint.getX();
      yValue = xOrPoint.getY();
    } else {
      xValue = xOrPoint;
      yValue = y;
    }
    // We update size/transform to match endpoints for straight lines?
    // Simplified: just set width/height
    const dx = xValue - this.getLeft();
    const dy = yValue - this.getTop();
    this.setWidth(Math.abs(dx));
    this.setHeight(Math.abs(dy));
    return this;
  }

  reroute() {
    // In API, there's no reroute directly in batchUpdate for lines?
    // Wait, the documentation says reroute is available.
    // It might be a specific request type.
    // Actually, I don't see 'rerouteLine' in Slides API reference.
    // It might be an Apps Script specific implementation that uses other methods.
    return this;
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
    this.__updateLineProps({
      startConnection: {
        connectedObjectId: connectionSite.getPageElement().getObjectId(),
        connectionSiteIndex: connectionSite.getIndex()
      }
    }, 'startConnection');
    return this;
  }

  setEndConnection(connectionSite) {
    this.__updateLineProps({
      endConnection: {
        connectedObjectId: connectionSite.getPageElement().getObjectId(),
        connectionSiteIndex: connectionSite.getIndex()
      }
    }, 'endConnection');
    return this;
  }

  __updateLineProps(lineProperties, fields) {
    const presentationId = this.__page.__presentation?.getId() || this.__page.__slide?.__presentation.getId();
    Slides.Presentations.batchUpdate([{
      updateLineProperties: {
        objectId: this.getObjectId(),
        lineProperties: lineProperties,
        fields: fields
      }
    }], presentationId);
  }

  toString() {
    return 'Line';
  }
}
