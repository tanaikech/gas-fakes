import { Auth } from "./src/support/auth.js";
const fileId = "1Gi9SPMszqRXFp9gQOKCuV13IssS4LVZ7q5PGYOaJ8adGBjD6yaXsFMgQ"; // File ID of the standalone Google Apps Script.
const url = `https://www.googleapis.com/drive/v3/files/${fileId}/export?mimeType=${encodeURIComponent("application/vnd.google-apps.script+json")}`;
const auth = await Auth.setAuth([ "https://www.googleapis.com/auth/drive.readonly" ]);
auth.cachedCredential = null;
const accessToken = await auth.getAccessToken();
const response = await fetch(url, { headers: { authorization: `Bearer ${accessToken}` } });
const text = await response.text();
console.log(text);