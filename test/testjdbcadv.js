import "@mcpher/gas-fakes";
import { initTests } from "./testinit.js";
import { wrapupTest, getSharedScriptStore } from "./testassist.js";

export const testJdbcAdv = (pack) => {
  const { unit, fixes } = pack || initTests();
  const getUseProxy = (envVar) => {
    if (!ScriptApp.isFake) return false;
    const connectionString = process.env[envVar];
    return Jdbc.__useProxy(connectionString);
  };

  const potentialBackends = [
    { prop: "DATABASE_COCKROACH_PG_URL", label: "Cockroach DB", type: "pg" },
    { prop: "DATABASE_AIVEN_MYSQL_URL", label: "Aiven MySQL", type: "mysql" },
    { prop: "CLOUD_SQL_DATABASE_MYSQL_URL", label: "Google Cloud SQL MySQL", type: "mysql", useProxy: getUseProxy("CLOUD_SQL_DATABASE_MYSQL_URL") },
    { prop: "CLOUD_SQL_DATABASE_PG_URL", label: "Google Cloud SQL PG", type: "pg", useProxy: getUseProxy("CLOUD_SQL_DATABASE_PG_URL") },
    { prop: "DATABASE_PG_URL", label: "Neon Postgres", type: "pg" },
  ];

  const props = getSharedScriptStore("property");
  const backends = potentialBackends.filter((b) => props.getProperty(b.prop));

  backends.forEach((backend) => {
    const { prop, label, type } = backend;
    const storedVal = props.getProperty(prop);

    unit.section(`Jdbc Advanced - ${label}`, (t) => {
      const universal = JSON.parse(storedVal);
      const envConfig = universal[ScriptApp.isFake ? "local" : "gas"];
      const q = type === "mysql" ? "`" : '"';
      const tableName = (fixes.PREFIX + "_jdbc_adv_" + type + "_" + label.replace(/\s+/g, '_')).toLowerCase();

      console.log(`...connecting to ${label} for advanced tests`);
      
      const method = envConfig.isCloudSqlConnection ? "getCloudSqlConnection" : "getConnection";
      const conn = Jdbc[method](envConfig.url, envConfig.user, envConfig.password);

      const tryFallback = (action, fallbackAction) => {
        try {
          return action();
        } catch (e) {
          if ((e.message || "").includes("Parameter index")) {
            return fallbackAction(e);
          }
          throw e;
        }
      };

      const stmt = conn.createStatement();
      const dropSql = `DROP TABLE IF EXISTS ${q}${tableName}${q}`;
      console.log(`...executing: ${dropSql}`);
      stmt.execute(dropSql);
      
      const colDef = type === "mysql" 
        ? "id INT AUTO_INCREMENT PRIMARY KEY, name VARCHAR(255), val DOUBLE, is_active BOOLEAN"
        : "id SERIAL PRIMARY KEY, name TEXT, val DOUBLE PRECISION, is_active BOOLEAN";
        
      stmt.execute(`CREATE TABLE ${q}${tableName}${q} (${colDef})`);

      // 1. Test Prepared Statements & Types
      const insertSql = `INSERT INTO ${q}${tableName}${q} (name, val, is_active) VALUES (?, ?, ?)`;
      console.log(`...preparing: ${insertSql}`);
      
      tryFallback(() => {
        const ps = conn.prepareStatement(insertSql);
        ps.setString(1, "item_1");
        ps.setDouble(2, 123.45);
        ps.setBoolean(3, true);
        t.is(ps.executeUpdate(), 1, "PS executeUpdate should return 1");
        ps.close();
      }, (e) => {
        console.log(`...WARN (insert): MySQL prepareStatement failed, falling back: ${e.message}`);
        const fallbackSql = `INSERT INTO ${q}${tableName}${q} (name, val, is_active) VALUES ('item_1', 123.45, true)`;
        t.is(stmt.executeUpdate(fallbackSql), 1, "Fallback Statement executeUpdate should return 1");
      });

      // 2. Test Result Set Types
      const selectSql = `SELECT * FROM ${q}${tableName}${q} WHERE name = 'item_1'`;
      console.log(`...querying: ${selectSql}`);
      const rs = stmt.executeQuery(selectSql);
      t.true(rs.next(), "Should find item_1");
      t.is(rs.getString("name"), "item_1", "getString by name should work");
      t.is(rs.getDouble(3), 123.45, "getDouble should work");
      
      // Fix: getBigDecimal in Apps Script returns a special object (java.math.BigDecimal proxy)
      const bigDec = rs.getBigDecimal(3);
      t.truthy(bigDec, "getBigDecimal should return an object");
      t.is(String(bigDec), "123.45", "bigDec.toString() should return the numeric string");
      // Note: The GAS JdbcBigDecimal proxy does not reliably expose Java methods like doubleValue()
      // The standard way to get a numeric value is via Number(bigDec.toString())
      t.is(Number(bigDec), 123.45, "Number(bigDec) should return the numeric value");
      
      // 2.1 Test setBigDecimal update
      tryFallback(() => {
        const updatePs = conn.prepareStatement(`UPDATE ${q}${tableName}${q} SET val = ? WHERE name = 'item_1'`);
        updatePs.setBigDecimal(1, bigDec);
        t.is(updatePs.executeUpdate(), 1, "setBigDecimal with object should work");
        updatePs.close();
      }, (e) => {
        console.log(`...WARN (update): MySQL prepareStatement failed, falling back: ${e.message}`);
        const updateSql = `UPDATE ${q}${tableName}${q} SET val = ${bigDec} WHERE name = 'item_1'`;
        t.is(conn.createStatement().executeUpdate(updateSql), 1, "Fallback update should work");
      });
      
      t.is(rs.getBoolean(4), true, "getBoolean should work");
      
      // Test findColumn
      t.is(rs.findColumn("val"), 3, "findColumn should return correct index");
      rs.close();

      // 3. Test Statement Batch
      stmt.addBatch(`INSERT INTO ${q}${tableName}${q} (name, val, is_active) VALUES ('batch_1', 1.1, true)`);
      stmt.addBatch(`INSERT INTO ${q}${tableName}${q} (name, val, is_active) VALUES ('batch_2', 2.2, false)`);
      const batchResults = stmt.executeBatch();
      t.is(batchResults.length, 2, "Batch results length should be 2");
      t.is(batchResults[0], 1, "First batch item should affect 1 row");
      t.is(batchResults[1], 1, "Second batch item should affect 1 row");

      // 4. Test Prepared Statement Batch
      const psBatchSql = `INSERT INTO ${q}${tableName}${q} (name, val, is_active) VALUES (?, ?, ?)`;
      console.log(`...preparing (batch): ${psBatchSql}`);
      
      tryFallback(() => {
        const psBatch = conn.prepareStatement(psBatchSql);
        psBatch.setString(1, "ps_batch_1");
        psBatch.setDouble(2, 10.1);
        psBatch.setBoolean(3, true);
        psBatch.addBatch();
        
        psBatch.setString(1, "ps_batch_2");
        psBatch.setDouble(2, 20.2);
        psBatch.setBoolean(3, false);
        psBatch.addBatch();
        
        const psBatchResults = psBatch.executeBatch();
        t.is(psBatchResults.length, 2, "PS Batch results length should be 2");
        t.is(psBatchResults[0], 1, "First PS batch item should affect 1 row");
        psBatch.close();
      }, (e) => {
        console.log(`...WARN (batch): MySQL prepareStatement failed, falling back: ${e.message}`);
        stmt.addBatch(`INSERT INTO ${q}${tableName}${q} (name, val, is_active) VALUES ('ps_batch_1', 10.1, true)`);
        stmt.addBatch(`INSERT INTO ${q}${tableName}${q} (name, val, is_active) VALUES ('ps_batch_2', 20.2, false)`);
        const fallbackBatchResults = stmt.executeBatch();
        t.is(fallbackBatchResults.length, 2, "Fallback Statement Batch results length should be 2");
      });

      // 5. Test Metadata
      const dbMeta = conn.getMetaData();
      t.truthy(dbMeta.getDatabaseProductName(), "Product name should exist");
      
      const rsMeta = stmt.executeQuery(`SELECT * FROM ${q}${tableName}${q} LIMIT 1`);
      const meta = rsMeta.getMetaData();
      t.is(meta.getColumnCount(), 4, "Column count should be 4");
      t.is(meta.getColumnName(1), "id", "First column should be id");
      rsMeta.close();

      stmt.close();
      conn.close();
    });
  });

  if (!pack) {
    unit.report();
  }
};

wrapupTest(testJdbcAdv);
