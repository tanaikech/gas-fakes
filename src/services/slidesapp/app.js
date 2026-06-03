/**
 * the idea here is to create an empty global entry for the singleton
 * but only load it when it is actually used.
 */

import { lazyLoaderApp } from '../common/lazyloader.js'
import { newFakeSlidesApp as maker} from './fakeslidesapp.js';
import './pageelementfactory.js';
export { newFakePageElementRange } from './fakepageelementrange.js';
export { newFakePageRange } from './fakepagerange.js';
export { newFakeTableCellRange } from './faketablecellrange.js';
export { newFakeTableColumn } from './faketablecolumn.js';
let _app = null;
_app = lazyLoaderApp(_app, 'SlidesApp', maker)