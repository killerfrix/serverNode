const fs = require('fs');
const readline = require('readline');
const pool = require('./db');



class TaskManager {
  async addTask(title, description) {
    const query = `
    INSERT INTO tasks (title, description)
    VALUES ($1, $2)
    RETURNING *`;

    const result = await pool.query(query, [title, description]);
    console.log(`Task '${result.rows[0].title}' added successfully!`);
  }

  async listTasks() {
    const result = await pool.query('SELECT * FROM tasks ORDER BY id');
    const tasks = result.rows;


    if (tasks.length === 0) {
      console.log('No tasks found.');
      return;
    }

    console.log('\n' + '='.repeat(80));
    console.log(`${'ID'.padEnd(5)} ${'TITLE'.padEnd(20)} ${'STATUS'.padEnd(10)} ${'CREATED DATE'.padEnd(20)} ${'DESCRIPTION'.padEnd(30)}`);
    console.log('-'.repeat(80));
    for (const task of tasks) {
      console.log(
        `${String(task.id).padEnd(5)} ${task.title.substring(0, 18).padEnd(20)} ${task.status.padEnd(10)} ${task.created_date.toISOString().substring(0, 19).replace('T', ' ')} ${task.description.substring(0, 28).padEnd(30)}`
      );
    }
    console.log('='.repeat(80) + '\n');
  }

  async markComplete(taskId) {
    const result = await pool.query(
      'UPDATE tasks SET status = $1 WHERE id = $2 RETURNING *',
      ['Completed', taskId]
    );

    if (result.rowCount === 0) {
      console.log(`Task with ID ${taskId} not found.`);
    } else {
      console.log(`Task '${result.rows[0].title}' marked as completed!`);
    }
  }


    async deleteTask(taskId) {
    const result = await pool.query(
      'DELETE FROM tasks WHERE id = $1 RETURNING *',
      [taskId]
    );

    if (result.rowCount === 0) {
      console.log(`Task with ID ${taskId} not found.`);
    } else {
      console.log(`Task '${result.rows[0].title}' deleted successfully!`);
    }
  }

}

// Create readline interface for user input
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

// Helper function to prompt user for input
function prompt(question) {
  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      resolve(answer);
    });
  });
}

// Main application function
async function main() {
  const taskManager = new TaskManager();

  while (true) {
    console.log('\nTASK MANAGER');
    console.log('1. Add Task');
    console.log('2. List Tasks');
    console.log('3. Mark Task as Complete');
    console.log('4. Delete Task');
    console.log('5. Exit');

    const choice = await prompt('Enter your choice (1-5): ');

    if (choice === '1') {
      const title = await prompt('Enter task title: ');
      const description = await prompt('Enter task description: ');
      await taskManager.addTask(title, description);
    } 
    
    else if (choice === '2') {
      await taskManager.listTasks(); 
    } 
    
    else if (choice === '3') {
      const idInput = await prompt('Enter task ID to mark as complete: ');
      const taskId = parseInt(idInput);

      if (isNaN(taskId)) {
        console.log('Invalid task ID. Please enter a number.');
        continue;
      }

      await taskManager.markComplete(taskId); 
    } 
    
    else if (choice === '4') {
      const idInput = await prompt('Enter task ID to delete: ');
      const taskId = parseInt(idInput);

      if (isNaN(taskId)) {
        console.log('Invalid task ID. Please enter a number.');
        continue;
      }

      await taskManager.deleteTask(taskId); 
    } 
    
    else if (choice === '5') {
      console.log('Exiting Task Manager. Goodbye!');
      rl.close();
      break;
    } 
    
    else {
      console.log('Invalid choice. Please try again.');
    }
  }
}


// Run the application
main().catch(error => {
  console.error('An error occurred:', error);
  rl.close();
}); 
