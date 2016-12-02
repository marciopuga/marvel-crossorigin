"use strict";

const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const request = require('request');
const tough = require('tough-cookie');
const Cookie = tough.Cookie;

app.set('port', (process.env.PORT || 3002));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.use(function (req, res, next) {
  res.header('Access-Control-Allow-Origin', '*')
  res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
  res.header('Access-Control-Allow-Headers', 'X-Requested-With,content-type');
  res.header('Access-Control-Allow-Credentials', true);
  next();
})

app.listen(app.get('port'), () => {
  console.log('------------------------------------');
  console.log(' Local: http://localhost:' + app.get('port'));
  console.log('------------------------------------');
});

app.use('*', RequestHandler);

let COOKIE = [];

function RequestHandler(req, response) {
  var cooklet = [];
  for (var prop in COOKIE) {
    cooklet.push(COOKIE[prop].cookieString());
  }
  var url = req.params[0].substring(1);
  url = url.substring(url.indexOf('https://marvelapp.com'));

  const opts = {
    url: url,
    form: req.body,
    method: req.method,
    qs: req.query,
    useQuerystring: true,
    headers: {
      cookie: cooklet.join('; '),
    }
  };

  console.log(opts);
  request(
    opts,
    (err, res) => {
      if(err) {
        console.log('response error')
        response.status(500).send(err);
        console.log(req.url)
        return;
      }

      if(res.headers['set-cookie']) {
        if (res.headers['set-cookie'] instanceof Array) {
          COOKIE = res.headers['set-cookie'].map(Cookie.parse);
        } else {
          COOKIE = [Cookie.parse(res.headers['set-cookie'])];
        }

      }
      response.status(res.statusCode).send(res.body);
    }
  );
}
