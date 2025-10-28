## <img src="./logo.png" alt="gas-fakes logo" width="50" align="top">  Revolutionize Your Apps Script Workflow: Develop and Test Locally with gas-fakes
For developers building on Google's powerful Apps Script platform, the creative possibilities are vast. However, the development process itself can often feel constrained by its cloud-native environment. The constant cycle of writing code in the online editor, saving, and running tests in the cloud can be a significant drag on productivity. But what if you could bring the Apps Script environment to your local machine?

Thanks to the innovative work of Google Developer Expert, Bruce McPherson, this is no longer a "what if." Introducing gas-fakes, a game-changing repository that brings the Apps Script environment to Node.js, allowing you to develop, test, and debug your Google Apps Script projects locally.

## The Challenge: A Disconnected Development Experience

Anyone who has worked extensively with Google Apps Script is familiar with the challenges of its development lifecycle. Using native services like DriveApp, SpreadsheetApp, or CacheService traditionally means being tethered to the Google Cloud IDE. This can lead to a slow and often frustrating "back-and-forth" development process that feels disconnected from the modern, local workflows that developers in other ecosystems take for granted.

## The Solution: A Local Apps Script Environment

The gas-fakes repository is a proof-of-concept that brilliantly emulates the Google Apps Script environment on a local Node.js server. The core idea is to allow developers to write and run their GAS code, including calls to familiar services, without ever leaving their local development setup. It achieves this by using Google Workspace APIs to mimic the behavior of the native Apps Script services.

## Key Features and Benefits of gas-fakes:

Write Authentic Apps Script Code, Locally: The most significant advantage is the ability to write your code exactly as you would in the Apps Script editor, but in your preferred local editor like VS Code.

- Synchronous Execution: gas-fakes mirrors the synchronous nature of Apps Script. This means you don't have to refactor your code to handle promises or async/await, making the transition seamless.
- Faster Testing and Debugging: By running your scripts locally, you can take advantage of the speed and power of local testing frameworks and debuggers, dramatically accelerating your development cycle.
- Integration with Modern Tooling: Use familiar tools like npm for package management and execute your tests right from your command line.
- Emulated Services: gas-fakes has implemented a growing number of fake services, including DriveApp, CacheService, and PropertiesService, with more on the way.

## Getting Started with gas-fakes

The repository is available as an npm package, making it easy to integrate into your projects. Getting started involves a few simple steps:

- Install the package: npm i @mcpher/gas-fakes
- Set up a Google Cloud Project: Since you'll be running outside of the Google-managed environment, you'll need your own GCP project with the relevant Workspace APIs enabled.
- Configure your environment: The repository provides clear instructions and helper scripts to set up your local environment and authenticate using Application Default Credentials.

Once configured, you can start writing and testing your Apps Script code locally, with the confidence that it will behave the same way when deployed to the GAS environment.

## About the Creator

The gas-fakes repository is a project by Bruce McPherson, a well-respected figure and Google Developer Expert in the Apps Script community. He is the author of several books and video courses on Apps Script, including "Going GAS," and is known for his insightful blog, Desktop Liberation, and numerous contributions of libraries and solutions for the Apps Script ecosystem. His deep expertise and commitment to the community lend significant credibility to this project.

## Conclusion

The gas-fakes repository is a must-see for any serious Google Apps Script developer. It represents a significant step forward in bringing a modern, efficient, and enjoyable development experience to the platform. By bridging the gap between local and cloud development, this project has the potential to save developers countless hours and unlock a new level of productivity.

To learn more and get started, visit the gas-fakes repository on GitHub: https://github.com/brucemcpherson/gas-fakes

## <img src="./logo.png" alt="gas-fakes logo" width="50" align="top">  Further Reading

- [getting started](GETTING_STARTED.md) - how to handle authentication for restricted scopes.
- [readme](README.md)
- [initial idea and thoughts](https://ramblings.mcpher.com/a-proof-of-concept-implementation-of-apps-script-environment-on-node/)
- [Inside the volatile world of a Google Document](https://ramblings.mcpher.com/inside-the-volatile-world-of-a-google-document/)
- [Apps Script Services on Node – using apps script libraries](https://ramblings.mcpher.com/apps-script-services-on-node-using-apps-script-libraries/)
- [Apps Script environment on Node – more services](https://ramblings.mcpher.com/apps-script-environment-on-node-more-services/)
- [Turning async into synch on Node using workers](https://ramblings.mcpher.com/turning-async-into-synch-on-node-using-workers/)
- [All about Apps Script Enums and how to fake them](https://ramblings.mcpher.com/all-about-apps-script-enums-and-how-to-fake-them/)
- [Russian version](README.RU.md) ([credit Alex Ivanov](https://github.com/oshliaer)) - needs updating
- [colaborators](collaborators.md) - additional information for collaborators
- [oddities](oddities.md) - a collection of oddities uncovered during this project
- [gemini](gemini-observations.md) - some reflections and experiences on using gemini to help code large projects
- [named colors](named-colors.md)
- [sandbox](sandbox.md)
- [named range identity](named-range-identity.md)
- [adc and restricted scopes](https://ramblings.mcpher.com/how-to-allow-access-to-sensitive-scopes-with-application-default-credentials/)
- [push test pull](pull-test-push.md)
- [gas fakes cli](gas-fakes-cli.md)
- [sharing cache and properties between gas-fakes and live apps script](https://ramblings.mcpher.com/sharing-cache-and-properties-between-gas-fakes-and-live-apps-script/)
- [gas-fakes-cli now has built in mcp server and gemini extension](https://ramblings.mcpher.com/gas-fakes-cli-now-has-built-in-mcp-server-and-gemini-extension/)
- [gas-fakes CLI: Run apps script code directly from your terminal](https://ramblings.mcpher.com/gas-fakes-cli-run-apps-script-code-directly-from-your-terminal/)
- [How to allow access to sensitive scopes with Application Default Credentials](https://ramblings.mcpher.com/how-to-allow-access-to-sensitive-scopes-with-application-default-credentials/)
- [Supercharge Your Google Apps Script Caching with GasFlexCache](https://ramblings.mcpher.com/supercharge-your-google-apps-script-caching-with-gasflexcache/)
- [Fake-Sandbox for Google Apps Script: Granular controls.](https://ramblings.mcpher.com/fake-sandbox-for-google-apps-script-granular-controls/)
- [A Fake-Sandbox for Google Apps Script: Securely Executing Code Generated by Gemini CLI](https://ramblings.mcpher.com/gas-fakes-sandbox/)