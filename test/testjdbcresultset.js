import "@mcpher/gas-fakes";
import { initTests } from "./testinit.js";
import { wrapupTest, getJdbcBackends } from "./testassist.js";

export const testJdbcResultSet = (pack) => {
  const { unit, fixes } = pack || initTests();

  const backends = getJdbcBackends(Jdbc);

  // We'll use the first available backend for live verification, 
  // but also test the FakeJdbcResultSet logic directly with mocked data.
  const backend = backends[0];
  if (!backend) {
    console.warn("No JDBC backends available for ResultSet tests.");
    return;
  }

  const { label, type, storedVal } = backend;

  unit.section(`JdbcResultSet Parity - ${label}`, (t) => {
    const universal = JSON.parse(storedVal);
    const envConfig = universal[ScriptApp.isFake ? "local" : "gas"];
    const conn = Jdbc.getConnection(envConfig.url, envConfig.user, envConfig.password);
    
    const tableName = (label.replace(/ /g, "_") + "_rs_parity").toLowerCase();
    const q = type === "mysql" ? "`" : '"';
    const stmt = conn.createStatement();
    
    stmt.execute(`DROP TABLE IF EXISTS ${q}${tableName}${q}`);
    stmt.execute(`CREATE TABLE ${q}${tableName}${q} (id INT, name TEXT, val FLOAT)`);
    
    // Insert some test data
    stmt.execute(`INSERT INTO ${q}${tableName}${q} (id, name, val) VALUES (1, 'item1', 1.1)`);
    stmt.execute(`INSERT INTO ${q}${tableName}${q} (id, name, val) VALUES (2, 'item2', 2.2)`);
    stmt.execute(`INSERT INTO ${q}${tableName}${q} (id, name, val) VALUES (3, 'item3', 3.3)`);

    const rs = stmt.executeQuery(`SELECT * FROM ${q}${tableName}${q} ORDER BY id ASC`);
    
    // Metadata & Statement
    t.is(rs.getStatement(), stmt, "getStatement() returns correct statement");
    const meta = rs.getMetaData();
    t.is(meta.getColumnCount(), 3, "getMetaData() returns metadata");

    // Navigation & Position
    t.true(rs.isBeforeFirst(), "Starts before first");
    t.false(rs.isFirst(), "Not first initially");
    
    t.true(rs.next(), "Moves to first row");
    t.is(rs.getRow(), 1, "getRow() is 1");
    t.true(rs.isFirst(), "isFirst() is true");
    t.is(rs.getInt(1), 1, "getInt(1) works");
    t.is(rs.getString("name"), "item1", "getString('name') works (overload)");
    t.is(rs.getFloat(3), 1.1, "getFloat(3) works");
    t.false(rs.wasNull(), "wasNull() is false");

    t.true(rs.last(), "Moves to last row");
    t.is(rs.getRow(), 3, "getRow() is 3");
    t.true(rs.isLast(), "isLast() is true");
    t.is(rs.getInt(1), 3, "getInt(1) on last row works");

    t.true(rs.first(), "Moves back to first");
    t.is(rs.getRow(), 1, "getRow() is 1 again");

    t.true(rs.absolute(2), "Moves to absolute row 2");
    t.is(rs.getRow(), 2, "getRow() is 2");
    t.is(rs.getString(2), "item2", "Row 2 data is correct");

    t.true(rs.relative(1), "Move relative +1 to row 3");
    t.is(rs.getRow(), 3, "getRow() is 3");

    t.true(rs.previous(), "Move previous to row 2");
    t.is(rs.getRow(), 2, "getRow() is 2");

    t.false(rs.absolute(5), "Absolute out of bounds returns false");
    t.true(rs.isAfterLast(), "Positioned after last");

    rs.beforeFirst();
    t.true(rs.isBeforeFirst(), "beforeFirst() works");
    t.true(rs.next(), "next() after beforeFirst() moves to 1");
    t.is(rs.getRow(), 1);

    rs.afterLast();
    t.true(rs.isAfterLast(), "afterLast() works");

    // Properties
    rs.setFetchSize(100);
    t.is(rs.getFetchSize(), 100, "getFetchSize() works");
    rs.setFetchDirection(1001); // FETCH_REVERSE
    t.is(rs.getFetchDirection(), 1001, "getFetchDirection() works");

    // Types & Nulls
    rs.first();
    t.is(typeof rs.getByte(1), "number", "getByte() returns number");
    t.is(typeof rs.getDouble(3), "number", "getDouble() returns number");

    rs.close();
    t.true(rs.isClosed(), "isClosed() is true after close");
    
    stmt.execute(`DROP TABLE IF EXISTS ${q}${tableName}${q}`);
    conn.close();
  });
};

wrapupTest(testJdbcResultSet);
