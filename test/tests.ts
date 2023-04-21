const { PostgresDataSource } = require('../src');

const source = new PostgresDataSource();
source.setHost('localhost');
source.setPort(5432);
source.setDatabaseName('postgres');
source.setUsername('postgres');
source.setPassword('postgres');
source.setDebugEnabled(true);

async function executeBasicTest() {
  const response = await source.getTable("users").find();
  console.log(response);
}

executeBasicTest();


