require('../../data-source');
require('../../connection');

class PostgresDataSource extends DataSource {
    public getConnection(): Connection {
        return new PostgresConnection();
    }
}
