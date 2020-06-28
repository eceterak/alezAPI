const path = require('path');
const express = require('express');
const dotenv = require('dotenv');
const morgan = require('morgan');
const fileupload = require('express-fileupload');
const db = require('./config/db');
const errorHandler = require('./middleware/errorHandler.middleware');
const cookieParser = require('cookie-parser');
const mongoSanitize = require('express-mongo-sanitize');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const hpp = require('hpp');
const xss = require('xss-clean');
const color = require('colors');

// define env variables
dotenv.config({ path: './config/config.env' });

// routes
const adverts = require('./routes/adverts.route');
const cities = require('./routes/cities.route');
const auth = require('./routes/auth.route');
const users = require('./routes/users.route');

// connect to db
db();

// initialize app
const app = express();

// dev logging middleware
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// body parser
app.use(express.json());

// sanitize data
app.use(mongoSanitize());

// set security headers
app.use(helmet());

// prevent XSS attacks
app.use(xss());

// rate limiting
const limiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 min
  max: 100
});

app.use(limiter);

// prevent http param pollution
app.use(hpp());

// file upload
app.use(fileupload());

// cookie parser
app.use(cookieParser());

// set static folder
app.use(express.static(path.join(__dirname, 'public')));

// mount routes
app.use('/api/v1/adverts', adverts);
app.use('/api/v1/cities', cities);
app.use('/api/v1/auth', auth);
app.use('/api/v1/users', users);

// error handling
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

const server = app.listen(
  PORT,
  console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`.yellow.bold)
);

// handle unhandled promise rejections
process.on('unhandledRejection', (err, promise) => {
  console.log(`Error: ${err.message}`.red);
  // close server & exit process
  server.close(() => {
    process.exit(1);
  });
})

module.exports = app;
