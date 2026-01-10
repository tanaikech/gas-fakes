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

  // only sandbox tests in fakes
  if (ScriptApp.isFake) {
    unit.section('Calendar Management', (t) => {
      // Test creating a new calendar
      const newName = 'Gas Fakes Test Calendar ' + Date.now();
      const newCal = CalendarApp.createCalendar(newName);
      tidyCalendars.add(newCal.getId());
      t.truthy(newCal, 'Created calendar should exist');
      t.is(newCal.getName(), newName, 'New calendar name should match');

      // Test listing calendars
      const allCals = CalendarApp.getAllCalendars();
      t.truthy(allCals.length > 0, 'Should have at least one calendar');
      const found = allCals.find(c => c.getName() === newName);
      t.truthy(found, 'Created calendar should be found in all calendars');

      const ownedCals = CalendarApp.getAllOwnedCalendars();
      t.truthy(ownedCals.length > 0, 'Should have at least one owned calendar');

      const byName = CalendarApp.getCalendarsByName(newName);
      t.is(byName.length, 1, 'Should find one calendar by name');
      t.is(byName[0].getId(), newCal.getId(), 'Found calendar ID should match');
    });


    unit.section('Calendar Sandbox - Whitelist Access', (t) => {
      // Save current sandbox state
      const behavior = ScriptApp.__behavior;
      const originalSandboxMode = behavior.sandboxMode;
      const calendarSettings = behavior.sandboxService.CalendarApp;
      const originalWhitelist = calendarSettings.calendarWhitelist;

      try {
        // Enable sandbox mode
        behavior.sandboxMode = true;

        // Create a test calendar that will be in the whitelist
        const whitelistedName = 'Whitelisted Calendar ' + Date.now();
        const whitelistedCal = CalendarApp.createCalendar(whitelistedName);
        t.truthy(whitelistedCal, 'Should create whitelisted calendar');

        // Create another calendar that won't be in the whitelist
        const restrictedName = 'Restricted Calendar ' + Date.now();
        const restrictedCal = CalendarApp.createCalendar(restrictedName);
        t.truthy(restrictedCal, 'Should create restricted calendar');

        // Clear the session tracking to simulate external calendars
        behavior.__createdCalendarIds.clear();

        // Set up whitelist
        calendarSettings.calendarWhitelist = [
          { name: whitelistedName, read: true, write: false },
          { name: 'Primary', read: true, write: true }
        ];

        // Test: Primary calendar should always be accessible
        const primary = CalendarApp.getDefaultCalendar();
        t.truthy(primary, 'Primary calendar should be accessible');
        t.is(primary.getId(), 'primary', 'Should get primary calendar');

        // Test: Whitelisted calendar should be readable
        const foundWhitelisted = CalendarApp.getCalendarsByName(whitelistedName);
        t.is(foundWhitelisted.length, 1, 'Should find whitelisted calendar');

        // Test: Restricted calendar should not be accessible
        const foundRestricted = CalendarApp.getCalendarsByName(restrictedName);
        t.is(foundRestricted.length, 0, 'Should not find restricted calendar');

        // Test: getAllCalendars should only return accessible calendars
        const allCals = CalendarApp.getAllCalendars();
        const hasWhitelisted = allCals.some(c => c.getName() === whitelistedName);
        const hasRestricted = allCals.some(c => c.getName() === restrictedName);
        t.truthy(hasWhitelisted, 'getAllCalendars should include whitelisted calendar');
        t.is(hasRestricted, false, 'getAllCalendars should not include restricted calendar');

      } finally {
        // Restore original state
        behavior.sandboxMode = originalSandboxMode;
        calendarSettings.calendarWhitelist = originalWhitelist;
      }
    });

    unit.section('Calendar Sandbox - Write Permissions', (t) => {
      const behavior = ScriptApp.__behavior;
      const originalSandboxMode = behavior.sandboxMode;
      const calendarSettings = behavior.sandboxService.CalendarApp;
      const originalWhitelist = calendarSettings.calendarWhitelist;

      try {
        behavior.sandboxMode = true;

        // Create test calendars
        const readOnlyName = 'Read Only Calendar ' + Date.now();
        const readOnlyCal = CalendarApp.createCalendar(readOnlyName);

        const writableName = 'Writable Calendar ' + Date.now();
        const writableCal = CalendarApp.createCalendar(writableName);

        // Clear session tracking
        behavior.__createdCalendarIds.clear();

        // Set up whitelist with different permissions
        calendarSettings.calendarWhitelist = [
          { name: readOnlyName, read: true, write: false },
          { name: writableName, read: true, write: true }
        ];

        // Test: Read-only calendar should reject writes
        const readOnlyCals = CalendarApp.getCalendarsByName(readOnlyName);
        t.is(readOnlyCals.length, 1, 'Should find read-only calendar');

        try {
          readOnlyCals[0].setDescription('Should fail');
          t.fail('Should not allow write to read-only calendar');
        } catch (e) {
          t.truthy(e.message.includes('denied'), 'Should throw access denied error');
        }

        // Test: Writable calendar should allow writes
        const writableCals = CalendarApp.getCalendarsByName(writableName);
        t.is(writableCals.length, 1, 'Should find writable calendar');

        writableCals[0].setDescription('Should succeed');
        t.is(writableCals[0].getDescription(), 'Should succeed', 'Should update writable calendar');

      } finally {
        behavior.sandboxMode = originalSandboxMode;
        calendarSettings.calendarWhitelist = originalWhitelist;
      }
    });

    unit.section('Calendar Sandbox - Usage Limits', (t) => {
      const behavior = ScriptApp.__behavior;
      const originalSandboxMode = behavior.sandboxMode;
      const calendarSettings = behavior.sandboxService.CalendarApp;
      const originalLimit = calendarSettings.usageLimit;
      const originalWhitelist = calendarSettings.calendarWhitelist;

      try {
        behavior.sandboxMode = true;

        // Create a test calendar
        const testName = 'Usage Test Calendar ' + Date.now();
        const testCal = CalendarApp.createCalendar(testName);

        // Clear session and set up whitelist
        behavior.__createdCalendarIds.clear();
        calendarSettings.calendarWhitelist = [
          { name: testName, read: true, write: true }
        ];

        // Test: Granular read limit
        calendarSettings.usageLimit = { read: 2, write: 10 };
        calendarSettings.resetUsageCount();

        // First two reads should succeed
        CalendarApp.getCalendarsByName(testName);
        CalendarApp.getCalendarsByName(testName);

        // Third read should fail
        try {
          CalendarApp.getCalendarsByName(testName);
          t.fail('Should enforce read limit');
        } catch (e) {
          t.truthy(e.message.includes('usage limit'), 'Should throw usage limit error');
        }

        // Test: Total usage limit
        calendarSettings.usageLimit = 3; // Total limit
        calendarSettings.resetUsageCount();

        // Use up the limit with mixed operations
        CalendarApp.getAllCalendars(); // read: 1
        CalendarApp.getAllOwnedCalendars(); // read: 2
        CalendarApp.getCalendarsByName(testName); // read: 3

        // Next operation should fail
        try {
          CalendarApp.getAllCalendars(); // read: 4 - should fail
          t.fail('Should enforce total usage limit');
        } catch (e) {
          t.truthy(e.message.includes('usage limit'), 'Should throw total usage limit error');
        }

      } finally {
        behavior.sandboxMode = originalSandboxMode;
        calendarSettings.usageLimit = originalLimit;
        calendarSettings.calendarWhitelist = originalWhitelist;
        calendarSettings.resetUsageCount();
      }
    });

    unit.section('Calendar Sandbox - Session Calendars', (t) => {
      const behavior = ScriptApp.__behavior;
      const originalSandboxMode = behavior.sandboxMode;
      const calendarSettings = behavior.sandboxService.CalendarApp;
      const originalWhitelist = calendarSettings.calendarWhitelist;

      try {
        behavior.sandboxMode = true;

        // Set up empty whitelist
        calendarSettings.calendarWhitelist = [];

        // Test: Session-created calendars should be accessible even without whitelist
        const sessionName = 'Session Calendar ' + Date.now();
        const sessionCal = CalendarApp.createCalendar(sessionName);
        t.truthy(sessionCal, 'Should create session calendar');

        // Should be able to read and write to session calendar
        sessionCal.setDescription('Session calendar description');
        t.is(sessionCal.getDescription(), 'Session calendar description', 'Should modify session calendar');

        // Should find it in listings
        const found = CalendarApp.getCalendarsByName(sessionName);
        t.is(found.length, 1, 'Should find session calendar in listings');

        const allCals = CalendarApp.getAllCalendars();
        const hasSession = allCals.some(c => c.getName() === sessionName);
        t.truthy(hasSession, 'getAllCalendars should include session calendar');

      } finally {
        behavior.sandboxMode = originalSandboxMode;
        calendarSettings.calendarWhitelist = originalWhitelist;
      }
    });

    unit.section('Calendar Sandbox - Method Whitelist', (t) => {
      const behavior = ScriptApp.__behavior;
      const originalSandboxMode = behavior.sandboxMode;
      const calendarSettings = behavior.sandboxService.CalendarApp;
      const originalMethodWhitelist = calendarSettings.methodWhitelist;

      try {
        behavior.sandboxMode = true;

        // Set up method whitelist
        calendarSettings.setMethodWhitelist(['getDefaultCalendar', 'getCalendarById', 'createCalendar']);

        // Test: Whitelisted methods should work
        const primary = CalendarApp.getDefaultCalendar();
        t.truthy(primary, 'Whitelisted method should work');

        const newCal = CalendarApp.createCalendar('Method Test ' + Date.now());
        t.truthy(newCal, 'Whitelisted createCalendar should work');

        // Test: Non-whitelisted methods should fail
        try {
          CalendarApp.getAllCalendars();
          t.fail('Non-whitelisted method should fail');
        } catch (e) {
          t.truthy(e.message.includes('not allowed'), 'Should throw method not allowed error');
        }

      } finally {
        behavior.sandboxMode = originalSandboxMode;
        calendarSettings.clearMethodWhitelist();
      }
    });
  }

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

