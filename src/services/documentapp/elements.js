// This file is used to ensure all element types are loaded and registered
// with the elementRegistry. By importing them here, we trigger their
// registration code.

import './fakeparagraph.js';
import './fakebody.js';
import './fakepagebreak.js';
import './faketext.js';
import './fakehorizontalrule.js';
import './faketable.js';
import './faketablerow.js';
import './faketablecell.js';
import './fakelistitem.js';
// As you create more element types (e.g., Table, ListItem), import them here.
// import './faketable.js';