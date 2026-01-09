import { newFakeGasenum} from "@mcpher/fake-gasenum";
export const Color = newFakeGasenum([
  "BLUE",
  "BROWN",
  "CHARCOAL",
  "CHESTNUT",
  "GRAY",
  "GREEN",
  "INDIGO",
  "LIME",
  "MUSTARD",
  "OLIVE",
  "ORANGE",
  "PINK",
  "PLUM",
  "PURPLE",
  "RED",
  "RED_ORANGE",
  "SEA_BLUE",
  "SLATE",
  "TEAL",
  "TURQOISE",
  "YELLOW"
])
export const EventColor = newFakeGasenum([
  "BLUE",
  "CYAN",
  "GRAY",
  "GREEN",
  "MAUVE",
  "ORANGE",
  "PALE_BLUE",
  "PALE_GREEN",
  "PALE_RED",
  "RED",
  "YELLOW"
])
export const EventTransparency = newFakeGasenum([
  "OPAQUE",
  "TRANSPARENT"
])
export const EventType = newFakeGasenum([
  "DEFAULT",
  "BIRTHDAY",
  "FOCUS_TIME",
  "FROM_GMAIL",
  "OUT_OF_OFFICE",
  "WORKING_LOCATION"
])
export const GuestStatus = newFakeGasenum([
  "INVITED",
  "MAYBE",
  "NO",
  "OWNER",
  "YES"
])
export const Month = newFakeGasenum([
  "JANUARY",
  "FEBRUARY",
  "MARCH",
  "APRIL",
  "MAY",
  "JUNE",
  "JULY",
  "AUGUST",
  "SEPTEMBER",
  "OCTOBER",
  "NOVEMBER",
  "DECEMBER"
])
export const Visibility = newFakeGasenum([
  "CONFIDENTIAL",
  "DEFAULT",
  "PRIVATE",
  "PUBLIC"
])
export const Weekday = newFakeGasenum([
  "SUNDAY",
  "MONDAY",
  "TUESDAY",
  "WEDNESDAY",
  "THURSDAY",
  "FRIDAY",
  "SATURDAY"
])