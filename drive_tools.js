import { z } from "zod";

const tools = [{ name: "search_files_by_name", schema: {
  description: "Search for files on Google Drive by filename.",
  inputSchema: {
    filename: z.string().describe("The name of the file to search for.")
  }
}, func: (object = {}) => { const { filename } = object;
const files = DriveApp.getFilesByName(filename);
const results = [];
while (files.hasNext()) {
  const file = files.next();
  results.push({
    name: file.getName(),
    id: file.getId(),
    url: file.getUrl(),
    mimeType: file.getMimeType()
  });
}
return results; } }];