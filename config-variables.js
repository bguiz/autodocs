'use strict';

/**
 * @class  EnvironmentVariables
 * @module  Autodocs
 */
function EnvironmentVariables(vars) {
  /**
   * Test that an environment variable exists
   *
   * @method exists
   * @for  EnvironmentVariables
   * @param  {String} name The name of the environment variable
   * @return {Boolean} `true` when environment variable is defined and **is not** an empty string
   */
  function existsEnvironmentVariable(name) {
    return !!vars[name];
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
      throw new Error('Config variable `'+name+'` not set');
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
      vars[name] = value;
    }
    return vars[name];
  }

  /**
   * Substitute the value of other environment variables into the named one.
   *
   * For example:
   *
   * ```javascript
   * vars.MAJOR_VERSION = "0";
   * vars.MINOR_VERSION = "3";
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
    vars[name] = vars[name]
      .replace(/{{[^{}]+}}/g, function(otherName) {
        otherName = otherName.replace(/[{}]+/g, '');
        requireEnvironmentVariable(otherName);
        return vars[otherName];
      });
    return vars[name];
  }

  /**
   * Set a default value for an environment variable if it does not exist
   *
   * @method selected
   * @for  EnvironmentVariables
   * @param  {Array<String>} name The names of the environment variables we want
   * @return {Object<String, String>} A hash of key value pairs
   */
  function selectedEnvironmentVariable(names) {
    var out = {};
    names.forEach(function(name) {
      out[name] = vars[name];
    });
    return out;
  }

  /**
   * In a bash shell, when `printenv` is invoked,
   * parse its output into a Javascript object
   *
   * @method parsePrintenv
   * @for  EnvironmentVariables
   * @param  {String} stdout The output from `printenv`
   * @param  {String} out If this is given, the values from `printenv` will be added/ overriden ob this object
   * @return {Object<String, String>} A hash of key value pairs
   */
  function parsePrintenv(stdout, out) {
    out = out || {};
    var lines = stdout.toString().split('\n');
    lines.forEach(function(line) {
      var splitIdx = line.indexOf('=');
      if (splitIdx > 0) {
        var name = line.slice(0, splitIdx);
        var value = line.slice(splitIdx + 1);
        out[name] = value;
      }
    });
    return out;
  }

  return {
    exists: existsEnvironmentVariable,
    require: requireEnvironmentVariable,
    'default': defaultEnvironmentVariable,
    substitute: substituteEnvironmentVariable,
    selected: selectedEnvironmentVariable,
    parsePrintenv: parsePrintenv,
  };
}

module.exports = EnvironmentVariables;


