'use strict';

var fs = require('fs');
var path = require('path');
var childProcess = require('child_process');

/**
 * @class  PublishGithubPages
 * @module  AutodocsPublish
 */

module.exports = {
  init: require('./init.js'),
  run: require('./publish.js'),
};
