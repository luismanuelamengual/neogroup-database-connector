
import {PostgresDataSource, DataSources, registerSource, getTable} from '../src/';

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
        const response2 = await getTable("liveness").find();
        console.log(response2[1].id);
        await DataSources.get("main").close();
    });
});