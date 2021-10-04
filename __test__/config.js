require('dotenv').config();

const env = (key) => process.env[key];

module.exports = {
  host: env('HOST'),
  port: env('PORT'),
  user: env('USER'),
  password: env('PASSWORD'),
};
