import './main.js';

try {
  console.log('Searching for emails from Martin...');
  
  // Search Gmail for messages from Martin (getting up to 10 recent threads)
  const threads = GmailApp.search('from:Martin', 0, 10);
  
  if (threads.length === 0) {
    console.log('No emails found from Martin.');
    process.exit(0);
  }

  console.log(`Found ${threads.length} threads. Creating summary doc...`);

  // Create the Document
  const doc = DocumentApp.create('Email Summary: Martin');
  const body = doc.getBody();
  
  // Add a title
  body.appendParagraph('Summary of Recent Emails from Martin')
      .setHeading(DocumentApp.ParagraphHeading.TITLE);
  
  body.appendParagraph(`Generated on: ${new Date().toLocaleString()}`);
  body.appendParagraph(''); 

  // We have to use the advanced Gmail service directly because gas-fakes' 
  // FakeGmailMessage does not yet support getSubject(), getDate(), or getSnippet()
  for (const thread of threads) {
    // Get the raw thread resource from the Gmail API
    const threadResource = Gmail.Users.Threads.get('me', thread.getId());
    if (!threadResource.messages || threadResource.messages.length === 0) continue;
    
    const firstMsg = threadResource.messages[0];
    
    // Extract Subject from headers
    const headers = firstMsg.payload && firstMsg.payload.headers ? firstMsg.payload.headers : [];
    const subjectHeader = headers.find(h => h.name.toLowerCase() === 'subject');
    const dateHeader = headers.find(h => h.name.toLowerCase() === 'date');
    
    const subject = subjectHeader ? subjectHeader.value : 'No Subject';
    const date = dateHeader ? dateHeader.value : 'Unknown Date';
    
    body.appendParagraph(`Subject: ${subject}`)
        .setHeading(DocumentApp.ParagraphHeading.HEADING1);
    
    for (const msg of threadResource.messages) {
      const msgHeaders = msg.payload && msg.payload.headers ? msg.payload.headers : [];
      const msgDateHeader = msgHeaders.find(h => h.name.toLowerCase() === 'date');
      const msgDate = msgDateHeader ? msgDateHeader.value : 'Unknown Date';
      
      body.appendParagraph(`Date: ${msgDate}`)
          .setHeading(DocumentApp.ParagraphHeading.HEADING3);
      
      const snippet = msg.snippet || "No content.";
      body.appendParagraph(snippet);
    }
    
    body.appendParagraph(''); // Spacing
  }

  doc.saveAndClose();

  console.log(`Successfully created document "${doc.getName()}"`);
  console.log(`Document URL: ${doc.getUrl()}`);

} catch (error) {
  console.error(`Error: ${error.message}`);
}
