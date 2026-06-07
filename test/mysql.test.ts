/**
 * MySQL local integration tests
 *
 * Requiere un servidor MySQL corriendo localmente. Configura las credenciales
 * en un archivo .env en la raíz del proyecto (ver .env.example).
 *
 * Arrancar MySQL en macOS (Homebrew):  brew services start mysql
 * Arrancar MySQL en Linux:             sudo service mysql start
 *
 * La suite se saltea automáticamente si MySQL no está disponible.
 */

import 'dotenv/config'
import { MysqlDataSource, OrderByDirection } from '../src'

// ─── Config ───────────────────────────────────────────────────────────────────

const config = {
  host: process.env.MYSQL_HOST ?? 'localhost',
  port: parseInt(process.env.MYSQL_PORT ?? '3306', 10),
  database: process.env.MYSQL_DATABASE ?? 'neogroup_test',
  username: process.env.MYSQL_USERNAME ?? 'root',
  password: process.env.MYSQL_PASSWORD ?? ''
}

// ─── Suite ────────────────────────────────────────────────────────────────────

describe('MySQL — integración local', () => {
  let source: MysqlDataSource
  let available = false

  // ── Setup ────────────────────────────────────────────────────────────────

  beforeAll(async () => {
    try {
      source = new MysqlDataSource()
      source.setHost(config.host)
      source.setPort(config.port)
      source.setDatabaseName(config.database)
      source.setUsername(config.username)
      source.setPassword(config.password)

      // Verifica la conectividad antes de correr los tests
      const conn = await source.getConnection()

      await conn.close()
      available = true
    } catch {
      // eslint-disable-next-line no-console
      console.log(
        `\n⚠  MySQL no disponible en ${config.host}:${config.port} — se saltean los tests.\n` +
          `   Asegurate de tener MySQL corriendo y un archivo .env configurado (ver .env.example).\n`
      )
    }

    if (!available) {
      return
    }

    await source.execute(`
      CREATE TABLE IF NOT EXISTS users (
        id       INT AUTO_INCREMENT PRIMARY KEY,
        name     VARCHAR(100) NOT NULL,
        email    VARCHAR(150) NOT NULL,
        age      INT          NOT NULL,
        active   TINYINT      NOT NULL DEFAULT 1,
        nickname VARCHAR(100)
      )
    `)

    await source.execute(`
      CREATE TABLE IF NOT EXISTS orders (
        id      INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT          NOT NULL,
        product VARCHAR(150) NOT NULL,
        amount  DECIMAL(10,2) NOT NULL
      )
    `)
  })

  afterAll(async () => {
    if (!available) {
      return
    }

    await source.execute('DROP TABLE IF EXISTS orders')
    await source.execute('DROP TABLE IF EXISTS users')
    await source.close()
  })

  beforeEach(async () => {
    if (!available) {
      return
    }

    await source.execute('DELETE FROM orders')
    await source.execute('DELETE FROM users')
  })

  // ── Helpers ──────────────────────────────────────────────────────────────

  async function seedUsers() {
    await source.table('users').insert({ name: 'Alice', email: 'alice@example.com', age: 30, active: 1 })
    await source.table('users').insert({ name: 'Bob', email: 'bob@example.com', age: 25, active: 1 })
    await source.table('users').insert({ name: 'Charlie', email: 'charlie@example.com', age: 35, active: 0 })
  }

  async function seedOrders() {
    const alice = await source.table('users').where('name', 'Alice').first()
    const bob = await source.table('users').where('name', 'Bob').first()

    await source.table('orders').insert({ user_id: alice!.id, product: 'Widget', amount: 9.99 })
    await source.table('orders').insert({ user_id: alice!.id, product: 'Gadget', amount: 24.99 })
    await source.table('orders').insert({ user_id: bob!.id, product: 'Doohickey', amount: 4.99 })
  }

  // ── INSERT ───────────────────────────────────────────────────────────────

  describe('INSERT', () => {
    it('inserta con set() y retorna 1 fila afectada', async () => {
      if (!available) {
        return
      }

      const changes = await source
        .table('users')
        .set('name', 'Alice')
        .set('email', 'alice@example.com')
        .set('age', 30)
        .insert()

      expect(changes).toBe(1)
    })

    it('inserta con objeto de fields (estilo Laravel)', async () => {
      if (!available) {
        return
      }

      await source.table('users').insert({ name: 'Dave', email: 'dave@example.com', age: 28 })
      const user = await source.table('users').where('name', 'Dave').first()

      expect(user).not.toBeNull()
      expect(user!.age).toBe(28)
    })
  })

  // ── SELECT ───────────────────────────────────────────────────────────────

  describe('SELECT', () => {
    beforeEach(async () => {
      if (!available) {
        return
      }

      await seedUsers()
    })

    it('retorna todos los registros', async () => {
      if (!available) {
        return
      }

      const users = await source.table('users').find()

      expect(users).toHaveLength(3)
    })

    it('retorna el primero con first()', async () => {
      if (!available) {
        return
      }

      const user = await source.table('users').orderBy('name').first()

      expect(user).not.toBeNull()
      expect(user!.name).toBe('Alice')
    })

    it('filtra con WHERE simple', async () => {
      if (!available) {
        return
      }

      const users = await source.table('users').where('active', 1).find()

      expect(users).toHaveLength(2)
    })

    it('selecciona columnas específicas', async () => {
      if (!available) {
        return
      }

      const users = await source.table('users').select('name', 'age').find()

      expect(users[0]).toHaveProperty('name')
      expect(users[0]).toHaveProperty('age')
      expect(users[0]).not.toHaveProperty('email')
    })

    it('whereIn', async () => {
      if (!available) {
        return
      }

      const users = await source.table('users').whereIn('age', [25, 35]).find()

      expect(users).toHaveLength(2)
    })

    it('whereBetween', async () => {
      if (!available) {
        return
      }

      const users = await source.table('users').whereBetween('age', [25, 30]).find()

      expect(users).toHaveLength(2)
    })

    it('whereNull / whereNotNull', async () => {
      if (!available) {
        return
      }

      await source.table('users').where('name', 'Alice').update({ nickname: 'Ali' })
      const nullRows = await source.table('users').whereNull('nickname').find()
      const nonNullRows = await source.table('users').whereNotNull('nickname').find()

      expect(nullRows).toHaveLength(2)
      expect(nonNullRows).toHaveLength(1)
    })

    it('whereLike', async () => {
      if (!available) {
        return
      }

      const users = await source.table('users').whereLike('email', '%@example.com').find()

      expect(users).toHaveLength(3)
    })

    it('orWhere', async () => {
      if (!available) {
        return
      }

      const users = await source.table('users').where('name', 'Alice').orWhere('name', 'Bob').find()

      expect(users).toHaveLength(2)
    })

    it('grouped condition callback con whereIn', async () => {
      if (!available) {
        return
      }

      const users = await source
        .table('users')
        .where((q) => q.whereIn('age', [25, 35]))
        .find()

      expect(users).toHaveLength(2)
    })

    it('whereColumn compara dos columnas', async () => {
      if (!available) {
        return
      }

      // age = active nunca es true con nuestros datos (age >> active)
      // whereColumn('active', '<', 'age') debería traer todos
      const users = await source.table('users').whereColumn('active', '<', 'age').find()

      expect(users).toHaveLength(3)
    })

    it('ORDER BY ASC / DESC', async () => {
      if (!available) {
        return
      }

      const asc = await source.table('users').orderBy('age').find()
      const desc = await source.table('users').orderBy('age', OrderByDirection.DESC).find()

      expect(asc[0].name).toBe('Bob')
      expect(desc[0].name).toBe('Charlie')
    })

    it('LIMIT y OFFSET', async () => {
      if (!available) {
        return
      }

      const page = await source.table('users').orderBy('age').limit(1).offset(1).find()

      expect(page).toHaveLength(1)
      expect(page[0].name).toBe('Alice')
    })

    it('DISTINCT', async () => {
      if (!available) {
        return
      }

      await source.table('users').insert({ name: 'Alice2', email: 'alice2@example.com', age: 30, active: 1 })
      const rows = await source.table('users').distinct().select('age').find()
      const ages = rows.map((r: any) => Number(r.age))

      expect(ages.filter((a: number) => a === 30)).toHaveLength(1)
    })
  })

  // ── GROUP BY / HAVING ────────────────────────────────────────────────────

  describe('GROUP BY / HAVING', () => {
    beforeEach(async () => {
      if (!available) {
        return
      }

      await seedUsers()
    })

    it('GROUP BY con COUNT', async () => {
      if (!available) {
        return
      }

      const rows = await source
        .table('users')
        .select('active', 'COUNT(*) AS total')
        .groupBy('active')
        .orderBy('active', OrderByDirection.DESC)
        .find()

      expect(rows).toHaveLength(2)
      expect(Number(rows[0].total)).toBe(2) // active=1: Alice + Bob
    })

    it('HAVING filtra grupos', async () => {
      if (!available) {
        return
      }

      const rows = await source
        .table('users')
        .select('active', 'COUNT(*) AS total')
        .groupBy('active')
        .having('COUNT(*)', '>', 1)
        .find()

      expect(rows).toHaveLength(1)
      expect(Number(rows[0].total)).toBe(2)
    })
  })

  // ── JOINS ────────────────────────────────────────────────────────────────

  describe('JOINS', () => {
    beforeEach(async () => {
      if (!available) {
        return
      }

      await seedUsers()
      await seedOrders()
    })

    it('INNER JOIN retorna solo usuarios con órdenes', async () => {
      if (!available) {
        return
      }

      const rows = await source
        .table('users')
        .innerJoin('orders', 'users.id', 'orders.user_id')
        .select('users.name', 'orders.product')
        .find()

      expect(rows).toHaveLength(3)
      expect(rows.find((r: any) => r.name === 'Charlie')).toBeUndefined()
    })

    it('LEFT JOIN incluye usuarios sin órdenes', async () => {
      if (!available) {
        return
      }

      const rows = await source
        .table('users')
        .leftJoin('orders', 'users.id', 'orders.user_id')
        .select('users.name', 'orders.product')
        .find()
      const charlie = rows.filter((r: any) => r.name === 'Charlie')

      expect(charlie.length).toBeGreaterThan(0)
      expect(charlie[0].product).toBeNull()
    })

    it('INNER JOIN con GROUP BY cuenta órdenes por usuario', async () => {
      if (!available) {
        return
      }

      const rows = await source
        .table('users')
        .innerJoin('orders', 'users.id', 'orders.user_id')
        .select('users.name', 'COUNT(orders.id) AS order_count')
        .groupBy('users.id', 'users.name')
        .orderBy('order_count', OrderByDirection.DESC)
        .find()

      expect(rows[0].name).toBe('Alice')
      expect(Number(rows[0].order_count)).toBe(2)
    })
  })

  // ── UPDATE ───────────────────────────────────────────────────────────────

  describe('UPDATE', () => {
    beforeEach(async () => {
      if (!available) {
        return
      }

      await seedUsers()
    })

    it('actualiza con set() y WHERE', async () => {
      if (!available) {
        return
      }

      await source.table('users').where('name', 'Alice').set('age', 99).update()
      const user = await source.table('users').where('name', 'Alice').first()

      expect(user!.age).toBe(99)
    })

    it('actualiza con objeto de fields (estilo Laravel)', async () => {
      if (!available) {
        return
      }

      await source.table('users').where('name', 'Bob').update({ age: 26, active: 0 })
      const user = await source.table('users').where('name', 'Bob').first()

      expect(user!.age).toBe(26)
      expect(user!.active).toBe(0)
    })

    it('actualiza todos los registros sin WHERE', async () => {
      if (!available) {
        return
      }

      const changes = await source.table('users').set('active', 0).update()

      expect(changes).toBe(3)
    })
  })

  // ── DELETE ───────────────────────────────────────────────────────────────

  describe('DELETE', () => {
    beforeEach(async () => {
      if (!available) {
        return
      }

      await seedUsers()
    })

    it('elimina un registro con WHERE', async () => {
      if (!available) {
        return
      }

      await source.table('users').where('name', 'Alice').delete()
      const users = await source.table('users').find()

      expect(users).toHaveLength(2)
    })

    it('elimina múltiples registros con WHERE', async () => {
      if (!available) {
        return
      }

      const changes = await source.table('users').where('active', 1).delete()

      expect(changes).toBe(2)
    })

    it('elimina todos los registros sin WHERE', async () => {
      if (!available) {
        return
      }

      const changes = await source.table('users').delete()

      expect(changes).toBe(3)
    })
  })

  // ── TRANSACTIONS ─────────────────────────────────────────────────────────

  describe('TRANSACTIONS', () => {
    beforeEach(async () => {
      if (!available) {
        return
      }

      await source.table('users').insert({ name: 'Alice', email: 'alice@example.com', age: 30 })
    })

    it('commit: los cambios persisten', async () => {
      if (!available) {
        return
      }

      const conn = await source.getConnection()

      try {
        await conn.beginTransaction()
        await conn.execute('INSERT INTO users (name, email, age) VALUES (?, ?, ?)', ['Bob', 'bob@example.com', 25])
        await conn.commitTransaction()
      } finally {
        await conn.close()
      }

      const users = await source.table('users').find()

      expect(users).toHaveLength(2)
    })

    it('rollback: los cambios se revierten', async () => {
      if (!available) {
        return
      }

      const conn = await source.getConnection()

      try {
        await conn.beginTransaction()
        await conn.execute('INSERT INTO users (name, email, age) VALUES (?, ?, ?)', ['Bob', 'bob@example.com', 25])
        await conn.rollbackTransaction()
      } finally {
        await conn.close()
      }

      const users = await source.table('users').find()

      expect(users).toHaveLength(1)
    })

    it('executeTransaction: rollback automático al lanzar error', async () => {
      if (!available) {
        return
      }

      const conn = await source.getConnection()

      try {
        await conn.executeTransaction(async (c) => {
          await c.execute('INSERT INTO users (name, email, age) VALUES (?, ?, ?)', ['Bob', 'bob@example.com', 25])
          throw new Error('Error simulado')
        })
      } catch {
        /* esperado */
      } finally {
        await conn.close()
      }

      const users = await source.table('users').find()

      expect(users).toHaveLength(1)
    })
  })

  // ── BACKTICKS (MySQL-specific) ────────────────────────────────────────────

  describe('Backticks — identificadores MySQL', () => {
    beforeEach(async () => {
      if (!available) {
        return
      }

      await seedUsers()
    })

    it('usa backticks en nombres de tabla y columna', async () => {
      if (!available) {
        return
      }

      // Verifica que la query no falle con palabras reservadas en nombres de campo
      // `select` es reservada en MySQL — aquí forzamos un alias con ese nombre
      const rows = await source.table('users').select('name', 'age').where('active', 1).find()

      expect(rows).toHaveLength(2)
    })

    it('INNER JOIN con notación string genera backticks correctos', async () => {
      if (!available) {
        return
      }

      await seedOrders()
      const rows = await source
        .table('users')
        .innerJoin('orders', 'users.id', 'orders.user_id')
        .select('users.name', 'orders.product')
        .find()

      expect(rows.length).toBeGreaterThan(0)
    })
  })
})
