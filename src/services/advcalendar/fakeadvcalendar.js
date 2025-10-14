/**
 * @file advcalendar/fakeadvcalendar.js
 * @author Bruce Mcpherson
 *
 * @description This is a fake for the advanced calendar service
 *
 */
import { Proxies } from "../../support/proxies.js";
import { advClassMaker } from "../../support/helpers.js";
import { calendarCacher } from "../../support/calendarcacher.js";
import { propsList } from "./calendarpropslist.js";
import { newFakeAdvCalendarAcl } from "./fakeadvcalendaracl.js";
import { newFakeAdvCalendarCalendarList } from "./fakeadvcalendarcalendarlist.js";
import { newFakeAdvCalendarCalendars } from "./fakeadvcalendarcalendars.js";
import { newFakeAdvCalendarChannels } from "./fakeadvcalendarchannels.js";
import { newFakeAdvCalendarColors } from "./fakeadvcalendarcolors.js";
import { newFakeAdvCalendarEvents } from "./fakeadvcalendarevents.js";
import { newFakeAdvCalendarFreebusy } from "./fakeadvcalendarfreebusy.js";
import { newFakeAdvCalendarSettings } from "./fakeadvcalendarsettings.js";

class FakeAdvCalendar {
  constructor() {
    this.__fakeObjectType = "Calendar";

    Reflect.ownKeys(propsList).forEach((p) => {
      this[p] = () => advClassMaker(propsList[p]);
    });
  }
  toString() {
    return "AdvancedServiceIdentifier{name=calendar, version=v3}";
  }

  getVersion() {
    return "v3";
  }

  get Acl() {
    return newFakeAdvCalendarAcl(this);
  }
  get CalendarList() {
    return newFakeAdvCalendarCalendarList(this);
  }
  get Calendars() {
    return newFakeAdvCalendarCalendars(this);
  }
  get Channels() {
    return newFakeAdvCalendarChannels(this);
  }
  get Colors() {
    return newFakeAdvCalendarColors(this);
  }
  get Events() {
    return newFakeAdvCalendarEvents(this);
  }
  get Freebusy() {
    return newFakeAdvCalendarFreebusy(this);
  }
  get Settings() {
    return newFakeAdvCalendarSettings(this);
  }

  __getCalendarPerformance() {
    return calendarCacher.getPerformance();
  }
}

export const newFakeAdvCalendar = (...args) =>
  Proxies.guard(new FakeAdvCalendar(...args));