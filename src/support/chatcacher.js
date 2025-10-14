/**
 * avoid going to api if we already have it
 * anything other than a get should jusr delete the whiole map for the form
 */
const USE_CACHE = true;
import { newFetchCacher } from "./fetchcacher.js";
export const chatCacher = newFetchCacher(USE_CACHE);

