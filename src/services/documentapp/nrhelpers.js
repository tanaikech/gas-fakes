import { Utils } from "../../support/utils.js";
const { is } = Utils

// all named ranges are prefixed like this to distinguish from any other that might be user created
const shadowPrefix = "GAS_FAKE_"

// makes a prefix for a named range based on the type of elelemtn
export const makeNrPrefix = (type = null, segmentId = null) => {
  // A null or empty string segmentId refers to the body.
  const segmentPart = (is.nonEmptyString(segmentId) ? segmentId : 'body') + '_';

  if (is.null(type)) {
    return shadowPrefix + segmentPart;
  }
  if (!is.nonEmptyString(type)) {
    throw `expected a non empty string - got ${type}`
  }
  return shadowPrefix + segmentPart + type + '_';
};

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
const addNrRequest = (type, element, addRequests, segmentId) => {
  const name = makeNrPrefix(type, segmentId) + Utilities.getUuid();
  addRequests.push({
    createNamedRange: {
      name,
      range: {
        endIndex: element.endIndex,
        startIndex: element.startIndex,
        segmentId: segmentId,
      },
    },
  });
  return {
    name,
  };
};

// either finds a matching named range, or adds it to the creation queue
export const findOrCreateNamedRangeName = (element, type, currentNr, addRequests, segmentId) => {
  const { endIndex, startIndex } = element;
  const prefix = makeNrPrefix(type, segmentId);

  // First, try for an exact match on start and end index. This is the most reliable.
  let bestMatchIndex = currentNr.findIndex(nr =>
    nr.name.startsWith(prefix) &&
    (nr.ranges || []).some(range =>
      range.endIndex === endIndex &&
      range.startIndex === startIndex &&
      // Also check that the segmentId matches. The API returns an empty string for the body segment.
      (range.segmentId || '') === (segmentId || '')
    )
  );

  let isPartialMatch = false;
  // If no exact match, try a looser match on just the start index.
  // This handles cases where an element (like the last paragraph) is modified by an append,
  // which changes its endIndex but not its startIndex.
  if (bestMatchIndex === -1) {
    bestMatchIndex = currentNr.findIndex(nr =>
      nr.name.startsWith(prefix) &&
      (nr.ranges || []).some(range => range.startIndex === startIndex && (range.segmentId || '') === (segmentId || ''))
    );
    if (bestMatchIndex !== -1) {
      isPartialMatch = true;
    }
  }

  if (bestMatchIndex !== -1) {
    // Consume it from the list so it can't be matched to another element.
    const [foundRange] = currentNr.splice(bestMatchIndex, 1);

    // If it was a partial match, it means the element was modified (e.g., endIndex changed).
    // We need to update its named range by deleting the old one and creating a new one with the same name.
    if (isPartialMatch) {
      addRequests.push({ deleteNamedRange: { namedRangeId: foundRange.namedRangeId } });
      addRequests.push({
        createNamedRange: {
          name: foundRange.name,
          range: { startIndex, endIndex, segmentId },
        },
      });
    }
    return foundRange;
  }

  // If no match was found, it's a genuinely new element.
  return addNrRequest(type, element, addRequests, segmentId);
};