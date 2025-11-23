import '@mcpher/gas-fakes';

const rulesId = '11L29nlZakItr2mNJbOeOJPJ377BxeJ8G';

const getDriveObject = (id) => {
  return JSON.parse(DriveApp.getFileById(id).getBlob().getDataAsString())
}

const main = () => {
  if (ScriptApp.isFake) {
    const behavior = ScriptApp.__behavior;
    behavior.addIdWhitelist(behavior.newIdWhitelistItem(rulesId));
  }

  const rulesObject = getDriveObject(rulesId);

  console.log('=== Network Outputs ===');
  if (rulesObject.network && rulesObject.network.outputs) {
    console.log(JSON.stringify(rulesObject.network.outputs, null, 2));
  } else {
    console.log('No outputs found in network section');
  }
};

if (ScriptApp.isFake) {
  main();
}
