/**
 * the idea here is to create an empty global entry for the singleton
 * but only load it when it is actually used.
 */
import { newFakeFormApp as maker} from './fakeformapp.js';
import { lazyLoaderApp } from '../common/lazyloader.js'

let _app = null;
_app = lazyLoaderApp(_app, 'FormApp', maker)
