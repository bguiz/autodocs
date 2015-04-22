'use strict';

/**
 * @class  EnvironmentVariables
 * @module  Autodocs
 */

/**
 * Test that an environment variable exists
 *
 * @method exists
 * @for  EnvironmentVariables
 * @param  {String} name The name of the environment variable
 * @return {Boolean} `true` when environment variable is defined and **is not** an empty string
 */
function existsEnvironmentVariable(name) {
  return !!process.env[name];
}

/**
 * Enforce that an environment variable exists
 *
 * @method require
 * @for  EnvironmentVariables
 * @param  {String} name The name of the environment variable
 * @throws  Throws and error when the environment variable does not exist
 */
function requireEnvironmentVariable(name) {
  if (!existsEnvironmentVariable(name)) {
    throw new Error('Environment variable `'+name+'` not set');
  }
}

/**
 * Set a default value for an environment variable if it does not exist
 *
 * @method default
 * @for  EnvironmentVariables
 * @param  {String} name The name of the environment variable
 * @param  {String} value The default value
 * @return {String} The value of the existing or newly set environment variable
 */
function defaultEnvironmentVariable(name, value) {
  if (!existsEnvironmentVariable(name)) {
    process.env[name] = value;
  }
  return process.env[name];
}

/**
 * Substitute the value of other environment variables into the named one.
 *
 * For example:
 *
 * ```javascript
 * process.env.MAJOR_VERSION = "0";
 * process.env.MINOR_VERSION = "3";
 * EnvironmentVariables.substitute('api/{{MAJOR_VERSION}}.{{MINOR_VERSION}}');
 * ```
 *
 * ... will return `'api/0.3'`;
 *
 * Note that if this is done for multiple environment variables,
 * the order in which they are done will affect the result.
 * It is the responsibility of the caller to this function to ensure that
 * the values to be substituted in are already fully resolved:
 * this function **is not** recursive.
 * Therefore, cycles are also not allowed.
 * Any of these will result in indeterminate results, including errors.
 *
 * @method default
 * @for  EnvironmentVariables
 * @param  {String} name The name of the environment variable
 * @return {String} The value of the existing or newly set environment variable
 */
function substituteEnvironmentVariable(name) {
  process.env[name] = process.env[name]
    .replace(/{{[^{}]+}}/g, function(otherName) {
      otherName = otherName.replace(/[{}]+/g, '');
      requireEnvironmentVariable(otherName);
      return process.env[otherName];
    });
  return process.env[name];
}

module.exports = {
  exists: existsEnvironmentVariable,
  require: requireEnvironmentVariable,
  'default': defaultEnvironmentVariable,
  substitute: substituteEnvironmentVariable,
};
