var express = require("express");
var url = require("url");
var router = express.Router();

var http = require("http");
var https = require("https");
var htmlparser = require("htmlparser2");

const fetch = require('node-fetch');

/* GET current players list. */
router.get("/current", function (req, res, next) {
  if (req.query.url === undefined) {
    res.send({ message: "url cannot be undefined" });
  }

  var urlObj = url.parse(req.query.url);
  var urlParam = urlObj.href.replace(/.*?:\/\//g, "");
  var parts = urlParam.match(/(.*)\/(.*)/i);
  if (parts.length != 3) {
    res.send({ message: "invalid url to parse" });
  }
  var options = {
    hostname: parts[1],
    path: "/" + parts[2],
    headers: {
      Host: "ratings.fide.com",
      "User-Agent":
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/110.0.0.0 Safari/537.36",
    },
  };

  var urlPrefix = urlObj.href.match(/.*?:\/\//g);
  if (
    urlPrefix !== undefined &&
    urlPrefix !== null &&
    urlPrefix[0] === "https://"
  ) {
    options.port = 443;
    process.env["NODE_TLS_REJECT_UNAUTHORIZED"] = 0;
    https
      .get(options, function (result) {
        processResponse(res, req, result);
      })
      .on("error", function (e) {
        res.send({ message: e.message });
      });
  } else {
    options.port = 80;
    http
      .get(options, function (result) {
        processResponse(res, req, result);
      })
      .on("error", function (e) {
        res.send({ message: e.message });
      });
  }
});

router.post("/extra", function (req, res, next) {
  try {
    process.env["NODE_TLS_REJECT_UNAUTHORIZED"] = 0;

    fetch("https://chesskb.com:9200/chess_player/_search", {
      method: "POST",
      body: JSON.stringify({
        from: 0, size: 1000,
        query: {
          terms: {
            ID_Number: req.body?.ids?.split(','),
          },
        },
      }),
      headers: {
        "Content-type": req.headers["content-type"],
        "Authorization": req.headers.authorization,
      },
    })
      .then((response) => {
        if (response.ok) {
          response.json().then((data) => {
            // console.log(data);
            var hits = data.hits;
            return res.send(hits?.hits);
          });
        } else {
          throw `Error with status ${response.status}`;
        }
      })
      .catch((error) => {
        console.log(error);
      });
  } catch (error) {

    console.log(error);
  }

});

var processResponse = function (res, req, result) {
  var data = "";
  result.on("data", function (chunk) {
    data += chunk;
  });
  result.on("end", function (chunk) {
    res.send(data);
  });
};

module.exports = router;
