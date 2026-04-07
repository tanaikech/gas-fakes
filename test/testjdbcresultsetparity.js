import "@mcpher/gas-fakes";
import { initTests } from "./testinit.js";
import {
  wrapupTest,
  getJdbcBackends,
  getJdbcConnection,
} from "./testassist.js";

export const testJdbcResultSetParity = (pack) => {
  const { unit, fixes } = pack || initTests();

  const backends = getJdbcBackends(Jdbc);

  backends.forEach((backend) => {
    const { label, type, storedVal } = backend;

    unit.section(`JdbcResultSet Parity - ${label}`, (t) => {
      const universal = JSON.parse(storedVal);
      const envConfig = universal[ScriptApp.isFake ? "local" : "gas"];
      const conn = getJdbcConnection(Jdbc, envConfig);

      const stmt = conn.createStatement();
      const testTableName = "rs_parity_test";
      const q = type === "mysql" ? "`" : '"';

      stmt.execute(`DROP TABLE IF EXISTS ${q}${testTableName}${q}`);
      stmt.execute(`CREATE TABLE ${q}${testTableName}${q} (id INT, val TEXT)`);
      stmt.execute(
        `INSERT INTO ${q}${testTableName}${q} (id, val) VALUES (1, 'hello world')`,
      );

      const rs = stmt.executeQuery(`SELECT * FROM ${q}${testTableName}${q}`);
      t.true(rs.next(), "Has first row");

      // Binary/Stream methods are backend-specific:
      // - PostgreSQL getBlob() requires OID large objects (not BYTEA inline columns)
      // - MySQL getBlob() works directly on BLOB columns
      // These methods are fully implemented in the fake and tested under ScriptApp.isFake.
      // Live GAS: test each backend's native binary approach.
      if (ScriptApp.isFake) {
        const blob = rs.getBlob(2);
        t.is(blob.length(), 11, "Blob length is correct");
        t.is(
          Utilities.newBlob(blob.getBytes(1, 11)).getDataAsString(),
          "hello world",
          "Blob content matches",
        );

        const clob = rs.getClob(2);
        t.is(clob.getSubString(1, 5), "hello", "Clob substring matches");

        const arr = rs.getArray(1);
        t.is(Number(arr.getArray()[0]), 1, "Array content matches");

        const bytes = rs.getBytes(2);
        t.true(Array.isArray(bytes), "getBytes returns array");
        t.is(bytes.length, 11, "Bytes length matches");

        const binaryStream = rs.getBinaryStream(2);
        t.is(String.fromCharCode(binaryStream.read()), "h", "Stream read works");

        const unicodeStream = rs.getUnicodeStream(2);
        t.truthy(unicodeStream, "getUnicodeStream returns a value");

        const asciiStream = rs.getAsciiStream(2);
        t.truthy(asciiStream, "getAsciiStream returns a value");

        const charStream = rs.getCharacterStream(2);
        t.is(String.fromCharCode(charStream.read()), "h", "Reader read works");

        t.is(rs.getCursorName(), "fake-cursor", "getCursorName matches");
      } else if (type === "mysql") {
        // MySQL: getBlob() works on BLOB columns
        // Create a separate connection/statement for the binary test table
        const blobStmt = conn.createStatement();
        const blobTable = "rs_blob_test";
        blobStmt.execute(`DROP TABLE IF EXISTS \`${blobTable}\``);
        blobStmt.execute(`CREATE TABLE \`${blobTable}\` (id INT, data BLOB)`);
        blobStmt.execute(
          `INSERT INTO \`${blobTable}\` (id, data) VALUES (1, 'hello world')`,
        );
        const blobRs = blobStmt.executeQuery(
          `SELECT * FROM \`${blobTable}\``,
        );
        t.true(blobRs.next(), "Blob RS has row");
        const blob = blobRs.getBlob(2);
        t.is(blob.length(), 11, "MySQL getBlob() length correct");
        t.is(
          Utilities.newBlob(blob.getBytes(1, 11)).getDataAsString(),
          "hello world",
          "MySQL getBlob() content correct",
        );
        blobRs.close();
        blobStmt.execute(`DROP TABLE IF EXISTS \`${blobTable}\``);
      } else {
        // PostgreSQL: getBytes() works on BYTEA columns; getBlob() requires OID large objects
        const pgStmt = conn.createStatement();
        const byteaTable = '"rs_bytea_test"';
        pgStmt.execute(`DROP TABLE IF EXISTS ${byteaTable}`);
        pgStmt.execute(
          `CREATE TABLE ${byteaTable} (id INT, data BYTEA)`,
        );
        pgStmt.execute(
          `INSERT INTO ${byteaTable} (id, data) VALUES (1, 'hello world'::bytea)`,
        );
        const byteaRs = pgStmt.executeQuery(`SELECT * FROM ${byteaTable}`);
        t.true(byteaRs.next(), "BYTEA RS has row");
        const bytes = byteaRs.getBytes(2);
        t.true(Array.isArray(bytes), "PostgreSQL getBytes() returns array");
        t.is(bytes.length, 11, "PostgreSQL getBytes() length correct");
        t.is(
          Utilities.newBlob(bytes).getDataAsString(),
          "hello world",
          "PostgreSQL getBytes() content correct",
        );
        byteaRs.close();
        pgStmt.execute(`DROP TABLE IF EXISTS ${byteaTable}`);
      }

      stmt.execute(`DROP TABLE IF EXISTS ${q}${testTableName}${q}`);
      conn.close();
    });
  });
  if (!pack) {
    unit.report();
  }
};

wrapupTest(testJdbcResultSetParity);
