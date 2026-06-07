import { DefaultQueryBuilder } from '../../query/builders/default-query-builder'
import { Field } from '../../query/fields'
import { Statement } from '../../query/statement'
import { Table } from '../../query/table'

export class MysqlQueryBuilder extends DefaultQueryBuilder {
  private static readonly BACKTICK = '`'

  // MySQL usa backticks para escapar identifiers (tablas, campos)
  // evitando colisiones con palabras reservadas

  protected buildTable(table: Table, statement: Statement) {
    if (typeof table === 'string' || table instanceof String) {
      statement.sql += MysqlQueryBuilder.BACKTICK + table + MysqlQueryBuilder.BACKTICK
    } else {
      if (table.schema) {
        statement.sql += MysqlQueryBuilder.BACKTICK + table.schema + MysqlQueryBuilder.BACKTICK
        statement.sql += DefaultQueryBuilder.POINT
      }

      statement.sql += MysqlQueryBuilder.BACKTICK + table.name + MysqlQueryBuilder.BACKTICK
    }
  }

  protected buildField(field: Field, statement: Statement) {
    if (typeof field === 'string' || field instanceof String) {
      // Campo raw (e.g. 'COUNT(id)', 'users.id') — no se envuelve en backticks
      statement.sql += field
    } else {
      if (field.table) {
        this.buildTable(field.table, statement)
        statement.sql += DefaultQueryBuilder.POINT
      }

      statement.sql += MysqlQueryBuilder.BACKTICK + field.name + MysqlQueryBuilder.BACKTICK
    }
  }
}
