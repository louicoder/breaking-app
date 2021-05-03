const mongoose = require('mongoose');
require('dotenv').config();

// dev
// DEV_DB_CONNECTION_STRING

// Prod
// DB_CONNECTION_STRING

const connectWithRetry = () =>
  mongoose
    .connect(process.env.DB_CONNECTION_STRING, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      useCreateIndex: true,
      useFindAndModify: false
    })
    .then(() => console.log(':::::::: CONNECTED TO DATBASE :::::::::'))
    .catch((error) => {
      console.log('Something went wrong during the connection', error.message);
      setTimeout(connectWithRetry, 5000);
    });

module.exports = connectWithRetry;