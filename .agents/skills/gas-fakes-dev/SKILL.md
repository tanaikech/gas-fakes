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

### 4. Test Registration and Suite Integrity (CRITICAL)
Whenever you create a new test script (e.g., `test/testnewfeature.js`) or significantly modify an existing one:
- **Registration**: You MUST add the new test to the main test suite in [**`test/test.js`**](file:///Users/brucemcpherson/Documents/repos/gas-fakes/test/test.js). This includes adding the `import` statement and the test call within the `testFakes()` function.
- **Workflow Compliance**: At the beginning of EVERY task involving testing or implementation, you MUST consult the `.agents/workflows/` directory (specifically [**`test.md`**](file:///Users/brucemcpherson/Documents/repos/gas-fakes/.agents/workflows/test.md)) to ensure you are following the latest project-specific procedures.

### 5. Holistic/Targeted Skill Evolution (Self-Updating SKILL)
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

### Apps Script JDBC Data Types & Results
- **BigDecimal Handling**: `JdbcResultSet.getBigDecimal()` returns a `JdbcBigDecimal` object on live GAS. This is a Java proxy that may NOT expose standard Java methods like `doubleValue()`. To get a numeric value safely across all platforms, use `Number(val)` or `parseFloat(val.toString())`.
- **Column Resolution**: `JdbcResultSet` methods (e.g., `getString()`) support both 1-indexed integers and string column labels. Ensure the fake implementation resolves both using `findColumn`.

### JDBC Driver Compatibility (Live GAS)
- **Semicolons in Prepared Statements**: Avoid trailing semicolons (`;`) in strings passed to `prepareStatement`. Some drivers (e.g., MySQL on GAS) may fail to recognize `?` placeholders if a semicolon is present.
- **Connection Methods**:
  - **MySQL (Google Cloud)**: MUST use `Jdbc.getCloudSqlConnection`.
  - **MySQL (Other/External)**: MUST use `Jdbc.getConnection`.
  - **PostgreSQL (All)**: MUST use `Jdbc.getConnection`.
- **Parameter Index Errors (MySQL 8+)**: For external MySQL databases (e.g., Aiven), the `prepareStatement` method may fail with `Parameter index out of range (1 > 0)` because the older GAS driver cannot parse placeholders in modern MySQL 8+ protocols.
  - **Workaround**: Implement a `try/catch` fallback to standard `Statement.execute()` with manually escaped values if `prepareStatement` fails for MySQL backends.

### Apps Script Constraints & Web APIs
- **Unavailable Web APIs**: The GAS V8 runtime **DOES NOT** support many standard Web APIs, including `TextDecoder`, `TextEncoder`, `fetch`, `setTimeout`, and `ReadableStream`.
- **String/Byte Conversion**: To convert a byte array to a string portably, use:
  ```javascript
  const str = Utilities.newBlob(bytes).getDataAsString();
  ```
- **IP Whitelisting**: Because Live Apps Script runs on dynamic Google IPs, you must whitelist Google's API IP ranges (fetched from `https://www.gstatic.com/ipranges/goog.json`) in your Cloud SQL instance's Authorized Networks to allow connection.
- **Portability Rule**: When writing tests designed to run on both platforms, you MUST guard access to fake-only properties using `if (ScriptApp.isFake)`. 
- **Minimization Strategy (CRITICAL)**: **Minimize** the use of `if (ScriptApp.isFake)` blocks. Whenever possible, verify behaviors and expected return values using the **Public API**. 
    - *Example*: Instead of checking `__fakeObjectType === 'JdbcBlob'`, simply call `blob.length()` or `blob.getBytes()`. If these work, the object is implicitly of the correct type.
- **Why?**: Extensive use of `if (ScriptApp.isFake)` makes the test suite harder to maintain and reduces confidence that the same test is actually verifying the same behavior on both platforms.

### GAS JDBC Runtime Constraints (Critical for Live Tests)
- **`getBlob()` requires an OID large object column — not BYTEA**: Calling `rs.getBlob(n)` on a `TEXT` or `BYTEA` column throws `"Bad value for type long : <value>"` because the PostgreSQL JDBC driver's `getBlob()` internally calls `getLong()` to retrieve a PostgreSQL large object OID from `pg_largeobject`. For inline binary data, use `getBytes()` / `getBinaryStream()` instead. MySQL's `BLOB` type maps directly and works with `getBlob()`. **In practice: never test `getBlob()` against a PostgreSQL/CockroachDB backend in a parity test.**
- **`createStatement()` returns `FORWARD_ONLY`**: Plain `conn.createStatement()` returns a forward-only cursor. Navigation methods `last()`, `first()`, `absolute()`, `relative()`, `previous()`, `beforeFirst()`, `afterLast()` all throw `"Operation requires a scrollable ResultSet"`. Use `conn.createStatement(1004, 1007)` (TYPE_SCROLL_INSENSITIVE, CONCUR_READ_ONLY) to get a scrollable cursor. In the fake, these parameters are accepted but advisory — results are already buffered.
- **`getFloat()` is 32-bit**: GAS `rs.getFloat()` returns an IEEE 754 single-precision float. `1.1` becomes `1.100000023841858`. Always compare with `Math.fround(expected)`. The fake applies `Math.fround()` accordingly.
- **`getDouble()` is 64-bit**: Unlike the above, `rs.getDouble()` returns a full 64-bit double.
- **Backend DDL differences**: Use `BLOB` for MySQL and `BYTEA` for PostgreSQL. Use `'value'::bytea` syntax for PostgreSQL literal binary inserts.

## Delivery
- Output the complete code for modified or newly created service classes and test scripts.
- **ALWAYS output the updated `SKILL.md`** when new knowledge is extracted and crystallized.