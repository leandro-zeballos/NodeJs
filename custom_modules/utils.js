'use strict';
let http = require('http');
let async = require('async');
let endpoints = require('../config/config.json');

let utils = {
 httpRequest: (options, callback) => {  //change code to user request-promise?
  let req = http.request(options, (res) => {
   res.setEncoding('utf8');
   let body = '';
   res.on('data', (chunk) => {
    body += chunk;
   });

   res.on('end', () => {
    if (body === '' && res.statusCode === 200) {
     return callback(null);
    } else if (body === '') {
     let error = new Error(res.statusMessage);
     error.error_code = 500;
     return callback(error);
    }

    try {
     body = body.replace(/^\uFEFF/, '');
     body = JSON.parse(body);
    } catch (e) {
     console.log('#### Error parsing JSON Http response:');
     console.log(e);
     console.log(body);
     e.error_code = 500;
     return callback(e);
    }
    return callback(null, body);
   });

  });

  req.on('error', (e) => {
   console.log('httpRequest problem with request: ' + e.message);
   e.error_code = 500;
   callback(e);
  });

  // send the data
  return req.end(null);

 },

 createAsyncCalls: (totalCalls, method, path) => {
  let ASYNC_CALLS = [];
  for (let i = 1; i <= totalCalls; i++) {
   let options = {};
   options.hostname = endpoints.HOST;
   options.agent = false;
   options.method = method;
   options.path = path + `?page=${i}&limit=10`;
   ASYNC_CALLS.push(async.apply(utils.httpRequest, options));
  }
  return ASYNC_CALLS;
 }
}
module.exports = utils;
