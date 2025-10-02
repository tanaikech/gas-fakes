
/**
 * the idea here is to create an empty global entry for the singleton
 * but only load it when it is actually used.
 */
import { lazyLoaderApp } from '../common/lazyloader.js'
import { newFakeUtilities as maker } from './fakeutilities.js';
let _app = null;
_app = lazyLoaderApp(_app, 'Utilities', maker)