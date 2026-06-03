# [Mail](https://developers.google.com/apps-script/reference/mail)

This service allows scripts to send email on a user's behalf. See also Gmail Service. Unlike Gmail Service, Mail Service's sole purpose is sending email; it cannot access a user's Gmail account.

## Class: [MailApp](https://developers.google.com/apps-script/reference/mail/mail-app)

Sends email.

| Method | Description | Return Type | Return Description | Status | Implementation |
|--- |--- |--- |--- |--- |--- |
| [getRemainingDailyQuota()](https://developers.google.com/apps-script/reference/mail/mail-app#getRemainingDailyQuota()) | Returns the number of recipients you can send emails to for the rest of the day. The returned value is valid for the current execution and might vary between executions. | Integer | The number of emails remaining that the script can send. | not started |  |
| [sendEmail(Object)](https://developers.google.com/apps-script/reference/mail/mail-app#sendEmail(Object)) | Sends an email message. This variation of the method is much more flexible, allowing for many more options. |  |  | not started |  |
| [sendEmail(String,String,String,Object)](https://developers.google.com/apps-script/reference/mail/mail-app#sendEmail(String,String,String,Object)) |  |  |  | not started |  |
| [sendEmail(String,String,String,String)](https://developers.google.com/apps-script/reference/mail/mail-app#sendEmail(String,String,String,String)) |  |  |  | not started |  |
| [sendEmail(String,String,String)](https://developers.google.com/apps-script/reference/mail/mail-app#sendEmail(String,String,String)) |  |  |  | not started |  |

