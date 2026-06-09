import {
  BelongsTo,
  Column,
  DB,
  HasMany,
  HasManyThrough,
  HasOne,
  HasOneThrough,
  PrimaryKey,
  Resource,
  SqliteDataSource
} from '../src'

// ─── Model definitions (decorator style — no base class) ─────────────────────

@Resource({ table: 'countries' })
class Country {
  @PrimaryKey()
  id!: number

  @Column()
  name!: string

  @Column()
  code!: string

  @HasMany(() => User, 'countryId')
  users?: User[]

  @HasManyThrough(() => Order, () => User, 'userId', 'countryId')
  orders?: Order[]
}

@Resource()
class User {
  @PrimaryKey()
  id!: number

  @Column()
  name!: string

  @Column()
  email!: string

  @Column({ cast: 'number' })
  age!: number

  @Column({ cast: 'boolean' })
  active!: boolean

  @Column()
  countryId!: number

  @BelongsTo(() => Country, 'countryId')
  country?: Country

  @HasOne(() => Profile, 'userId')
  profile?: Profile | null

  @HasMany(() => Order, 'userId')
  orders?: Order[]

  @HasOneThrough(() => ShippingAddress, () => Profile, 'profileId', 'userId')
  shippingAddress?: ShippingAddress

  get label(): string {
    return `${this.name} <${this.email}>`
  }
}

@Resource()
class Profile {
  @PrimaryKey()
  id!: number

  @Column()
  userId!: number

  @Column()
  bio!: string

  @BelongsTo(() => User, 'userId')
  user?: User
}

@Resource()
class Order {
  @PrimaryKey()
  id!: number

  @Column()
  userId!: number

  @Column()
  product!: string

  @Column({ cast: 'number' })
  amount!: number

  @BelongsTo(() => User, 'userId')
  user?: User
}

@Resource({ table: 'shipping_addresses' })
class ShippingAddress {
  @PrimaryKey()
  id!: number

  @Column()
  profileId!: number

  @Column()
  street!: string

  @BelongsTo(() => Profile, 'profileId')
  profile?: Profile
}

// ─── Cast the decorated classes so TypeScript sees injected static methods ────
// @Resource wraps the class and injects static query methods at runtime;
// these casts tell TypeScript what methods exist.
const UserModel = User as any
const CountryModel = Country as any
const OrderModel = Order as any

// ─── Suite ───────────────────────────────────────────────────────────────────

describe('Resources (Active Record — decorator style)', () => {
  let source: SqliteDataSource

  beforeAll(async () => {
    source = new SqliteDataSource()

    await source.execute(`
      CREATE TABLE countries (
        id   INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        code TEXT NOT NULL
      )
    `)
    await source.execute(`
      CREATE TABLE users (
        id        INTEGER PRIMARY KEY AUTOINCREMENT,
        name      TEXT    NOT NULL,
        email     TEXT    NOT NULL,
        age       INTEGER NOT NULL,
        active    INTEGER NOT NULL DEFAULT 1,
        countryId INTEGER
      )
    `)
    await source.execute(`
      CREATE TABLE profiles (
        id     INTEGER PRIMARY KEY AUTOINCREMENT,
        userId INTEGER NOT NULL,
        bio    TEXT    NOT NULL DEFAULT ''
      )
    `)
    await source.execute(`
      CREATE TABLE orders (
        id      INTEGER PRIMARY KEY AUTOINCREMENT,
        userId  INTEGER NOT NULL,
        product TEXT    NOT NULL,
        amount  REAL    NOT NULL
      )
    `)
    await source.execute(`
      CREATE TABLE shipping_addresses (
        id        INTEGER PRIMARY KEY AUTOINCREMENT,
        profileId INTEGER NOT NULL,
        street    TEXT    NOT NULL
      )
    `)

    DB.register(source)
  })

  afterAll(async () => {
    await source.close()
  })

  beforeEach(async () => {
    await source.execute('DELETE FROM shipping_addresses')
    await source.execute('DELETE FROM orders')
    await source.execute('DELETE FROM profiles')
    await source.execute('DELETE FROM users')
    await source.execute('DELETE FROM countries')
  })

  // ─── Helpers ─────────────────────────────────────────────────────────────

  async function seedCountries() {
    await source.execute(`INSERT INTO countries (name, code) VALUES ('Argentina', 'AR')`)
    await source.execute(`INSERT INTO countries (name, code) VALUES ('Brazil', 'BR')`)
  }

  async function seedUsers() {
    const ar = await source.table('countries').where('code', 'AR').first()
    const br = await source.table('countries').where('code', 'BR').first()

    await source.execute(
      `INSERT INTO users (name, email, age, active, countryId) VALUES ('Alice', 'alice@example.com', 30, 1, ?)`,
      [ar!.id]
    )
    await source.execute(
      `INSERT INTO users (name, email, age, active, countryId) VALUES ('Bob', 'bob@example.com', 25, 1, ?)`,
      [ar!.id]
    )
    await source.execute(
      `INSERT INTO users (name, email, age, active, countryId) VALUES ('Charlie', 'charlie@example.com', 35, 0, ?)`,
      [br!.id]
    )
  }

  async function seedRelated() {
    const alice = await source.table('users').where('name', 'Alice').first()
    const bob = await source.table('users').where('name', 'Bob').first()

    await source.execute(`INSERT INTO profiles (userId, bio) VALUES (?, 'Alice bio')`, [alice!.id])
    await source.execute(`INSERT INTO profiles (userId, bio) VALUES (?, 'Bob bio')`, [bob!.id])
    const aliceProfile = await source.table('profiles').where('userId', alice!.id).first()

    await source.execute(`INSERT INTO shipping_addresses (profileId, street) VALUES (?, '123 Main St')`, [
      aliceProfile!.id
    ])
    await source.execute(`INSERT INTO orders (userId, product, amount) VALUES (?, 'Widget',    9.99)`, [alice!.id])
    await source.execute(`INSERT INTO orders (userId, product, amount) VALUES (?, 'Gadget',   24.99)`, [alice!.id])
    await source.execute(`INSERT INTO orders (userId, product, amount) VALUES (?, 'Doohickey', 4.99)`, [bob!.id])
  }

  // ─── Decorator metadata ───────────────────────────────────────────────────

  describe('Decorator metadata', () => {
    it('@Resource setea table name por defecto (lowercase + s)', () => {
      expect(UserModel.table).toBe('users') // User → users
      expect(OrderModel.table).toBe('orders') // Order → orders
    })

    it('@Resource respeta table name explícito', () => {
      expect(CountryModel.table).toBe('countries')
    })

    it('@Column registra los fields', () => {
      expect(UserModel.fields).toContain('name')
      expect(UserModel.fields).toContain('email')
      expect(UserModel.fields).toContain('age')
    })

    it('@Column con cast registra el cast correctamente', () => {
      expect(UserModel.casts['age']).toBe('number')
      expect(UserModel.casts['active']).toBe('boolean')
    })

    it('@PrimaryKey setea el primaryKey', () => {
      expect(UserModel.primaryKey).toBe('id')
    })

    it('@HasMany registra la relación correctamente', () => {
      expect(UserModel.relationships['orders']).toBeDefined()
      expect(UserModel.relationships['orders'].type).toBe('hasMany')
    })

    it('@BelongsTo registra la relación correctamente', () => {
      expect(UserModel.relationships['country']).toBeDefined()
      expect(UserModel.relationships['country'].type).toBe('belongsTo')
    })

    it('@HasOne registra la relación correctamente', () => {
      expect(UserModel.relationships['profile']).toBeDefined()
      expect(UserModel.relationships['profile'].type).toBe('hasOne')
    })
  })

  // ─── Hydration & casts ───────────────────────────────────────────────────

  describe('Hydration & casts', () => {
    beforeEach(async () => {
      await seedCountries()
      await seedUsers()
    })

    it('retorna instancias de la clase decorada', async () => {
      const users = await UserModel.get()

      expect(users[0]).toBeInstanceOf(User)
    })

    it('aplica cast number al campo age', async () => {
      const user = await UserModel.where('name', 'Alice').first()

      expect(typeof user.age).toBe('number')
      expect(user.age).toBe(30)
    })

    it('aplica cast boolean: 1 → true, 0 → false', async () => {
      const alice = await UserModel.where('name', 'Alice').first()
      const charlie = await UserModel.where('name', 'Charlie').first()

      expect(alice.active).toBe(true)
      expect(charlie.active).toBe(false)
    })

    it('los getters de la clase funcionan sin @Attribute', async () => {
      const user = await UserModel.where('name', 'Alice').first()

      expect(user.label).toBe('Alice <alice@example.com>')
    })
  })

  // ─── Static query methods ─────────────────────────────────────────────────

  describe('Querying', () => {
    beforeEach(async () => {
      await seedCountries()
      await seedUsers()
    })

    it('get() retorna todos los registros', async () => {
      const users = await UserModel.get()

      expect(users).toHaveLength(3)
    })

    it('find(id) retorna el recurso por PK', async () => {
      const all = await UserModel.get()
      const user = await UserModel.find(all[0].id)

      expect(user).toBeInstanceOf(User)
      expect(user.id).toBe(all[0].id)
    })

    it('find(id) retorna null si no existe', async () => {
      expect(await UserModel.find(99999)).toBeNull()
    })

    it('first() retorna el primer recurso', async () => {
      expect(await UserModel.first()).toBeInstanceOf(User)
    })

    it('where() filtra por igualdad', async () => {
      const users = await UserModel.where('name', 'Alice').get()

      expect(users).toHaveLength(1)
      expect(users[0].name).toBe('Alice')
    })

    it('whereIn() filtra por lista', async () => {
      const users = await UserModel.whereIn('name', ['Alice', 'Bob']).get()

      expect(users).toHaveLength(2)
    })

    it('whereNotIn() excluye valores de la lista', async () => {
      const users = await UserModel.whereNotIn('name', ['Charlie']).get()

      expect(users).toHaveLength(2)
    })

    it('whereBetween() filtra por rango', async () => {
      const users = await UserModel.whereBetween('age', [25, 30]).get()

      expect(users).toHaveLength(2)
    })

    it('whereNull() y whereNotNull()', async () => {
      const nullCo = await UserModel.whereNull('countryId').get()
      const notNullCo = await UserModel.whereNotNull('countryId').get()

      expect(nullCo).toHaveLength(0)
      expect(notNullCo).toHaveLength(3)
    })

    it('orderBy() ordena correctamente', async () => {
      const users = await UserModel.orderBy('name').get()

      expect(users.map((u: any) => u.name)).toEqual(['Alice', 'Bob', 'Charlie'])
    })

    it('limit() y offset() paginan', async () => {
      const all = await UserModel.orderBy('name').get()
      const paged = await UserModel.orderBy('name').limit(2).offset(1).get()

      expect(paged).toHaveLength(2)
      expect(paged[0].name).toBe(all[1].name)
    })

    it('encadena where() consecutivos (AND implícito)', async () => {
      const users = await UserModel.where('active', 1).where('age', '>', 26).get()

      expect(users).toHaveLength(1)
      expect(users[0].name).toBe('Alice')
    })
  })

  // ─── save() — INSERT ──────────────────────────────────────────────────────

  describe('save() — INSERT', () => {
    it('inserta y setea el PK automáticamente', async () => {
      const user = new User() as any

      user.name = 'Dave'
      user.email = 'dave@example.com'
      user.age = 28
      user.active = 1
      await user.save()

      expect(user.id).toBeGreaterThan(0)
      const found = await UserModel.find(user.id)

      expect(found.name).toBe('Dave')
    })

    it('PKs de inserts consecutivos son distintos e incrementales', async () => {
      const u1 = new User() as any

      u1.name = 'E1'
      u1.email = 'e1@x.com'
      u1.age = 20
      u1.active = 1
      const u2 = new User() as any

      u2.name = 'E2'
      u2.email = 'e2@x.com'
      u2.age = 21
      u2.active = 1
      await u1.save()
      await u2.save()
      expect(u2.id).toBeGreaterThan(u1.id)
    })
  })

  // ─── save() — UPDATE ──────────────────────────────────────────────────────

  describe('save() — UPDATE', () => {
    it('actualiza un registro existente', async () => {
      const user = new User() as any

      user.name = 'Frank'
      user.email = 'frank@example.com'
      user.age = 40
      user.active = 1
      await user.save()
      user.name = 'Frank Updated'
      await user.save()

      const found = await UserModel.find(user.id)

      expect(found.name).toBe('Frank Updated')
    })

    it('no cambia el PK al actualizar', async () => {
      const user = new User() as any

      user.name = 'Grace'
      user.email = 'grace@example.com'
      user.age = 22
      user.active = 0
      await user.save()
      const originalId = user.id

      user.age = 23
      await user.save()
      expect(user.id).toBe(originalId)
    })
  })

  // ─── delete() ────────────────────────────────────────────────────────────

  describe('delete()', () => {
    it('elimina el registro', async () => {
      const user = new User() as any

      user.name = 'ToDelete'
      user.email = 'del@x.com'
      user.age = 99
      user.active = 1
      await user.save()
      const id = user.id

      await user.delete()
      expect(await UserModel.find(id)).toBeNull()
    })

    it('lanza error si no tiene PK', async () => {
      const user = new User() as any

      await expect(user.delete()).rejects.toThrow()
    })
  })

  // ─── Eager loading — with() ───────────────────────────────────────────────

  describe('Eager loading — with()', () => {
    beforeEach(async () => {
      await seedCountries()
      await seedUsers()
      await seedRelated()
    })

    it('hasMany: carga órdenes del usuario', async () => {
      const users = await UserModel.where('name', 'Alice').with('orders').get()

      expect(users[0].orders).toHaveLength(2)
      expect(users[0].orders[0]).toBeInstanceOf(Order)
    })

    it('hasMany: array vacío cuando no hay relacionados', async () => {
      const users = await UserModel.where('name', 'Charlie').with('orders').get()

      expect(users[0].orders).toEqual([])
    })

    it('hasOne: carga el profile del usuario', async () => {
      const users = await UserModel.where('name', 'Alice').with('profile').get()

      expect(users[0].profile).toBeInstanceOf(Profile)
      expect(users[0].profile.bio).toBe('Alice bio')
    })

    it('hasOne: null cuando no hay relacionado', async () => {
      const users = await UserModel.where('name', 'Charlie').with('profile').get()

      expect(users[0].profile).toBeNull()
    })

    it('belongsTo: carga el country del usuario', async () => {
      const users = await UserModel.where('name', 'Alice').with('country').get()

      expect(users[0].country).toBeInstanceOf(Country)
      expect(users[0].country.code).toBe('AR')
    })

    it('carga múltiples relaciones a la vez', async () => {
      const users = await UserModel.where('name', 'Alice').with('orders', 'profile').get()

      expect(users[0].orders).toHaveLength(2)
      expect(users[0].profile).toBeInstanceOf(Profile)
    })

    it('distribuye correctamente entre todos los registros', async () => {
      const users = await UserModel.with('orders').get()
      const alice = users.find((u: any) => u.name === 'Alice')
      const bob = users.find((u: any) => u.name === 'Bob')
      const charlie = users.find((u: any) => u.name === 'Charlie')

      expect(alice.orders).toHaveLength(2)
      expect(bob.orders).toHaveLength(1)
      expect(charlie.orders).toHaveLength(0)
    })

    it('dot-notation: carga relaciones anidadas', async () => {
      const orders = await OrderModel.with('user.country').get()
      const widget = orders.find((o: any) => o.product === 'Widget')

      expect(widget.user).toBeInstanceOf(User)
      expect(widget.user.country).toBeInstanceOf(Country)
      expect(widget.user.country.code).toBe('AR')
    })

    it('hasManyThrough: orders de un country', async () => {
      const countries = await CountryModel.where('code', 'AR').with('orders').get()

      expect(countries[0].orders).toHaveLength(3) // Alice (2) + Bob (1)
    })

    it('hasOneThrough: shippingAddress de un user via profile', async () => {
      const users = await UserModel.where('name', 'Alice').with('shippingAddress').get()

      expect(users[0].shippingAddress).toBeDefined()
      expect(users[0].shippingAddress.street).toBe('123 Main St')
    })
  })

  // ─── joinRelationship ────────────────────────────────────────────────────

  describe('joinRelationship', () => {
    beforeEach(async () => {
      await seedCountries()
      await seedUsers()
      await seedRelated()
    })

    it('innerJoinRelationship() retorna solo registros con relación', async () => {
      const users = await UserModel.innerJoinRelationship('orders').select('users.id', 'users.name').distinct().get()
      const names = users.map((u: any) => u.name).sort()

      expect(names).toEqual(['Alice', 'Bob'])
    })

    it('leftJoinRelationship() incluye todos los registros', async () => {
      const users = await UserModel.leftJoinRelationship('orders').select('users.id', 'users.name').distinct().get()

      expect(users).toHaveLength(3)
    })

    it('joinRelationship() es alias de innerJoinRelationship()', async () => {
      const users = await UserModel.joinRelationship('orders').select('users.id', 'users.name').distinct().get()

      expect(users.map((u: any) => u.name).sort()).toEqual(['Alice', 'Bob'])
    })

    it('joinRelationship() encadenado desde where()', async () => {
      const users = await UserModel.where('active', 1)
        .leftJoinRelationship('profile')
        .select('users.id', 'users.name')
        .get()

      expect(users.length).toBeGreaterThanOrEqual(2)
    })

    it('lanza error si la relación no existe', () => {
      expect(() => UserModel.joinRelationship('nonexistent')).toThrow()
    })
  })
})
