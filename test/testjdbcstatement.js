import "@mcpher/gas-fakes";
import { initTests } from "./testinit.js";
import { wrapupTest, trasher, getJdbcBackends } from "./testassist.js";

export const testJdbcStatement = (pack) => {
  const toTrash = [];
  const { unit, fixes } = pack || initTests();

  const backends = getJdbcBackends(Jdbc);

  backends.forEach((backend) => {
    const { label, type, storedVal } = backend;

    unit.section(`JdbcStatement Parity - ${label}`, (t) => {

      const universal = JSON.parse(storedVal);
      const envConfig = universal[ScriptApp.isFake ? "local" : "gas"];

      const method = envConfig.isCloudSqlConnection ? "getCloudSqlConnection" : "getConnection";
      
      console.log(`...connecting to ${label} for Statement verification`);
      const conn = Jdbc[method](envConfig.url, envConfig.user, envConfig.password);
      t.truthy(conn, `Should obtain a connection to ${label}`);
      
      const stmt = conn.createStatement();
      t.truthy(stmt, `Should create a statement for ${label}`);

      // 1. Test Getters/Setters
      console.log("...testing getters/setters");
      stmt.setFetchSize(100);
      t.is(stmt.getFetchSize(), 100, `${label}: Fetch size should be 100`);

      stmt.setMaxRows(50);
      t.is(stmt.getMaxRows(), 50, `${label}: Max rows should be 50`);

      stmt.setQueryTimeout(30);
      t.is(stmt.getQueryTimeout(), 30, `${label}: Query timeout should be 30`);

      stmt.setPoolable(true);
      t.is(stmt.isPoolable(), true, `${label}: Should be poolable`);

      // 2. Test Connection association
      t.is(stmt.getConnection(), conn, `${label}: Statement should return its parent connection`);

      // 3. Test Overloads
      console.log("...testing execute/executeUpdate overloads");
      const q = type === "mysql" ? "`" : '"';
      const tableName = (label.replace(/ /g, "_") + "_parity").toLowerCase();
      
      // execute() overload 
      const selectSql = type === "pg" ? "SELECT 1::INT as val" : "SELECT 1 as val";
      const execResult = stmt.execute(selectSql, 1);
      t.true(execResult, `${label}: Execute should return true for SELECT`);
      
      const rs = stmt.getResultSet();
      t.truthy(rs, `${label}: Should have a result set`);
      t.true(rs.next(), `${label}: Should have one row`);
      t.is(rs.getString(1), "1", `${label}: Should return 1`);
      rs.close();

      // executeUpdate() overload (Cleanup and Create)
      stmt.execute(`DROP TABLE IF EXISTS ${q}${tableName}${q}`);
      const updateResult = stmt.executeUpdate(`CREATE TABLE ${q}${tableName}${q} (id INT)`, 1);
      t.is(typeof updateResult, "number", `${label}: Update result should be a number`);

      // 4. Test PreparedStatement Parity
      console.log("...testing PreparedStatement parity");
      const psSql = type === "pg" ? "SELECT ?::text as val" : "SELECT ? as val";
      const ps = conn.prepareStatement(psSql);
      ps.setFetchSize(200);
      t.is(ps.getFetchSize(), 200, `${label}: PS Fetch size should be 200`);
      t.is(ps.getConnection(), conn, `${label}: PS should return its parent connection`);
      
      ps.setString(1, "hello");
      const psRs = ps.executeQuery();
      t.true(psRs.next(), `${label}: PS should return a row`);
      t.is(psRs.getString(1), "hello", `${label}: PS should return parameter value`);
      psRs.close();
      ps.close();

      // Final cleanup
      stmt.execute(`DROP TABLE IF EXISTS ${q}${tableName}${q}`);
      stmt.close();
      conn.close();
    });
  });

  if (!pack) {
    unit.report();
  }
  if (fixes.CLEAN) trasher(toTrash);

  return { unit, fixes };
};

wrapupTest(testJdbcStatement);
