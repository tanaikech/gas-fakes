import '../../main.js';
console.log(process.env.LOG_DESTINATION)
Logger.__logDestination="BOTH"
console.log(Logger.__destination)
console.log (Logger.__cloudLogLink)


