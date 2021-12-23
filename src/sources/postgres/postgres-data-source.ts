import {DataSource} from '../../data-source';
import {Connection} from '../../connection';
import {PostgresConnection} from './postgres-connection';

export class PostgresDataSource extends DataSource {

    private postgreLib: any;
    private pool: any;

    constructor() {
        super();
        try {
            this.postgreLib = require("pg");
        } catch (e) {
            throw new Error("PostgreSQL module not found. Please install it via \"npm install -S pg\"");
        }
        
        this.pool = new this.postgreLib.Pool();
        console.log(this.pool);
    }

    public getConnection(): Connection {
        return new PostgresConnection();
    }
}
