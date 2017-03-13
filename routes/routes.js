'use strict';
let express = require('express');
let router = express.Router();
let swapicli = require('../custom_modules/swapiCli');

router.get('/character/:name', (req, res) => {
  let name = req.params.name;
  swapicli.characterProfile(name)
  .then(response => {      
   res.render('character.hbs', {character:response.results[0]});
  })
  .catch( e => {
    return res.json(e);
  });
});

router.get('/characters', (req, res) => {
   let sort = req.query.sort;
   swapicli.listCharacters(sort)
   .then(results => {
     return res.json(results);
   })
   .catch( e => {
      return res.json(e);
   })
});

router.get('/planetresidents', (req, res) => {
 swapicli.listPlanetResidents()
 .then(results => {
   return res.json(results);
 })
 .catch( e => {
    return res.json(e);
 })
});

module.exports = router;
