/**
 * the idea here is to create an empty global entry for the singleton
 * but only load it when it is actually used.
 */
import { lazyLoaderApp } from '../common/lazyloader.js'
import { newFakeLogger as maker } from './fakelogger.js';
let _app = null;
_app = lazyLoaderApp(_app, 'Logger', maker)