[![npm version](https://badge.fury.io/js/@neogroup%2Fdatabase-connector.svg)](https://badge.fury.io/js/@neogroup%2Fdatabase-connector)
![](https://img.shields.io/github/forks/luismanuelamengual/Neochess-Core.svg?style=social&label=Fork)
![](https://img.shields.io/github/stars/luismanuelamengual/Neochess-Core.svg?style=social&label=Star)
![](https://img.shields.io/github/watchers/luismanuelamengual/Neochess-Core.svg?style=social&label=Watch)
![](https://img.shields.io/github/followers/luismanuelamengual.svg?style=social&label=Follow)

# Database Connector

This package is a lightweight and user-friendly database connector that allows developers to easily interact with any databases. It has been designed with simplicity and ease-of-use in mind, making it accessible even to those who are new to database programming.

The package comes with clear and comprehensive documentation, making it easy to get started and quickly learn the basics of working databases. It also provides a range of useful features and functionalities, such as connection pooling, transaction management, and query building, which help to streamline the development process and make it more efficient.

## Installation

```shell
npm install @neogroup/database-connector
```

## Getting started

First its necessary to register a new Data Source. For a *postgres* data source, this can be accomplished with the following code

```typescript
const source = new PostgresDataSource();
source.setHost(/*database host*/);
source.setDatabaseName(/*database name*/);
source.setUsername(/*database username*/);
source.setPassword(/*database password*/);
DB.register(source);
```

After the registration, its possible to execute queries in the database in the following way

```typescript
const users = DB.table('users').find();
```

This will execute the following SQL

```sql
SELECT * FROM users
```


## Contact

For bugs or for requirements please contact me at luismanuelamengual@gmail.com