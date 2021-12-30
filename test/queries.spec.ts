
import {PostgresDataSource} from '../src/';

describe("Queries", () => {
    test("Simple queries", async () => {

        const source = new PostgresDataSource();
        source.setHost('localhost');
        source.setPort(5432);
        source.setDatabaseName('neochess');
        source.setUsername('postgres');
        source.setPassword('postgres');
        source.setDebugEnabled(true);

        try {

            /*const response = await source.getTable("liveness").find();
            console.log(response[0].id);
            const response2 = await source.getTable("liveness").select({name:'id', table: 'liveness'}, 'date', {name: 'clientid', alias: 'cid'}).find();
            console.log(response2[1].id);
            const response3 = await source.getTable("liveness").select({name: '*', function: 'count', alias: 'cuenta'}).find();
            console.log(response3[0].cuenta);*/
            
            await source.getTable('user')
                .set('firstname', 'Scarlett')
                .set('lastname', 'Johansson')
                .set('username', 'blackwidow')
                .set('password', '123qwe')
                .insert();

        } catch (e) {
            console.log(e);
        }

        await source.close();


    });
});