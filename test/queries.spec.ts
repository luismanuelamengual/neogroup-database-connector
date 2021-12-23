
import {PostgresDataSource, DataSources} from '../src/';

describe("Queries", () => {
    test("Simple queries", async () => {
        DataSources.register("main", new PostgresDataSource({
            host: 'localhost',
            port: 5432,
            database: 'biometrics',
            user: 'postgres',
            password: 'postgres'
        }));
        const response = await DataSources.get("main").getTable("liveness").find();
        console.log(response[0].id);
    });
});