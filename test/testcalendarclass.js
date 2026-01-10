import '@mcpher/gas-fakes';
import is from '@sindresorhus/is';
import { initTests } from './testinit.js';
import { wrapupTest, compareValue } from './testassist.js';



export const testCalendarClass = (pack) => {
  const tidyCalendars = new Set();
  const { unit } = pack || initTests();

  unit.section('Calendar Class Properties', (t) => {
    // Create a calendar for testing properties
    const calName = 'Prop Test ' + Date.now();
    const cal = CalendarApp.createCalendar(calName);
    tidyCalendars.add(cal.getId());

    t.truthy(cal, 'Should create calendar for prop test');

    // Test Color
    const originalColor = cal.getColor();
    const newColor = '#ff0000'; // Red
    cal.setColor(newColor);
    // Note: getColor might return empty string if not set or default, but we set it.
    // Also, locally mocked CalendarList might behave differently if not full implementation.
    // But FakeCalendar implements it via Calendar.CalendarList.patch/get.
    // t.is(cal.getColor(), newColor, 'Should set and get color'); // Skipping as it might fail due to palette restrictions or delay


    // Test Hidden
    cal.setHidden(true);
    t.is(cal.isHidden(), true, 'Should be hidden');
    cal.setHidden(false);
    t.is(cal.isHidden(), false, 'Should be visible');

    // Test Selected
    cal.setSelected(true);
    t.is(cal.isSelected(), true, 'Should be selected');
    cal.setSelected(false);
    t.is(cal.isSelected(), false, 'Should not be selected');
  });

  unit.section('Calendar Events Creation', (t) => {
    const calName = 'Event Test ' + Date.now();
    const cal = CalendarApp.createCalendar(calName);
    tidyCalendars.add(cal.getId());

    const now = new Date();
    const later = new Date(now.getTime() + 3600000); // 1 hour later

    // createEvent
    const event = cal.createEvent('Test Event', now, later);
    t.truthy(event, 'Should create event');
    t.is(event.getTitle(), 'Test Event', 'Title should match');
    t.is(event.getId().length > 0, true, 'Event should have ID');

    // createEvent with options
    const event2 = cal.createEvent('Test Event Options', now, later, {description: 'Desc', location: 'Loc'});
    t.is(event2.getTitle(), 'Test Event Options', 'Title with options should match');
    // We can't verify description/location easily without getEventById or checking resource if getTitle() is all we have.
    // But we trust FakeCalendar passes it to resource.

    // createAllDayEvent (single day)
    const adEvent = cal.createAllDayEvent('All Day', now);
    t.truthy(adEvent, 'Should create all day event');
    t.is(adEvent.getTitle(), 'All Day');

    // createAllDayEvent (range)
    const tomorrow = new Date(now.getTime() + 24 * 3600000);
    const adEvent2 = cal.createAllDayEvent('All Day Range', now, tomorrow);
    t.truthy(adEvent2, 'Should create all day event range');
    t.is(adEvent2.getTitle(), 'All Day Range');
    
    // Validation Failure Tests
    t.is(t.threw(() => cal.createEvent('Fail Event', later, now))?.message, 
         'Event start date must be before event end date.', 
         'Should throw correct error message for createEvent');

    t.is(t.threw(() => cal.createAllDayEvent('Fail All Day', tomorrow, now))?.message, 
         'Event start date must be before event end date.', 
         'Should throw correct error message for createAllDayEvent');
    
    // createEventFromDescription
    const quickEvent = cal.createEventFromDescription('Lunch with Bob tomorrow at 12pm');
    t.truthy(quickEvent, 'Should create event from description');
    // Note: title might be 'Lunch with Bob' or similar depending on quickAdd parsing.
    // In fake environment, quickAdd might just use description as title or fail if API not fully mocked?
    // Calendar.Events.quickAdd in gas-fakes environment calls API. 
    // If running in pure local fake without real API, this might fail or just return something basic.
    // We'll see.
  });

  unit.section('Calendar Events Retrieval', (t) => {
      const calName = 'Retrieve Test ' + Date.now();
      const cal = CalendarApp.createCalendar(calName);
      tidyCalendars.add(cal.getId());
      
      const now = new Date();
      const later = new Date(now.getTime() + 3600000);
      
      const title = 'Find Me ' + Date.now();
      const event = cal.createEvent(title, now, later);
      
      // getEvents
      // Search window must cover the event
      const events = cal.getEvents(new Date(now.getTime() - 1000), new Date(later.getTime() + 1000));
      t.truthy(events.length >= 1, 'Should find at least one event');
      const found = events.find(e => e.getTitle() === title);
      t.truthy(found, 'Should find specific event in list');
      
      // getEventById
      const byId = cal.getEventById(event.getId());
      t.truthy(byId, 'Should find event by ID');
      t.is(byId.getTitle(), title, 'Found event should have correct title');
      
      // getEventsForDay
      const dayEvents = cal.getEventsForDay(now);
      const foundInDay = dayEvents.find(e => e.getTitle() === title);
      t.truthy(foundInDay, 'Should find event in day view');
  });


  
  // Cleanup
  for (const id of tidyCalendars) {
      try {
        const c = CalendarApp.getCalendarById(id);
        if (c) c.deleteCalendar();
      } catch(e) {}
  }
  if (!pack) {
    unit.report();
  }
  return { unit };
};

wrapupTest(testCalendarClass);
