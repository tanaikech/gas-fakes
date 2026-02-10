import '@mcpher/gas-fakes'
import { initTests } from "./testinit.js";
import { wrapupTest } from "./testassist.js";

export const testChartsApp = (pack) => {
  const { unit } = pack || initTests();

  unit.section("Charts Service", (t) => {
    t.true(typeof Charts !== 'undefined', "Charts service should be defined");
    t.is(Charts.toString(), "Charts", "toString() should return 'Charts'");
  });

  unit.section("ChartType enum in Charts", (t) => {
    t.true(typeof Charts.ChartType !== 'undefined', "ChartType should be available in Charts");
    t.is(Charts.ChartType.BAR.toString(), "BAR", "BAR enum value should be correct");
    t.is(Charts.ChartType.LINE.toString(), "LINE", "LINE enum value should be correct");
  });


  unit.section("Charts service methods (NYI)", (t) => {
    t.rxMatch(
      t.threw(() => Charts.newAreaChart())?.message || "no throw",
      /not yet implemented/
    );
  });

  if (!pack) {
    unit.report();
  }
  return { unit };
}

wrapupTest(testChartsApp);
