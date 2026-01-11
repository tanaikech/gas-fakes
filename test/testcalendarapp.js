import '@mcpher/gas-fakes';
import is from '@sindresorhus/is';
import { initTests } from './testinit.js';
import { wrapupTest, compareValue } from './testassist.js';


export const testCalendarApp = (pack) => {
  const { unit } = pack || initTests();
  const tidyCalendars = new Set();
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
    t.is(calendar.getId(), 'primary', 'Default calendar ID should be primary');


    // now create a test calendar
    const tname = 'Test Calendar ' + Date.now();
    const testCalendar = CalendarApp.createCalendar(tname);
    t.truthy(testCalendar, 'Test calendar should exist');
    t.is(testCalendar.getName(), tname, 'Test calendar name should match');
    tidyCalendars.add(testCalendar.getId());

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


  // delete test calendars
  for (const id of tidyCalendars) {
    const cal = CalendarApp.getCalendarById(id)
    if (cal) cal.deleteCalendar();
  }
  if (!pack) {
    unit.report();
  }
  return { unit };
};


wrapupTest(testCalendarApp);

