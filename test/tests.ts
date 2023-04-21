import { PostgresDataSource, getTable, registerSource } from '../src';

const source = new PostgresDataSource();
source.setHost('localhost');
source.setDatabaseName('postgres');
source.setUsername('postgres');
source.setPassword('postgres');
source.setDebugEnabled(true);
registerSource(source);

async function executeBasicTest() {
  const response = await getTable('users').find();
  console.log(response);
  const response2 = await getTable('users').where('username', 'Neo').find();
  console.log(response2);
}

executeBasicTest();


