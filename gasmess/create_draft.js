function createDraft() {
  var recipient = Session.getActiveUser().getEmail();
  var subject = "Hello";
  var body = "heloo world";
  GmailApp.createDraft(recipient, subject, body);
  console.log("Draft created for " + recipient);
}
createDraft();