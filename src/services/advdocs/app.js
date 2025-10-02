
/**
 * the idea here is to create a global entry for the singleton 
 * before we actually have everything we need to create it. 
 * We do this by using a proxy, intercepting calls to the 
 * initial sigleton and diverting them to a completed one
 */
import { newFakeAdvDocs as maker } from './fakeadvdocs.js'
import { lazyLoaderApp } from '../common/lazyloader.js'

let _app = null;
_app = lazyLoaderApp(_app, 'Docs', maker)

