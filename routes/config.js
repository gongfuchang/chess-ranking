const sdb = require("stormdb");

var express = require('express');
var router = express.Router();


var fs = require("fs");
var path = require('path');
var iconv = require('iconv-lite');

const resPath = path.join(path.resolve(__dirname, '..'), '/public/res/');
const txtPath = resPath + "config.csv";
const configPath = resPath + "config.json";

router.get('/list', function(req, res, next) {
    const db = req.db;
    const content = db.get('data');
    res.send(JSON.stringify(content.value()));
});

const lastUpdateTimeFlag = 'lastUpdateTime', playersFlag = 'players';
router.retrieveDb = function(){
    // Use JSON file for storage
    const engine = new sdb.localFileEngine(configPath);
    const db = new sdb(engine);

    try {
        var val = db.get('data').get(lastUpdateTimeFlag).value();
    } catch (err) {
        db.default({'data' : makeupConfigs()});
        db.save();
    }
    
    return db;
}

function makeupConfigs(){
    var fileContent = "", jso = {};
    if (fs.existsSync(txtPath)){
        const buffer = fs.readFileSync(txtPath);
        content = iconv.decode(buffer, 'gbk');
        console.log(content);

		var lines = content.split('\n');
		if(lines.length > 0){
			jso[lastUpdateTimeFlag] = lines[0].split(':')[1];
		}
        var players = {};
		for (let index = lines.length; index > 0; --index) {
			const str = lines[index];
			//patern: 1503014	 Carlsen, Magnus	卡尔森	NOR	g	0	1990	1	2862	1	2862
            //{'1503014': {'zname': '卡尔森'}}}
			if(!str) continue;
			var parts = str.split('	');
			players[parts[0]] = {
				name:		parts[1],
				zname:		parts[2],
				country:	parts[3],
				title:		parts[4],
				games:		parts[5],
				birthday:	parts[6],
				rank:		parts[7],
				rate:		parts[8],
				lastRank:	parts.length == 11 ? parts[9] : 0,
				lastRate:	parts.length == 11 ? parts[10] : 0
			};
		}
        jso[playersFlag] = players;
    }
    return jso;
}

router.post('/save', function(req, res, nex){
    var playes = []
    if (!req.body || !(players = JSON.parse(req.body[playersFlag])) || players.length == 0){
        res.send({message: "no players to update"});
        return;
    }
    
    players.forEach(player => {
        var playerMap = req.db.get('data').get(playersFlag);
        var toUpdate = playerMap.get(player['id']);
        delete player.id;
        toUpdate.set(player);
        req.db.save();
    });
    return res.send({message: "config saved successfully"});

});

module.exports = router;
