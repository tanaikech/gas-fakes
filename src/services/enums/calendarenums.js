import { newFakeGasenum } from "@mcpher/fake-gasenum";

export const Color = newFakeGasenum(
  {
    BLUE: "#2952A3",
    BROWN: "#8D6F47",
    CHARCOAL: "#4E5D6C",
    CHESTNUT: "#865A5A",
    GRAY: "#5A6986",
    GREEN: "#0D7813",
    INDIGO: "#5229A3",
    LIME: "#528800",
    MUSTARD: "#88880E",
    OLIVE: "#6E6E41",
    ORANGE: "#BE6D00",
    PINK: "#B1365F",
    PLUM: "#705770",
    PURPLE: "#7A367A",
    RED: "#A32929",
    RED_ORANGE: "#B1440E",
    SEA_BLUE: "#29527A",
    SLATE: "#4A716C",
    TEAL: "#28754E",
    TURQOISE: "#1B887A",
    YELLOW: "#AB8B00"
  })

export const EventColor = newFakeGasenum(
  {
    BLUE: "9",
    CYAN: "7",
    GRAY: "8",
    GREEN: "10",
    MAUVE: "3",
    ORANGE: "6",
    PALE_BLUE: "1",
    PALE_GREEN: "2",
    PALE_RED: "4",
    RED: "11",
    YELLOW: "5"
  })

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