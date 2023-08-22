var Midware = {
	CONFIG_ENTITY: {}, // {'1503014': {'zname': '卡尔森'}}
	loadConfigEntity : async function(){
		var sUrl = '/config/list';
		try {
			const resp = await fetch('/config/list', {
				method: 'GET'
			});
			return resp.json().then(jso =>{	
				this.CONFIG_ENTITY = jso;
			});
		} catch (err) {
			alert(err.message);
			console.err(err);
		}        	
	},
	getConfigEntity : function(){
		return (this.CONFIG_ENTITY || {});

	},
	writeConfigEntity : async function(entities, callback){
		if (!entities){
			return;
		}
		//else
		try {
			const resp = await fetch('/config/save', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify({'players' : entities})
			});
			return resp.json();
		} catch (err) {
			console.error(err);
			alert('保存棋手数据发生错误，请重新请求试试。');
		}
	},

}


var PlayerConfig = {
	getTitleHash2 : function(){
		return {
			gm: '特级大师',
			im: '国际大师',
			fm: '棋联大师',
			cm: '候选大师',
			wgm: '女子特级大师',
			wim: '女子国际大师',
			wfm: '女子棋联大师',
			wcm: '女子候选大师'
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
			'HKG':	'中国香港',
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