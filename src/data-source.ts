require('./connection');

abstract class DataSource {

    public abstract getConnection(): Connection;
}
