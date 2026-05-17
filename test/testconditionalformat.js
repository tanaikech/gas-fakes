import '@mcpher/gas-fakes';
import { initTests } from './testinit.js';
import { wrapupTest, createTrashCollector, trasher } from './testassist.js';

export const testConditionalFormat = (pack) => {
  const toTrash = createTrashCollector();
  const { unit, fixes } = pack || initTests();

  unit.section('ConditionalFormatRule class methods', (t) => {
    const ssName = `gas-fakes-test-conditionalformat-${new Date().getTime()}`;
    const ss = SpreadsheetApp.create(ssName);
    toTrash.push(DriveApp.getFileById(ss.getId()));

    const sheet = ss.getSheets()[0];
    const range = sheet.getRange("A1:B10");

    // Test Builder and saving to sheet
    const rule1 = SpreadsheetApp.newConditionalFormatRule()
      .whenNumberGreaterThan(50)
      .setBackground("#FF0000")
      .setFontColor("#FFFFFF")
      .setBold(true)
      .setRanges([range])
      .build();
    
    t.is(rule1.toString(), 'ConditionalFormatRule', 'build() should return ConditionalFormatRule');

    // Gradient condition
    const rule2 = SpreadsheetApp.newConditionalFormatRule()
      .setGradientMinpoint("#00FF00")
      .setGradientMaxpointWithValue("#0000FF", SpreadsheetApp.InterpolationType.MAX, "")
      .setRanges([sheet.getRange("C1:C10")])
      .build();

    sheet.setConditionalFormatRules([rule1, rule2]);

    // Test retrieving from sheet
    const rules = sheet.getConditionalFormatRules();
    t.is(rules.length, 2, 'Should retrieve 2 conditional format rules');

    // Test BooleanCondition properties
    const r1 = rules[0];
    const boolCond = r1.getBooleanCondition();
    t.truthy(boolCond, 'Rule 1 should have a boolean condition');
    t.is(boolCond.toString(), 'ConditionalFormatBooleanCondition', 'getBooleanCondition() should return ConditionalFormatBooleanCondition');
    t.is(boolCond.getCriteriaType().toString(), 'NUMBER_GREATER_THAN', 'Criteria type should map to Enum correctly');
    t.deepEqual(boolCond.getCriteriaValues(), [50], 'Criteria values should match');
    t.is(boolCond.getBackgroundObject().asRgbColor().asHexString(), '#ff0000', 'Background color should match');
    t.is(boolCond.getFontColorObject().asRgbColor().asHexString(), '#ffffff', 'Font color should match');
    t.is(boolCond.getBold(), true, 'Bold should be true');

    // Test GradientCondition properties
    const r2 = rules[1];
    const gradCond = r2.getGradientCondition();
    t.truthy(gradCond, 'Rule 2 should have a gradient condition');
    t.is(gradCond.toString(), 'ConditionalFormatGradientCondition', 'getGradientCondition() should return ConditionalFormatGradientCondition');
    t.is(gradCond.getMinColorObject().asRgbColor().asHexString(), '#00ff00', 'Gradient min color should match');
    t.is(gradCond.getMaxType().toString(), 'MAX', 'Gradient max type should match');

    // Test copy and modify
    const copiedRule = r1.copy()
      .whenCellEmpty()
      .build();
    
    t.is(copiedRule.getBooleanCondition().getCriteriaType().toString(), 'CELL_EMPTY', 'Copied rule should have new criteria type');
    t.is(copiedRule.getBooleanCondition().getBold(), true, 'Copied rule should retain unmodified formatting (bold)');
    
    // Test clear
    sheet.clearConditionalFormatRules();
    t.is(sheet.getConditionalFormatRules().length, 0, 'clearConditionalFormatRules should remove all rules');

  });

  unit.section('ConditionalFormatRule varied criteria', (t) => {
    const ssName = `gas-fakes-test-cond-criteria-${new Date().getTime()}`;
    const ss = SpreadsheetApp.create(ssName);
    toTrash.push(DriveApp.getFileById(ss.getId()));

    const sheet = ss.getSheets()[0];
    const range = sheet.getRange("A1:B10");

    const date = new Date("2026-05-01T12:00:00Z");

    const r1 = SpreadsheetApp.newConditionalFormatRule().whenTextContains("hello").setRanges([range]).build();
    const r2 = SpreadsheetApp.newConditionalFormatRule().whenNumberBetween(10, 20).setRanges([range]).build();
    const r3 = SpreadsheetApp.newConditionalFormatRule().whenDateEqualTo(SpreadsheetApp.RelativeDate.TODAY).setRanges([range]).build();
    const r4 = SpreadsheetApp.newConditionalFormatRule().whenDateAfter(date).setRanges([range]).build();
    const r5 = SpreadsheetApp.newConditionalFormatRule().withCriteria(SpreadsheetApp.BooleanCriteria.TEXT_STARTS_WITH, ["prefix"]).setRanges([range]).build();
    const r6 = SpreadsheetApp.newConditionalFormatRule().whenFormulaSatisfied("=A1>10").setRanges([range]).build();

    sheet.setConditionalFormatRules([r1, r2, r3, r4, r5, r6]);

    const rules = sheet.getConditionalFormatRules();
    t.is(rules.length, 6, "Should save and retrieve 6 diverse rules");

    t.is(rules[0].getBooleanCondition().getCriteriaType().toString(), 'TEXT_CONTAINS');
    t.deepEqual(rules[0].getBooleanCondition().getCriteriaValues(), ["hello"]);

    t.is(rules[1].getBooleanCondition().getCriteriaType().toString(), 'NUMBER_BETWEEN');
    t.deepEqual(rules[1].getBooleanCondition().getCriteriaValues(), [10, 20]);

    t.is(rules[2].getBooleanCondition().getCriteriaType().toString(), 'DATE_EQUAL_TO_RELATIVE');
    t.deepEqual(rules[2].getBooleanCondition().getCriteriaValues().map(String), ["TODAY"]);

    t.is(rules[3].getBooleanCondition().getCriteriaType().toString(), 'DATE_AFTER');
    // Compare dates robustly
    const retrievedDate = new Date(rules[3].getBooleanCondition().getCriteriaValues()[0]);
    t.is(retrievedDate.getFullYear(), date.getFullYear());
    t.is(retrievedDate.getMonth(), date.getMonth());
    t.is(retrievedDate.getDate(), date.getDate());

    t.is(rules[4].getBooleanCondition().getCriteriaType().toString(), 'TEXT_STARTS_WITH');
    t.deepEqual(rules[4].getBooleanCondition().getCriteriaValues(), ["prefix"]);

    t.is(rules[5].getBooleanCondition().getCriteriaType().toString(), 'CUSTOM_FORMULA');
    t.deepEqual(rules[5].getBooleanCondition().getCriteriaValues(), ["=A1>10"]);
  });

  if (!pack) {
    unit.report();
  }
  if (fixes.CLEAN) trasher(toTrash);
  return { unit, fixes };
};

wrapupTest(testConditionalFormat);
