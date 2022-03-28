const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const { logger } = require(path.join(__dirname, '../../config/logger.js'));

async function initializeMongoServer() {
  const mongoServer = await MongoMemoryServer.create();
  const mongoUri = mongoServer.getUri();

  mongoose
    .connect(mongoUri, {
      useUnifiedTopology: true,
      useNewUrlParser: true,
    })
    .then(() => logger.info(`DB connection successful 🔓`))
    .catch((error) => logger.info(`${error}`));
}

module.exports = initializeMongoServer;
