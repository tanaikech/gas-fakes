import is from '@sindresorhus/is';
import '../main.js';
import { initTests } from './testinit.js';
import { getFormsPerformance, wrapupTest, getDrivePerformance, trasher } from './testassist.js';

export const testForm = (pack) => {
  const toTrash = [];
  const { unit, fixes } = pack || initTests();

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
    t.threw(() => FormApp.openByUrl('http://invalid.url/'), 'openByUrl() should throw on invalid URL');

    // Test setTitle() - affects internal form title
    const newTitle = `gas-fakes-test-form-renamed-${new Date().getTime()}`;
    form.setTitle(newTitle);
    const reopenedForm = FormApp.openById(form.getId());
    t.is(reopenedForm.getTitle(), newTitle, 'setTitle() should update the form title');
    t.is(file.getName(), formName, 'setTitle() should NOT change the file name');

    // Test getActiveForm()
    const activeForm = FormApp.getActiveForm();
    t.is(activeForm, null, 'getActiveForm() should be null if no documentId is set');

    // Test enums
    t.is(FormApp.ItemType.CHECKBOX.toString(), 'CHECKBOX', 'should have ItemType enum');
    t.is(FormApp.Alignment.LEFT.toString(), 'LEFT', 'should have Alignment enum');

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

  if (!pack) {
    unit.report();
  }
  if (fixes.CLEAN) trasher(toTrash);
  return { unit, fixes };
};

wrapupTest(testForm);
