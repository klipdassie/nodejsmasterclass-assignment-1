/*
 * Config file for API
 *
 * Title: The Node.js Master Class - Assignment #1
 * Description: Simple Hello World REST API
 * Author: Otto van der Meer
 * Date: November 2018
 */

// Environment container
const environment = {};

// Developement environment
environment.dev = {
  'host': 'localhost',
  'httpPort': 3000,
  'httpsPort': 3001,
  'envName': 'development'
};

// Production environment
environment.prod = {
  'host': 'localhost',
  'httpPort': 5000,
  'httpsPort': 5001,
  'envName': 'production'
};

// Determine environment using system environment variable NODE_ENV,
// if not set use development environment
const currentEnv = process.env.NODE_ENV ?
  process.env.NODE_ENV.toLowerCase() :
  'dev';

// Export environment for further use, use development environment if
// non existent NODE_ENV value is used
module.exports = environment[currentEnv] || environment.dev;
