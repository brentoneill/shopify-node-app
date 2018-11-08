const express = require('express');
const verifyOAuth = require('../helpers').verifyOAuth;
const mongoose = require('mongoose');
const config = require('../config');
const path = require('path');

const Shop = mongoose.model('Shop');

const router = express.Router();

/* GET home page. */
router.get('/', (req, res, next) => {
  const query = Object.keys(req.query).map((key) => `${key}=${req.query[key]}`).join('&');
  if (req.query.shop) {
    Shop.findOne({ shopify_domain: req.query.shop, isActive: true }, (err, shop) => {
      if (!shop) {
        return res.redirect(`/install/?${query}`);
      }
      if (verifyOAuth(req.query)) {
        return res.render('app/app', { apiKey: config.SHOPIFY_API_KEY, appName: config.APP_NAME, shop });
      }
      return res.render('index', { title: req.query.shop });
    });
  } else {
    return res.render('index', { title: 'Welcome to your example app' });
  }
});

router.get('/sw/get', (req, res) => {
    console.log('Received a GET for a sw...');
    // Give a 20w0
    res.status(200);
    // Set the new max scope
    res.set('Service-Worker-Allowed', '/');
    // Return the servicec worker
    res.sendFile(path.join(__dirname, '../sw/sw.js'));
    console.log('res is', res);
});

router.get('/error', (req, res) => res.render('error', { message: 'Something went wrong!' }));

module.exports = router;
