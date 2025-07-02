const { Pool } = require('pg');

const pool = new Pool({
  user: 'frix',
  host: 'localhost',
  database: 'frix',
  password: 'adminadmin',
  port: 5432,
});

module.exports = pool;
