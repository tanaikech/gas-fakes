// fake Apps Script XmlService
import { newFakeXmlService as maker } from './fakexmlservice.js';
import { lazyLoaderApp } from '../common/lazyloader.js';

let _app = null;
_app = lazyLoaderApp(_app, 'XmlService', maker);
