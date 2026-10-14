// Database connectivity smoke test. This script must never modify schema or data.
const { Sequelize } = require('sequelize');

const required = ['DB_NAME', 'DB_USER', 'DB_PASSWORD'];
const missing = required.filter((key) => !process.env[key]);

if (missing.length > 0) {
  console.error(`Missing required environment variables: ${missing.join(', ')}`);
  process.exitCode = 1;
} else {
  const sequelize = new Sequelize(
    process.env.DB_NAME,
    process.env.DB_USER,
    process.env.DB_PASSWORD,
    {
      host: process.env.DB_HOST || 'localhost',
      port: Number.parseInt(process.env.DB_PORT || '3306', 10),
      dialect: 'mysql',
      logging: false,
    }
  );

  async function checkDatabaseConnection() {
    try {
      await sequelize.authenticate();
      console.log('Database connection successful.');
    } catch (error) {
      console.error('Database connection failed:', error.message);
      process.exitCode = 1;
    } finally {
      await sequelize.close();
    }
  }

  checkDatabaseConnection().catch((error) => {
    console.error('Database smoke test failed:', error.message);
    process.exitCode = 1;
  });
}