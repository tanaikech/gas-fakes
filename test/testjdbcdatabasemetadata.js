import "@mcpher/gas-fakes";
import { initTests } from "./testinit.js";
import { wrapupTest, getJdbcBackends, getJdbcConnection } from "./testassist.js";

export const testJdbcDatabaseMetaData = (pack) => {
  const { unit, fixes } = pack || initTests();

  const backends = getJdbcBackends(Jdbc);

  backends.forEach((backend) => {
    const { label, type, storedVal } = backend;

    unit.section(`JdbcDatabaseMetaData Parity - ${label}`, (t) => {
      const universal = JSON.parse(storedVal);
      const envConfig = universal[ScriptApp.isFake ? "local" : "gas"];
      const conn = getJdbcConnection(Jdbc, envConfig);

      const meta = conn.getMetaData();

      // Basic Info
      t.is(
        meta.getDatabaseProductName(),
        type === "pg" ? "PostgreSQL" : "MySQL",
        "Product Name matches type",
      );

      if (ScriptApp.isFake) {
        t.is(
          meta.getDriverName(),
          "gas-fakes-jdbc-driver",
          "Driver name is correct",
        );
        t.is(
          meta.getDriverVersion(),
          globalThis.GasFakes?.metadata?.version || "unknown",
          "Dynamic version matches",
        );
      } else {
        t.truthy(meta.getDriverName(), "Native driver name is present");
        t.truthy(meta.getDriverVersion(), "Native driver version is present");
      }

      t.truthy(meta.getURL(), "URL is present");
      t.truthy(meta.getUserName(), "User Name is present");

      const q = meta.getIdentifierQuoteString();
      if (type === "mysql" && !ScriptApp.isFake) {
        // In native GAS, some MySQL drivers return " instead of `
        t.truthy(["`","\""].includes(q), "MySQL quote string matches known types");
      } else {
        t.is(q, type === "mysql" ? "`" : '"', "Quote string is correct for type");
      }

      // Capabilities
      t.true(meta.supportsTransactions(), "Supports transactions");
      t.true(meta.supportsBatchUpdates(), "Supports batch updates");
      if (type === "pg") {
        t.true(meta.supportsSavepoints(), "Postgres supports savepoints");
      }

      // Schema Inspection
      const typeInfo = meta.getTypeInfo();
      t.truthy(typeInfo.next(), "Has type info");
      t.truthy(typeInfo.getString("TYPE_NAME"), "Type info has TYPE_NAME");

      const catalogs = meta.getCatalogs();
      t.truthy(catalogs.next(), "Has catalogs");

      const tableTypes = meta.getTableTypes();
      t.truthy(tableTypes.next(), "Has table types");

      // Verify listing tables
      // Ensure a test table exists
      const testTableName = (
        label.replace(/ /g, "_") + "_meta_test"
      ).toLowerCase();
      const stmt = conn.createStatement();
      stmt.execute(`DROP TABLE IF EXISTS ${q}${testTableName}${q}`);
      stmt.execute(
        `CREATE TABLE ${q}${testTableName}${q} (id INT PRIMARY KEY, name TEXT)`,
      );

      const tables = meta.getTables(null, null, testTableName, null);
      if (!tables.next()) {
         // Debug: let's see what IS there
         const all = meta.getTables(null, null, null, null);
         let list = [];
         let count = 0;
         while(all.next() && count++ < 10) list.push(all.getString("TABLE_NAME"));
         throw new Error(`Expected table ${testTableName} not found in meta.getTables. First 10 tables: ${list.join(",")}`);
      }
      t.true(true, "Found our test table");
      t.is(
        tables.getString("TABLE_NAME").toLowerCase(),
        testTableName,
        "Table name matches",
      );

      const columns = meta.getColumns(null, null, testTableName, null);
      let colCount = 0;
      while (columns.next()) {
        colCount++;
        const colName = columns.getString("COLUMN_NAME").toLowerCase();
        t.truthy(["id", "name"].includes(colName), `Found column ${colName}`);
      }
      t.is(colCount, 2, "Found exactly 2 columns");

      const pks = meta.getPrimaryKeys(null, null, testTableName);
      t.true(pks.next(), "Found primary key");
      t.is(
        pks.getString("COLUMN_NAME").toLowerCase(),
        "id",
        "Primary key is 'id'",
      );

      stmt.execute(`DROP TABLE IF EXISTS ${q}${testTableName}${q}`);
      conn.close();
    });
  });
};

wrapupTest(testJdbcDatabaseMetaData);
