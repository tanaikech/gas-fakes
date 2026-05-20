//import '../main.js';
import '@mcpher/gas-fakes'
export function test() {
    console.log('--- test ---');
    console.log('test!');
    //console.log(Session.getActiveUser().getEmail());
    PropertiesService.getUserProperties().setProperty('test', 'test');
    console.log('test', PropertiesService.getUserProperties().getProperty('test'));
}

test();