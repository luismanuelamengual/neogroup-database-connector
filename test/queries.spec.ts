
import {PostgresDataSource, registerSource, getTable, getSource} from '../src/';

describe("Queries", () => {
    test("Simple queries", async () => {
        registerSource(new PostgresDataSource({
            host: 'localhost',
            port: 5432,
            database: 'biometrics',
            user: 'postgres',
            password: 'postgres'
        }));


        const response = await getTable("liveness").find();
        console.log(response[0].id);
        const response2 = await getTable("liveness").select('id', 'date', {name: 'clientid', alias: 'cid'}).find();
        console.log(response2[1].id);
        
        await getSource().close();
    });
});