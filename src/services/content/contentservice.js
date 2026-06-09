import { FakeTextOutput } from "./textoutput.js";
// just avoid conflict with global MimeType
import { MimeType as mt } from "../enums/contentenums.js";

export class FakeContentService {
  constructor() {
    this.MimeType = mt;
  }

  createTextOutput(content = "") {
    return new FakeTextOutput(content);
  }
}

export const newFakeContentService = () => new FakeContentService();
