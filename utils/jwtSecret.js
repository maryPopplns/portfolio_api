const fs = require('fs');
const path = require('path');
const { v4 } = require('uuid');
const { parse, stringify } = require('envfile');
const { logger } = require(path.join(__dirname, '../config/logger'));

const envFile = '.env';

fs.readFile(envFile, 'utf8', (err, data) => {
  if (err) {
    console.error(err);
    return;
  }
  const secret = v4();
  const parsed = parse(data);
  parsed.JWT_SECRET = secret;
  const final = stringify(parsed);

  fs.writeFile(envFile, final, (err) => {
    if (err) {
      console.error(err);
      return;
    }
    logger.info('jwt secret updated');
  });
});
