---
name: gas-fakes-dev
description: Develop and implement the 'gas-fakes' project, emulating Google Apps Script (GAS) functionality using Node.js.
tags:[nodejs, google-apps-script, google-cloud-api, testing, mock]
version: "1.0.0"
---

## Summary
This skill enables the agent to assist in the development of the `gas-fakes` project. The primary objective is to emulate Google Apps Script (GAS) behavior using Node.js and Google APIs, allowing Apps Script code to run in a local Node.js environment.

## Usage
- When you need to implement fake/mock functionality for GAS classes or methods.
- When creating test scripts to verify the implemented functionalities.
- When assisting a human developer with Node.js and Google APIs integration.

## Workflow

### 1. Context and Specification Check
Before implementing, verify the specifications of the target Google Apps Script classes and methods. Ensure that the functionality you are about to build aligns with real GAS behavior.

### 2. Implementation
Generate Node.js code that maps GAS methods to the corresponding Google Cloud APIs.
- Refer to the existing codebase in the `src/` directory to understand the current architecture.
- Ensure the code runs correctly in the Node.js environment.

### 3. Testing
You must verify your implementation by writing and executing test scripts.
- Place your test scripts in the `test/` directory.
- Execute the tests to ensure there are no errors and the behavior matches expectations.
- Full instructions on test and other workflows are in ../../workflows. Be sure to read the relevant workflow file before starting any task.

### 4. Holistic/Targeted Skill Evolution (Self-Updating SKILL)
**[CRITICAL INSTRUCTION]**
The `gas-fakes` project is complex, and bridging Node.js with GAS involves many hidden constraints, specific architectural patterns, and potential errors. You are required to continuously learn and autonomously evolve this SKILL.

- **Trigger:** Whenever you encounter an error during implementation or testing, or when you receive correction feedback/prompts from the human developer.
- **Action:** You MUST extract the lessons learned from the failure and recovery process. Identify the underlying rules, technical constraints, or coding patterns that caused the issue.
- **Update:** Immediately update this `SKILL.md` file (by adding, deleting, or modifying content) to document the newly acquired knowledge. If necessary, also create or update sample scripts, helper templates, or explanatory Markdown files in the project. 
- **Goal:** Transform your localized, temporary learnings into permanent, universally readable knowledge to prevent repeating the same mistakes and to handle the complexities of the project autonomously.
- **CREDENTIALS**: Never commit actual credentials or keys you might discover in the .env file to the repository nor to the SKILL.md file.

## Documented Knowledge & Lessons Learned

### Apps Script JDBC to Google Cloud SQL PostgreSQL
- **Connection Method**: You CANNOT use `Jdbc.getCloudSqlConnection()` for PostgreSQL in Apps Script; it only works for MySQL. You MUST use standard `Jdbc.getConnection()`.
- **IP Whitelisting**: Because Live Apps Script runs on dynamic Google IPs, you must whitelist Google's API IP ranges (fetched from `https://www.gstatic.com/ipranges/goog.json`) in your Cloud SQL instance's Authorized Networks to allow connection.
- **Connection String Formatting**: Apps Script's `Jdbc.getConnection()` has strict requirements for Postgres when hosted on Google Cloud:
  - You CANNOT use `ssl=true` as a query parameter (e.g., `jdbc:postgresql://<IP>:<PORT>/<DB>?ssl=true`). The Java driver on Apps Script throws `The following connection properties are unsupported: ssl`.
  - Do not embed url-encoded credentials directly into the URL. Instead, use the 3-argument signature: `Jdbc.getConnection("jdbc:postgresql://<IP>:<PORT>/<DB>", rawUser, rawPass)`.

### Apps Script JDBC to Google Cloud SQL MySQL
- **Connection Method**: You CAN use `Jdbc.getCloudSqlConnection(url, user, password)` for MySQL on Google Cloud using the specific protocol format `jdbc:google:mysql://[INSTANCE_CONNECTION_NAME]/[DATABASE_NAME]`.
- **Local Node.js Emulation**: The Node `mysql2` driver cannot directly resolve Google Cloud SQL instance names containing colons (e.g. `project:region:instance`). To emulate `Jdbc.getCloudSqlConnection` locally without the Cloud SQL Auth Proxy, you must:
  1. Extract the instance connection name.
  2. Use the `gcloud sql instances describe [INSTANCE_NAME]` command to dynamically resolve the instance's public IP address.
  3. Swap the instance name for the resolved IP address in the connection string.
  4. Ensure your local machine's IP address is authorized on the Cloud SQL instance.
- **Node URL Parsing**: Avoid passing connection strings with instance names (colons) directly into standard Node.js URL parsers (like `new URL()`), as it will fail. Ensure the string is formatted as `[protocol://]user:pass@host/db` or parse the parameters manually.

### Database Connection Strings with Existing Query Parameters (e.g. Neon Postgres)
- Neon database URLs frequently use query parameters like `?channel_binding=require&sslmode=require` appended to the database name.
- When parsing these URLs manually using regex (e.g. converting it to a standard `standardUrl` string via concatenation), ensure you check if the matched `db` parameter string *already* contains a `?`.
- If the `db` parameter already has a `?`, you **must append additional connection parameters using `&`**.
- Example Issue: Concatenating `?user=...` directly to a DB string that is `neondb?channel_binding=require` results in `neondb?channel_binding=require?user=...`. The Node `pg` client parser will choke on the double `?`, drop the explicit username credential entirely, fall back to authenticating with the OS system user (which will fail), and throw a confusing "password authentication failed" error.

## Delivery
- Output the complete code for modified or newly created service classes and test scripts.
- **ALWAYS output the updated `SKILL.md`** when new knowledge is extracted and crystallized.