

/**
 * the idea here is to create an empty global entry for the singleton
 * but only load it when it is actually used.
 */

import { lazyLoaderApp } from '../common/lazyloader.js'
import { newFakeDocumentApp as maker } from './fakedocumentapp.js';
import './elements.js'; // This ensures all element types register themselves before DocumentApp is used.

let _app = null;
_app = lazyLoaderApp(_app, 'DocumentApp', maker)