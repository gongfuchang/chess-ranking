var MyFile = {
	FOR_READING: 1,
	FOR_WRITEING: 2,
	LASTUPDATE_FLAG: 'lastUpdateTime',
	PLAYERS_FLAG: 'players',
	MEN: 'men',
	WOMEN: 'women',
	CONFIG_ENTITY: {},
	getConfigFileName : function(){
		return this.__getFolder() + 'config.csv';
	},
	getDetailsFileName : function(flag){
		return this.__getFolder() + 'details-' + flag + '.csv';
	},
	loadConfigEntity : function(callback){
		var sUrl = '/config/list';
		var self = this;
		var req = new Ajax.Request(sUrl, {
			method: 'GET',
			onSuccess: function(trans){
				//alert(trans.responseText)
				var sContent = trans.responseText;
				try{					
					self.__makeConfigEntity(sContent);
				}catch(err){
					//TODO
					alert(err.message);
					console.err(err);
				}

				callback.call(self);
			}
		});
	},
	__makeConfigEntity: function(content){		
		// {'lastUpdateTime': 168, 'players': {'1503014': {'zname': '卡尔森'}}}
		this.CONFIG_ENTITY = JSON.parse(content) || {};
	},
	getConfigEntity : function(){
		return (this.CONFIG_ENTITY || {})[this.PLAYERS_FLAG];

	},
	writeConfigEntity : function(entities, callback){
		if (!entities){
			return;
		}
		//else
		var sUrl = '/config/save';
		var self = this;
		var req = new Ajax.Request(sUrl, {
			method: 'POST',
			contentType: 'application/json',
			postBody: JSON.stringify({'players' : entities}),
			onSuccess: function(trans){
				callback.apply();
			}
		});
	},
	readDetailsEntity : function(flag){
		return {};
		var file = this.fso.OpenTextFile(this.getDetailsFileName(flag), MyFile.FOR_READING, false);
		//read first line
		var result = {header: {id: 'id-flag', timestamps: []}, records: {}};
		if (!file.AtEndOfStream){
			var str = file.ReadLine();
			var parts = str.split('	');
			parts.shift();
			//alert(parts)
			result['header'].timestamps = parts;
		}
		//read all records
		while (!file.AtEndOfStream){
			var str = file.ReadLine();
			if (str.length == 0){
				continue;
			}
			//else
			//patern: 1503014	2814-1-17	2804-2-12	..
			var parts = str.split('	');
			result['records'][parts.shift()] = parts;
		}
		file.Close();

		return result;
	},
	writeDetailsEntity : function(entity, flag){
		//entity pattern: {header: {id: 'id-flag', timestamps: [1293985356828, ..]}, records: {'1503014': ['2814-1-17', ..]}};
		//先比较最新时间，同一月份的不进行更新
		var header = entity['header'];
		if (this.__renderInTheSameMonth(parseInt(header.timestamps[0], 10))){
			return;
		}
		//else
		var str2Write = 'id';
		for(var index = 0; index < header.timestamps.length; index++){
			str2Write += '\t' + header.timestamps[index];
		}
		str2Write += '\n';

		var recs = entity['records'];
		for(var id in recs){
			str2Write += id;
			var historys = recs[id];
			for(var index = 0; index < historys.length; index++){
				str2Write += '\t' + historys[index];
			}
			str2Write += '\n';
		}
		//alert(str2Write);
		//back up first
		var sDetailsFile = this.getDetailsFileName(flag);
		// this.backup(sDetailsFile);

		//write file
		var file = this.getFile(sDetailsFile);
		//alert(sDetailsFile);
		var ts = file.OpenAsTextStream(MyFile.FOR_WRITEING, 0);//0-TristateUseDefault
		//document.getElementById('txtConfig').value = str2Write;
		ts.Write(str2Write);
		ts.Close();
		
	},

	getFile : function(sFileName, bCreateIfNone){
		var file = null;
		if (!this.fso.FileExists(sFileName)){
			if(!(bCreateIfNone === true)){
				return null;
			}
			file = this.fso.CreateTextFile(sFileName);
		}else{
			file = this.fso.GetFile(sFileName);
		}
		return file;
	},
	writeXmlFile : function(sFileName, sContent){
		//write file
		sFileName = sFileName + '.xml'
		var sFileNamePath = this.__getFolder() + sFileName;
		var file = this.getFile(sFileNamePath, true);
		var ts = file.OpenAsTextStream(MyFile.FOR_WRITEING, 0);//0-TristateUseDefault
		ts.Write(sContent);
		ts.Close();

		return 'res/' + sFileName;
	},
	_fileFolder: null,
	__getFolder : function(){
		if (this._fileFolder == null){
			var locHref = location.href;
			//pattern: file:///{path}/test-file.html
			var dirTxt = locHref.substring(8, locHref.lastIndexOf('/') + 1);
			this._fileFolder = dirTxt + 'res/';
		}
		return this._fileFolder;
	},
	__renderInTheSameMonth : function(nTimeMills){
		var lastUpdateDt = new Date(nTimeMills);
		var now = new Date();
		if (now.getMonth() <= lastUpdateDt.getMonth()){
			return true;
		}
		//else
		return false;
	}
}


var MyConfig = {
	getTitleHash : function(){
		return {
			g: '特级大师',
			m: '国际大师',
			wg: '女子特级大师',
			wf: '女子棋联大师',
			wm: '女子国际大师',
			f: '棋联大师'
		};
	},
	getModeHash : function(){
		return {
			men: '男棋手',
			women: '女棋手',
			juniors: '青少年棋手',
			girls: '青年女棋手'
		};
	},
	getCountryHash : function(){
		return {
			'ALB':	'阿尔巴尼亚',
			'ALG':	'阿尔及利亚',
			'ANG':	'安哥拉',
			'ARG':	'阿根廷',
			'AUS':	'澳大利亚',
			'AUT':	'奥地利',
			'BAR':	'巴布达岛',
			'BLR':	'白俄罗斯',
			'BOL':	'玻利维亚',
			'BRA':	'巴西',
			'BUL':	'保加利亚',
			'BEL':	'比利时',
			'CHN':	'中国',
			'CAN':	'加拿大',
			'CZE':	'捷克',
			'CUB':	'古巴',
			'CHI':	'智利',
			'CYP':	'塞浦路斯',
			'CAM':	'柬埔寨',
			'COL':	'哥伦比亚',
			'CRO':	'克罗地亚',
			'DEN':	'丹麦',
			'DOM':	'多米尼加共和国',
			'EGY':	'埃及',
			'ECU':	'厄瓜多尔',
			'ESP':	'西班牙',
			'EST':	'爱沙尼亚',
			'ETH':	'埃塞俄比亚',
			'FIN':	'芬兰',
			'FRA':	'法国',
			'GBR':	'英国',
			'GEO':	'格鲁吉亚',
			'GER':	'德国',
			'GRE':	'希腊',
			'HUN':	'匈牙利',
			'HK':	'中国香港',
			'IND':	'印度',
			'INA':	'印度尼西亚',
			'IRQ':	'伊拉克',
			'IRI':	'伊朗',
			'IRL':	'爱尔兰',
			'ISL':	'冰岛',
			'ISR':	'以色列',
			'ITA':	'意大利',
			'JOR':	'约旦',
			'JPN':	'日本',
			'KAZ':	'哈萨克斯坦',
			'KOR':	'韩国',
			'KGZ':	'吉尔吉斯斯坦',
			'KSA':	'沙特阿拉伯',
			'KUW':	'科威特',
			'LIB':	'黎巴嫩',
			'LBA':	'比利时',
			'LTU':	'立陶宛',
			'LUX':	'卢森堡',
			'MGL':	'马来西亚',
			'MEX':	'墨西哥',
			'MAR':	'摩洛哥',
			'MON':	'摩纳哥',
			'MGL':	'蒙古',
			'MYA':	'缅甸',
			'NAM':	'纳米比亚',
			'NOR':	'挪威',
			'NZL':	'新西兰',
			'NED':	'荷兰',
			'NEP':	'尼泊尔',
			'NGR':	'尼日利亚',
			'PAK':	'巴基斯坦',
			'PAN':	'巴拿马',
			'PER':	'秘鲁',
			'PHI':	'菲律宾',
			'POL':	'波兰',
			'PUR':	'波多黎哥',
			'POR':	'葡萄牙',
			'PRK':	'朝鲜',
			'ROM':	'罗马尼亚',
			'RSA':	'南非',
			'RUS':	'俄罗斯',
			'SIN':	'新加坡',
			'SVK':	'斯洛伐克',
			'SLO':	'斯洛文尼亚',
			'SUD':	'苏丹',
			'SRI':	'斯里兰卡',
			'SWE':	'瑞典',
			'SUI':	'瑞士',
			'SCO':	'苏格兰',
			'SYR':	'叙利亚',
			'TUN':	'突尼斯',
			'THA':	'泰国',
			'TPE':	'中华台北',
			'TUR':	'土耳其',
			'UKR':	'乌克兰',
			'USA':	'美国',
			'VEN':	'委内瑞拉',
			'VIE':	'越南',
			'YEM':	'也门',
			'YUG':	'南斯拉夫',
			'ZIM':	'赞比亚',
			'MTN':	'黑山共和国',
			'MNE':	'黑山共和国',
			'SRB':	'塞尔维亚',
			'ROU':	'罗马尼亚',
			'ENG':	'英国',
			'ARM':	'亚美尼亚',
			'QAT':	'卡塔尔',
			'LAT':	'拉脱维亚',
			'AZE':	'阿塞拜疆',
			'UZB':	'乌兹别克斯坦',
			'MDA':	'摩尔多瓦',
			'BIH':	'波黑',
			'FID': '棋联',
			'UAE': '阿联酋'
		}
	}
}