export class Url {
  /**
   * Extracts file ID from a Google Drive/Docs/Sheets/Slides URL.
   * @param {string} url The URL.
   * @returns {string|null} The file ID, or null if not found.
   */
  static getIdFromUrl(url) {
    const match = /\/d\/([a-zA-Z0-9-_]+)/.exec(url);
    if (match) {
      return match[1];
    }
    return null;
  }
}