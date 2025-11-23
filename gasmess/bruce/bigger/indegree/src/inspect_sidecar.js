
import '@mcpher/gas-fakes';

const sidecarId = '10Ibd2YBCptMV51B0384U04eDjABy_fen';

const main = () => {
  if (ScriptApp.isFake) {
    const behavior = ScriptApp.__behavior;
    behavior.addIdWhitelist(behavior.newIdWhitelistItem(sidecarId));
  }

  const file = DriveApp.getFileById(sidecarId);
  const content = file.getBlob().getDataAsString();
  const itemMap = JSON.parse(content);

  console.log('--- Labels ---');
  console.log(JSON.stringify(itemMap.labels, null, 2));

  console.log('--- fl_competent mapping ---');
  console.log(JSON.stringify(itemMap.questions['fl_competent'], null, 2));

  if (itemMap.questions['fl_competent']) {
    const labelId = itemMap.questions['fl_competent'].labelId;
    console.log(`Label ID for fl_competent: ${labelId}`);
    if (labelId && itemMap.labels[labelId]) {
      console.log('Labels content:', JSON.stringify(itemMap.labels[labelId], null, 2));
    } else {
      console.log('Labels content not found for this ID');
    }
  }

  console.log('--- Questions referencing labels_3 ---');
  const referencingQuestions = Object.entries(itemMap.questions).filter(([key, value]) => value.labelId === 'labels_3');
  console.log(JSON.stringify(referencingQuestions, null, 2));

  if (referencingQuestions.length === 0) {
    console.log('NO questions reference labels_3');
    // Check if any questions reference OTHER labels that might be identical to labels_3 content
    const labels3Content = itemMap.labels['labels_3'];
    if (labels3Content) {
      console.log('Content of labels_3:', JSON.stringify(labels3Content));
    }
  }
};

if (ScriptApp.isFake) {
  main();
}
