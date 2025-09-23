import is from '@sindresorhus/is';
import '../main.js';
import { initTests } from './testinit.js';
import { getGmailPerformance, wrapupTest, trasher } from './testassist.js';

export const testGmail = (pack) => {
  const toTrash = [];
  const { unit, fixes } = pack || initTests();

  unit.section('gmail labels', (t) => {
    // get current labels
    const initialLabels = Gmail.Users.Labels.list({ userId: 'me' });
    t.true(is.array(initialLabels.labels), 'should get an array of labels');
    const initialCount = initialLabels.labels.length;

    // create a new label
    const labelName = `${fixes.PREFIX}-test-label-${new Date().getTime()}`;
    const newLabelResource = Gmail.newLabel()
      .setName(labelName)
      .setLabelListVisibility('labelShow')
      .setMessageListVisibility('show')
      .setColor(Gmail.newLabelColor().setBackgroundColor('#16a765').setTextColor('#ffffff'));

    const createdLabel = Gmail.Users.Labels.create({ userId: 'me' }, newLabelResource);
    t.is(createdLabel.name, labelName, 'created label should have correct name');
    t.true(is.nonEmptyString(createdLabel.id), 'created label should have an id');
    t.is(createdLabel.color.backgroundColor, '#16a765', 'created label should have correct background color');

    // list again and check count
    const afterCreateLabels = Gmail.Users.Labels.list({ userId: 'me' });
    t.is(afterCreateLabels.labels.length, initialCount + 1, 'label count should increase by 1');

    // get the created label by id
    const gotLabel = Gmail.Users.Labels.get({ userId: 'me', id: createdLabel.id });
    t.is(gotLabel.id, createdLabel.id, 'get should retrieve the correct label');
    t.is(gotLabel.name, labelName, 'retrieved label should have correct name');

    // delete the label
    Gmail.Users.Labels.delete({ userId: 'me', id: createdLabel.id });

    // list again and check count
    const afterDeleteLabels = Gmail.Users.Labels.list({ userId: 'me' });
    t.is(afterDeleteLabels.labels.length, initialCount, 'label count should be back to initial');

    const err = t.threw(() => Gmail.Users.Labels.get({ userId: 'me', id: createdLabel.id }));
    t.rxMatch(err.message, /404/, 'getting a deleted label should throw a 404 error');

    if (Gmail.isFake) console.log('...cumulative gmail cache performance', getGmailPerformance());
  });

  unit.section('GmailApp basic methods', (t) => {
    const labels = GmailApp.getLabels();
    t.true(is.array(labels), 'getLabels() should return an array');
    t.true(labels.length > 0, 'should be at least one label');

    const firstLabel = labels[0];
    t.is(firstLabel.toString(), firstLabel.getName(), 'label.toString() should be its name');
    t.true(is.nonEmptyString(firstLabel.getId()), 'label should have an ID');

    // Find a known system label
    const inboxLabel = labels.find(l => l.getName() === 'INBOX');
    t.truthy(inboxLabel, 'should be able to find the INBOX label');
    if (inboxLabel) {
      t.is(inboxLabel.getId(), 'INBOX', 'INBOX label should have the correct ID');
    }
  });


  if (!pack) {
    unit.report();
  }
  if (fixes.CLEAN) trasher(toTrash);
  return { unit, fixes };
};

wrapupTest(testGmail);
