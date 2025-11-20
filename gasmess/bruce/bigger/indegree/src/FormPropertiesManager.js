/**
 * @class FormPropertiesManager
 * Manages storing and retrieving metadata in the properties of a Google Drive file
 * using the Drive Advanced Service. This requires the Drive API to be enabled
 * in the Apps Script project.
 */
export class FormPropertiesManager {
  /**
   * @param {string} fileId The ID of the Google Drive file (the form).
   */
  constructor(fileId) {
    if (!fileId) {
      throw new Error('A file ID is required to manage properties.');
    }
    /**
     * @type {string}
     * @private
     */
    this.__fileId = fileId;
  }

  /**
   * Writes a JavaScript object to the private properties of the Drive file.
   * The data is serialized to a JSON string before being stored.
   * @param {string} key The key under which to store the data.
   * @param {object} data The data object to store.
   * @returns {void}
   * @throws {Error} If the Drive API call fails.
   */
  write(key, data) {
    // SIDECAR FILE WORKAROUND for large properties
    try {
      const value = JSON.stringify(data);
      // this should be the generated form
      const file = DriveApp.getFileById(this.__fileId);
      const folder = file.getParents().next();

      // 1. Create the sidecar file with the large JSON data.
      const blob = Utilities.newBlob(value, 'application/json', `${key}.${file.getId()}.json`);
      const sidecarFile = folder.createFile(blob);
  
      // 2. Store the ID of the sidecar file in the original file's (tiny) properties.
      // This uses the 'properties' field which is limited but works for an ID.
      const resource = {
        properties: {
          [`${key}`]: sidecarFile.getId()
        }
      };
      // adv drive to write properties
      Drive.Files.update(resource, file.getId());

      // return the sidecar as a an apps script file
      return sidecarFile

    } catch (e) {
      console.error(`Failed to write properties to file ${this.__fileId}: ${e.message}`);
      throw new Error(`Failed to write properties: ${e.message}`);
    }
  }

  /**
   * Reads and deserializes a JavaScript object from the private properties of the Drive file.
   * @param {string} key The key from which to retrieve the data.
   * @returns {object | null} The retrieved data object, or null if the key is not found.
   * @throws {Error} If the Drive API call fails or if the data is not valid JSON.
   */
  read(key) {
    // SIDECAR FILE WORKAROUND for large properties
    try {
      // 1. Read the (tiny) property to find the ID of the sidecar file.
      const file = Drive.Files.get(this.__fileId, { fields: 'properties' });
      // The Drive API returns properties as an object, not an array.
      const sidecarId = file.properties?.[`${key}`];

      if (sidecarId) {
        // 2. Get the sidecar file and read its full content.
        const sidecarFile = DriveApp.getFileById(sidecarId);
        const content = sidecarFile.getBlob().getDataAsString();
        return JSON.parse(content);
      }

      // If no sidecar ID is found, there's nothing to read.
      throw new Error(`Missing sidecar block definition file for form ${file.name}`);

    } catch (e) {
      console.error(`Failed to read properties from file ${this.__fileId}: ${e.message}`);
      throw new Error(`Failed to read properties: ${e.message}`);
    }
  }
}