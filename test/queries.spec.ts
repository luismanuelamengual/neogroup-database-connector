
import {PostgresDataSource} from '../src/';

describe("Queries", () => {
    test("Simple queries", async () => {

        const source = new PostgresDataSource();
        source.setHost('localhost');
        source.setPort(5432);
        source.setDatabaseName('biometrics');
        source.setUsername('postgres');
        source.setPassword('postgres');
        source.setDebugEnabled(true);

        const response = await source.getTable("liveness").find();
        console.log(response[0].id);
        const response2 = await source.getTable("liveness").select({name:'id', tableName: 'liveness'}, 'date', {name: 'clientid', alias: 'cid'}).find();
        console.log(response2[1].id);
        
        await source.close();
    });
});