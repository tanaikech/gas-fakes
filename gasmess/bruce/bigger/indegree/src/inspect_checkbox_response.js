import '@mcpher/gas-fakes';

const FORM_ID = '1_naVLJPrGRwcSwajYCXD4Uwa_lNe18P2iGdAh2pg6vk'; // new pre form

const inspectCheckboxGridResponse = () => {
  try {
    const form = FormApp.openById(FORM_ID);
    const responses = form.getResponses();

    if (responses.length === 0) {
      console.log('No responses found');
      return;
    }

    console.log(`\n=== Inspecting first response ===`);
    const response = responses[0];
    const itemResponses = response.getItemResponses();

    // Find checkbox grid items
    itemResponses.forEach(itemResponse => {
      const item = itemResponse.getItem();
      const itemType = String(item.getType());
      const itemTitle = item.getTitle();

      if (itemType === 'CHECKBOX_GRID' || itemTitle.includes('closest') || itemTitle.includes('influential')) {
        console.log(`\n--- Item ---`);
        console.log(`Title: "${itemTitle}"`);
        console.log(`Type: ${itemType}`);
        console.log(`ID: ${item.getId()}`);
        console.log(`Response ID: ${itemResponse.getId()}`);

        const responseData = itemResponse.getResponse();
        console.log(`Response type: ${typeof responseData}`);
        console.log(`Response is array: ${Array.isArray(responseData)}`);
        console.log(`Response: ${JSON.stringify(responseData, null, 2)}`);
      }
    });

  } catch (error) {
    console.error(`Error: ${error.toString()}`);
    console.error(error.stack);
  }
};

inspectCheckboxGridResponse();
