import { newFakeGasenum } from "@mcpher/fake-gasenum";

/**
 * Enum representing the possible content types found in XML.
 */
export const ContentTypes = newFakeGasenum([
  "CDATA",
  "COMMENT",
  "DOCTYPE",
  "ELEMENT",
  "ENTITYREF",
  "PROCESSINGINSTRUCTION",
  "TEXT"
]);
