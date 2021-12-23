require('./connection');

abstract class ConnectionPool {

    public abstract getConnection(): Connection;
}