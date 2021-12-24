import {DataSource} from '../../data-source';
import {Connection} from '../../connection';
import {PostgresConnection} from './postgres-connection';

export class PostgresDataSource extends DataSource {
    private lib: any;
    private pool: any;

    constructor(config?: {host?: string, port?: number, user?: string, password?: string, database?: string}) {
        super();
        try {
            this.lib = require("pg");
        } catch (e) {
            throw new Error("PostgreSQL module not found. Please install it via \"npm install -S pg\"");
        }
        this.pool = new this.lib.Pool(config);
    }

    public async getConnection(): Promise<Connection> {
        return new PostgresConnection(await this.pool.connect());
    }

    public async close(): Promise<void> {
        await this.pool.end();
    }
}
