import { DB, SqliteDataSource } from '../src'

// Reset DB static state between tests so each case starts clean.
function resetDB() {
  ;(DB as any).sources.clear()
  ;(DB as any).activeSourceName = undefined
}

// Manipulate process.env safely.
function withEnv(vars: Record<string, string>, fn: () => void) {
  const saved: Record<string, string | undefined> = {}

  for (const [k, v] of Object.entries(vars)) {
    saved[k] = process.env[k]
    process.env[k] = v
  }

  try {
    fn()
  } finally {
    for (const [k, v] of Object.entries(saved)) {
      if (v === undefined) {
        delete process.env[k]
      } else {
        process.env[k] = v
      }
    }
  }
}

describe('DB.configure() — env var auto-bootstrap', () => {
  beforeEach(resetDB)
  afterEach(resetDB)

  // ── DB.configure() called explicitly ────────────────────────────────────────

  describe('DB.configure() explicit call', () => {
    it('registra un source SQLite en memoria con DB_DRIVER=sqlite', () => {
      withEnv({ DB_DRIVER: 'sqlite' }, () => {
        DB.configure()

        expect(DB.getActiveSource()).toBeInstanceOf(SqliteDataSource)
      })
    })

    it('respeta DB_FILE para SQLite', () => {
      withEnv({ DB_DRIVER: 'sqlite', DB_FILE: './test.db' }, () => {
        DB.configure()

        const src = DB.getActiveSource() as SqliteDataSource

        expect(src.getFilename()).toBe('./test.db')
      })
    })

    it('es no-op si ya hay sources registrados manualmente', () => {
      const manual = new SqliteDataSource()

      DB.register(manual)

      withEnv({ DB_DRIVER: 'sqlite', DB_FILE: './should-not-be-used.db' }, () => {
        DB.configure()

        // The active source must still be the one registered manually
        expect(DB.getActiveSource()).toBe(manual)
      })
    })

    it('lanza error si no hay vars de DB_DRIVER ni sources manuales', () => {
      expect(() => DB.configure()).toThrow(/DB_DRIVER/)
    })

    it('lanza error si el driver es desconocido', () => {
      withEnv({ DB_DRIVER: 'oracle' }, () => {
        expect(() => DB.configure()).toThrow(/Unknown DB driver/)
      })
    })
  })

  // ── Named sources ────────────────────────────────────────────────────────────

  describe('named sources via DB_<NAME>_DRIVER', () => {
    it('registra un source nombrado y lo hace accesible via DB.source()', () => {
      withEnv({ DB_REPORTING_DRIVER: 'sqlite', DB_REPORTING_FILE: './reporting.db' }, () => {
        DB.configure()

        const reporting = DB.source('reporting') as SqliteDataSource

        expect(reporting).toBeInstanceOf(SqliteDataSource)
        expect(reporting.getFilename()).toBe('./reporting.db')
      })
    })

    it('el source por defecto (DB_DRIVER) queda como activo', () => {
      withEnv(
        {
          DB_DRIVER: 'sqlite',
          DB_REPORTING_DRIVER: 'sqlite',
          DB_REPORTING_FILE: './reporting.db'
        },
        () => {
          DB.configure()

          // Active source is the unnamed default
          const active = DB.getActiveSource() as SqliteDataSource

          expect(active.getFilename()).toBe(':memory:')

          // Named source accessible separately
          const reporting = DB.source('reporting') as SqliteDataSource

          expect(reporting.getFilename()).toBe('./reporting.db')
        }
      )
    })

    it('sin DB_DRIVER, el primer source nombrado (alfabético) queda como activo', () => {
      withEnv({ DB_REPORTING_DRIVER: 'sqlite', DB_REPORTING_FILE: './r.db' }, () => {
        DB.configure()

        const active = DB.getActiveSource() as SqliteDataSource

        expect(active.getFilename()).toBe('./r.db')
      })
    })
  })

  // ── Auto-bootstrap ───────────────────────────────────────────────────────────

  describe('auto-bootstrap (implicit configure on first use)', () => {
    it('DB.table() arranca sin register() si DB_DRIVER está en el entorno', async () => {
      await withEnvAsync({ DB_DRIVER: 'sqlite' }, async () => {
        const source = DB.getActiveSource()

        expect(source).toBeInstanceOf(SqliteDataSource)

        // Actually execute a query to confirm the source works
        await source.execute('CREATE TABLE IF NOT EXISTS _autotest (id INTEGER PRIMARY KEY)')
        const rows = await source.query('SELECT 1 AS n')

        expect(rows[0].n).toBe(1)
        await source.close()
      })
    })

    it('lanza error descriptivo si no hay DB_DRIVER y no hay sources registrados', () => {
      expect(() => DB.getActiveSource()).toThrow(/DB_DRIVER/)
    })
  })
})

// Async variant of withEnv for async test bodies
async function withEnvAsync(vars: Record<string, string>, fn: () => Promise<void>) {
  const saved: Record<string, string | undefined> = {}

  for (const [k, v] of Object.entries(vars)) {
    saved[k] = process.env[k]
    process.env[k] = v
  }

  try {
    await fn()
  } finally {
    for (const [k, v] of Object.entries(saved)) {
      if (v === undefined) {
        delete process.env[k]
      } else {
        process.env[k] = v
      }
    }
  }
}
