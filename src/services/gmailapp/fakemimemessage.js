
// this is not a real class in GAS, but will be used to generate a raw message
// from https://developers.google.com/apps-script/reference/gmail/gmail-app#createDraft(String,String,String,Object)
export const createMimeMessage = (recipient, subject, body, options) => {
  const {
    attachments, bcc, cc, from, htmlBody, inlineImages, name, replyTo,
  } = options || {};

  const hasAttachments = attachments && attachments.length;
  const hasInlineImages = inlineImages && Object.keys(inlineImages).length;

  const headers = {
    To: recipient,
    Subject: subject,
  };
  if (cc) headers.Cc = cc;
  if (bcc) headers.Bcc = bcc;
  if (from) headers.From = name ? `${name} <${from}>` : from;
  if (replyTo) headers['Reply-To'] = replyTo;

  let message = Object.entries(headers).map(([key, value]) => `${key}: ${value}`).join('\r\n');

  let bodyPart = '';
  let bodyContentType = 'text/plain; charset=utf-8';

  if (htmlBody) {
    const alternativeBoundary = `----=${Utilities.computeDigest(Utilities.DigestAlgorithm.MD5, `alternative${new Date().getTime()}${Math.random()}`).map((b) => (b + 256).toString(16).slice(-2)).join('')}`;
    bodyContentType = `multipart/alternative; boundary=${alternativeBoundary}`;

    bodyPart += `--${alternativeBoundary}\r\n`;
    bodyPart += `Content-Type: text/plain; charset=utf-8\r\n\r\n`;
    bodyPart += `${body}\r\n`;

    if (hasInlineImages) {
      const relatedBoundary = `----=${Utilities.computeDigest(Utilities.DigestAlgorithm.MD5, `related${new Date().getTime()}${Math.random()}`).map((b) => (b + 256).toString(16).slice(-2)).join('')}`;
      bodyPart += `--${alternativeBoundary}\r\n`;
      bodyPart += `Content-Type: multipart/related; boundary=${relatedBoundary}\r\n\r\n`;

      bodyPart += `--${relatedBoundary}\r\n`;
      bodyPart += `Content-Type: text/html; charset=utf-8\r\n\r\n`;
      bodyPart += `${htmlBody}\r\n`;

      Object.entries(inlineImages).forEach(([cid, image]) => {
        bodyPart += `--${relatedBoundary}\r\n`;
        bodyPart += `Content-Type: ${image.getContentType()}\r\n`;
        bodyPart += `Content-Transfer-Encoding: base64\r\n`;
        bodyPart += `Content-ID: <${cid}>\r\n\r\n`;
        bodyPart += `${Utilities.base64Encode(image.getBytes())}\r\n`;
      });

      bodyPart += `--${relatedBoundary}--\r\n`;
    } else {
      bodyPart += `--${alternativeBoundary}\r\n`;
      bodyPart += `Content-Type: text/html; charset=utf-8\r\n\r\n`;
      bodyPart += `${htmlBody}\r\n`;
    }
    bodyPart += `--${alternativeBoundary}--`;
  } else {
    bodyPart = body;
  }

  if (hasAttachments) {
    const mixedBoundary = `----=${Utilities.computeDigest(Utilities.DigestAlgorithm.MD5, `mixed${new Date().getTime()}${Math.random()}`).map((b) => (b + 256).toString(16).slice(-2)).join('')}`;
    message += `\r\nContent-Type: multipart/mixed; boundary=${mixedBoundary}\r\n\r\n`;

    message += `--${mixedBoundary}\r\n`;
    message += `Content-Type: ${bodyContentType}\r\n\r\n`;
    message += `${bodyPart}\r\n`;

    attachments.forEach(attachment => {
      message += `--${mixedBoundary}\r\n`;
      message += `Content-Type: ${attachment.getContentType()}\r\n`;
      message += `Content-Transfer-Encoding: base64\r\n`;
      message += `Content-Disposition: attachment; filename="${attachment.getName()}"\r\n\r\n`;
      message += `${Utilities.base64Encode(attachment.getBytes())}\r\n`;
    });

    message += `--${mixedBoundary}--`;
  } else {
    message += `\r\nContent-Type: ${bodyContentType}\r\n\r\n`;
    message += bodyPart;
  }

  return message;
};