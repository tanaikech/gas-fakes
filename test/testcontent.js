import '@mcpher/gas-fakes';
import { wrapupTest } from './testassist.js';
import { initTests } from './testinit.js';

export function testContentService(pack) {
  const { unit, fixes } = pack || initTests();
  
  unit.section('ContentService basics', (t) => {
    const output = ContentService.createTextOutput("Initial ")
      .append("Content")
      .setMimeType(ContentService.MimeType.JSON)
      .downloadAsFile("data.json");
      
    t.is(output.getContent(), "Initial Content", "append and set content");
    t.is(output.getMimeType(), ContentService.MimeType.JSON, "set mime type");
    t.is(output.getFileName(), "data.json", "download as file");
    
    output.clear();
    t.is(output.getContent(), "", "clear content");
    
    output.setContent("New Data");
    t.is(output.getContent(), "New Data", "set content");
  });

  if (!pack) {
    unit.report();
  }
  return { unit, fixes };
}

wrapupTest(testContentService);
