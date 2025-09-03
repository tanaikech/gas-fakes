const registry = new Map();

/**
 * Registers a factory for a given item type.
 * @param {FormApp.ItemType} type - The item type enum value (e.g., FormApp.ItemType.CHECKBOX).
 * @param {Function} factory - The factory function for creating the item.
 */
export const registerFormItem = (type, factory) => {
  registry.set(type.toString(), factory); // Use toString() for map key
};

/**
 * Retrieves the factory for a given item type.
 * @param {FormApp.ItemType} type - The item type enum value.
 * @returns {Function} The factory function.
 */
export const getFormItemFactory = (type) => {
  const typeString = type.toString();
  if (!registry.has(typeString)) {
    throw new Error(`Form item type ${typeString} not registered.`);
  }
  return registry.get(typeString);
};
