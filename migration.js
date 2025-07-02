const fs = require('fs');
const pool = require('./db');

async function migrateTasks() {
  const data = JSON.parse(fs.readFileSync('tasks.json', 'utf8'));
  for (const task of data) {
    await pool.query(
      `INSERT INTO tasks (title, description, status, created_date)
       VALUES ($1, $2, $3, $4)`,
      [task.title, task.description, task.status, task.createdDate]
    );
  }
  console.log('Migration completed.');
  process.exit();
}

migrateTasks();
