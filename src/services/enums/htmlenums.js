import { newFakeGasenum } from "@mcpher/fake-gasenum";

export const HtmlEnums = {
  SandboxMode: newFakeGasenum([
    "EMULATED",
    "IFRAME",
    "NATIVE"
  ]),
  XFrameOptionsMode: newFakeGasenum([
    "ALLOWALL",
    "DEFAULT"
  ])
}
