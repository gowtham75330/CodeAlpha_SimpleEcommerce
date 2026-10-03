const fs = require('fs');
const path = require('path');
const mysql = require('mysql2/promise');
const config = require('../config/env');

function splitSql(contents) {
  return contents
    .split(/;\s*$/m)
    .map((statement) => statement.trim())
    .filter((statement) => statement.length > 0 && !statement.startsWith('--'));
}

async function run() {
  const schemaPath = path.join(__dirname, '../../../database/schema.sql');
  const seedPath = path.join(__dirname, '../../../database/seed.sql');
  const schemaSql = fs.readFileSync(schemaPath, 'utf8');
  const seedSql = fs.readFileSync(seedPath, 'utf8');

  const connection = await mysql.createConnection({
    host: config.db.host,
    port: config.db.port,
    user: config.db.user,
    password: config.db.password,
    multipleStatements: true
  });

  try {
    for (const statement of splitSql(schemaSql)) {
      await connection.query(statement);
    }

    const [rows] = await connection.query('SELECT COUNT(*) AS count FROM products');
    if (Number(rows[0].count) === 0) {
      for (const statement of splitSql(seedSql)) {
        await connection.query(statement);
      }
      console.log('Database schema applied and sample products inserted.');
    } else {
      console.log('Database schema applied. Products already present; seed skipped.');
    }
  } finally {
    await connection.end();
  }
}

run().catch((err) => {
  console.error('Database setup failed:', err.message);
  process.exit(1);
});
