import '@mcpher/gas-fakes';
import is from '@sindresorhus/is';
import { initTests } from './testinit.js';
import { wrapupTest, compareValue } from './testassist.js';

export const testCalendarApp = (pack) => {
  const { unit } = pack || initTests();

  unit.section('CalendarApp Placeholder', (t) => {
    t.truthy(CalendarApp, 'CalendarApp should be defined');

    // Test a basic method
    t.is(CalendarApp.getDefaultCalendar(), null, 'getDefaultCalendar should return null (placeholder)');

    // Test some enums from calendarenums.js
    t.truthy(CalendarApp.Month, 'CalendarApp.Month should be defined');
    t.is(CalendarApp.Month.JANUARY.toString(), 'JANUARY', 'Month.JANUARY should be accessible');

    t.truthy(CalendarApp.Weekday, 'CalendarApp.Weekday should be defined');
    t.is(CalendarApp.Weekday.MONDAY.toString(), 'MONDAY', 'Weekday.MONDAY should be accessible');

    t.truthy(CalendarApp.Visibility, 'CalendarApp.Visibility should be defined');
    t.is(CalendarApp.Visibility.PRIVATE.toString(), 'PRIVATE', 'Visibility.PRIVATE should be accessible');
  });

  if (!pack) {
    unit.report();
  }
  return { unit };
};

wrapupTest(testCalendarApp);
