### JDBC & MySQL 8.x/8.4 Authentication on Cloud SQL
**The Problem:** Google Apps Script uses a legacy JDBC driver incompatible with the default `caching_sha2_password` security introduced in MySQL 8.0+. In MySQL 8.4, the required legacy plugin is disabled entirely by default, causing `Jdbc.getConnection` or `Jdbc.getCloudSqlConnection` to fail with: *"Failed to establish a database connection. Check connection string, username and password."*

**The Solution:** You MUST explicitly enable the legacy `mysql_native_password` plugin at the server level and downgrade the specific user's authentication method.

1. **Enable the Database Flag (Cloud SQL):** 
   - In the Google Cloud Console, edit your Cloud SQL instance.
   - Navigate to **Configuration options > Flags**.
   - Add the flag `mysql_native_password` and set it to `on`. Save and allow the instance to restart.
2. **Downgrade the User Authentication:** 
   - Run the following SQL to switch the user to the legacy handshake:
     ```sql
     ALTER USER 'your-user'@'%' IDENTIFIED WITH mysql_native_password BY 'your-password';
     FLUSH PRIVILEGES;
     ```
   - *Note: You must re-run this `ALTER USER` command anytime the user's password is changed.*