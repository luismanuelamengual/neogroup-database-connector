const { registerSource } = require('../src/');

describe("Queries", () => {
    test("Simple queries", () => {
        registerSource("main", new PostgresDataSource());
    });
});