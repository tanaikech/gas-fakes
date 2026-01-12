import { Proxies } from '../../support/proxies.js';

export const newFakeRecurrenceRule = (...args) => {
  return Proxies.guard(new FakeRecurrenceRule(...args));
};

/**
 * Represents a recurrence rule for an event series.
 * @see https://developers.google.com/apps-script/reference/calendar/recurrence-rule
 */
export class FakeRecurrenceRule {
  constructor() {
    this.rule = {};
  }

  addDailyExclusion() { return this; }
  addDailyRule() { return this; }
  addMonthlyExclusion() { return this; }
  addMonthlyRule() { return this; }
  addWeeklyExclusion() { return this; }
  addWeeklyRule() { return this; }
  addYearlyExclusion() { return this; }
  addYearlyRule() { return this; }

  addDate(date) { return this; }
  addDateExclusion(date) { return this; }

  interval(interval) { return this; }
  onlyInMonth(month) { return this; }
  onlyInMonths(months) { return this; }
  onlyOnMonthDay(day) { return this; }
  onlyOnMonthDays(days) { return this; }
  onlyOnMonths(months) { return this; }
  onlyOnWeek(week) { return this; }
  onlyOnWeekday(day) { return this; }
  onlyOnWeekdays(days) { return this; }
  onlyOnWeeks(weeks) { return this; }
  onlyOnYearDay(day) { return this; }
  onlyOnYearDays(days) { return this; }
  times(times) { return this; }
  until(date) { return this; }
  weekStartsOn(day) { return this; }
  setTimeZone(timeZone) { return this; }

  toString() {
    return 'RecurrenceRule';
  }
}
