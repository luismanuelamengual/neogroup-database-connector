import { DB, OrderByDirection, PostgresDataSource } from '../src';

// Add support for "dotenv"
require('dotenv').config();

// Registering the postgres data source();
const source = new PostgresDataSource();
source.setHost(String(process.env.POSTGRES_SOURCE_HOST));
source.setDatabaseName(String(process.env.POSTGRES_SOURCE_DATABASE_NAME));
source.setUsername(String(process.env.POSTGRES_SOURCE_USERNAME));
source.setPassword(String(process.env.POSTGRES_SOURCE_PASSWORD));
source.setDebugEnabled(true);
DB.register(source);

async function executeBasicTest() {
  const users = await DB.table('users')
    .select('username', {name: 'password', table: 'users'})
    .where('id', '>', 1)
    .where('password', '<>', 'ramalt')
    .where('id', 'in', DB.selectQuery('users')
      .select('id')
      .where('id', 2))
    .orWhere(DB.conditionGroup()
      .with('id', '>', 0)
      .with('id', '<', 10))
    .orderBy('id', OrderByDirection.DESC)
    .orderBy('username')
    .limit(10)
    .find();
  console.log(users);
}

executeBasicTest();
