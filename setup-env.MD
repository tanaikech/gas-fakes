# Setup .env
We use a .env file to store variables for testing. Using `.env` is a common pattern to store 'secrets' or local variables that we don't want version controlled. We gitignore the .env file so that anytime a collaborator sets up their environment, there is no conflict on the remote when they push changes.

## Getting started
- Copy the `.env.template` file and rename the newly created copy `.env`. Note: Do not edit .env.template with your specific variables. 
- Fill out the .env with specific information (file ids, project ids, etc.) for your environment or ask for access to the already provided test files.

## How it works
On Node/locally: [Starting with Node 20](https://nodejs.org/en/learn/command-line/how-to-read-environment-variables-from-nodejs), the `process` module provides a .env property so any reference to `process.env.VAR_NAME` will have the variable value. We pass in the env-file flag with the path location of the .env file, like so `node --env-file=.env`, which you can see in package.json.

On Apps Script: process.env is NOT supported. Instead, in `togas.bash` we replace any instance of process.env with the actual value. We use `printf %q` to properly escape all characters coming from `.env` so that they are correctly replaced in the test file on GAS.

## Translations and writeups

- [initial idea and thoughts](https://ramblings.mcpher.com/a-proof-of-concept-implementation-of-apps-script-environment-on-node/)
- [Inside the volatile world of a Google Document](https://ramblings.mcpher.com/inside-the-volatile-world-of-a-google-document/
- [Apps Script Services on Node – using apps script libraries](https://ramblings.mcpher.com/apps-script-services-on-node-using-apps-script-libraries/)
- [Apps Script environment on Node – more services](https://ramblings.mcpher.com/apps-script-environment-on-node-more-services/)
- [Turning async into synch on Node using workers](https://ramblings.mcpher.com/turning-async-into-synch-on-node-using-workers/)
- [All about Apps Script Enums and how to fake them](https://ramblings.mcpher.com/all-about-apps-script-enums-and-how-to-fake-them/)
- [Russian version](README.RU.md) ([credit Alex Ivanov](https://github.com/oshliaer)) - needs updating
- [colaborators](collaborators.md) - additional information for collaborators
- [oddities](oddities.md) - a collection of oddities uncovered during this project
- [gemini](gemini.md) - some reflections and experiences on using gemini to help code large projects
- [setup env](setup-env.md) - ([credit Eric Shapiro] - additional info on contents of .env file
- [this file](README.md)
- [named colors](named-colors.md)