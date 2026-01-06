
import '@mcpher/gas-fakes';
import { testReproStaleSlide } from './repro_issue.js';

if (ScriptApp.isFake) {
  testReproStaleSlide();
}
