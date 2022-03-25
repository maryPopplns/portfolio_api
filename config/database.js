require('dotenv').config();
const path = require('path');
const mongoose = require('mongoose');
const debug = require('debug')('portfolio-api:database');

mongoose
  .connect(process.env.ATLAS_DB, {
    useUnifiedTopology: true,
    useNewUrlParser: true,
  })
  .then(() => debug(`DB connection successful 🔓`))
  .catch((error) => debug(`${error}`));
