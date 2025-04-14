/**
 * avoid going to api if we already have it
 * this naive implementation will keep a map for each spreadsheet it knows about and us e akey based on the api params to precheck a get
 * anything other than a get should jusr delete the whiole map for the spreadsheet
 */
const USE_CACHE = true
const workbooks = new Map()

const _performance = {
  hits: 0,
  misses: 0,
  numberOfCaches: 0
}

export const getSheetsPerformance = () => ({
  ..._performance,
  numberOfCaches: workbooks.size    
})


const getWorkbookCache = (id) => {
  if (!USE_CACHE) return null
  if (!workbooks.has(id)) {
    workbooks.set(id, new Map())
  }
  return workbooks.get(id)
}

export const deleteWorkbookEntry = (id, params) => {
  if (!USE_CACHE) return null
  const cache = getWorkbookCache(id)
  const key = digest(params)
  cache.delete(key)
  return null
}

export const clearWorkbookCache = (id) => {
  if (!USE_CACHE) return null
  workbooks.delete(id)
  return null
}


export const setWorkbookEntry = (id, params, value) => {
  if (!USE_CACHE) return value
  const cache = getWorkbookCache(id)
  const key = digest(params)
  cache.set(key, value)
  return value
}

export const getWorkbookEntry = (id, params) => {
  if (!USE_CACHE) return null
  const cache = getWorkbookCache(id)
  const key = digest(params)
  if (cache.has(key)) {
    _performance.hits++
    return cache.get(key)
  } else {
    _performance.misses++
    return null
  }

}

const digest = (params) => {
  const str = JSON.stringify(params)
  // todo - when sha1 is available digest this
  return Utilities.base64Encode(Utilities.newBlob(str).getBytes())
}
