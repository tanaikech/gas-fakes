import { newFakeGasenum } from "@mcpher/fake-gasenum";

export const Button = newFakeGasenum([
  "CANCEL",
  "CLOSE",
  "NO",
  "OK",
  "YES"
])

export const ButtonSet = newFakeGasenum([
  "OK",
  "OK_CANCEL",
  "YES_NO",
  "YES_NO_CANCEL"
])

export const ColorType = newFakeGasenum([
  "RGB",
  "THEME",
  "UNSUPPORTED"
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

export const Weekday = newFakeGasenum([
  "SUNDAY",
  "MONDAY",
  "TUESDAY",
  "WEDNESDAY",
  "THURSDAY",
  "FRIDAY",
  "SATURDAY"
])
