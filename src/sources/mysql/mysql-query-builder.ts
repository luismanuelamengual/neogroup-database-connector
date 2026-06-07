import { DefaultQueryBuilder } from '../../query/builders/default-query-builder'
import { Statement } from '../../query/statement'
import { Table } from '../../query/table'

export class MysqlQueryBuilder extends DefaultQueryBuilder {
  private static readonly BACKTICK = '`'

  // MySQL usa backticks para escapar identifiers (tablas, campos)
  // evitando colisiones con palabras reservadas.
  // buildTable y buildFieldName son suficientes — buildRawFieldString los invoca
  // automáticamente al parsear notaciones 'tabla.campo' y 'FUNC(tabla.campo)'.

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

  protected buildFieldName(name: string, statement: Statement) {
    statement.sql += MysqlQueryBuilder.BACKTICK + name + MysqlQueryBuilder.BACKTICK
  }
}
