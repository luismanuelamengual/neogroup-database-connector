
import {PostgresDataSource, registerSource, getTable, getConnection, getSource} from '../src/';

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
        
        const connection = await getConnection();
        const response3 = await connection.getTable("liveness").find();
        console.log(response3[2].host);
        await connection.close();

        await getSource().close();
    });
});