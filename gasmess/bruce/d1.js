import '../../main.js';
const d = DriveApp.createFile('my-test-file.txt', 'Hello from gas-fakes!');
const e = DriveApp.getFileById(d.getId());
console.log(e.getName());