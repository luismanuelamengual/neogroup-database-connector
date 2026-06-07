[![npm version](https://badge.fury.io/js/@neogroup%2Fdatabase-connector.svg)](https://badge.fury.io/js/@neogroup%2Fdatabase-connector)
![](https://img.shields.io/github/forks/luismanuelamengual/neogroup-database-connector.svg?style=social&label=Fork)
![](https://img.shields.io/github/stars/luismanuelamengual/neogroup-database-connector.svg?style=social&label=Star)
![](https://img.shields.io/github/watchers/luismanuelamengual/neogroup-database-connector.svg?style=social&label=Watch)
![](https://img.shields.io/github/followers/luismanuelamengual.svg?style=social&label=Follow)

# @neogroup/database-connector

A lightweight, fluent TypeScript library for interacting with relational databases. It provides a chainable query builder, connection/transaction management, and pluggable data sources for **PostgreSQL**, **MySQL**, and **SQLite** — with a clean architecture that makes it easy to add new engines.

## Table of contents

- [Installation](#installation)
- [Data sources](#data-sources)
  - [PostgreSQL](#postgresql)
  - [MySQL](#mysql)
  - [SQLite](#sqlite)
  - [Multiple sources](#multiple-sources)
- [Querying with DataTable](#querying-with-datatable)
  - [SELECT — basic](#select--basic)
  - [Filtering — WHERE](#filtering--where)
  - [Conditional clauses — when](#conditional-clauses--when)
  - [Sorting — ORDER BY](#sorting--order-by)
  - [Pagination — LIMIT & OFFSET](#pagination--limit--offset)
  - [Grouping — GROUP BY & HAVING](#grouping--group-by--having)
  - [Joins](#joins)
  - [Distinct](#distinct)
  - [Field aliases & functions](#field-aliases--functions)
  - [Table alias](#table-alias)
- [INSERT, UPDATE, DELETE](#insert-update-delete)
- [Raw queries](#raw-queries)
- [Advanced queries with SelectQuery](#advanced-queries-with-selectquery)
  - [UNION / UNION ALL](#union--union-all)
  - [Subqueries](#subqueries)
- [Connections & transactions](#connections--transactions)
- [Debug mode](#debug-mode)
- [Extending the library](#extending-the-library)
- [Contact](#contact)

---

## Installation

```bash
npm install @neogroup/database-connector
```

Depending on the database engine you use, install the corresponding driver:

| Engine     | Driver                  |
|------------|-------------------------|
| PostgreSQL | `npm install pg`        |
| MySQL      | `npm install mysql2`    |
| SQLite     | built-in (Node ≥ 22.5)  |

---

## Data sources

A **DataSource** represents a configured connection to a database engine. Register it once at startup with `DB.register()` and use `DB` anywhere in your code from that point on.

### PostgreSQL

```typescript
import { DB, PostgresDataSource } from '@neogroup/database-connector'

const source = new PostgresDataSource()
source.setHost('localhost')
source.setPort(5432)               // default: 5432
source.setDatabaseName('mydb')
source.setUsername('admin')
source.setPassword('secret')

DB.register(source)
```

### MySQL

```typescript
import { DB, MysqlDataSource } from '@neogroup/database-connector'

const source = new MysqlDataSource()
source.setHost('localhost')
source.setPort(3306)               // default: 3306
source.setDatabaseName('mydb')
source.setUsername('admin')
source.setPassword('secret')

DB.register(source)
```

MySQL identifiers (table names, column names) are automatically quoted with backticks to avoid conflicts with reserved words.

### SQLite

```typescript
import { DB, SqliteDataSource } from '@neogroup/database-connector'

const source = new SqliteDataSource()         // in-memory database
// source.setFilename('./data.db')            // or a file path

DB.register(source)
```

SQLite uses Node's built-in `node:sqlite` module — no native compilation required.

### Multiple sources

You can register multiple sources and switch between them by name:

```typescript
DB.register('primary', primarySource)
DB.register('reporting', reportingSource)

// Use a specific source
const rows = await DB.source('reporting').table('analytics').find()
```

When no name is given, the first registered source is the default and `DB.table(...)` targets it automatically.

---

## Querying with DataTable

`DB.table('name')` returns a `DataTable` — a chainable query builder scoped to a single table. All methods return the same `DataTable` instance so you can chain them freely.

### SELECT — basic

```typescript
// SELECT * FROM users
const users = await DB.table('users').find()

// SELECT * FROM users LIMIT 1
const user = await DB.table('users').first()   // returns null if no rows match
```

Select specific columns:

```typescript
// SELECT id, name, email FROM users
const users = await DB.table('users')
  .select('id', 'name', 'email')
  .find()
```

---

### Filtering — WHERE

**Simple equality:**

```typescript
// WHERE name = 'Alice'
await DB.table('users').where('name', 'Alice').find()
```

**Comparison operators** (`=`, `<>`, `<`, `>`, `<=`, `>=`):

```typescript
await DB.table('users').where('age', '>', 18).find()
await DB.table('users').where('age', '<>', 30).find()
```

**Multiple conditions (AND by default):**

```typescript
// WHERE active = 1 AND age > 18
await DB.table('users').where('active', 1).where('age', '>', 18).find()
```

**OR conditions:**

```typescript
// WHERE name = 'Alice' OR name = 'Bob'
await DB.table('users').where('name', 'Alice').orWhere('name', 'Bob').find()
```

**IN / NOT IN:**

```typescript
// WHERE role IN ('admin', 'editor')
await DB.table('users').whereIn('role', ['admin', 'editor']).find()

// WHERE id NOT IN (1, 2, 3)
await DB.table('users').whereNotIn('id', [1, 2, 3]).find()
```

Also available as `orWhereIn` / `orWhereNotIn`.

**BETWEEN / NOT BETWEEN:**

```typescript
// WHERE age BETWEEN 18 AND 65
await DB.table('users').whereBetween('age', [18, 65]).find()

// WHERE created_at NOT BETWEEN '2024-01-01' AND '2024-12-31'
await DB.table('orders').whereNotBetween('created_at', ['2024-01-01', '2024-12-31']).find()
```

Also available as `orWhereBetween` / `orWhereNotBetween`.

**LIKE / NOT LIKE:**

```typescript
await DB.table('users').whereLike('email', '%@gmail.com').find()
await DB.table('users').whereNotLike('name', 'A%').find()
```

Also available as `orWhereLike` / `orWhereNotLike`.

**NULL checks:**

```typescript
// WHERE deleted_at IS NULL
await DB.table('users').whereNull('deleted_at').find()

// WHERE deleted_at IS NOT NULL
await DB.table('users').whereNotNull('deleted_at').find()
```

Also available as `orWhereNull` / `orWhereNotNull`.

**Grouped conditions (parentheses):**

Pass a callback to `where()` to create a parenthesized group. The callback receives a `ConditionGroup` with the same `where()` / `orWhere()` API:

```typescript
// WHERE (name = 'Alice' OR name = 'Bob') AND active = 1
await DB.table('users')
  .where((group) => group.where('name', 'Alice').orWhere('name', 'Bob'))
  .where('active', 1)
  .find()
```

Nest groups as deep as needed:

```typescript
// WHERE (role = 'admin' OR (role = 'editor' AND verified = 1))
await DB.table('users')
  .where((group) =>
    group
      .where('role', 'admin')
      .orWhere((inner) => inner.where('role', 'editor').where('verified', 1))
  )
  .find()
```

`orWhere()` also accepts a callback, producing an OR-connected group.

---

### Conditional clauses — `when`

`when(condition, callback)` applies query modifications only when `condition` is truthy. This keeps dynamic query building readable without `if` statements scattered through the chain:

```typescript
const onlyActive = true
const minAge = 18

const users = await DB.table('users')
  .when(onlyActive, (q) => q.where('active', 1))
  .when(minAge != null, (q) => q.where('age', '>=', minAge))
  .find()
```

When `condition` is falsy the callback is skipped and the chain continues unchanged. `when` works on both `DataTable` and `SelectQuery`.

---

### Sorting — ORDER BY

```typescript
// ORDER BY name ASC
await DB.table('users').orderBy('name').find()

// ORDER BY age DESC
import { OrderByDirection } from '@neogroup/database-connector'
await DB.table('users').orderBy('age', OrderByDirection.DESC).find()

// Multiple sort fields
await DB.table('users')
  .orderBy('country', OrderByDirection.ASC)
  .orderBy('age', OrderByDirection.DESC)
  .find()
```

---

### Pagination — LIMIT & OFFSET

```typescript
// LIMIT 10
await DB.table('users').limit(10).find()

// LIMIT 10 OFFSET 20  (page 3)
await DB.table('users').limit(10).offset(20).find()

// OFFSET only (SQLite emits LIMIT -1 automatically)
await DB.table('users').offset(5).find()
```

---

### Grouping — GROUP BY & HAVING

```typescript
// SELECT country, COUNT(*) AS total FROM users GROUP BY country
await DB.table('users')
  .select('country', 'COUNT(*) AS total')
  .groupBy('country')
  .find()

// GROUP BY + HAVING
// HAVING COUNT(*) > 5
await DB.table('users')
  .select('country', 'COUNT(*) AS total')
  .groupBy('country')
  .having('COUNT(*)', '>', 5)
  .find()
```

`having()` and `orHaving()` accept the same signatures as `where()`.

---

### Joins

```typescript
// INNER JOIN orders ON users.id = orders.user_id
await DB.table('users')
  .innerJoin('orders', 'users.id', 'orders.user_id')
  .find()

// LEFT JOIN
await DB.table('users')
  .leftJoin('orders', 'users.id', 'orders.user_id')
  .find()
```

Fields follow the `'table.field'` notation — the builder parses and quotes each component according to the engine (e.g. backticks in MySQL). Object form is also accepted for finer control:

```typescript
.innerJoin('orders', { name: 'id', table: 'users' }, { name: 'user_id', table: 'orders' })
```

Available join methods: `join()`, `innerJoin()`, `leftJoin()`, `rightJoin()`, `outerJoin()`, `crossJoin()`.

Join with table alias:

```typescript
await DB.table('users')
  .innerJoin('orders', 'users.id', 'orders.user_id', 'o')
  .select('users.name', 'o.total')
  .find()
```

---

### Distinct

```typescript
// SELECT DISTINCT country FROM users
await DB.table('users').distinct().select('country').find()
```

---

### Field aliases & functions

Raw string fields support `'table.field'` notation and `'FUNC(table.field)'` — the builder parses and quotes each component using the engine's rules:

```typescript
// SELECT users.name, COUNT(orders.id) AS order_count FROM ...
await DB.table('users')
  .select('users.name', 'COUNT(orders.id) AS order_count')
  .innerJoin('orders', 'users.id', 'orders.user_id')
  .groupBy('users.id')
  .find()
```

Object form is also available for precise control:

```typescript
// SELECT COUNT(*) AS total FROM users
await DB.table('users')
  .select({ name: '*', function: 'COUNT', alias: 'total' })
  .find()

// SELECT MAX(age) AS max_age FROM users
await DB.table('users')
  .select({ name: 'age', function: 'MAX', alias: 'max_age' })
  .find()
```

---

### Table alias

```typescript
// FROM users AS u
await DB.table('users').alias('u').find()
```

---

## INSERT, UPDATE, DELETE

**INSERT:**

```typescript
// INSERT INTO users (name, email, age) VALUES ('Alice', 'alice@example.com', 30)
const rowsAffected = await DB.table('users')
  .set('name', 'Alice')
  .set('email', 'alice@example.com')
  .set('age', 30)
  .insert()
```

**UPDATE:**

```typescript
// UPDATE users SET active = 0 WHERE id = 7
const rowsAffected = await DB.table('users')
  .where('id', 7)
  .set('active', 0)
  .update()
```

**DELETE:**

```typescript
// DELETE FROM users WHERE active = 0
const rowsAffected = await DB.table('users').where('active', 0).delete()
```

> ⚠️ Omitting `where()` on `update()` and `delete()` will affect **all rows** in the table.

---

## Raw queries

When you need full control over the SQL string:

```typescript
// Raw SELECT
const rows = await DB.source('primary').query(
  'SELECT * FROM users WHERE age > ? AND active = ?',
  [18, 1]
)

// Raw execute (INSERT / UPDATE / DELETE / DDL)
const affected = await DB.source('primary').execute(
  'UPDATE users SET active = ? WHERE last_login < ?',
  [0, '2023-01-01']
)
```

---

## Advanced queries with SelectQuery

For queries that go beyond a single table — unions, subqueries, or complex joins — build a `SelectQuery` directly and pass it to `source.query()`.

### UNION / UNION ALL

```typescript
import { DB } from '@neogroup/database-connector'

// SELECT name FROM users WHERE active = 1
// UNION
// SELECT name FROM users WHERE age > 50
const query = DB.selectQuery('users')
  .select('name')
  .where('active', 1)
  .union(
    DB.selectQuery('users').select('name').where('age', '>', 50)
  )

const rows = await DB.source('primary').query(query)
```

`union()` removes duplicates (standard SQL `UNION`). Use `unionAll()` to keep them:

```typescript
const query = DB.selectQuery('orders')
  .select('user_id')
  .where('status', 'paid')
  .unionAll(
    DB.selectQuery('orders').select('user_id').where('status', 'refunded')
  )
```

Chain multiple unions:

```typescript
const query = DB.selectQuery('table_a').select('id')
  .union(DB.selectQuery('table_b').select('id'))
  .union(DB.selectQuery('table_c').select('id'))
```

### Subqueries

A `SelectQuery` can be used as a value in a `where()` condition:

```typescript
const activeUserIds = DB.selectQuery('users').select('id').where('active', 1)

const orders = await DB.source('primary').query(
  DB.selectQuery('orders').where('user_id', 'IN', activeUserIds)
)
```

---

## Connections & transactions

Obtain an explicit connection for multi-step operations or transactions:

```typescript
const conn = await DB.source('primary').getConnection()

try {
  await conn.beginTransaction()

  await conn.execute('INSERT INTO accounts (user_id, balance) VALUES (?, ?)', [1, 1000])
  await conn.execute('UPDATE accounts SET balance = balance - ? WHERE user_id = ?', [200, 2])

  await conn.commitTransaction()
} catch (err) {
  await conn.rollbackTransaction()
} finally {
  await conn.close()
}
```

The helper `executeTransaction()` handles begin/commit/rollback automatically:

```typescript
const conn = await DB.source('primary').getConnection()

await conn.executeTransaction(async (tx) => {
  await tx.execute('INSERT INTO logs (event) VALUES (?)', ['login'])
  await tx.execute('UPDATE users SET last_login = NOW() WHERE id = ?', [userId])
  // throws → automatic rollback; resolves → automatic commit
})

await conn.close()
```

---

## Debug mode

Enable SQL logging on a data source to print every statement and its bindings to the console:

```typescript
source.setDebugEnabled(true)
```

Example output:

```
SQL: SELECT * FROM users WHERE active = ? AND age > ?;   ["1", 18]
```

Read-only mode prevents any write operations from reaching the database — useful for testing:

```typescript
source.setReadonly(true)
```

---

## Extending the library

### Custom data source

Implement `DataSource` to connect any database engine:

```typescript
import { Connection, DataSource } from '@neogroup/database-connector'

class MyConnection implements Connection {
  async query(sql: string, bindings?: any[]): Promise<any[]> { /* ... */ }
  async execute(sql: string, bindings?: any[]): Promise<number> { /* ... */ }
  async beginTransaction(): Promise<void> { /* ... */ }
  async commitTransaction(): Promise<void> { /* ... */ }
  async rollbackTransaction(): Promise<void> { /* ... */ }
  async close(): Promise<void> { /* ... */ }
}

class MyDataSource extends DataSource {
  protected async requestConnection(): Promise<Connection> {
    return new MyConnection(/* ... */)
  }
  async close(): Promise<void> { /* ... */ }
}
```

### Custom query builder

Override `DefaultQueryBuilder` to adapt SQL generation for your engine:

```typescript
import { DefaultQueryBuilder, Statement, Table } from '@neogroup/database-connector'

class MyQueryBuilder extends DefaultQueryBuilder {
  protected buildTable(table: Table, statement: Statement) {
    // e.g. wrap table names in double-brackets for SQL Server
    statement.sql += typeof table === 'string' ? `[${table}]` : `[${table.name}]`
  }
}
```

Pass your custom builder to the data source constructor:

```typescript
class MyDataSource extends DataSource {
  constructor() {
    super(new MyQueryBuilder())
  }
  // ...
}
```

---

## Contact

For bugs or feature requests open an issue on [GitHub](https://github.com/luismanuelamengual/neogroup-database-connector/issues) or contact the author at luismanuelamengual@gmail.com.
