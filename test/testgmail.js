import is from '@sindresorhus/is';

import '../main.js';
import { initTests } from './testinit.js';
import { getGmailPerformance, wrapupTest, trasher } from './testassist.js';

export const testGmail = (pack) => {
  const toTrash = [];
  const { unit, fixes } = pack || initTests();

  unit.section('gmail labels', (t) => {
    // get current labels
    const initialLabels = Gmail.Users.Labels.list('me');
    t.true(is.array(initialLabels.labels), 'should get an array of labels');
    const initialCount = initialLabels.labels.length;

    // create a new label
    const labelName = `${fixes.PREFIX}-test-label-${new Date().getTime()}`;
    const newLabelResource = Gmail.newLabel()
      .setName(labelName)
      .setLabelListVisibility('labelShow')
      .setMessageListVisibility('show')
      .setColor(Gmail.newLabelColor().setBackgroundColor('#16a765').setTextColor('#ffffff'));

    const createdLabel = Gmail.Users.Labels.create(newLabelResource, 'me');
    t.is(createdLabel.name, labelName, 'created label should have correct name');
    t.true(is.nonEmptyString(createdLabel.id), 'created label should have an id');
    t.is(createdLabel.color.backgroundColor, '#16a765', 'created label should have correct background color');

    // list again and check count
    const afterCreateLabels = Gmail.Users.Labels.list('me');
    t.is(afterCreateLabels.labels.length, initialCount + 1, 'label count should increase by 1');

    // get the created label by id
    const gotLabel = Gmail.Users.Labels.get('me', createdLabel.id);
    t.is(gotLabel.id, createdLabel.id, 'get should retrieve the correct label');
    t.is(gotLabel.name, labelName, 'retrieved label should have correct name');

    // delete the label
    Gmail.Users.Labels.remove('me', createdLabel.id);

    // list again and check count
    const afterDeleteLabels = Gmail.Users.Labels.list('me');
    t.is(afterDeleteLabels.labels.length, initialCount, 'label count should be back to initial');

    const err = t.threw(() => Gmail.Users.Labels.get('me', createdLabel.id));
    t.rxMatch(err.message, /(404|not found)/i, 'getting a deleted label should throw a 404 or not found error');

    if (Gmail.isFake) console.log('...cumulative gmail cache performance', getGmailPerformance());
  });

  unit.section('GmailApp basic methods', (t) => {
    const labelName = `${fixes.PREFIX}-gmailapp-label-${new Date().getTime()}`;
    let newLabel;
    try {
      newLabel = GmailApp.createLabel(labelName);
      t.is(newLabel.getName(), labelName, 'createLabel should return a label with the correct name');
      t.is(newLabel.toString(), 'GmailLabel', 'label.toString() should be "GmailLabel"');
      t.true(is.nonEmptyString(newLabel.getId()), 'created label should have an ID');

      const labels = GmailApp.getUserLabels();
      t.true(is.array(labels), 'getUserLabels() should return an array');

      const foundLabel = labels.find(l => l.getName() === labelName);
      t.truthy(foundLabel, 'should find the newly created user label in getUserLabels()');
      if (foundLabel) {
        t.is(foundLabel.getId(), newLabel.getId(), 'found label should have the correct ID');
      }
    } finally {
      if (newLabel) {
        newLabel.deleteLabel();
      }
    }
  });


  if (!pack) {
    unit.report();
  }
  if (fixes.CLEAN) trasher(toTrash);
  return { unit, fixes };
};

wrapupTest(testGmail);
