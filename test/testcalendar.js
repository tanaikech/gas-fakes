import '@mcpher/gas-fakes';
import is from '@sindresorhus/is';

import { initTests } from './testinit.js';
import { getCalendarPerformance, wrapupTest, trasher } from './testassist.js';

export const testCalendar = (pack) => {
  const toTrash = [];
  const { unit, fixes } = pack || initTests();


    unit.section("basic adv calendar props", t => {
      t.is(Calendar.toString(), "AdvancedServiceIdentifier{name=calendar, version=v3}")
      t.is(Calendar.getVersion(), "v3")

      Reflect.ownKeys(Calendar)
        .filter(f => is.string(f) && f.match(/^new/))
        .forEach(f => {
          t.true(is.function(Calendar[f]), `check ${f} is a function`);
          const method = Calendar[f];
          const ob = method();
          t.true(Reflect.ownKeys(ob).every(g => is.function(ob[g])), `all Calendar.${f}().subprops are functions`)
        });

      const resources = ['Acl', 'CalendarList', 'Calendars', 'Channels', 'Colors', 'Events', 'Freebusy', 'Settings'];
      resources.forEach(resource => {
        t.is(is(Calendar[resource]), "Object", `Calendar.${resource} should be an object`);
        t.is(Calendar.toString(), Calendar[resource].toString(), `Calendar.${resource} should have the correct toString()`);
      });

      if (Calendar.isFake) console.log('...cumulative calendar cache performance', getCalendarPerformance())
    })
  

  if (!pack) {
    unit.report();
  }
  if (fixes.CLEAN) trasher(toTrash);
  return { unit, fixes };
};

wrapupTest(testCalendar);