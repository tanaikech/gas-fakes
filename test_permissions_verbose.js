import './src/index.js';

const sharedId = '1uz4cxEDxtQzu0cBb1B4h6fsjgWy7hNFf';
const sheetId = '1DlKpVVYCrCPNfRbGsz6N_K3oPTgdC9gQIKi0aNb42uI';

function logPerms(name, id) {
  console.log(`\nPermissions for ${name} (${id}):`);
  const { permissions } = Drive.Permissions.list(id, {fields: 'permissions(id,role,type,emailAddress,domain,allowFileDiscovery,displayName)'});
  permissions.forEach(p => {
    console.log(`- Role: ${p.role}, Type: ${p.type}, Email: ${p.emailAddress || 'N/A'}, Domain: ${p.domain || 'N/A'}, Name: ${p.displayName || 'N/A'}`);
  });
}

logPerms('SHARED_FILE_ID', sharedId);
logPerms('TEST_SHEET_ID', sheetId);
