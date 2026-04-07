import "@mcpher/gas-fakes";
import { initTests } from "./testinit.js";
import { wrapupTest, trasher, getJdbcBackends } from "./testassist.js";

export const testJdbc = (pack) => {
  const toTrash = [];
  const { unit, fixes } = pack || initTests();

  const backends = getJdbcBackends(Jdbc);

  backends.forEach((backend) => {
    const { prop, label, type, storedVal } = backend;

    unit.section(`Jdbc Basics - ${label}`, (t) => {

      let universal;
      try {
        universal = JSON.parse(storedVal);
      } catch (e) {
        console.error(`...skipping ${label} tests: Invalid JSON format stored for ${prop}. Please run tests locally first to serialize connections.`);
        return;
      }

      // ALWAYS select based on current runtime context, NOT the saved property
      const envConfig = universal[ScriptApp.isFake ? "local" : "gas"];

      console.log(
        `...connecting to ${label}${envConfig.useProxy ? " (via local proxy)" : ""}`,
      );

      // Always print the proxy command hint for Google connections in local mode, even if not currently running
      if (ScriptApp.isFake && envConfig.proxyCommand) {
        console.log(`...Hint: you can start the proxy with: ${envConfig.proxyCommand}`);
      }

      const method = envConfig.isCloudSqlConnection ? "getCloudSqlConnection" : "getConnection";

      // Helper function to execute the actual table creation and data validation logic against a given connection
      const validateConnection = (conn, methodLabel) => {
        t.truthy(conn, `Jdbc Connection to ${label} (${methodLabel}) should return a connection object`);
        t.false(conn.isClosed(), "Connection should be open");

        const stmt = conn.createStatement();
        const tableName = (fixes.PREFIX + "_" + prop.toLowerCase() + "_" + methodLabel.replace(/-/g, '_') + "_airports")
          .replace(/[^a-zA-Z0-9_]/g, "_")
          .toLowerCase();

        const ss = SpreadsheetApp.openById(fixes.TEST_AIRPORTS_ID);
        const sheet = ss.getSheets()[0];
        const data = sheet.getDataRange().getValues();
        const headers = data.shift();

        const sanitizedHeaders = headers.map((h) =>
          h.replace(/[^a-zA-Z0-9_]/g, "_").toLowerCase(),
        );
        const q = type === "mysql" ? "`" : '"';
        let colDef = sanitizedHeaders.map((h) => `${q}${h}${q} TEXT`).join(", ");

        if (type === "mysql") {
          colDef = `id INT AUTO_INCREMENT PRIMARY KEY, ` + colDef;
        }

        stmt.execute(`DROP TABLE IF EXISTS ${q}${tableName}${q};`);
        stmt.execute(`CREATE TABLE ${q}${tableName}${q} (${colDef});`);

        let currentValues = [];
        for (let i = 0; i < data.length; i++) {
          const row = data[i];
          const vals = row
            .map((v) => `'${String(v).replace(/'/g, "''")}'`)
            .join(", ");
          currentValues.push(`(${vals})`);

          if (currentValues.length >= 100 || i === data.length - 1) {
            const insertCols = sanitizedHeaders
              .map((h) => `${q}${h}${q}`)
              .join(", ");
            const insertSql = `INSERT INTO ${q}${tableName}${q} (${insertCols}) VALUES ${currentValues.join(",")};`;
            stmt.execute(insertSql);
            currentValues = [];
          }
        }

        try {
          if (!conn.getAutoCommit()) {
            conn.commit();
          }
        } catch (e) {}

        const rsAll = stmt.executeQuery(`SELECT * FROM ${q}${tableName}${q};`);
        const dbSet = new Set();
        while (rsAll.next()) {
          const rowData = [];
          const startIndex = type === "mysql" ? 2 : 1;
          for (
            let j = startIndex;
            j <= headers.length + (type === "mysql" ? 1 : 0);
            j++
          ) {
            rowData.push(rsAll.getString(j));
          }
          dbSet.add(rowData.join("|"));
        }
        rsAll.close();

        const sheetRows = data.map((row) => row.map((v) => String(v)).join("|"));
        t.is(
          dbSet.size,
          sheetRows.length,
          `Row count should match for ${backend.label} (${methodLabel})`,
        );

        let allFound = true;
        for (const rowKey of sheetRows) {
          if (!dbSet.has(rowKey)) {
            allFound = false;
            t.true(false, `Row not found in ${backend.label} DB: ${rowKey}`);
            break;
          }
        }
        t.true(allFound, `All rows should match for ${backend.label} (${methodLabel})`);

        stmt.close();
        conn.close();
        t.is(conn.isClosed(), true, "Connection should be closed");
      };

      // Test multi-argument (url, user, password)
      let multiConn;
      let multiErr = "ok";
      try {
        console.log(`...Jdbc.${method}("${envConfig.url}", "${envConfig.user}", pass)`);
        multiConn = Jdbc[method](envConfig.url, envConfig.user, envConfig.password);
      } catch (e) {
        multiErr = e.message;
      }
      t.is(multiErr, "ok", `Multi-argument connection to ${label} should not throw: ${multiErr !== "ok" ? multiErr : ""}`);
      if (multiConn) validateConnection(multiConn, "multi-arg");

      // Google Hosted databases on Live Apps Script do not consistently support single-argument connection strings natively
      // The Java JDBC parser throws errors or malformed URL exceptions, so we skip the single-arg format tests for these on Live
      if (!ScriptApp.isFake && universal.isGoogle) {
         console.log(`...skipping single-arg test for Google Cloud SQL on Live Apps Script (unsupported)`);
         return;
      }

      // Test single-argument (connectionString)
      let singleConn;
      let singleErr = "ok";
      try {
        // We test `fullConnectionString` for single arg because it has the credentials embedded
        console.log(`...Jdbc.${method}("${envConfig.fullConnectionString}")`);
        singleConn = Jdbc[method](envConfig.fullConnectionString);
      } catch (e) {
        singleErr = e.message;
      }
      t.is(singleErr, "ok", `Single-argument connection to ${label} should not throw: ${singleErr !== "ok" ? singleErr : ""}`);
      if (singleConn) validateConnection(singleConn, "single-arg");
    });
  });

  if (!pack) {
    unit.report();
  }
  if (fixes.CLEAN) trasher(toTrash);

  return { unit, fixes };
};

wrapupTest(testJdbc);
