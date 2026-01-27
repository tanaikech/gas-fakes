import '@mcpher/gas-fakes';
import { testFakes } from './test.js';

const runJob =  () => {
  console.log('--- Starting Cloud Run Job Execution ---');
  
  try {
    testFakes(); 
    
    console.log('--- Test execution completed successfully ---');
    process.exit(0); 
  } catch (error) {
    console.error('--- Test execution failed ---');
    console.error(error);
    process.exit(1); 
  }
};

runJob();