import { Proxies } from '../../support/proxies.js';
import * as CalendarEnums from '../enums/calendarenums.js';

export const newFakeEventGuest = (...args) => {
  return Proxies.guard(new FakeEventGuest(...args));
};

/**
 * Represents a guest of an event.
 * @see https://developers.google.com/apps-script/reference/calendar/event-guest
 */
export class FakeEventGuest {
    constructor(resource) {
        this.__resource = resource;
    }
    
    getEmail() { 
        return this.__resource.email; 
    }
    
    getName() { 
        return this.__resource.displayName || ''; 
    }
    
    getGuestStatus() { 
        const status = this.__resource.responseStatus;
        // Map API status to Enum
        const map = {
            'accepted': CalendarEnums.GuestStatus.YES,
            'declined': CalendarEnums.GuestStatus.NO,
            'tentative': CalendarEnums.GuestStatus.MAYBE,
            'needsAction': CalendarEnums.GuestStatus.INVITED
        };
        return map[status] || CalendarEnums.GuestStatus.INVITED;
    }
    
    getAdditionalGuests() { 
        return this.__resource.additionalGuests || 0; 
    }
    
    toString() { 
        return 'EventGuest'; 
    }
}
