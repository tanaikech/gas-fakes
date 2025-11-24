import '@mcpher/gas-fakes';
import { FormPropertiesManager } from './FormPropertiesManager.js';

const FORM_ID = '1Ik7fbNpqBsf7d6Ej9UCdlPkXJZW_4q50T80AOmxAFCQ'; // pre form
const ITEM_MAP_KEY = 'formItemMap';

const inspectItemMap = () => {
  try {
    const propertiesManager = new FormPropertiesManager(FORM_ID);
    const itemMap = propertiesManager.read(ITEM_MAP_KEY) || { questions: {} };

    console.log('\n=== Looking for checkbox grid mappings ===');

    // Find all mappings that might be related to checkbox grids
    const allKeys = Object.keys(itemMap.questions || {});
    console.log(`\nTotal mappings: ${allKeys.length}`);

    // Look for keys containing "closest" or "influential"
    const relevantKeys = allKeys.filter(key =>
      key.includes('closest') || key.includes('influential')
    );

    console.log(`\nMappings containing "closest" or "influential": ${relevantKeys.length}`);
    relevantKeys.forEach(key => {
      const mapping = itemMap.questions[key];
      console.log(`\nKey: "${key}"`);
      console.log(`  createdId: ${mapping.createdId}`);
      console.log(`  labelId: ${mapping.labelId}`);
      console.log(`  rowIndex: ${mapping.rowIndex}`);
      console.log(`  labels: ${JSON.stringify(mapping.labels)}`);
    });

    // If no matches, show a sample of what keys exist
    if (relevantKeys.length === 0) {
      console.log('\nNo matches found. Sample of existing keys:');
      allKeys.slice(0, 20).forEach(key => {
        console.log(`  "${key}"`);
      });
    }

  } catch (error) {
    console.error(`Error: ${error.toString()}`);
    console.error(error.stack);
  }
};

inspectItemMap();
