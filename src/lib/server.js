const express = require('express');
const morgan = require('morgan');
const cors = require('cors');
const compression = require('compression');
const rateLimiter = require('express-rate-limit');
const nodeEnv = process.env.NODE_ENV;

const app = express();
app.set('trust proxy', 1);

const limiter = rateLimiter.rateLimit({
  windowMs: 10 * 60 * 1000, // 10 minutes
  limit: 100, // Limit each IP to 200 requests per windowMs
  standardHeaders: 'draft-7',
  legacyHeaders: false,
});

if (nodeEnv !== 'test') {
  app.use(morgan('combined'));
}

app.use(cors());
app.use(compression());
app.use(limiter);
require('../routes')(app);

module.exports = app;
