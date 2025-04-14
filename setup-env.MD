# Setup .env
We use a .env file to store variables for testing. Using `.env` is a common pattern to store 'secrets' or local variables that we don't want version controlled. We gitignore the .env file so that anytime a collaborator sets up their environment, there is no conflict on the remote when they push changes.

## Getting started
- Copy the `.env.template` file and rename the newly created copy `.env`. Note: Do not edit .env.template with your specific variables. 
- Fill out the .env with specific information (file ids, project ids, etc.) for your environment

## How it works
On Node/locally: [Starting with Node 20](https://nodejs.org/en/learn/command-line/how-to-read-environment-variables-from-nodejs), the `process` module provides a .env property so any reference to `process.env.VAR_NAME` will have the variable value. We pass in the env-file flag with the path location of the .env file, like so `node --env-file=.env`, which you can see in package.json.

On Apps Script: process.env is NOT supported. Instead, in `togas.bash` we replace any instance of process.env with the actual value. We use `printf %q` to properly escape all characters coming from `.env` so that they are correctly replaced in the test file on GAS.
