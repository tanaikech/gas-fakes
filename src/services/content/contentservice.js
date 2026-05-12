import { FakeTextOutput } from "./textoutput.js";
import { ContentEnums } from "../enums/contentenums.js";

export class FakeContentService {
  constructor() {
    this.MimeType = ContentEnums.MimeType;
  }

  createTextOutput(content = "") {
    return new FakeTextOutput(content);
  }
}

export const newFakeContentService = () => new FakeContentService();
