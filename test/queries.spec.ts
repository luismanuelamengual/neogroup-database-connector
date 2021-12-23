import {getSource, registerSource} from '../src/';
import {PostgresDataSource} from '../src/sources/postgres/postgres-data-source';

describe("Queries", () => {
    test("Simple queries", () => {
        registerSource("main", new PostgresDataSource());

        getSource("main").getTable("user").find();
    });
});