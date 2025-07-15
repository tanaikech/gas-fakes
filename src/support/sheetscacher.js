/**
 * avoid going to api if we already have it
 * this naive implementation will keep a map for each spreadsheet it knows about and us e akey based on the api params to precheck a get
 * anything other than a get should jusr delete the whiole map for the spreadsheet
 */
const USE_CACHE = true
import { newFetchCacher } from "./fetchcacher.js"
export const sheetsCacher = newFetchCacher(USE_CACHE)

