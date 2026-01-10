import { Proxies } from '../../support/proxies.js';

export const newFakeEventRecurrence = (...args) => {
  return Proxies.guard(new FakeEventRecurrence(...args));
};

/**
 * Represents the recurrence settings for an event series.
 * @see https://developers.google.com/apps-script/reference/calendar/event-recurrence
 */
export class FakeEventRecurrence {
  constructor() {
    // TODO: Implement recurrence rules storage
  }

  toString() {
    return 'EventRecurrence';
  }
}
