# <img src="./logo.png" alt="gas-fakes logo" width="50" align="top">  Application default credentials and restricted scopes

Recent updates to OAth secutity policies have caused many problems in getting things to work using only Application Default credentials (ADC), and this is likely to get worse. I'm providing enhanced guidance for how to get all this to still work with ADC (rather than having to manage service accounts) to get past this growing irritation.

## Internal use projects

It's possible to configure your project for internal use in the cloud console. Since gas-fakes is exactly that, we can try to find a way to modify ADC as if its an internal prject, which will allow us to access those restricted scopes that would otherwise be blocked. The key is to replace the client id and secret that ADC generated with one that you've created and set as internal only.

## Console versus CLI

I'm not a fan of using the cloud console as it makes it difficult to document, error prone and subject to frequent UI changes and it being frquently impossible to find anything. However, most of this stuff does not have a CLI equivalent so we have to do it via the console. Sadly, we cannot dynamically modify the scopes required so we'll have some annoying duplication to handle during this process.

### The Oauth consent screen

The first job is to set this up in the console. Go here https://console.cloud.google.com/auth/overview. If you already have an app set up for this project you'll wonder what on earth to do next. You can only have one app per project, so you're out of luck. You'll need to create a new project - I recommend you do this anyway - let's keep gas-fakes to its own project. Let's assume I'm creating a new project. 

#### initial setup

- Add the new project - create it as part of an organization. 
- Go to the oauth consent screen and give it a name and your email address, next..
- Select the Audience as 'internal'. You could mark it as external and add a list of users that can access it, but let's stick to internal, next...
- Add you email address, then agree and finish and create.

#### create Oauth client

- The application is desktop app
- give it a name - You will be able to create multiple clients if you want (for example with different scopes), so give it a name that reflects what you'll be using it for. In my case, I'm only creating one client that will be scoped for all of gas-fakes capabilities.
- at this point it'll give a client id, and allow you to download the credentials. Do that - we'll need them later

#### Adding scopes

For ADC we've been setting scopes via the .env file. We'll still need to do that, but the client you've just created will need a list of scopes that it will allow to be used. Your .env file scopes will be all or a subset of these. So lets get the list, and find the place in the console to add them - its the data access icon on the left sidebar. 
- Add scopes all the scopes you want gas-fakes to ever be able to ask for. It's easier just to add them as a comma separated list (at the bottom) rather than trying to find them in the list it provides, ... save 
- Check the verification center - the last icon on the sidebar - it should say "verification not required", thank goodness.

#### Branding

Second from the top on the left sidebar on the console, you can find the branding section. You probably don't need to do much here, except perhaps add a logo. You can use the gas-fakes logo if you like from here https://github.com/brucemcpherson/gas-fakes/logo.png

## Injecting the new credentials

If you've already set up  gas-fakes, you'll have an .env file that looks like this.

````
GCP_PROJECT_ID="your-project-id"

# this is optional 
DRIVE_TEST_FILE_ID="the id of some drive file you have access to"

# we'll use the default config for application default credentials
AC=default
# these are the scopes set by default - take some of these out if you want to minimize access
DEFAULT_SCOPES="https://www.googleapis.com/auth/userinfo.email,openid,https://www.googleapis.com/auth/cloud-platform"
EXTRA_SCOPES=",https://www.googleapis.com/auth/drive,https://www.googleapis.com/auth/spreadsheets,https://www.googleapis.com/auth/gmail.labels"
LOG_DESTINATION="CONSOLE"

````

And you'll have a file in  ~/.config/gcloud/application_default_credentials.json that looks like this
````
{
  "account": "",
  "client_id": "xxxxx,
  "client_secret": "xxxx",
  "quota_project_id": "xxx",
  "refresh_token": "1xxx",
  "type": "authorized_user",
  "universe_domain": "googleapis.com"
}
````
≈


## resetting with the new credentials

Now we'll persuade Application Default Credentials to use our newly created app rather than the one it wanted to use. Presumably you've already run setaacounts.h to seed the ADC as normal and set your project. 

Now add this to your .env file - Im storing mine in the project in a folder called private (which is in my .gitignore file). The file is the one you downloaded from the console.

````
CLIENT_CREDENTIAL_FILE="private/gasfakes-oa.json"
````

Now you can run shells/setenhanced.sh which will replace the adc credentials with these, via another dialog.

You can now go to shells and run setaccounts.sh as normal (this will run gcloud auth application-default login with the approperiate scopes), and it should go through the normal adc dialog. if you've created a new project it will ask if you want to turn on some cloud APIS.

## enabling workspace apis

Finally, if this is a new project, then the workspace APIS gas-fakes supports will need to be enabled. shells/enable.sh will do all that for you.

That's it! 

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
- [gemini](gemini.md) - some reflections and experiences on using gemini to help code large projects
- [named colors](named-colors.md)
- [sandbox](sandbox.md)
- [named range identity](named-range-identity.md)
- [restricted scopes](restricted_scopes.md) - how to handle authentication for restricted scopes.