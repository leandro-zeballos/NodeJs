'use strict';

let async = require('async');
let _ = require('lodash');
let Q = require('q');
let endpoints = require('../config/config.json');
let utils = require('./utils');
let swapicli = {

 characterProfile: (name) => {
  let deferred = Q.defer();
  let options = {};
  options.hostname = endpoints.HOST;
  options.method = 'GET';
  options.agent = false;  
  options.path = endpoints.PEOPLE + `?search=${name}`;
  utils.httpRequest(options, (err, response) => {
    if (err) {
       deferred.reject(err);
    }
    deferred.resolve(response);
  });

  return deferred.promise;
 },

 listCharacters: (sort) => {
  let deferred = Q.defer();
  let ASYNC_CALLS = utils.createAsyncCalls(5, 'GET', endpoints.PEOPLE);
  async.parallel(ASYNC_CALLS, (error, response) => {
   if (error) {
    return deferred.reject(error);
   }
   //Handle response
   let results = _.flatten(response.map(res => {
    return res.results;
   }));

   //sort elements by paramater
   if (sort === 'name') {
    results = results.sort((a, b) => a.name.toLowerCase() < b.name.toLowerCase() ? 1 : -1);
   } else if (sort === 'height') {
    results = results.sort((a, b) => parseInt(a.height, 10) - parseInt(b.height, 10));
   } else if (sort === 'mass') {
    results = results.sort((a, b) => parseInt(a.mass, 10) - parseInt(b.mass, 10));
   }
   return deferred.resolve(results);
  });
  return deferred.promise;
 },
 listPlanetResidents: () => {
   let deferred = Q.defer();
   let planetResidents = {};
   //Create calls for all planets
   let PLANET_ASYNC_CALLS = utils.createAsyncCalls(7, 'GET', endpoints.PLANETS);
   async.parallel(PLANET_ASYNC_CALLS, (error, response) => {
     if (error) {
      return deferred.reject(error);
     }

     let results = _.flatten(response.map(res => {
      return res.results;
     }));
     //Store temporary data for later usage
     let planetNames = {};
     let charactersUrls = [];
     results.forEach( planet => {
       planetNames[planet.url] = planet.name;
       charactersUrls = _.concat(charactersUrls, planet.residents);
     });

     //Create calls for getting each person info
     let PEOPLE_ASYNC_CALLS = _.flatten(charactersUrls.map(url => {
       return utils.createAsyncCalls(1,'GET', url);
     }));
     async.parallel(PEOPLE_ASYNC_CALLS, (error, response) => {
         response.forEach(person => {
             let planet = planetNames[person.homeworld];
             if (!planetResidents[planet]) {
               planetResidents[planet] = [];
             }
             planetResidents[planet].push(person.name);
         });
         return deferred.resolve(planetResidents);
     });
    });
   return deferred.promise;
 }
};
module.exports = swapicli;
