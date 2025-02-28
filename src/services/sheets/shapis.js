import { google } from "googleapis";

let sheetsClient = null

export const getSheetsClient = (auth) => {
  if (!sheetsClient) {
    sheetsClient =  google.sheets({version: 'v4', auth});
  }
  return sheetsClient
}



