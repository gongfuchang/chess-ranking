const sdb = require("stormdb");

var express = require('express');
var router = express.Router();


var fs = require("fs");
var path = require('path');
var iconv = require('iconv-lite');

const resPath = path.join(path.resolve(__dirname, '..'), '/public/res/');
const configPath = resPath + "config.json";

router.get('/list', function(req, res, next) {
    const db = req.db;
    const content = db.get('data');
    res.send(JSON.stringify(content.value()));
});

router.retrieveDb = function(){
    // Use JSON file for storage
    const engine = new sdb.localFileEngine(configPath);
    const db = new sdb(engine);

    try {
        var val = db.get('data').value();
    } catch (err) {
        console.error('failed to load db from local storage.', err);
    }
    
    return db;
}

router.post('/save', function(req, res, nex){
    var players = []
    if (!req.body || !(players = JSON.parse(req.body.players)) || players.length == 0){
        res.send({message: "no players to update"});
        return;
    }
    
    players.forEach(player => {
        var playerMap = req.db.get('data');
        var toUpdate = playerMap.get(player['id']);
        delete player.id;
        toUpdate.set(player);
        req.db.save();
    });
    return res.send({message: "config saved successfully"});

});

module.exports = router;
