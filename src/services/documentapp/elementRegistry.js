const registry = new Map();

/**
 * Registers a factory for a given element type.
 * @param {string} type - The element type string (e.g., 'PARAGRAPH').
 * @param {Function} factory - The factory function for creating the element.
 */
export const registerElement = (type, factory) => {
  registry.set(type, factory);
};

/**
 * Retrieves the factory for a given element type.
 * @param {string} type - The element type string.
 * @returns {Function} The factory function.
 */
export const getElementFactory = (type) => {
  if (!registry.has(type)) {
    throw new Error(`Type ${type} not registered.`);
  }
  return registry.get(type);
};