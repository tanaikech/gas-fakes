import is from '@sindresorhus/is';
import '@mcpher/gas-fakes';
import { initTests } from './testinit.js';
import { getFormsPerformance, wrapupTest, getDrivePerformance, trasher } from './testassist.js';

export const testForm = (pack) => {
  const toTrash = [];
  
  const { unit, fixes } = pack || initTests();

    unit.section('Form.addPageBreakItem & Routing', (t) => {
    const form = FormApp.create('Add PageBreakItem Test Form');
    toTrash.push(DriveApp.getFileById(form.getId()));

    const question1 = form.addListItem().setTitle('Go to page 2?');
    const pageBreak1 = form.addPageBreakItem();
    form.addTextItem().setTitle('This is Page 2');
    const pageBreak2 = form.addPageBreakItem();
    form.addTextItem().setTitle('This is Page 3');

    t.is(pageBreak1.toString(), 'PageBreakItem', 'addPageBreakItem should return a PageBreakItem');
    t.is(pageBreak1.getIndex(), 1, 'The first page break should be at index 1');
    t.is(pageBreak1.getType(), FormApp.ItemType.PAGE_BREAK, 'Item type should be PAGE_BREAK');

    // Test routing from a choice item
    const choiceYes = question1.createChoice('Yes', pageBreak2); // Go to page 3
    const choiceNo = question1.createChoice('No', FormApp.PageNavigationType.CONTINUE); // Go to next page (page 2)
    question1.setChoices([choiceYes, choiceNo]);

    const updatedChoices = form.getItemById(question1.getId()).asListItem().getChoices();
    // On a ListItem, getGoToPage() is not available on the choice.
    // We check the navigation type instead.
    t.is(updatedChoices[0].getPageNavigationType(), FormApp.PageNavigationType.GO_TO_PAGE, 'Choice "Yes" should have GO_TO_PAGE navigation');
    t.is(updatedChoices[1].getPageNavigationType(), FormApp.PageNavigationType.CONTINUE, 'Choice "No" should have CONTINUE navigation');
    // Live Apps Script throws a TypeError when calling getGoToPage() on a ListItem choice.
    t.threw(() => updatedChoices[0].getGoToPage(), 'getGoToPage() should throw for ListItem choices');

    // Test setting navigation on a page break itself
    // This is not supported by the public Forms API, so the fake throws an error.
    if (FormApp.isFake) {
      const err = t.threw(() => pageBreak1.setGoToPage(pageBreak2));
      t.truthy(err, 'setGoToPage on PageBreakItem should throw in fake environment');
      t.is(pageBreak1.getGoToPage(), null, 'getGoToPage on PageBreakItem should return null');
    }

    if (FormApp.isFake) console.log('...cumulative forms cache performance', getFormsPerformance());
  });

  unit.section('FormApp basics', (t) => {
    // Test create()
    const formName = `gas-fakes-test-form-${new Date().getTime()}`;
    const form = FormApp.create(formName);
    const file = DriveApp.getFileById(form.getId());
    toTrash.push(file);

    t.true(is.object(form), 'create() should return an object');
    t.is(form.toString(), 'Form', 'form.toString() should be "Form"');
    t.true(is.nonEmptyString(form.getId()), 'created form should have an ID');
    t.true(form.getEditUrl().includes(form.getId()), 'created form URL should contain ID');
    t.true(form.getPublishedUrl().includes('/viewform'), 'published form URL should contain "/viewform"');

    // Verify that create() sets the file name in Drive, but not the form's internal title.
    t.is(file.getName(), formName, 'create() should set the file name in Drive');
    // see issue https://issuetracker.google.com/issues/442747794 for discrepancy in platform
  
    t.is(form.getTitle(), FormApp.isFake ? formName: '', 'create() should result in an empty form title on gas');


    // Test openById()
    const openedForm = FormApp.openById(form.getId());
    t.is(openedForm.getId(), form.getId(), 'openById() should open the correct form');
    t.is(openedForm.getTitle(), FormApp.isFake ? formName: '', 'opened form should have correct (empty) title');


    // Test openByUrl()
    const openedByUrl = FormApp.openByUrl(form.getEditUrl());
    t.is(openedByUrl.getId(), form.getId(), 'openByUrl() should open the correct form');
    t.is(openedByUrl.getTitle(), FormApp.isFake ? formName: '', 'opened form by URL should have correct (empty) title');


    // Test openByUrl() with invalid URL
    const err1 = t.threw(() => FormApp.openByUrl('http://invalid.url/'));
    if (err1) {
      // The fake should be updated to throw the same error as the live environment.
      t.is(err1.message, 'Invalid argument: url', 'openByUrl() should throw on invalid URL');
    }
    t.truthy(err1, 'openByUrl() should throw an error for an invalid URL');

    // Test setTitle() and description - affects internal form title
    const newTitle = `gas-fakes-test-form-renamed-${new Date().getTime()}`;
    const description = newTitle + '-description';
    form.setTitle(newTitle).setDescription (description);;
    const reopenedForm = FormApp.openById(form.getId());
    t.is(reopenedForm.getTitle(), newTitle, 'setTitle() should update the form title');
    t.is(file.getName(), formName, 'setTitle() should NOT change the file name');
    t.is (form.getDescription(), description, 'setDescription')

    // Test getActiveForm()
    const activeForm = FormApp.getActiveForm();
    t.is(activeForm, null, 'getActiveForm() should be null if no documentId is set');

    // Test enums
    t.is(FormApp.ItemType.CHECKBOX.toString(), 'CHECKBOX', 'should have ItemType enum');
    t.is(FormApp.Alignment.LEFT.toString(), 'LEFT', 'should have Alignment enum');

    // Test isPublished()
    t.true(form.isPublished(), 'A new form should be published (accepting responses) by default');

    // Test setPublished() - should throw an error
    if (FormApp.isFake) {
      const err2 = t.threw(() => form.setPublished(false));
      t.truthy(err2, 'setPublished() should throw in the fake environment');
      t.rxMatch(err2?.message, /not yet implemented/i, 'setPublished() should throw a "not yet implemented" error');
    }


    if (FormApp.isFake) {
      console.log('...cumulative forms cache performance', getFormsPerformance());
      console.log('...cumulative drive cache performance', getDrivePerformance());
    }
  });

  unit.section('Form item methods', (t) => {
    // This test can only run in the fake environment because it uses the advanced Forms service
    // to add items to the form, which is not available in live Apps Script.
    if (!FormApp.isFake) {
      console.log('...skipping Form item methods test on live Apps Script');
      return;
    }

    const form = FormApp.create('Form with Items');
    toTrash.push(DriveApp.getFileById(form.getId()));

    // Use advanced service to add items, as FormApp doesn't have add*Item methods yet.
    const createItemRequest1 = Forms.newRequest().setCreateItem(
      Forms.newCreateItemRequest()
        .setItem(
          Forms.newItem()
            .setTitle('First Question')
            .setQuestionItem(
              Forms.newQuestionItem().setQuestion(
                Forms.newQuestion().setTextQuestion(Forms.newTextQuestion())
              )
            )
        )
        .setLocation(Forms.newLocation().setIndex(0))
    );

    const createItemRequest2 = Forms.newRequest().setCreateItem(
      Forms.newCreateItemRequest()
        .setItem(
          Forms.newItem()
            .setTitle('Second Question')
            .setQuestionItem(
              Forms.newQuestionItem().setQuestion(
                Forms.newQuestion().setChoiceQuestion(
                  Forms.newChoiceQuestion()
                    .setType('CHECKBOX')
                    .setOptions([Forms.newOption().setValue('Option 1')])
                )
              )
            )
        )
        .setLocation(Forms.newLocation().setIndex(1))
    );

    const batchRequest = Forms.newBatchUpdateFormRequest()
      .setRequests([createItemRequest1, createItemRequest2])
      .setIncludeFormInResponse(true);

    const batchResponse = Forms.Form.batchUpdate(batchRequest, form.getId());
    t.is(batchResponse.replies.length, 2, 'Batch update should have two replies');

    const item1Id = batchResponse.replies[0].createItem.itemId;
    t.true(is.nonEmptyString(item1Id), 'First created item should have an ID');

    // Re-open the form to test getItems and getItemById
    const updatedForm = FormApp.openById(form.getId());

    // Test getItems()
    const items = updatedForm.getItems();
    t.is(items.length, 2, 'getItems() should return two items');
    t.is(items[0].toString(), 'Item', 'First item should be of type Item');
    t.is(items[0].getTitle(), 'First Question', 'First item should have correct title');
    t.is(items[1].getTitle(), 'Second Question', 'Second item should have correct title');

    // Test getItemById()
    const item1 = updatedForm.getItemById(item1Id);
    t.truthy(item1, 'getItemById() should find the first item');
    t.is(item1.getId(), item1Id, 'Found item should have the correct ID');
    t.is(item1.getTitle(), 'First Question', 'Found item should have the correct title');

    // Test getItemById() with a non-existent ID
    const nonExistentItem = updatedForm.getItemById('non-existent-id');
    t.is(nonExistentItem, null, 'getItemById() with a non-existent ID should return null');

    if (FormApp.isFake) {
      console.log('...cumulative forms cache performance', getFormsPerformance());
    }
  });

  unit.section('Form.addCheckboxItem', (t) => {
    const form = FormApp.create('Add Item Test Form');
    toTrash.push(DriveApp.getFileById(form.getId()));

    const checkboxItem = form.addCheckboxItem();
    t.is(checkboxItem.toString(), 'CheckboxItem', 'addCheckboxItem should return a CheckboxItem');
    t.is(checkboxItem.getIndex(), 0, 'The first added item should be at index 0');

    const defaultChoices = checkboxItem.getChoices();
    t.is(defaultChoices.length, 1, 'A new checkbox item should have one choice by default');
    const expectedDefaultValue = FormApp.isFake ? 'Option 1' : ''; // Live creates empty, fake API needs a value
    t.is(defaultChoices[0].getValue(), expectedDefaultValue, 'The default choice should have the correct value for the environment');

    checkboxItem.setTitle('What are your favorite colors?');

    // Test isRequired() and setRequired()
    t.false(checkboxItem.isRequired(), 'Checkbox should not be required by default');
    checkboxItem.setRequired(true);
    t.true(checkboxItem.isRequired(), 'isRequired() should be true after setRequired(true)');
    checkboxItem.setRequired(false);

    const newChoiceValues = ['Red', 'Green', 'Blue'];
    const newChoices = newChoiceValues.map(val => checkboxItem.createChoice(val));
    checkboxItem.setChoices(newChoices);

    const retrievedItem = form.getItemById(checkboxItem.getId()).asCheckboxItem();
    t.is(retrievedItem.getTitle(), 'What are your favorite colors?', 'Title should be set correctly');
    t.deepEqual(retrievedItem.getChoices().map(c => c.getValue()), newChoiceValues, 'Choices should be set correctly');

    if (FormApp.isFake) console.log('...cumulative forms cache performance', getFormsPerformance());
  });

  unit.section('Form.addMultipleChoiceItem', (t) => {
    const form = FormApp.create('Add MC Item Test Form');
    toTrash.push(DriveApp.getFileById(form.getId()));

    const mcItem = form.addMultipleChoiceItem();
    t.is(mcItem.toString(), 'MultipleChoiceItem', 'addMultipleChoiceItem should return a MultipleChoiceItem');
    t.is(mcItem.getIndex(), 0, 'The first added item should be at index 0');

    const defaultChoices = mcItem.getChoices();
    t.is(defaultChoices.length, 1, 'A new multiple choice item should have one choice by default');
    const expectedDefaultValue = FormApp.isFake ? 'Option 1' : ''; // Live creates empty, fake API needs a value
    t.is(defaultChoices[0].getValue(), expectedDefaultValue, 'The default choice should have the correct value for the environment');

    mcItem.setTitle('What is your favorite color?');

    // Test isRequired() and setRequired()
    t.false(mcItem.isRequired(), 'MC item should not be required by default');
    mcItem.setRequired(true);
    t.true(mcItem.isRequired(), 'isRequired() should be true after setRequired(true)');
    mcItem.setRequired(false);

    const newChoiceValues = ['Red', 'Green', 'Blue'];
    const newChoices = newChoiceValues.map(val => mcItem.createChoice(val));
    mcItem.setChoices(newChoices);

    const retrievedItem = form.getItemById(mcItem.getId()).asMultipleChoiceItem();
    t.is(retrievedItem.getTitle(), 'What is your favorite color?', 'Title should be set correctly');
    t.deepEqual(retrievedItem.getChoices().map(c => c.getValue()), newChoiceValues, 'Choices should be set correctly');

    if (FormApp.isFake) console.log('...cumulative forms cache performance', getFormsPerformance());
  });

  unit.section('Form.addGridItem', (t) => {
    const form = FormApp.create('Add GridItem Test Form');
    toTrash.push(DriveApp.getFileById(form.getId()));

    const gridItem = form.addGridItem();
    t.is(gridItem.toString(), 'GridItem', 'addGridItem should return a GridItem');
    t.is(gridItem.getIndex(), 0, 'The first added item should be at index 0');
    t.is(gridItem.getType(), FormApp.ItemType.GRID, 'Item type should be GRID');

    // Test isRequired() and setRequired()
    t.false(gridItem.isRequired(), 'GridItem should not be required by default');
    gridItem.setRequired(true);
    t.true(gridItem.isRequired(), 'isRequired() should be true after setRequired(true)');
    gridItem.setRequired(false);
    t.false(gridItem.isRequired(), 'isRequired() should be false after setRequired(false)');

    // Test setRows() and setColumns()
    const rows = ['Row A', 'Row B'];
    const cols = ['Col 1', 'Col 2', 'Col 3'];
    gridItem.setRows(rows).setColumns(cols);
    t.deepEqual(gridItem.getRows(), rows, 'getRows() should return the correct rows');
    t.deepEqual(gridItem.getColumns(), cols, 'getColumns() should return the correct columns');

    if (FormApp.isFake) console.log('...cumulative forms cache performance', getFormsPerformance());
  });

  unit.section('Form.addSectionHeaderItem', (t) => {
    const form = FormApp.create('Add SectionHeaderItem Test Form');
    toTrash.push(DriveApp.getFileById(form.getId()));

    const sectionHeaderItem = form.addSectionHeaderItem();
    t.is(sectionHeaderItem.toString(), 'SectionHeaderItem', 'addSectionHeaderItem should return a SectionHeaderItem');
    t.is(sectionHeaderItem.getIndex(), 0, 'The first added item should be at index 0');
    t.is(sectionHeaderItem.getType(), FormApp.ItemType.SECTION_HEADER, 'Item type should be SECTION_HEADER');
    t.is(sectionHeaderItem.getTitle(), '', 'Default title should be empty to match live environment');

    sectionHeaderItem.setTitle('New Section Title').setHelpText('Some help text');
    t.is(sectionHeaderItem.getTitle(), 'New Section Title', 'Title should be updated');
    t.is(sectionHeaderItem.getHelpText(), 'Some help text', 'Help text should be updated');

    if (FormApp.isFake) console.log('...cumulative forms cache performance', getFormsPerformance());
  });

  unit.section('Form.addScaleItem', (t) => {
    const form = FormApp.create('Add ScaleItem Test Form');
    toTrash.push(DriveApp.getFileById(form.getId()));

    const scaleItem = form.addScaleItem();
    t.is(scaleItem.toString(), 'ScaleItem', 'addScaleItem should return a ScaleItem');
    t.is(scaleItem.getIndex(), 0, 'The first added item should be at index 0');
    t.is(scaleItem.getType(), FormApp.ItemType.SCALE, 'Item type should be SCALE');

    // Test default bounds
    t.is(scaleItem.getLowerBound(), 1, 'Default lower bound should be 1');
    t.is(scaleItem.getUpperBound(), 5, 'Default upper bound should be 5');

    scaleItem.setBounds(0, 10).setLabels('Bad', 'Good');
    t.is(scaleItem.getLowerBound(), 0, 'Lower bound should be updated');
    t.is(scaleItem.getUpperBound(), 10, 'Upper bound should be updated');
    t.is(scaleItem.getLeftLabel(), 'Bad', 'Left label should be updated');
    t.is(scaleItem.getRightLabel(), 'Good', 'Right label should be updated');

    if (FormApp.isFake) console.log('...cumulative forms cache performance', getFormsPerformance());
  });

  unit.section('Form.moveItem', (t) => {
    const form = FormApp.create('Move Item Test Form');
    toTrash.push(DriveApp.getFileById(form.getId()));

    // Add a few items to have something to move
    const itemA = form.addCheckboxItem().setTitle('A');
    const itemB = form.addSectionHeaderItem().setTitle('B');
    const itemC = form.addScaleItem().setTitle('C');

    // Check initial positions
    t.is(itemA.getIndex(), 0, 'Item A should be at index 0 initially');
    t.is(itemB.getIndex(), 1, 'Item B should be at index 1 initially');
    t.is(itemC.getIndex(), 2, 'Item C should be at index 2 initially');

    // Move the last item to the beginning
    form.moveItem(2, 0);
    t.is(itemC.getIndex(), 0, 'Item C should now be at index 0');
    t.is(itemA.getIndex(), 1, 'Item A should now be at index 1');
    t.is(itemB.getIndex(), 2, 'Item B should now be at index 2');

    // Move the first item (now C) to the end
    form.moveItem(0, 2);
    t.is(itemA.getIndex(), 0, 'Item A should be back at index 0');
    t.is(itemB.getIndex(), 1, 'Item B should be back at index 1');
    t.is(itemC.getIndex(), 2, 'Item C should now be at the end, index 2');
  });

  unit.section('Form.addListItem', (t) => {
    const form = FormApp.create('Add ListItem Test Form');
    toTrash.push(DriveApp.getFileById(form.getId()));

    const listItem = form.addListItem();
    t.is(listItem.toString(), 'ListItem', 'addListItem should return a ListItem');
    t.is(listItem.getIndex(), 0, 'The first added item should be at index 0');
    t.is(listItem.getType(), FormApp.ItemType.LIST, 'Item type should be LIST');

    const defaultChoices = listItem.getChoices();
    t.is(defaultChoices.length, 1, 'A new list item should have one choice by default');
    // Live Apps Script creates a default choice with an empty string value.
    const expectedDefaultValue = FormApp.isFake ? 'Option 1' : ''; // Live creates empty, fake API needs a value
    t.is(defaultChoices[0].getValue(), expectedDefaultValue, 'The default choice should have the correct value for the environment');

    listItem.setTitle('Select an option');

    const newChoiceValues = ['Option X', 'Option Y', 'Option Z'];
    const newChoices = newChoiceValues.map(val => listItem.createChoice(val));
    listItem.setChoices(newChoices);

    const retrievedItem = form.getItemById(listItem.getId()).asListItem();
    t.is(retrievedItem.getTitle(), 'Select an option', 'Title should be set correctly');
    t.deepEqual(retrievedItem.getChoices().map(c => c.getValue()), newChoiceValues, 'Choices should be set correctly');

    if (FormApp.isFake) console.log('...cumulative forms cache performance', getFormsPerformance());
  });

  unit.section('Form.addTextItem', (t) => {
    const form = FormApp.create('Add TextItem Test Form');
    toTrash.push(DriveApp.getFileById(form.getId()));

    const textItem = form.addTextItem();
    t.is(textItem.toString(), 'TextItem', 'addTextItem should return a TextItem');
    t.is(textItem.getIndex(), 0, 'The first added item should be at index 0');
    t.is(textItem.getType(), FormApp.ItemType.TEXT, 'Item type should be TEXT');

    textItem.setTitle('Enter your name');
    textItem.setRequired(true);

    const retrievedItem = form.getItemById(textItem.getId()).asTextItem();
    t.is(retrievedItem.getTitle(), 'Enter your name', 'Title should be set correctly');
    t.true(retrievedItem.isRequired(), 'Item should be required');

    if (FormApp.isFake) console.log('...cumulative forms cache performance', getFormsPerformance());
  });



  if (!pack) {
    unit.report();
  }
  if (fixes.CLEAN) trasher(toTrash);
  return { unit, fixes };
};

wrapupTest(testForm);
