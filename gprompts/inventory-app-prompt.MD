Prompt:  create an inventory app 

with the list of links in /home/bruce/gas-fakes/progress/inventory-list.json, create a node  app that can create a result in the form the example template /home/bruce/gas-fakes/gprompts/model.json

- write the es6 app to  ./gprompts/gas-inventory.mjs
- create a dedicated package.json in ./gprompts for this
- visit each link

- recurse through each class method to discover the classes and properties mentioned for each.
- continue to recurse for every class
- the final objective is to convert the entire app script service documentation into a json file that contains an entire description of every class, method, property and enum mentioned.