
import {PostgresDataSource, ConditionGroup} from '../src/';

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
            
            /*await source.getTable('user')
                .set('firstname', 'Jay')
                .set('lastname', 'Mammon')
                .set('username', 'jayman')
                .set('password', 'pipi888')
                .insert();*/

            let response;
            response = await source.getTable("user")
                .where('userid', '<=', 2)
                .orWhere((new ConditionGroup())
                    .with('firstname', '=', 'Scarlet')
                    .with('password', 'like', 'rama'))
                .find();
                
            console.log(response);
            response = await source.getTable("user").where('password', 'like', '%8%').find();
            console.log(response);
            response = await source.getTable("user").select({name: '*', functionName: 'count', alias: 'cuenta'}).find();
            console.log(response);

            /*response = await source.getTable("user").innerJoin("person", "user.userid", "person.userid").find();
            console.log(response);*/

        } catch (e) {
            console.log(e);
        }

        await source.close();
    });
});