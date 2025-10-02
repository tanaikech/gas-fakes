import '../main.js';
import { initTests } from './testinit.js';
import * as sinon from 'sinon';
import { cloudLog as fakeCloudLog } from '../src/services/logger/fakelogger.js';
import { wrapupTest } from './testassist.js';

export const testLogger = (pack) => {
  const { unit, fixes } = pack || initTests();

  unit.section('whatever logger is set to', (t) =>  {
    const l = process.env.LOG_DESTINATION
    t.true (['NONE', 'CONSOLE', 'CLOUD', 'BOTH',''].includes (l))
    console.log ('log destination ser to ', l)
    Logger.log ('logger test with destination set to '+l)
  })



  unit.section('Logger basics', (t) => {
    // In case other tests used it, clear the log before starting
    Logger.clear();
    t.is(Logger.getLog(), '', 'Log should be empty after initial clear');

    // Test simple logging
    Logger.log('First line');
    t.is(Logger.getLog(), 'First line', 'Should log a simple string');

    // Test logging with format specifiers
    Logger.log('Second line with a number: %d and a string: %s', 123, 'hello');
    t.is(
      Logger.getLog(),
      'First line\nSecond line with a number: 123 and a string: hello',
      'Should log with format specifiers'
    );

    // Test logging multiple arguments including objects
    Logger.log({ an: 'object' }, ['an', 'array']);
    const expectedLog =
      'First line\n' +
      'Second line with a number: 123 and a string: hello\n' +
      "{ an: 'object' } [ 'an', 'array' ]";
    t.is(Logger.getLog(), expectedLog, 'Should log multiple arguments including objects');

    // Test clear
    Logger.clear();
    t.is(Logger.getLog(), '', 'Log should be empty after clear');

    // Test logging after clearing
    Logger.log('A fresh start');
    t.is(Logger.getLog(), 'A fresh start', 'Should log correctly after clearing');
  });

  // The toString() method is proxied, so we can test it here.
  unit.section('Logger toString()', (t) => {
    t.is(Logger.toString(), 'Logger', 'Logger.toString() should return "Logger"');
  });

  // This test section is only relevant in the fake (Node.js) environment
  // where we can spy on console.log and the cloud logging client.
  if (ScriptApp.isFake) {
    unit.section('Logger LOG_DESTINATION behavior', async (t) => {
      // Spy on the global console.log
      const consoleSpy = sinon.spy(console, 'log');

      // The cloudLog object might not exist at spy-creation time, so we spy on its 'write' method later.
      let cloudLogSpy;

      const testDestination = async (destination, { expectConsole, expectCloud, expectInternalLog }) => {
        Logger.__setLogDestination(destination);
        console.log(`    [INFO] Testing with LOG_DESTINATION = ${destination}`);

        // The cloudLog object is created lazily, so we must spy on it after it's potentially created.
        // The first call to Logger.log() with a CLOUD destination will create it.
        if (expectCloud && !cloudLogSpy) {
          await Logger.log('init spy'); // This call will trigger initialization.
          cloudLogSpy = sinon.spy(fakeCloudLog, 'write');
        }

        consoleSpy.resetHistory();
        if (cloudLogSpy) cloudLogSpy.resetHistory();
        Logger.clear();

        const logMessage = `testing destination ${destination}`;
        await Logger.log(logMessage);

        if (expectConsole) {
          t.true(consoleSpy.called, `console.log should be called for ${destination}`);
        } else {
          const wasCalledWithLogMessage = consoleSpy.getCalls().some(call => call.args[0].includes(logMessage));
          t.false(wasCalledWithLogMessage, `console.log should NOT be called with the message for ${destination}`);
        }

        if (expectCloud) {
          t.truthy(cloudLogSpy, `Cloud log client should be initialized for ${destination}`);
          if (cloudLogSpy) t.true(cloudLogSpy.called, `cloudLog.write should be called for ${destination}`);
        } else {
          if (cloudLogSpy) t.false(cloudLogSpy.called, `cloudLog.write should NOT be called for ${destination}`);
        }

        t.is(Logger.getLog().includes(logMessage), expectInternalLog, `Internal log expectation for ${destination}`);
      };

      // Save original and then test each destination
      const originalDestination = (process.env.LOG_DESTINATION || 'CONSOLE').toUpperCase();
      try {
        await testDestination('CONSOLE', { expectConsole: true, expectCloud: false, expectInternalLog: true });
        await testDestination('CLOUD', { expectConsole: false, expectCloud: true, expectInternalLog: true });
        await testDestination('BOTH', { expectConsole: true, expectCloud: true, expectInternalLog: true });
        await testDestination('NONE', { expectConsole: false, expectCloud: false, expectInternalLog: true });
      } finally {
        // Restore original environment variable and spies
        Logger.__setLogDestination(originalDestination);
        consoleSpy.restore();
        if (cloudLogSpy) cloudLogSpy.restore();
      }
    });
  }

  // Sandbox tests are only relevant in the fake environment
  if (ScriptApp.isFake) {
    unit.section('Logger in Sandbox', (t) => {
      const behavior = ScriptApp.__behavior;
      const loggerService = behavior.sandboxService.Logger;

      // 1. Disable the service
      loggerService.enabled = false;
      const err = t.threw(() => Logger.log("this won't work"));
      t.rxMatch(
        err?.message,
        /Logger service is disabled by sandbox settings/,
        'Should deny access to disabled Logger service'
      );

      // Re-enable for the next test
      loggerService.enabled = true;

      // 2. Method Whitelist
      loggerService.setMethodWhitelist(['getLog']);
      t.not(Logger.getLog(), undefined, 'getLog should be allowed by methodWhitelist');

      const logErr = t.threw(() => Logger.log('this should be denied'));
      t.rxMatch(
        logErr?.message,
        /Method Logger.log is not allowed by sandbox settings/,
        'log should be denied by methodWhitelist'
      );

      // Cleanup for other tests
      loggerService.clear();
    });
  }

  if (!pack) {
    unit.report();
  }

  return { unit, fixes };
};
wrapupTest(testLogger);
