// testing locally
// sync the version with gas fakes code since they share a package.json
import { createRequire } from 'node:module';
const require = createRequire(import.meta.url);
const pjson = require('./package.json');
const VERSION = pjson.version;
console.log (`...gas-fakes version ${VERSION}`)
import './src/index.js'
