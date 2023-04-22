import { DB, PostgresDataSource } from '../src';

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
  const users = await DB.table('users').find();
  console.log(users);
}

executeBasicTest();
