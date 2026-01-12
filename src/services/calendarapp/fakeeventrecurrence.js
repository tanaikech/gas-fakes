import { Proxies } from '../../support/proxies.js';
import { newFakeRecurrenceRule } from './fakerecurrencerule.js';

export const newFakeEventRecurrence = (...args) => {
  return Proxies.guard(new FakeEventRecurrence(...args));
};

/**
 * Represents the recurrence settings for an event series.
 * @see https://developers.google.com/apps-script/reference/calendar/event-recurrence
 */
export class FakeEventRecurrence {
  constructor() {
    this.rules = [];
  }

  addDailyExclusion() { return this.__addRule(); }
  addDailyRule() { return this.__addRule(); }
  addMonthlyExclusion() { return this.__addRule(); }
  addMonthlyRule() { return this.__addRule(); }
  addWeeklyExclusion() { return this.__addRule(); }
  addWeeklyRule() { return this.__addRule(); }
  addYearlyExclusion() { return this.__addRule(); }
  addYearlyRule() { return this.__addRule(); }

  addDate(date) {
    // RDATE support
    // This isn't a rule in the same sense, but part of the recurrence definition
    // For now we store it.
    if (!this.rDates) this.rDates = [];
    this.rDates.push(date);
    return this;
  }

  addDateExclusion(date) {
    // EXDATE support
    if (!this.exDates) this.exDates = [];
    this.exDates.push(date);
    return this;
  }

  setTimeZone(timeZone) {
    this.timeZone = timeZone;
    return this;
  }

  __addRule() {
    const rule = newFakeRecurrenceRule();
    this.rules.push(rule);
    return rule;
  }

  toString() {
    return 'EventRecurrence';
  }
}
