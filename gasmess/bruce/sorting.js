
/**
 * Compares two values using Google Sheets' ascending sort logic.
 * @param {*} a first value to compare
 * @param {*} b second value to compare
 * @returns {number} a<b: -1, a===b: 0, a>b: 1
 */
const compareMixedValues = (a, b) => {
  const isBlankA = (a === null || a === undefined || a === "");
  const isBlankB = (b === null || b === undefined || b === "");

  // Handle blanks - always sorted to the top in this ascending comparator
  if (isBlankA && !isBlankB) return -1;
  if (!isBlankA && isBlankB) return 1;
  if (isBlankA && isBlankB) return 0;

  // Get type priorities (lower number = sorts first)
  const getTypePriority = (val) => {
    // Correct Google Sheets ascending priority
    if (typeof val === 'number') return 1;
    if (typeof val === 'string') return 2;
    if (typeof val === 'boolean') return 3;
    if (val instanceof Date) return 4;
    return 5;
  };

  const priorityA = getTypePriority(a);
  const priorityB = getTypePriority(b);

  // If different types, sort by type priority
  if (priorityA !== priorityB) {
    return priorityA < priorityB ? -1 : 1;
  }

  // Same types - compare values
  if (typeof a === 'number' && typeof b === 'number') {
    return a - b;
  }
  if (typeof a === 'string' && typeof b === 'string') {
    return a.localeCompare(b, undefined, { sensitivity: 'base', numeric: true });
  }
  if (typeof a === 'boolean' && typeof b === 'boolean') {
    return (a === b) ? 0 : (a ? 1 : -1); 
  }
  if (a instanceof Date && b instanceof Date) {
    return a.getTime() - b.getTime();
  }

  // Fallback for other types
  const strA = String(a);
  const strB = String(b);
  return strA.localeCompare(strB, undefined, { sensitivity: 'base' });
};
// ... your sort2d function remains correct, just pass the 'ascending' flag to compareMixedValues.
export const sort2d = (spec, arr) => {
  const deepCopy = arr.map(row => [...row]);
  return deepCopy.sort((a, b) => {
    for (const s of spec) {
      const index = (typeof s === 'object' && s !== null) ? s.column - 1 : s - 1;
      const ascending = (typeof s === 'object' && s !== null) ? s.ascending !== false : true;
      let result = compareMixedValues(a[index], b[index]);
      if (!ascending) {
          result = -result;
      }
      if (result !== 0) {
          return result;
      }
    }
    return 0;
  });
};

// Test function to verify behavior
export const testSorting = (spec) => {
  const testData = [
    [false, 120, 'cheese', 'peach', 'armpit', 10],
    ['kiwi', 'orange', 'apple', 'bub ble', 'bucket', 'armpit'],
    ['plum', 'butter', 'buckle', 'grape', 65, 65],
    [false, "", 'armpit', 'orange', 21, 'buckle'],
    ['cherry', 'foo', 'butter', 21, 'red eye', 'foo'],
    ['kiwi', 77, false, 'banana', 'red eye', 'apple'],
    ['buckle', 'bar', 'foo', 21, 10, 'foo'],
    ['bub ble', 65, 'butter', 'buckle', 'bub ble', null],
    ['cheese', 'pear', 'pear', 77, 10, 'foo'],
    [
      'bub ble',
      'armpit',
      'melon',
      'buckle',
      'red eye',
      3.141592653589793
    ],
    ['pear', false, 0.3963452962629548, 'foo', 'banana', 'plum'],
    ['cherry', true, 'apple', 'cheese', 'butter', 'peach']
  ]

  console.log('Original:', testData);

  // Sort by column 2 (booleans) ascending
  const sorted = sort2d(spec, testData);
  console.log('Sorted by column 2 (booleans ASC):', sorted);

  return sorted;
};
const spec = [1,{column:2 , ascending:false}]
testSorting(spec)