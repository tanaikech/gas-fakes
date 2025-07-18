# Some notes for gas-fakes collaborators 

This is a proof of concept so I've implemented a subset of number of services and methods, but the tricky parts are all in place so all that's left is a load of busy work (to which I heartily invite any interested collaborators).

## progress

This is a pretty huge task, so I'm working on adding services a little bit at a time, with usually just a few methods added in each release. I'm looking for collaborators who not only want to help on this project, but also to deepen their understanding of Apps Script services, and the worksace APIs. I've certainly learned a lot so far.

## Getting started

First take a look at the [readme](README.md) for how to get started as a user. The main difference is
- You'll be using a local fork from the [repo](https://github.com/brucemcpherson/gas-fakes) of the source code rather than from npm
- You'll need a companion Apps Script project so you can test your work as you go
- You can merge your updates, issues and tests into the main repo
- Merges are happening almost daily so you can pull the latest updates to your fork regularily


### Development schedule

As a background project I'm chipping away at this when I can. There's a mountain of work to do, and I'm not that bothered about the general order I do it in. If you would specifically like some service or method prioritized, let me know and I'll see if I can push it forward. Better still, if you'd like to have a crack at implementing it yourself, let me know and I'll get you started.


## Testing

Use the test project included in the repo if you want to do some tests. It uses a Fake services to exercise Auth etc. Just change the fixtures in your own environments by following the instructions in [setup-env.md](https://github.com/brucemcpherson/gas-fakes/blob/main/setup-env.MD), then `npm i && npm test`.

 If you are a collaborator and want to add some additional methods, you need to create a test section and always run a full set of tests on both environments before creating a merge request to ensure your changes havent broken anything. At the time of writing there are about 4,500 active tests.

Note that I use a [unit tester](https://ramblings.mcpher.com/apps-script-test-runner-library-ported-to-node/) that runs in both GAS and Node, so the exact same tests will run in both environments. There are some example tests in the repo. Each test has been proved on both Node and GAS. There's also a shell (togas.sh) which will use clasp to push the test code to Apps Script.

Each test can be run individually (for example `npm run testdrive`) or all with `npm test`

Test settings and fixtures are in the .env file. Some readonly files are publicly shared and can be left with the example value in .env-template. Most files which are written are created and deleted afterwards on successful completion. They will be named something starting with -- and often centralized into a scratch folder for easy maintentance. In case of failures you may need to delete these yourself. If you want to preserve the testfiles it creates doing a test session, just set the CLEAN parameter in .env to 0.

### Pushing to GAS

The script uses togas.sh will move the test scripts to GAS with clasp - just set the `SOURCE` and `TARGET` folders in the TOGAS script. Make sure you have an `appsscript.json` manifest in the `SOURCE` folder, as **gas-fakes** reads that to handle OAuth on Node.

You can write your project to run on Node and call GAS services, and it will also run on the GAS environment with no code changes, except on the Node side you have this one import

```sh
// all the fake services are here
import '@mcpher/gas-fakes/main.js'
```

togas.sh will remove imports and exports on the way to apps script, which doesnt support them.

## Using Gemini code assist

I've had mixed result with Gemini on this large project. If you're planning to use Gemini to do some legwork, I have no objections but here's some [notes](gemini.md) - some reflections and experiences on using Gemini to help code large projects on my experience so far.

## Help

As I mentioned earlier, to take this further, I'm going to need a lot of help to extend the methods and services supported - so if you feel this would be useful to you, and would like to collaborate, please ping me on [bruce@mcpher.com](mailto:bruce@mcpher.com) and we'll talk.

## Translations and writeups

- [initial idea and thoughts](https://ramblings.mcpher.com/a-proof-of-concept-implementation-of-apps-script-environment-on-node/)
- [Apps Script Services on Node – using apps script libraries](https://ramblings.mcpher.com/apps-script-services-on-node-using-apps-script-libraries/)
- [Apps Script environment on Node – more services](https://ramblings.mcpher.com/apps-script-environment-on-node-more-services/)
- [Turning async into synch on Node using workers](https://ramblings.mcpher.com/turning-async-into-synch-on-node-using-workers/)
- [All about Apps Script Enums and how to fake them](https://ramblings.mcpher.com/all-about-apps-script-enums-and-how-to-fake-them/)
- [Russian version](README.RU.md) ([credit Alex Ivanov](https://github.com/oshliaer)) - needs updating
- [colaborators](collaborators.md) - additional information for collaborators
- [oddities](oddities.md) - a collection of oddities uncovered during this project
- [gemini](gemini.md) - some reflections and experiences on using gemini to help code large projects
- [setup env](setup-env.md) - ([credit Eric Shapiro] - additional info on contents of .env file
- [readme](README.md)
- [named colors](named-colors.md)
