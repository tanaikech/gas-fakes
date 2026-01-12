import '@mcpher/gas-fakes';
import is from '@sindresorhus/is';
import { initTests } from './testinit.js';
import { wrapupTest, compareValue, maketcal, trasher } from './testassist.js';


export const testCalendarApp = (pack) => {
  const { unit, fixes } = pack || initTests();
  const toTrash = [];

  unit.section('CalendarApp general', (t) => {
    t.truthy(CalendarApp, 'CalendarApp should be defined');

    // Test a basic method
    t.truthy(CalendarApp.getDefaultCalendar(), 'getDefaultCalendar should return something');

    // Test some enums from calendarenums.js
    t.truthy(CalendarApp.Month, 'CalendarApp.Month should be defined');
    t.is(CalendarApp.Month.JANUARY.toString(), 'JANUARY', 'Month.JANUARY should be accessible');

    t.truthy(CalendarApp.Weekday, 'CalendarApp.Weekday should be defined');
    t.is(CalendarApp.Weekday.MONDAY.toString(), 'MONDAY', 'Weekday.MONDAY should be accessible');

    t.truthy(CalendarApp.Visibility, 'CalendarApp.Visibility should be defined');
    t.is(CalendarApp.Visibility.PRIVATE.toString(), 'PRIVATE', 'Visibility.PRIVATE should be accessible');
  });

  unit.section('Calendar Class Metadata', (t) => {
    const calendar = CalendarApp.getDefaultCalendar();
    t.truthy(calendar, 'Default calendar should exist');
    
    // In both fake and live environments, the ID should now be the canonical ID (email), not 'primary'
    // Session is usually available in fake environment too via the worker
    const expectedId = Session.getEffectiveUser().getEmail();
    t.is(calendar.getId(), expectedId, 'Default calendar ID should match user email');


    // now create a test calendar
    const { cal: testCalendar, calName: tname } = maketcal(toTrash, fixes, { nameSuffix: 'general' });
    t.truthy(testCalendar, 'Test calendar should exist');
    t.is(testCalendar.getName(), tname, 'Test calendar name should match');

    // Test setters and getters
    const originalName = testCalendar.getName();
    const testName = 'Test Calendar ' + Date.now();
    testCalendar.setName(testName);
    t.is(testCalendar.getName(), testName, 'Calendar name should be updated');

    const testDescription = 'Testing gas-fakes Calendar implementation';
    testCalendar.setDescription(testDescription);
    t.is(testCalendar.getDescription(), testDescription, 'Calendar description should be updated');

    const testTimeZone = 'UTC';
    testCalendar.setTimeZone(testTimeZone);
    t.is(testCalendar.getTimeZone(), testTimeZone, 'Calendar time zone should be updated');

    // Restore name (optional but good practice)
    testCalendar.setName(originalName);
  });


  if (!pack) {
    unit.report();
  }
  if (fixes.CLEAN) trasher(toTrash);
  return { unit };
};


wrapupTest(testCalendarApp);

