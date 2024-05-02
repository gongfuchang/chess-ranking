var express = require("express");
var url = require("url");
var router = express.Router();

var http = require("http");
var https = require("https");
var htmlparser = require("htmlparser2");

const fetch = require('node-fetch');

const TIME_OUT = 15000;

/* GET current players list. */
router.get("/current", function (req, res, next) {
    if (req.query.url === undefined) {
        res.send({message: "url cannot be undefined"});
    }

    var urlObj = url.parse(req.query.url);
    var urlParam = urlObj.href.replace(/.*?:\/\//g, "");
    var parts = urlParam.match(/(.*)\/(.*)/i);
    if (parts.length != 3) {
        res.send({message: "invalid url to parse"});
    }
    console.time('fetch-from-fide');
    process.env["NODE_TLS_REJECT_UNAUTHORIZED"] = 0;
    fetch('http://' + urlParam, {
        "headers": {
          "x-requested-with": "XMLHttpRequest"
        },
        "body": null,
        "method": "GET"
      }, TIME_OUT).then(async (response) => {
        console.timeEnd('fetch-from-fide');
        // console.time('process-text');
        if (response.ok) {
            // console.log(await response.text());
            return res.send(await response.text());
            // response.text().then((data) => {
            //     console.timeEnd('process-text');
            //     // console.log(data);
            //     return res.send(data);
            // });
        } else {
            throw `Error with status ${response.status}`;
        }
    })
        .catch((error) => {
            console.log(error);
        });
});

router.post("/extra", function (req, res, next) {
    try {
        process.env["NODE_TLS_REJECT_UNAUTHORIZED"] = 0;
        console.time('fetch-extra');
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
        }, TIME_OUT)
            .then((response) => {
                console.timeEnd('fetch-extra');
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
