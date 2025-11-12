import '../../main.js';
import { readFileSync } from 'fs';

const bb = JSON.parse(readFileSync ('buildingblocks.json','utf8'))
console.log (bb)