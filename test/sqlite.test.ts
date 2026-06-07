import { OrderByDirection, SqliteDataSource } from '../src'

describe('SQLite — CRUD completo', () => {
  let source: SqliteDataSource

  // ─── Setup ───────────────────────────────────────────────────────────────

  beforeAll(async () => {
    source = new SqliteDataSource()
    // :memory: por defecto — base de datos limpia en cada ejecución de tests

    await source.execute(`
      CREATE TABLE users (
        id      INTEGER PRIMARY KEY AUTOINCREMENT,
        name    TEXT    NOT NULL,
        email   TEXT    NOT NULL,
        age     INTEGER NOT NULL,
        active  INTEGER NOT NULL DEFAULT 1
      )
    `)

    await source.execute(`
      CREATE TABLE orders (
        id      INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        product TEXT    NOT NULL,
        amount  REAL    NOT NULL
      )
    `)
  })

  afterAll(async () => {
    await source.close()
  })

  // Limpia las tablas antes de cada test para que sean independientes
  beforeEach(async () => {
    await source.execute('DELETE FROM orders')
    await source.execute('DELETE FROM users')
  })

  // ─── Helper ──────────────────────────────────────────────────────────────

  async function seedUsers() {
    await source
      .table('users')
      .set('name', 'Alice')
      .set('email', 'alice@example.com')
      .set('age', 30)
      .set('active', 1)
      .insert()
    await source
      .table('users')
      .set('name', 'Bob')
      .set('email', 'bob@example.com')
      .set('age', 25)
      .set('active', 1)
      .insert()
    await source
      .table('users')
      .set('name', 'Charlie')
      .set('email', 'charlie@example.com')
      .set('age', 35)
      .set('active', 0)
      .insert()
  }

  // Inserta órdenes asociadas a los usuarios ya persistidos
  async function seedOrders() {
    const alice = await source.table('users').where('name', 'Alice').first()
    const bob = await source.table('users').where('name', 'Bob').first()

    await source.table('orders').set('user_id', alice!.id).set('product', 'Widget').set('amount', 9.99).insert()
    await source.table('orders').set('user_id', alice!.id).set('product', 'Gadget').set('amount', 24.99).insert()
    await source.table('orders').set('user_id', bob!.id).set('product', 'Doohickey').set('amount', 4.99).insert()
    // Charlie no tiene órdenes
  }

  // ─── INSERT ──────────────────────────────────────────────────────────────

  describe('INSERT', () => {
    it('inserta un registro y retorna 1 fila afectada', async () => {
      const changes = await source
        .table('users')
        .set('name', 'Alice')
        .set('email', 'alice@example.com')
        .set('age', 30)
        .insert()

      expect(changes).toBe(1)
    })

    it('inserta múltiples registros y los persiste todos', async () => {
      await seedUsers()

      const users = await source.table('users').find()

      expect(users).toHaveLength(3)
    })
  })

  // ─── SELECT ──────────────────────────────────────────────────────────────

  describe('SELECT', () => {
    beforeEach(async () => {
      await seedUsers()
    })

    // ── Básico ──────────────────────────────────────────────────────────────

    describe('Básico', () => {
      it('retorna todos los registros', async () => {
        const users = await source.table('users').find()

        expect(users).toHaveLength(3)
      })

      it('retorna campos seleccionados con select()', async () => {
        const users = await source.table('users').select('name', 'age').find()

        expect(users).toHaveLength(3)
        expect(Object.keys(users[0])).toEqual(['name', 'age'])
      })

      it('retorna campo con alias', async () => {
        const users = await source.table('users').select({ name: 'name', alias: 'nombre' }).find()

        expect(users[0].nombre).toBeDefined()
        expect(users[0].name).toBeUndefined()
      })

      it('retorna el primer registro con first()', async () => {
        const user = await source.table('users').orderBy('age').first()

        expect(user).not.toBeNull()
        expect(user!.name).toBe('Bob')
      })

      it('retorna null con first() cuando no hay resultados', async () => {
        const user = await source.table('users').where('name', 'Nadie').first()

        expect(user).toBeNull()
      })

      it('retorna resultados distintos con distinct()', async () => {
        // Hay dos valores posibles de active (0 y 1)
        const rows = await source.table('users').select('active').distinct().find()

        expect(rows).toHaveLength(2)
      })
    })

    // ── WHERE ────────────────────────────────────────────────────────────────

    describe('WHERE', () => {
      it('filtra con igualdad simple', async () => {
        const users = await source.table('users').where('active', 1).find()

        expect(users).toHaveLength(2)
      })

      it('filtra con operador de comparación (>)', async () => {
        const users = await source.table('users').where('age', '>', 28).find()

        expect(users).toHaveLength(2)
        expect(users.map((u: any) => u.name).sort()).toEqual(['Alice', 'Charlie'])
      })

      it('filtra con operador de comparación (<)', async () => {
        const users = await source.table('users').where('age', '<', 30).find()

        expect(users).toHaveLength(1)
        expect(users[0].name).toBe('Bob')
      })

      it('filtra con operador de comparación (<>)', async () => {
        const users = await source.table('users').where('active', '<>', 1).find()

        expect(users).toHaveLength(1)
        expect(users[0].name).toBe('Charlie')
      })

      it('filtra con múltiples condiciones AND', async () => {
        const users = await source.table('users').where('active', 1).where('age', '>', 26).find()

        expect(users).toHaveLength(1)
        expect(users[0].name).toBe('Alice')
      })

      it('filtra con OR WHERE', async () => {
        const users = await source.table('users').where('name', 'Alice').orWhere('name', 'Bob').find()

        expect(users).toHaveLength(2)
      })

      it('filtra con IN sobre lista de valores', async () => {
        const users = await source.table('users').where('age', 'in', [25, 35]).orderBy('age').find()

        expect(users).toHaveLength(2)
        expect(users[0].name).toBe('Bob')
        expect(users[1].name).toBe('Charlie')
      })

      it('filtra con IS NULL', async () => {
        // Ningún usuario tiene email null → resultado vacío
        const users = await source.table('users').where('email', null).find()

        expect(users).toHaveLength(0)
      })

      it('filtra con grupo de condiciones (paréntesis)', async () => {
        const { DB } = await import('../src')
        // (name = 'Alice' OR name = 'Bob') AND active = 1
        const users = await source
          .table('users')
          .where(DB.conditionGroup().with('name', 'Alice').orWith('name', 'Bob'))
          .where('active', 1)
          .find()

        expect(users).toHaveLength(2)
        expect(users.map((u: any) => u.name).sort()).toEqual(['Alice', 'Bob'])
      })
    })

    // ── ORDER BY ─────────────────────────────────────────────────────────────

    describe('ORDER BY', () => {
      it('ordena ASC por campo numérico', async () => {
        const users = await source.table('users').orderBy('age', OrderByDirection.ASC).find()

        expect(users[0].name).toBe('Bob')
        expect(users[2].name).toBe('Charlie')
      })

      it('ordena DESC por campo numérico', async () => {
        const users = await source.table('users').orderBy('age', OrderByDirection.DESC).find()

        expect(users[0].name).toBe('Charlie')
        expect(users[2].name).toBe('Bob')
      })

      it('ordena ASC por campo de texto', async () => {
        const users = await source.table('users').orderBy('name', OrderByDirection.ASC).find()

        expect(users[0].name).toBe('Alice')
        expect(users[2].name).toBe('Charlie')
      })

      it('ordena por múltiples campos', async () => {
        // Primero por active DESC, luego por age ASC
        const users = await source
          .table('users')
          .orderBy('active', OrderByDirection.DESC)
          .orderBy('age', OrderByDirection.ASC)
          .find()

        // active=1: Bob(25), Alice(30) → active=0: Charlie(35)
        expect(users[0].name).toBe('Bob')
        expect(users[1].name).toBe('Alice')
        expect(users[2].name).toBe('Charlie')
      })
    })

    // ── LIMIT / OFFSET ───────────────────────────────────────────────────────

    describe('LIMIT / OFFSET', () => {
      it('aplica LIMIT correctamente', async () => {
        const users = await source.table('users').orderBy('age').limit(2).find()

        expect(users).toHaveLength(2)
      })

      it('aplica LIMIT + OFFSET correctamente', async () => {
        // ordenados por age: Bob(25), Alice(30), Charlie(35)
        const users = await source.table('users').orderBy('age').limit(1).offset(1).find()

        expect(users).toHaveLength(1)
        expect(users[0].name).toBe('Alice')
      })

      it('OFFSET sin LIMIT retorna desde la posición indicada', async () => {
        const users = await source.table('users').orderBy('age').offset(2).find()

        expect(users).toHaveLength(1)
        expect(users[0].name).toBe('Charlie')
      })

      it('LIMIT mayor que los registros retorna todos', async () => {
        const users = await source.table('users').limit(100).find()

        expect(users).toHaveLength(3)
      })
    })

    // ── GROUP BY ────────────────────────────────────────────────────────────

    describe('GROUP BY', () => {
      it('agrupa por campo y cuenta registros', async () => {
        // active=0: Charlie (1 usuario) | active=1: Alice, Bob (2 usuarios)
        const groups = await source
          .table('users')
          .select('active', { name: 'id', function: 'count', alias: 'total' })
          .groupBy('active')
          .orderBy('active')
          .find()

        expect(groups).toHaveLength(2)
        expect(groups[0].active).toBe(0)
        expect(groups[0].total).toBe(1)
        expect(groups[1].active).toBe(1)
        expect(groups[1].total).toBe(2)
      })

      it('agrupa y suma un campo numérico', async () => {
        // Suma de edades por estado activo
        const groups = await source
          .table('users')
          .select('active', { name: 'age', function: 'sum', alias: 'total_age' })
          .groupBy('active')
          .orderBy('active')
          .find()

        expect(groups).toHaveLength(2)
        expect(groups[0].total_age).toBe(35) // Charlie (age=35, active=0)
        expect(groups[1].total_age).toBe(55) // Alice(30) + Bob(25) (active=1)
      })

      it('agrupa y calcula el promedio de un campo numérico', async () => {
        const groups = await source
          .table('users')
          .select('active', { name: 'age', function: 'avg', alias: 'avg_age' })
          .groupBy('active')
          .orderBy('active')
          .find()

        expect(groups).toHaveLength(2)
        expect(groups[0].avg_age).toBe(35) // Charlie
        expect(groups[1].avg_age).toBe(27.5) // (30 + 25) / 2
      })
    })

    // ── HAVING ──────────────────────────────────────────────────────────────

    describe('HAVING', () => {
      it('filtra grupos cuyo conteo supera un umbral', async () => {
        // Solo el grupo active=1 tiene más de 1 usuario
        const groups = await source
          .table('users')
          .select('active', { name: 'id', function: 'count', alias: 'total' })
          .groupBy('active')
          .having('COUNT(id)', '>', 1)
          .find()

        expect(groups).toHaveLength(1)
        expect(groups[0].active).toBe(1)
        expect(groups[0].total).toBe(2)
      })

      it('combina WHERE y HAVING', async () => {
        // Solo usuarios menores de 33 → Bob(25) y Alice(30), ambos active=1
        // WHERE age < 33: descarta a Charlie → quedan Alice y Bob en active=1
        // HAVING COUNT >= 2 → solo ese grupo pasa
        const groups = await source
          .table('users')
          .select('active', { name: 'id', function: 'count', alias: 'total' })
          .where('age', '<', 33)
          .groupBy('active')
          .having('COUNT(id)', '>=', 2)
          .find()

        expect(groups).toHaveLength(1)
        expect(groups[0].active).toBe(1)
        expect(groups[0].total).toBe(2)
      })
    })

    // ── JOINS ───────────────────────────────────────────────────────────────

    describe('JOINS', () => {
      beforeEach(async () => {
        await seedOrders()
      })

      it('INNER JOIN: retorna solo usuarios con órdenes', async () => {
        // Alice (2 órdenes) y Bob (1 orden) → Charlie excluido
        const rows = await source
          .table('users')
          .select({ name: 'name', table: 'users' }, { name: 'product', table: 'orders' })
          .innerJoin('orders', { name: 'id', table: 'users' }, { name: 'user_id', table: 'orders' })
          .orderBy({ name: 'name', table: 'users' })
          .find()

        expect(rows).toHaveLength(3) // Alice×2 + Bob×1
        expect(rows.map((r: any) => r.name).sort()).toEqual(['Alice', 'Alice', 'Bob'])
      })

      it('INNER JOIN con WHERE: filtra filas del resultado combinado', async () => {
        const rows = await source
          .table('users')
          .select({ name: 'name', table: 'users' }, { name: 'amount', table: 'orders' })
          .innerJoin('orders', { name: 'id', table: 'users' }, { name: 'user_id', table: 'orders' })
          .where({ name: 'amount', table: 'orders' }, '>', 10)
          .find()

        // Solo la orden de Alice con amount=24.99 supera 10
        expect(rows).toHaveLength(1)
        expect(rows[0].name).toBe('Alice')
        expect(rows[0].amount).toBe(24.99)
      })

      it('LEFT JOIN: incluye todos los usuarios, con o sin órdenes', async () => {
        const rows = await source
          .table('users')
          .select({ name: 'name', table: 'users' }, { name: 'product', table: 'orders' })
          .leftJoin('orders', { name: 'id', table: 'users' }, { name: 'user_id', table: 'orders' })
          .orderBy({ name: 'name', table: 'users' })
          .find()

        // Alice×2 + Bob×1 + Charlie×1(product=null)
        expect(rows).toHaveLength(4)

        const charlie = rows.find((r: any) => r.name === 'Charlie')

        expect(charlie).toBeDefined()
        expect(charlie!.product).toBeNull()
      })

      it('INNER JOIN con GROUP BY: total de órdenes por usuario', async () => {
        const rows = await source
          .table('users')
          .select(
            { name: 'name', table: 'users' },
            { name: 'id', table: 'orders', function: 'count', alias: 'order_count' }
          )
          .innerJoin('orders', { name: 'id', table: 'users' }, { name: 'user_id', table: 'orders' })
          .groupBy({ name: 'user_id', table: 'orders' })
          .orderBy({ name: 'name', table: 'users' })
          .find()

        expect(rows).toHaveLength(2) // Alice y Bob (Charlie no tiene órdenes)
        expect(rows[0].name).toBe('Alice')
        expect(rows[0].order_count).toBe(2)
        expect(rows[1].name).toBe('Bob')
        expect(rows[1].order_count).toBe(1)
      })
    })
  })

  // ─── UPDATE ──────────────────────────────────────────────────────────────

  describe('UPDATE', () => {
    beforeEach(async () => {
      await seedUsers()
    })

    it('actualiza un registro específico con WHERE', async () => {
      const changes = await source.table('users').set('age', 31).where('name', 'Alice').update()

      expect(changes).toBe(1)

      const user = await source.table('users').where('name', 'Alice').first()

      expect(user!.age).toBe(31)
    })

    it('actualiza múltiples campos a la vez', async () => {
      await source.table('users').set('age', 26).set('active', 0).where('name', 'Bob').update()

      const user = await source.table('users').where('name', 'Bob').first()

      expect(user!.age).toBe(26)
      expect(user!.active).toBe(0)
    })

    it('actualiza todos los registros cuando no hay WHERE', async () => {
      const changes = await source.table('users').set('active', 0).update()

      expect(changes).toBe(3)

      const activeUsers = await source.table('users').where('active', 1).find()

      expect(activeUsers).toHaveLength(0)
    })
  })

  // ─── DELETE ──────────────────────────────────────────────────────────────

  describe('DELETE', () => {
    beforeEach(async () => {
      await seedUsers()
    })

    it('elimina un registro con WHERE', async () => {
      const changes = await source.table('users').where('name', 'Bob').delete()

      expect(changes).toBe(1)

      const users = await source.table('users').find()

      expect(users).toHaveLength(2)
      expect(users.find((u: any) => u.name === 'Bob')).toBeUndefined()
    })

    it('elimina múltiples registros con WHERE', async () => {
      const changes = await source.table('users').where('active', 1).delete()

      expect(changes).toBe(2)
    })

    it('elimina todos los registros sin WHERE', async () => {
      const changes = await source.table('users').delete()

      expect(changes).toBe(3)

      const users = await source.table('users').find()

      expect(users).toHaveLength(0)
    })
  })

  // ─── TRANSACTIONS ────────────────────────────────────────────────────────

  describe('TRANSACTIONS', () => {
    beforeEach(async () => {
      await source.table('users').set('name', 'Alice').set('email', 'alice@example.com').set('age', 30).insert()
    })

    it('commit: los cambios persisten después de confirmar', async () => {
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

    it('rollback: los cambios se revierten al hacer rollback', async () => {
      const conn = await source.getConnection()

      try {
        await conn.beginTransaction()
        await conn.execute('INSERT INTO users (name, email, age) VALUES (?, ?, ?)', [
          'Charlie',
          'charlie@example.com',
          35
        ])
        await conn.rollbackTransaction()
      } finally {
        await conn.close()
      }

      const users = await source.table('users').find()

      expect(users).toHaveLength(1)
    })

    it('executeTransaction: commit automático al completar sin errores', async () => {
      const conn = await source.getConnection()

      await conn.executeTransaction(async (c) => {
        await c.execute('INSERT INTO users (name, email, age) VALUES (?, ?, ?)', ['Bob', 'bob@example.com', 25])
        await c.execute('INSERT INTO users (name, email, age) VALUES (?, ?, ?)', ['Charlie', 'charlie@example.com', 35])
      })

      await conn.close()

      const users = await source.table('users').find()

      expect(users).toHaveLength(3)
    })

    it('executeTransaction: rollback automático al lanzar un error', async () => {
      const conn = await source.getConnection()

      try {
        await conn.executeTransaction(async (c) => {
          await c.execute('INSERT INTO users (name, email, age) VALUES (?, ?, ?)', ['Bob', 'bob@example.com', 25])
          throw new Error('Error simulado')
        })
      } catch {
        // error esperado
      } finally {
        await conn.close()
      }

      const users = await source.table('users').find()

      // Solo Alice (la de beforeEach) debe existir
      expect(users).toHaveLength(1)
    })
  })
})
