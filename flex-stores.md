## Using flex-cache as shareable drop in replacement for the cache and property stores

gas-flex-cache provides exactly the same methods as the properties and cacheservice in apps script, but uses a different backend to store and serve the data. It is setup to accept plugin back end data stores, and you can use it as an add-on to both gas-fakes and live Apps Script - see [here](https://ramblings.mcpher.com/supercharge-your-google-apps-script-caching-with-gasflexcache/) for how. 

However, it's also natively built in to gas-fakes so you can choose to use it for your stores.

## Why to switch to flex-cache

 The default gas-fakes store services uses key value stores based on the local disk. gas-fakes currently supports the Upstash Redis back end, which not only gives us multiple sharing options, but also give full access to all of redis's capabilitities.

 In addition, if you also switch to flex-cache in live apps script, you can share cache and property values between your development Node gas-fakes environment and your live apps script!

### Get upstash credentials

- visit https://upstash.com/ and start up a free redis database.
- get the redis database url and token – you’ll be storing this in the property store of your script

### add them to your .env file

You need these values (The default value for STORE_TYPE is "file', in which case the other values are ignored) to you .env file

```env
STORE_TYPE="upstash"
UPSTASH_REDIS_REST_URL="https://xxx...upstash.io"
UPSTASH_REDIS_REST_TOKEN="xxx...
```

### use flex-cache on live apps script

If you want to share stores between gas-fakes and live apps script, you can either completely replace the native apps script stores with the gas-flex-cache apps script library, or create  additional stores to communicate with gas-fakes which would give more selective sharing opportunities. For some examples of a range of sharing use cases see [here](https://ramblings.mcpher.com/supercharge-your-google-apps-script-caching-with-gasflexcache/).

Let's assume you want to strictly emulate apps script property services, and shared them between your local and live environment.

- Add the Apps Script library to your project (bmGasFlexCache id: 1R_r9n4EGctvA8lWBZVeuT66mgaKBRV5IxfIsD_And-ra2H16iNXVWva0)
- Add a shortcut to the dropin class to your script
```javascript
var newCacheDropin = bmGasFlexCache.newCacheDropin;
```

### Sharing the main script ID

In Apps Script, the cache and property stores visibility is limited to the same script. gas-flex-cache allows much more optios for sharing stores, but to emulate Apps Script behavior, if you want to share stores as a drop-in, we have to make sure that the gas-fakes shares the same scriptID as its counterpart on live Apps Script. The settings file gasfakes.json defines the identity gas-fakes should assume. If you don't have one, gas-fakes will generate one with a random scriptID the first time you run it.

here's an example of a one of my gasfakes.json
````
{
  "manifest": "./appsscript.json",
  "clasp": "../testongas/.clasp.json",
  "documentId": null,
  "cache": "/tmp/gas-fakes/cache",
  "properties": "/tmp/gas-fakes/properties",
  "scriptId": "13z5rgP4Lqnwq2U_bNfylSd3ze8FhWreHM3dGmWWvKE7oSrB-afXy6PN2"
}
````

There are 2 ways we can match scriptId between the local gas-fakes environment and the target scriptId

#### Option 1 - clasp

If you are using clasp, then the staging folder you use to transer files to gas will contain a .clasp.json. gas-fakes will automatically pick up the scriptID from there and inject it into your gasfakes.json. To do this, delete any scriptId currently in your gasfakes.json and put the path to the .clasp.json that manages pushing to your target Script.

#### Option 2 - enter the scriptId manually

Populate the scriptId property with the id of the target script.


