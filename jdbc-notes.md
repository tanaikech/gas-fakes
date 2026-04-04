# Notes on jdbc handling in Apps Script and gas-fakes

The Apps Script implementation of JDBC is pretty old. Converting the connection string for a variety of databases can be complex and error prone. Gas-fakes uses modern connectors for pg and mysql so not only is it faster, but it able to handle connection strings more robustly.  However, since the objective is to emulate live apps script, I've added a few utilities to help you not only normalize the connection strings and dumb down the connectivity requirements to App Script supported ones, but also handle some of the less obvious connectivity problems you might face both from Live Apps Script and locally.

## Databases so far tested

These all work on both gas-fakes and live apps script. [testjdbc.js](test/testjdbc.js)  has examples of each. I'll be adding to this list as I get round to it.

- PostgreSQL on [Neon](https://neon.com/)
- MySQL on [Aiven](https://aiven.io/)
- CockroachDB (postgres-like) on [cockroachdb.com](https://www.cockroachlabs.com/)
- PostgreSQL on [Google Cloud SQL](https://cloud.google.com/sql)
- MySQL on [Google Cloud SQL](https://cloud.google.com/sql)


## Connection String Normalization

Each of these databases will give you a connection string. However, none of them will work with apps script jdbc. In addition to the connection string fiddling, you'll also need to handle various proxying and permission gotchas, especially for the google hosted ones. gas-fakes cli however can provide a suitable jdbc connection string for both live apps script and local testing from a given database connection string. More on that later.

## Google Cloud SQL hosted databases

Google SQL hosted databases have a few additional steps, most of which is detected and handled automatically by `gas-fakes`.

### Running locally

For the externally hosted databases (Neon, Aiven, CockroachDB) you can connect directly using a refactored connection string. More on that later in the normalization of connection strings section. You don't need to run the cloud proxy. 


#### Connectivity

For the Google Cloud SQL (mySQL, postgres), you'll can use the cloud sql proxy or use the external ip address of your database. Gas-fakes can use either, automatically switching between either depending on whether it detects the cloud sql proxy running. It can also detect the external address of the database by interogating the cloud sql api, whitelist your local ip, and use that if the cloud sql proxy is not running for the target database. When `gas-fakes` detects that the cloud sql proxy is running, it will automatically patch in the localhost address and port to the connection string in place of the internal google address. 

##### Option 1: Starting the cloud sql proxy if running locally

There's some stuff to install with gcloud one-time
```
gcloud components install cloud-sql-proxy
```

Let's say your instance is project-id:region:instance-name. This is the internal address of a google host, so is only valid when using jdbc.getCloudSqlConnection() - which at this time is only valid for MySQL (not Postgres). cloud-sql-proxy is a service that runs locally and exposes itself on localhost. To use it you hit the localhost and it will securely connect to your cloud sql instance inside the google network using the internal google instance name. 

In a separate terminal session you can start the proxy like this:

```
cloud-sql-proxy <project-id>:<region>:<instance-name>
```

##### Option 2: Using the external ip address of your database

`gas-fakes` will attempt to use the sql proxy if it is running. If not, then it will do these things:
- get the external ip address of your database from the cloud sql api
- whitelist your local ip address for the database so you can access it
- modify the connection string you provide to subsitute the google internal name of the instance with the external ip address of the database

You just need to supply the connection string as usual.

### Out of date password encryption for MySQL

For MySql, Google Apps Script uses a JDBC driver that is incompatible with the default authentication security introduced in MySQL 8.0 and 8.4 (which Cloud SQL uses). Jdbc.getCloudSqlConnection or Jdbc.getConnection will fail with the error "Failed to establish a database connection. Check connection string, username and password." This is because MySQL 8.4 uses caching_sha2_password (SHA-256) by default. The Apps Script JDBC driver only supports the legacy mysql_native_password (SHA-1) handshake. In MySQL 8.4, this legacy plugin is disabled by default.

#### How to fix it

To allow Apps Script to connect, you must explicitly re-enable the legacy authentication plugin at the server level and then update the specific database user. It's a pain, but it is what it is.

1. Enable the Database Flag
You must tell the Google Cloud SQL instance to load the legacy plugin.

- Go to Cloud SQL Instances > [Your Instance] > Edit.
- Navigate to Configuration options > Flags. 
- Add the flag: mysql_native_password and set it to on.
- Save (The instance will restart).

2. Downgrade the User Authentication
Run the following SQL command in the Cloud SQL Query Editor to update the specific user account:
```
SQL
ALTER USER 'your-user'@'%' 
IDENTIFIED WITH mysql_native_password BY 'your-password';

FLUSH PRIVILEGES;
```

**Note** - this means you'll have to do this each time you change the user password.


### Running on Apps Script

Apps Script has some challenges with connection strings, especially if they contain special characters. This doesnt seem to be fixable by url encoding, soI recommend you use the `(url,user, password)` variant of the constructor instead of the single connection string variant. There's another alleged constructor format `(url, options)` which is supposed to take options including `{user, password, database}` but `database` doesnt work - so if you use this option the url should include the database - for example `instance/database` and exclude the database property from the options argument.

#### Connection strings

The format of connection strings required by apps script is not the same as is generally given by cloud providers. I won't go into the differences here, but gas-fakes provides a useful utility that deconstructs a range of connection strings and provides various connection strings and user/password combinations you can use instead.

#### Sharing credentials between apps script and gas-fakes

I you are developing using gas-fakes, then your connections will likley be defined in your .env file. To avoid duplicating effort and working with properties service on Live Apps Script, you can directly create properties in live Apps Script - see [sharing cache and properties between gas-fakes and live apps script](https://ramblings.mcpher.com/sharing-cache-and-properties-between-gas-fakes-and-live-apps-script/).  This projects test suite (which runs on both live apps script and gas-fakes) does exactly that see - [testjdbc.js](test/testjdbc.js) 







