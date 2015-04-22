'use strict';


function existsEnvironmentVariable(name) {
  return !!process.env[name];
}

function requireEnvironmentVariable(name) {
  if (!existsEnvironmentVariable(name)) {
    throw new Error('Environment variable `'+name+'` not set');
  }
}

function defaultEnvironmentVariable(name, value) {
  if (!existsEnvironmentVariable(name)) {
    process.env[name] = value;
  }
  return process.env[name];
}

function substituteEnvironmentVariable(name) {
  process.env[name] = process.env[name]
    .replace(/{{[^{}]+}}/g, function(otherName) {
      otherName = otherName.replace(/[{}]+/g, '');
      requireEnvironmentVariable(otherName);
      return process.env[otherName];
    });
}

module.exports = {
  exists: existsEnvironmentVariable,
  require: requireEnvironmentVariable,
  'default': defaultEnvironmentVariable,
  substitute: substituteEnvironmentVariable,
};
