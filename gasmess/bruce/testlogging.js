import '../../main.js';
//import './node_modules/@mcpher/gas-fakes/main.js'

// we can pretest npm with npm pack, then  
// npm install ../../mcpher-gas-fakes-1.1.4.tgz 
//import '@mcpher/gas-fakes'
console.log(process.env.LOG_DESTINATION)
Logger.__logDestination="BOTH"
console.log(Logger.__destination)
console.log (Logger.__cloudLogLink)

const file = DriveApp.getFileById("1iOqRbA6zbV3ry73iEf4y9cygtDchJvAh")
console.log (file.getName())