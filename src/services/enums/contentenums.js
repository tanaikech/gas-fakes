import { newFakeGasenum } from "@mcpher/fake-gasenum";

export const ContentEnums = {
  MimeType: newFakeGasenum([
    "ATOM",
    "CSV",
    "ICAL",
    "JAVASCRIPT",
    "JSON",
    "RSS",
    "TEXT",
    "VCARD",
    "XML"
  ])
}
