const crypto = require('crypto');

const SALT = process.env.ANONYMIZE_SALT || 'default_salt_change_me';

function anonymize(value) {
  if (!value) return null;
  return crypto.createHmac('sha256', SALT).update(String(value)).digest('hex');
}

module.exports = { anonymize };