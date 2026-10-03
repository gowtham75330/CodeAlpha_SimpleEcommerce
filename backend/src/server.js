const app = require('./app');
const config = require('./config/env');
const { testConnection } = require('./config/db');

async function start() {
  try {
    await testConnection();
    console.log(`Connected to MySQL database "${config.db.database}".`);
  } catch (err) {
    console.error('Could not connect to MySQL. Check backend/.env and that MySQL is running.');
    console.error(err.message);
    process.exit(1);
  }

  listenWithFallback(config.port);
}

function listenWithFallback(port, attempts = 10) {
  const server = app.listen(port, () => {
    console.log(`Server listening on http://localhost:${port}`);
    if (port !== config.port) {
      console.warn(`Port ${config.port} was already in use. The app is running on port ${port}.`);
    }
  });

  server.on('error', (err) => {
    if (err.code === 'EADDRINUSE' && attempts > 0) {
      console.warn(`Port ${port} is already in use. Trying port ${port + 1}...`);
      setTimeout(() => listenWithFallback(port + 1, attempts - 1), 100);
      return;
    }
    console.error(`Could not start the server on port ${port}.`);
    console.error(err.message);
    process.exit(1);
  });
}

start();
