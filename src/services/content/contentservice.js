import { FakeTextOutput } from "./textoutput.js";

export class FakeContentService {
  constructor() {
    this.MimeType = {
        ATOM: "application/atom+xml",
        CSV: "text/csv",
        ICAL: "text/calendar",
        JAVASCRIPT: "text/javascript",
        JSON: "application/json",
        RSS: "application/rss+xml",
        TEXT: "text/plain",
        VCARD: "text/vcard",
        XML: "application/xml"
    };
  }

  createTextOutput(content = "") {
    return new FakeTextOutput(content);
  }
}

export const newFakeContentService = () => new FakeContentService();
