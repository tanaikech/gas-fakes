/**
 * @file Provides a factory for creating fake Google Apps Script enums.
 * This utility helps in mimicking the behavior of built-in GAS enums like
 * `DocumentApp.ElementType` or `SpreadsheetApp.CopyPasteType`.
 */

/**
 * Creates a fake enum object that mimics the behavior of Google Apps Script enums.
 * The returned object is frozen, and its properties are read-only, ensuring
 * that it behaves like a true enum. Each key is mapped to a string of the same name.
 *
 * @example
 * const MyEnum = newFakeGasEnum('MyEnum', ['KEY_A', 'KEY_B']);
 * console.log(MyEnum.KEY_A); // Outputs: "KEY_A"
 * MyEnum.KEY_A = 'new value'; // Throws an error in strict mode
 *
 * @param {string} name The name of the enum, used for `toString()` representation (e.g., "ElementType").
 * @param {string[]} keys An array of strings representing the enum keys.
 * @returns {Object<string, string>} A frozen object where each key from the input array
 *   is mapped to itself as a string value, simulating an enum.
 */
export const newFakeGasEnum = (name, keys) => {
  const enumObject = {};
  keys.forEach(key => {
    // Define properties as non-writable and non-configurable to mimic native enums.
    Object.defineProperty(enumObject, key, {
      value: key,
      writable: false,
      enumerable: true,
      configurable: false,
    });
  });

  return Object.freeze(enumObject);
};