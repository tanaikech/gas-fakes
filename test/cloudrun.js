import '@mcpher/gas-fakes';
import { testSession } from './testsession.js';

/// if we are runnning only 1 test we need to mock an execute arg
const singleTest = true;

if (singleTest){
  globalThis.process?.argv?.push('execute')
}

const runJob = () => {
  console.log('--- Starting Cloud Run Job Execution ---');

  try {
    testSession();
    
    console.log('--- Test execution completed successfully ---');
    process.exit(0); 
  } catch (error) {
    console.error('--- Test execution failed ---');
    console.error(error);
    process.exit(1); 
  }
};

runJob();