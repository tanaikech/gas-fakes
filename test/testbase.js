import is from '@sindresorhus/is';
import '@mcpher/gas-fakes';
import { initTests } from './testinit.js';
import { wrapupTest } from './testassist.js';

export const testBase = (pack) => {
  const { unit } = pack || initTests();

  unit.section('Base namespace', (t) => {
    if (ScriptApp.isFake) {
      t.true(is.object(Base), 'Base should be an object in gas-fakes');
    } else {
      console.log('...skipping Base namespace check (does not exist in live GAS)');
    }
  });

  unit.section('Base Button Enum', (t) => {
    if (ScriptApp.isFake) {
      const obj = Base.Button;
      t.true(is.object(obj), 'Base.Button should be an object');
      t.is(obj.OK.toString(), 'OK', 'Base.Button.OK should be OK');
    } else {
      console.log('...skipping Base.Button check (not defined in live GAS)');
    }
  });

  unit.section('Base ButtonSet Enum', (t) => {
    if (ScriptApp.isFake) {
      const obj = Base.ButtonSet;
      t.true(is.object(obj), 'Base.ButtonSet should be an object');
      t.is(obj.OK.toString(), 'OK', 'Base.ButtonSet.OK should be OK');
    } else {
      console.log('...skipping Base.ButtonSet check (not defined in live GAS)');
    }
  });

  unit.section('Base ColorType Enum', (t) => {
    if (ScriptApp.isFake) {
      const obj = Base.ColorType;
      t.true(is.object(obj), 'Base.ColorType should be an object');
      t.is(obj.RGB.toString(), 'RGB', 'Base.ColorType.RGB should be RGB');
    } else {
      console.log('...skipping Base.ColorType check (not defined in live GAS)');
    }
  });

  unit.section('Base MimeType Enum', (t) => {
    // MimeType IS globally defined in live GAS
    t.true(is.object(MimeType), 'MimeType should be an object');
    t.is(MimeType.GOOGLE_DOCS, 'application/vnd.google-apps.document', 'MimeType.GOOGLE_DOCS should match');
    
    if (ScriptApp.isFake) {
      t.true(is.object(Base.MimeType), 'Base.MimeType should be an object');
      t.is(Base.MimeType.GOOGLE_DOCS, 'application/vnd.google-apps.document', 'Base.MimeType.GOOGLE_DOCS should match');
    }
  });

  unit.section('Base Month Enum', (t) => {
    if (ScriptApp.isFake) {
      const obj = Base.Month;
      t.true(is.object(obj), 'Base.Month should be an object');
      t.is(obj.JANUARY.toString(), 'JANUARY', 'Base.Month.JANUARY should be JANUARY');
    } else {
      console.log('...skipping Base.Month check (not defined in live GAS)');
    }
  });

  unit.section('Base Weekday Enum', (t) => {
    if (ScriptApp.isFake) {
      const obj = Base.Weekday;
      t.true(is.object(obj), 'Base.Weekday should be an object');
      t.is(obj.SUNDAY.toString(), 'SUNDAY', 'Base.Weekday.SUNDAY should be SUNDAY');
    } else {
      console.log('...skipping Base.Weekday check (not defined in live GAS)');
    }
  });

  if (!pack) {
    unit.report();
  }
  return { unit };
};

wrapupTest(testBase);
