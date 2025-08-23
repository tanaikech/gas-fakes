import { Utils } from "../../support/utils.js";
const { is } = Utils

// all named ranges are prefixed like this to distinguish from any other that might be user created
const shadowPrefix = "GAS_FAKE_"

// makes a prefix for a named range based on the type of elelemtn
export const makeNrPrefix = (type = null) => {
  if (is.null(type)) {
    return shadowPrefix
  }
  if (!is.nonEmptyString(type)) {
    throw `expected a non empty string - got ${type}`
  }
  return shadowPrefix + type + '_'
}

// get all the relevant named ranges from the current document
export const getCurrentNr = (data) => {
  // filter out unrelated namedranges, and add the rest for lookup later
  return Reflect.ownKeys(data.namedRanges || {})
    .filter(key => key.startsWith(shadowPrefix))
    .reduce((p, c) => {
      // strangly there's another level of .namedRanges property
      if (data.namedRanges[c].namedRanges.length !== 1) {
        // TODO I dont know if this true yet we'll need to investigate
        throw new Error(`expected only 1 nr match but got ${data.namedRanges[c].namedRanges.length}`)
      }
      data.namedRanges[c].namedRanges.forEach(r => {
        p.push(r)
      })
      return p
    }, [])
}

// add a request to the bacth requests to create a new named range
const addNrRequest = (type, element, addRequests) => {
  const name = makeNrPrefix(type) + Utilities.getUuid()
  addRequests.push({
    createNamedRange: {
      name,
      range: {
        endIndex: element.endIndex,
        startIndex: element.startIndex
      }
    }
  })
  return {
    name
  }
}

// either finds a matching named range, or adds it to the creation queue
export const findOrCreateNamedRangeName = (element, type, currentNr, addRequests) => {
  const { endIndex, startIndex } = element;
  const prefix = makeNrPrefix(type);

  const bestMatchIndex = currentNr.findIndex(nr =>
    nr.name.startsWith(prefix) &&
    (nr.ranges || []).some(range => range.endIndex === endIndex && range.startIndex === startIndex)
  );

  if (bestMatchIndex !== -1) {
    // We found a match (either exact or expanded).
    // Consume it from the list so it can't be matched to another element.
    const [foundRange] = currentNr.splice(bestMatchIndex, 1);
    return foundRange;
  }

  // If no match was found, it's a genuinely new element.
  return addNrRequest(type, element, addRequests);
};