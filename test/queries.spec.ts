
import {PostgresDataSource, DataSources} from '../src/';

describe("Queries", () => {
    test("Simple queries", () => {
        DataSources.register("main", new PostgresDataSource());
        DataSources.get("main").getTable("user").find();
    });
});