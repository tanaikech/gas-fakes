function sendEmail() {
  var recipient = Session.getActiveUser().getEmail();
  var subject = "Hello";
  var body = "heloo world";
  GmailApp.sendEmail(recipient, subject, body);
  console.log("Email sent to " + recipient);
}
sendEmail();