---
description: The role of the .env file
---

The .env file is maintained by gas-fakes init and auth and contains a number of variables required to properly run gas-fakes. 

## auth

there are 2 types of auth supported

- adc: application default credentials 
- dwd: domain wide delegation


### the .env  file and dwd
The preferred is dwd, which uses a service account to impersonate the user logged into gcloud. However, when gas-fakes runs it needs to know which service account to use. The name of the service account is in the .env file. The service acount itself will have been created and had the necessary permissions assigned during the gas-fakes auth process.

If the env file is not specified (either with `node --env-file <env-file>`, `dotenv/configure` or if with gas-fakes-cli,  `gas-fakes -e <env-file>`) gas-fakes will fall back to application default credentials, which is fine for most local use. To use dwd rather than adc, always provide a reference to the .env file created by gas-fakes auth

### the .env file and adc
Normally gas-fakes will run with adc without an .env file. This is because cloud_platform and drive scope are automatically assigned during gas-fakes auth and this allows access to many workspace apis (for example spreadsheets, docs etc). However if restricted/sensitive scopes are required you either need to use dwd (which reads the manifest file during the gas-fakes init process to discover the required scopes), or use an oauth credentials file in addition to the regular adc process, as documented in  [sensitive scopes](../../senstive_scopes.md)

## containerization
gas-fakes can run on cloud-run - but it needs dwd auth - for details see [running gas-fakes on google cloud run](../../cloud-run.md)



## summary

gas-fakes will use the service account if it can find it, and your selected method of authentication was dwd. If it can't find it because you havent provided a path to an .env file it will fall back to adc.