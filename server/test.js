// test.js
const { Sequelize } = require('sequelize');
const sequelize = new Sequelize('salon', 'salon_user', 'owaies', { host: 'localhost', dialect: 'mysql', logging: console.log });
sequelize.authenticate().then(() => console.log('Connected')).catch(err => console.error('Failed:', err));
sequelize.sync({ force: true }).then(() => console.log('Synced')).catch(err => console.error('Sync failed:', err));