// Sets required environment variables before any test module initialises.
// Loaded via vitest.config.js setupFiles — runs before test file imports.
process.env.JWT_SECRET = 'test_jwt_secret_that_is_at_least_32_characters_long'
process.env.JWT_REFRESH_SECRET = 'test_refresh_secret_that_is_at_least_32_chars_x'
process.env.CLIENT_URL = 'http://localhost:5173'
process.env.PORT = '3001'
process.env.NODE_ENV = 'test'
process.env.DATABASE_URL = 'postgresql://test:test@localhost:5432/test'
