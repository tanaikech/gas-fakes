
import '@mcpher/gas-fakes';
import is from '@sindresorhus/is';

import { initTests } from './testinit.js';
import { getGmailPerformance, wrapupTest, trasher } from './testassist.js';

export const testGmail = (pack) => {
  const toTrash = [];
  const { unit, fixes } = pack || initTests();

  unit.section("gmailapp createDraft", (t) => {
    const recipient = "test@example.com";
    const subject = "Test Draft Subject " + new Date().getTime();
    const body = "Test draft body.";
    const draft = GmailApp.createDraft(recipient, subject, body);
    t.true(is.object(draft), "should create a draft object");
    t.true(is.nonEmptyString(draft.getId()), "draft should have an id");
    t.is(draft.toString(), "GmailDraft", "should be a gmail draft object");
  });

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

  unit.section("gmailapp createDraft advanced", (t) => {
    const recipient = "test@example.com";
    const subject = "Test Draft Subject advanced " + new Date().getTime();
    const body = "Test draft body.";
    const htmlBody = "<html><body><p>Test draft body with inline image <img src='cid:myImage' /></p></body></html>";
    const attachment = Utilities.newBlob("test attachment", "text/plain", "attachment.txt");
    const inlineImage = UrlFetchApp.fetch(fixes.RANDOM_IMAGE).getBlob();

    const options = {
      htmlBody,
      attachments: [attachment],
      inlineImages: {
        myImage: inlineImage,
      },
      cc: "cc@example.com",
      bcc: "bcc@example.com",
      from: "from@example.com",
      name: "Test Sender",
      replyTo: "replyto@example.com",
    };

    const draft = GmailApp.createDraft(recipient, subject, body, options);
    t.true(is.object(draft), "should create a draft object with advanced options");
    t.true(is.nonEmptyString(draft.getId()), "advanced draft should have an id");
    t.is(draft.toString(), "GmailDraft", "should be a gmail draft object");
  });

  unit.section("gmailapp deleteLabel", (t) => {
    const labelName = `${fixes.PREFIX}-delete-label-${new Date().getTime()}`;
    let newLabel = GmailApp.createLabel(labelName);
    t.is(newLabel.getName(), labelName, 'createLabel should return a label with the correct name for deletion test');

    let labels = GmailApp.getUserLabels();
    t.true(labels.some(l => l.getName() === labelName), 'should find the newly created label before deletion');

    GmailApp.deleteLabel(newLabel);

    labels = GmailApp.getUserLabels();
    t.false(labels.some(l => l.getName() === labelName), 'should not find the deleted label');

    // For now, just ensure it doesn't break.
    try {
      GmailApp.deleteLabel(newLabel);
      t.true(true, 'deleting an already deleted label should not throw');
    } catch (e) {
      t.true(false, `deleting an already deleted label threw an error: ${e.message}`);
    }
  });

  unit.section("gmailapp getAliases", (t) => {
    const aliases = GmailApp.getAliases();
    t.true(is.array(aliases), 'getAliases() should return an array');
    t.is(aliases.length, 2, 'should return the correct number of aliases');
    t.true(aliases.includes('primary@example.com'), 'should include the primary alias');
    t.true(aliases.includes('alias@example.com'), 'should include the alias');
  });

  unit.section("gmailapp getDraft", (t) => {
    const recipient = "test_getDraft@example.com";
    const subject = "Test getDraft Subject " + new Date().getTime();
    const body = "Test getDraft body.";
    const createdDraft = GmailApp.createDraft(recipient, subject, body);
    
    t.true(is.object(createdDraft), "createDraft should return a valid draft object");
    t.true(is.nonEmptyString(createdDraft.getId()), "created draft should have an ID");

    const retrievedDraft = GmailApp.getDraft(createdDraft.getId());
    t.true(is.object(retrievedDraft), "getDraft should return a valid draft object");
    t.is(retrievedDraft.getId(), createdDraft.getId(), "retrieved draft ID should match created draft ID");
    
    // Test for non-existent draft
    const nonExistentId = "non_existent_draft_id";
    const err = t.threw(() => GmailApp.getDraft(nonExistentId));
    t.rxMatch(err.message, /(404|not found)/i, 'getting a non-existent draft should throw a 404 or not found error');
  });






  if (!pack) {
    unit.report();
  }
  if (fixes.CLEAN) trasher(toTrash);
  return { unit, fixes };
};

wrapupTest(testGmail);


