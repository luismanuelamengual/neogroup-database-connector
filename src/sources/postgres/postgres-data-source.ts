import {DataSource} from '../../data-source';
import {Connection} from '../../connection';
import {PostgresConnection} from './postgres-connection';

export class PostgresDataSource extends DataSource {
    public getConnection(): Connection {
        return new PostgresConnection();
    }
}
