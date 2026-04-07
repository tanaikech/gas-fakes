import { Proxies } from "../../support/proxies.js";
import { Syncit } from "../../support/syncit.js";
import { newFakeJdbcResultSet } from "./fakejdbcresultset.js";

class FakeJdbcDatabaseMetaData {
  constructor(connection, connectionId, url) {
    this.__fakeObjectType = "JdbcDatabaseMetaData";
    this._connection = connection;
    this._connectionId = connectionId;
    this._url = url;
    this._type =
      url.includes("postgres") || url.includes("cockroach")
        ? "postgres"
        : "mysql";
  }

  // ---------------------------------------------------------
  // Core Info Methods
  // ---------------------------------------------------------

  getURL() {
    return this._url;
  }

  getUserName() {
    try {
      const u = new URL(
        this._url
          .replace(/^jdbc:google:/, "")
          .replace(/^jdbc:/, "")
          .replace("cockroachdb", "http"),
      );
      return u.username;
    } catch (e) {
      return "unknown";
    }
  }

  getDatabaseProductName() {
    return this._type === "postgres" ? "PostgreSQL" : "MySQL";
  }

  getDatabaseProductVersion() {
    return "unknown";
  }

  getDriverName() {
    return "gas-fakes-jdbc-driver";
  }
  getDriverVersion() {
    return globalThis.GasFakes?.metadata?.version || "unknown";
  }
  getDriverMajorVersion() {
    return 2;
  }
  getDriverMinorVersion() {
    return 3;
  }

  getIdentifierQuoteString() {
    return this._type === "mysql" ? "`" : '"';
  }

  // ---------------------------------------------------------
  // Retrieval Methods (ResultSets)
  // ---------------------------------------------------------

  getCatalogs() {
    const sql =
      this._type === "mysql"
        ? "SELECT SCHEMA_NAME as TABLE_CAT FROM information_schema.SCHEMATA"
        : "SELECT datname AS TABLE_CAT FROM pg_database";
    const result = Syncit.fxJdbcQuery(this._connectionId, sql);
    return newFakeJdbcResultSet(result);
  }

  getSchemas() {
    const sql =
      "SELECT SCHEMA_NAME as TABLE_SCHEM, CATALOG_NAME as TABLE_CATALOG FROM information_schema.SCHEMATA";
    const result = Syncit.fxJdbcQuery(this._connectionId, sql);
    return newFakeJdbcResultSet(result);
  }

  getTableTypes() {
    return newFakeJdbcResultSet({
      fields: [{ name: "TABLE_TYPE" }],
      rows: [
        { TABLE_TYPE: "TABLE" },
        { TABLE_TYPE: "VIEW" },
        { TABLE_TYPE: "SYSTEM TABLE" },
      ],
    });
  }

  getTables(catalog, schemaPattern, tableNamePattern, types) {
    let sql = `SELECT 
      TABLE_CATALOG as TABLE_CAT, 
      TABLE_SCHEMA as TABLE_SCHEM, 
      TABLE_NAME, 
      CASE WHEN TABLE_TYPE = 'BASE TABLE' THEN 'TABLE' ELSE TABLE_TYPE END as TABLE_TYPE, 
      NULL as REMARKS, 
      NULL as TYPE_CAT, 
      NULL as TYPE_SCHEM, 
      NULL as TYPE_NAME, 
      NULL as SELF_REFERENCING_COL_NAME, 
      NULL as REF_GENERATION
      FROM information_schema.tables WHERE 1=1`;

    if (catalog) sql += ` AND TABLE_CATALOG = '${catalog}'`;
    if (schemaPattern) sql += ` AND TABLE_SCHEMA LIKE '${schemaPattern}'`;
    if (tableNamePattern) {
      sql += ` AND LOWER(TABLE_NAME) LIKE LOWER('${tableNamePattern}')`;
    }
    if (types && types.length > 0) {
      const typeList = types
        .map((t) => {
          if (t === "TABLE") return "'TABLE','BASE TABLE'";
          return `'${t}'`;
        })
        .join(",");
      sql += ` AND TABLE_TYPE IN (${typeList})`;
    }

    const result = Syncit.fxJdbcQuery(this._connectionId, sql);
    return newFakeJdbcResultSet(result);
  }

  getColumns(catalog, schemaPattern, tableNamePattern, columnNamePattern) {
    const isMysql = this._type === "mysql";
    let sql = `SELECT 
      TABLE_CATALOG as TABLE_CAT, 
      TABLE_SCHEMA as TABLE_SCHEM, 
      TABLE_NAME, 
      COLUMN_NAME, 
      DATA_TYPE as DATA_TYPE_NAME,
      CASE 
        WHEN DATA_TYPE LIKE '%int%' THEN 4
        WHEN DATA_TYPE LIKE '%text%' THEN 12
        WHEN DATA_TYPE LIKE '%varchar%' THEN 12
        WHEN DATA_TYPE LIKE '%float%' THEN 7
        WHEN DATA_TYPE LIKE '%double%' THEN 8
        ELSE 1111 
      END as DATA_TYPE,
      CHARACTER_MAXIMUM_LENGTH as COLUMN_SIZE,
      NULL as BUFFER_LENGTH,
      NUMERIC_PRECISION as DECIMAL_DIGITS,
      10 as NUM_PREC_RADIX,
      CASE WHEN IS_NULLABLE = 'YES' THEN 1 ELSE 0 END as NULLABLE,
      NULL as REMARKS,
      COLUMN_DEFAULT as COLUMN_DEF,
      NULL as SQL_DATA_TYPE,
      NULL as SQL_DATETIME_SUB,
      CHARACTER_OCTET_LENGTH as CHAR_OCTET_LENGTH,
      ORDINAL_POSITION,
      IS_NULLABLE,
      NULL as SCOPE_CATALOG,
      NULL as SCOPE_SCHEMA,
      NULL as SCOPE_TABLE,
      NULL as SOURCE_DATA_TYPE,
      ${isMysql ? "CASE WHEN EXTRA LIKE '%auto_increment%' THEN 'YES' ELSE 'NO' END" : "'NO'"} as IS_AUTOINCREMENT
      FROM information_schema.columns WHERE 1=1`;

    if (catalog) sql += ` AND TABLE_CATALOG = '${catalog}'`;
    if (schemaPattern) sql += ` AND TABLE_SCHEMA LIKE '${schemaPattern}'`;
    if (tableNamePattern) {
      sql += ` AND LOWER(TABLE_NAME) LIKE LOWER('${tableNamePattern}')`;
    }
    if (columnNamePattern) {
      sql += ` AND LOWER(COLUMN_NAME) LIKE LOWER('${columnNamePattern}')`;
    }

    sql += " ORDER BY TABLE_NAME, ORDINAL_POSITION";

    const result = Syncit.fxJdbcQuery(this._connectionId, sql);
    return newFakeJdbcResultSet(result);
  }

  getPrimaryKeys(catalog, schema, table) {
    let sql;
    if (this._type === "mysql") {
      sql = `SELECT 
        TABLE_CATALOG as TABLE_CAT, 
        TABLE_SCHEMA as TABLE_SCHEM, 
        TABLE_NAME, 
        COLUMN_NAME, 
        ORDINAL_POSITION as KEY_SEQ, 
        CONSTRAINT_NAME as PK_NAME
        FROM information_schema.KEY_COLUMN_USAGE 
        WHERE CONSTRAINT_NAME = 'PRIMARY' AND LOWER(TABLE_NAME) = LOWER('${table}')`;
      if (catalog) sql += ` AND TABLE_CATALOG = '${catalog}'`;
      if (schema) sql += ` AND TABLE_SCHEMA = '${schema}'`;
    } else {
      // PostgreSQL Primary Keys via information_schema
      sql = `SELECT 
        tc.table_catalog as TABLE_CAT, 
        tc.table_schema as TABLE_SCHEM, 
        tc.table_name as TABLE_NAME, 
        kcu.column_name as COLUMN_NAME, 
        kcu.ordinal_position as KEY_SEQ, 
        tc.constraint_name as PK_NAME
        FROM information_schema.table_constraints tc 
        JOIN information_schema.key_column_usage kcu 
          ON tc.constraint_name = kcu.constraint_name 
          AND tc.table_schema = kcu.table_schema
          AND tc.table_name = kcu.table_name
        WHERE tc.constraint_type = 'PRIMARY KEY' AND LOWER(tc.table_name) = LOWER('${table}')`;
      if (catalog) sql += ` AND tc.table_catalog = '${catalog}'`;
      if (schema) sql += ` AND tc.table_schema = '${schema}'`;
    }

    const result = Syncit.fxJdbcQuery(this._connectionId, sql);
    return newFakeJdbcResultSet(result);
  }

  getTypeInfo() {
    // Standard type info return
    return newFakeJdbcResultSet({
      fields: [
        { name: "TYPE_NAME" },
        { name: "DATA_TYPE" },
        { name: "PRECISION" },
        { name: "LITERAL_PREFIX" },
        { name: "LITERAL_SUFFIX" },
        { name: "CREATE_PARAMS" },
        { name: "NULLABLE" },
        { name: "CASE_SENSITIVE" },
        { name: "SEARCHABLE" },
        { name: "UNSIGNED_ATTRIBUTE" },
        { name: "FIXED_PREC_SCALE" },
        { name: "AUTO_INCREMENT" },
        { name: "LOCAL_TYPE_NAME" },
        { name: "MINIMUM_SCALE" },
        { name: "MAXIMUM_SCALE" },
        { name: "SQL_DATA_TYPE" },
        { name: "SQL_DATETIME_SUB" },
        { name: "NUM_PREC_RADIX" },
      ],
      rows: [
        { TYPE_NAME: "TEXT", DATA_TYPE: 12, SEARCHABLE: 3, NULLABLE: 1 },
        { TYPE_NAME: "INT", DATA_TYPE: 4, SEARCHABLE: 3, NULLABLE: 1 },
        { TYPE_NAME: "FLOAT", DATA_TYPE: 7, SEARCHABLE: 3, NULLABLE: 1 },
      ],
    });
  }

  // ---------------------------------------------------------
  // Capability Methods (Static/Defaults)
  // ---------------------------------------------------------

  supportsTransactions() {
    return true;
  }
  supportsBatchUpdates() {
    return true;
  }
  supportsSavepoints() {
    return this._type === "postgres";
  }
  supportsStoredProcedures() {
    return true;
  }
  supportsResultSetType(type) {
    return type === 1003;
  } // TYPE_FORWARD_ONLY
  supportsResultSetConcurrency(type, concurrency) {
    return concurrency === 1007;
  } // CONCUR_READ_ONLY

  // High-level common capabilities
  allProceduresAreCallable() {
    return true;
  }
  allTablesAreSelectable() {
    return true;
  }
  dataDefinitionCausesTransactionCommit() {
    return this._type === "mysql";
  }
  dataDefinitionIgnoredInTransactions() {
    return false;
  }
  doesMaxRowSizeIncludeBlobs() {
    return true;
  }
  supportsCorrelatedSubqueries() {
    return true;
  }
  supportsDataDefinitionAndDataManipulationTransactions() {
    return true;
  }
  supportsDataManipulationTransactionsOnly() {
    return false;
  }
  supportsDifferentTableCorrelationNames() {
    return false;
  }
  supportsExpressionsInOrderBy() {
    return true;
  }
  supportsExtendedSQLGrammar() {
    return false;
  }
  supportsFullOuterJoins() {
    return this._type === "postgres";
  }
  supportsGroupBy() {
    return true;
  }
  supportsGroupByBeyondSelect() {
    return true;
  }
  supportsGroupByUnrelated() {
    return true;
  }
  supportsIntegrityEnhancementFacility() {
    return false;
  }
  supportsLikeEscapeClause() {
    return true;
  }
  supportsLimitedOuterJoins() {
    return true;
  }
  supportsMinimumSQLGrammar() {
    return true;
  }
  supportsMixedCaseIdentifiers() {
    return false;
  }
  supportsMixedCaseQuotedIdentifiers() {
    return true;
  }
  supportsMultipleResultSets() {
    return false;
  }
  supportsMultipleTransactions() {
    return true;
  }
  supportsNamedParameters() {
    return false;
  }
  supportsNonNullableColumns() {
    return true;
  }
  supportsOpenCursorsAcrossCommit() {
    return false;
  }
  supportsOpenCursorsAcrossRollback() {
    return false;
  }
  supportsOpenStatementsAcrossCommit() {
    return false;
  }
  supportsOpenStatementsAcrossRollback() {
    return false;
  }
  supportsOrderByUnrelated() {
    return true;
  }
  supportsOuterJoins() {
    return true;
  }
  supportsPositionedDelete() {
    return false;
  }
  supportsPositionedUpdate() {
    return false;
  }
  supportsSchemasInDataManipulation() {
    return true;
  }
  supportsSchemasInIndexDefinitions() {
    return true;
  }
  supportsSchemasInPrivilegeDefinitions() {
    return true;
  }
  supportsSchemasInProcedureCalls() {
    return true;
  }
  supportsSchemasInTableDefinitions() {
    return true;
  }
  supportsSelectForUpdate() {
    return true;
  }
  supportsStatementPooling() {
    return false;
  }
  supportsSubqueriesInComparisons() {
    return true;
  }
  supportsSubqueriesInExists() {
    return true;
  }
  supportsSubqueriesInIns() {
    return true;
  }
  supportsSubqueriesInQuantifieds() {
    return true;
  }
  supportsTableCorrelationNames() {
    return true;
  }
  supportsUnion() {
    return true;
  }
  supportsUnionAll() {
    return true;
  }
  usesLocalFilePerTable() {
    return false;
  }
  usesLocalFiles() {
    return false;
  }

  // Default numeric constraints
  getMaxBinaryLiteralLength() {
    return 0;
  }
  getMaxCatalogNameLength() {
    return 0;
  }
  getMaxCharLiteralLength() {
    return 0;
  }
  getMaxColumnNameLength() {
    return 0;
  }
  getMaxColumnsInGroupBy() {
    return 0;
  }
  getMaxColumnsInIndex() {
    return 0;
  }
  getMaxColumnsInOrderBy() {
    return 0;
  }
  getMaxColumnsInSelect() {
    return 0;
  }
  getMaxColumnsInTable() {
    return 0;
  }
  getMaxConnections() {
    return 0;
  }
  getMaxCursorNameLength() {
    return 0;
  }
  getMaxIndexLength() {
    return 0;
  }
  getMaxProcedureNameLength() {
    return 0;
  }
  getMaxRowSize() {
    return 0;
  }
  getMaxSchemaNameLength() {
    return 0;
  }
  getMaxStatementLength() {
    return 0;
  }
  getMaxStatements() {
    return 0;
  }
  getMaxTableNameLength() {
    return 0;
  }
  getMaxTablesInSelect() {
    return 0;
  }
  getMaxUserNameLength() {
    return 0;
  }

  getDefaultTransactionIsolation() {
    return 2;
  } // TRANSACTION_READ_COMMITTED
  getResultSetHoldability() {
    return 1;
  } // HOLD_CURSORS_OVER_COMMIT
  getSQLStateType() {
    return 2;
  } // sqlStateSQL
}

export const newFakeJdbcDatabaseMetaData = (...args) =>
  Proxies.guard(new FakeJdbcDatabaseMetaData(...args));
