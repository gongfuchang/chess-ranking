
Object.extend(String.prototype, {
    trim: function () {
        return this.replace(/(^\s*)|(\s*$)/g, "");
    }
});

function loadConfig() {
    toggleLoadingTips(true);
    MyFile.loadConfigEntity(function () {
        toggleLoadingTips(false);
    });
}
function toggleLoadingTips(show) {
    show ? Element.show('dvLoadingTips') : Element.hide('dvLoadingTips');
    btns = document.getElementsByTagName('button');
    for (let index = 0; index < btns.length; index++) {
        btns[index].disabled = show;
    }

}
function prefixInt(num, length) {
    return (num / Math.pow(10, length)).toFixed(length).substring(2);
}
function loadCurrentRate(mode, truncat_num) {
    var sUrl = '/player/current?url=' + encodeURIComponent('https://ratings.fide.com/'), remotePart, has_trend = true, complex = true;
    switch (mode) {
        case 'chinese':
            remotePart = 'a_top_var.php?continent=0&country=CHN&rating=standard&gender=&age1=0&age2=0&period=1&period2=1';
            has_trend = false;
            complex = false;
            break;
        case 'chinese-women':
            remotePart = 'a_top_var.php?continent=0&country=CHN&rating=standard&gender=F&age1=0&age2=0&period=';
            dt = new Date();
            remotePart += dt.getFullYear() + '-' + prefixInt(dt.getMonth() + 1, 2) + '-01';
            remotePart += '&period2=1';
            has_trend = false;
            complex = false;
            break;
        default:
            remotePart = 'a_top.php?list=' + mode;
            if(mode == 'junior' || mode == 'girls') has_trend = false;
            break;
    }
    sUrl += encodeURIComponent(remotePart);

    toggleLoadingTips(true);
    var req = new Ajax.Request(sUrl, {
        method: 'GET',
        onSuccess: function (trans) {
            //alert(trans.responseText)
            var sContent = trans.responseText;
            
            try {
                // console.log(sContent);
                renderTable(sContent, mode, truncat_num, has_trend, complex);

            } catch (err) {
                console.err(err);
                //TODO
                alert('请求 Fide 数据发生错误，请重新请求试试。');
                toggleLoadingTips(false);
            }

            toggleLoadingTips(false);
        }
    });
}
function renderTable(sContent, mode, truncat_num, has_trend, complex) {
    //clear cached data
    for (var i = 0; i < categorys.length; i++) {
        window.analyzeData[categorys[i]] = {};
    }
    Element.update('dvCharts', '');
    Element.hide('dvChartDetails');
    window.allRateArr = [];

    // 不带 ranking 数据的 6 列, 0-rank, 1: name, 2: country, 3: rate, 4: name-change, 5: birthday,
    // 简化版不带 ranking 数据的 6 列, 0-rank, 1: name, 2: title, 3: country, 4: rate, 5: birthday,

    // <td>1</td>
    // <td><a href=/profile/8602980>Hou, Yifan</a></td>
    // <td class="flag-wrapper">
    //     <img src="/svg/CHN.svg" height=20> CHN
    // </td>
    // <td>2628</td>
    // <td class="name-change">&nbsp;</td>
    // <td>1994</td>


    // 带 ranking 数据的 7 列， 0-rank, 1: name, 2: country, 3: rate, 4: name-change, 5: birthday, 6： trend
    // <td>6</td>
    // <td><a href=/profile/8605114>Lei, Tingjie</a></td>
    // <td class="flag-wrapper">
    //     <img src="/svg/CHN.svg" height=20> CHN
    // </td>
    // <td>2545</td>
    // <td class="name-change">&nbsp;</td>
    // <td>1997</td>
    // <td>2533 (7)</td>

    // TODO 2023-4-1 FIDE 改变查询策略后，查询数据跟之前不一致
    sContent = sContent.replace(/[\n\r]/ig, '');
    sContent = sContent.replaceAll(/<img src=\"\/svg\/(\w+)\.svg\" height=20>/ig, '');

    var reg = /<table>.+<\/table>/i
    var result = sContent.match(reg);

    //reg = /<tr bgcolor=#[a-z]+><td width=10>&nbsp;(\d+)<\/a><\/td><td>&nbsp;<a href=\/top_files.phtml\?id=(\d+) class=tur>([a-z|\,\s|\-|\.]+)<\/a><\/td><td>(&nbsp;[a-z]+)<\/td><td>&nbsp;([A-Z]+)<\/td><td>&nbsp;(\d+)<\/td><td>&nbsp;(\d+)<\/td><td>(&nbsp;){1,2}(\d{0,4}|&nbsp;])<\/td><\/tr>/gi;


    //var sTableHtml = '<table style="background: #737E88" border="0" cellspacing="1" cellpadding="3"><tr style="text-align: center; background: #4c67ac"><td><b>排名</b></td><td><b>姓名</b></td><td><b>译名</b></td><td><b>编辑</b></td><td><b>称号</b></td><td><b>国家</b></td><td><b>等级分</b></td><td><b>出生年月</b></td></tr>';
    // var sTableHtml = '<table style="background: #737E88" border="0" cellspacing="1" cellpadding="3"><tr style="text-align: center; background: #4c67ac"><td><b>排名</b></td><td><b>名次升降</b></td><td><b>姓名</b></td><td><b>译名</b></td><td><b>编辑</b></td><td><b>称号</b></td><td><b>国家</b></td><td><b>等级分</b></td><td><b>等级分升降</b></td><td><b>对局数</b></td><td><b>出生年份</b></td></tr>';
    var sTableHtml = has_trend ? '<table id="tblContent" style="background: #737E88" border="0" cellspacing="1" cellpadding="3"><tr style="text-align: center; background: #4c67ac; color: #ffffff"><td><b>排名</b></td><td><b>姓名</b></td><td><b>译名</b></td><td><b>编辑</b></td><td><b>国家</b></td><td><b>等级分</b></td><td><b>等级分升降</b></td><td><b>名次升降</b></td><td><b>出生年份</b></td></tr>' :
        '<table id="tblContent" style="background: #737E88" border="0" cellspacing="1" cellpadding="3"><tr style="text-align: center; background: #4c67ac; color: #ffffff"><td><b>排名</b></td><td><b>姓名</b></td><td><b>译名</b></td><td><b>编辑</b></td><td><b>国家</b></td><td><b>等级分</b></td><td><b>出生年份</b></td></tr>';
    var sNoneRecHtml = '';
    // {'lastUpdateTime': 168, 'players': {'1503014': {'zname': '卡尔森'}}}
    window.currentConfigEntity = MyFile.getConfigEntity();
    window.currentConfigMode = mode;
    window.currentTruncatNum = truncat_num;
    var hConfigHash = window.currentConfigEntity || {};
    var hTitleHash = MyConfig.getTitleHash();
    var hCountryHash = MyConfig.getCountryHash();
    var countNone = 0, chnPlayersCount = 0;

    var dvHidden = $('dvHiddenContent');
    Element.update(dvHidden, result);
    var dataRows = dvHidden.children[0].rows;
    for (var count = 1; count < dataRows.length; count++) {
        if (truncat_num && count > truncat_num) {
            break;
        }
        var r = dataRows[count].cells;

        // 带 ranking 数据的 7 列， 0-rank, 1: name, 2: country, 3: rate, 4: name-change, 5: birthday, 6： trend
        // 简化版的返回数据的 6 列， 0-rank, 1: name, 2: title, 3: country, 4: rate, 5: birthday,
        var nameCol = r[1];
        var sName = nameCol.innerText;
        // <td><a href=/profile/8602980>Hou, Yifan</a></td>
        var sId = (/profile\/([0-9]+)/i).exec(nameCol.innerHTML)[1];
        if (!sId) {
            continue;
        }
        var data = {
            rank: r[0].innerText.trim(),
            id: sId, name: sName,
            zname: sName,
            birthday: r[5].innerText.trim()
        };
        Object.extend(data, complex ? {
            country: r[2].innerText.trim(),
            rate: r[3].innerText.trim(),
        } : {
            title: r[2].innerText.trim(), 
            country: r[3].innerText.trim(),
            rate: r[4].innerText.trim(),
        });
   
        var rankTrend = -1, rateTrend = -1;
        if(has_trend && r.length > 6){          
            reg = /(\d+)\s\((\d+)\)/ig;
            trends = reg.exec(r[6].innerText.trim());
            if(trends){
                rateTrend = data.rate - trends.slice()[1];
                rankTrend = trends.slice()[2] - data.rank;
            }            
        }

        pushAnalyzeData(data);
        if (data.country == 'CHN') {
            chnPlayersCount++;
        }
        var config = hConfigHash[data.id];
        var bUpdated = config != null;
        if (config) {
            data.zname = config.zname;
        }
        var bIsNoneRecord = false;
        //不在config.csv中，或者不是中文名
        if (!config || hasNoChnChar(data.zname) || data.name.trim() != config.name.trim()) {
            bIsNoneRecord = true;
            countNone++;
            sNoneRecHtml += makeNoneRecRowHtml(data, false);
        }
        //无论怎样，更新内存中的config
        config = config || {};
        //backup
        var oldConfig = Object.extend({}, config);
        Object.extend(config, {
            name: data.name,
            zname: data.zname,
            country: data.country,
            title: data.title,
            games: data.games,
            birthday: data.birthday,
            rank: data.rank,
            rate: data.rate
        });
        if (!bUpdated) {
            Object.extend(config, {
                lastRank: oldConfig.rank || 0,
                lastRate: oldConfig.rate || 0
            });
        }
        hConfigHash[data.id] = config;
        // //trend 相关
        // var rankTrend = config.lastRank == 0 ? '-' : (config.lastRank - data.rank);
        // var rateTrend = config.lastRate == 0 ? '-' : (data.rate - config.lastRate);

        //title 和 country
        var dataStr = toJSONStr(data);
        data.country = hCountryHash[data.country] || data.country;
        data.title = (data.title || '').toUpperCase();//hTitleHash[data.title] || data.title;

        //构造html
        sTableHtml += '<tr class="' + (bIsNoneRecord ? 'o-alert' : (count % 2 == 0 ? 'e-row' : 'o-row')) + '">';
        sTableHtml += '<td align=center>' + data.rank + '</td>';
        // sTableHtml += '<td align=right><font color=' + (rankTrend > 0 ? 'green' : 'gray') + '>' + rankTrend + '</font></td>';
        sTableHtml += '<td><font color=' + (data.country == '中国' ? 'red' : '') + '>' + data.name + '</font></td>';
        sTableHtml += '<td>' + data.zname + '</td>';
        sTableHtml += '<td align="center">' + (bIsNoneRecord ? '&nbsp;' : ('<a href="#" onclick="editRow(' + data.id + ', this); return false;"><img src="images/edit.png" width="20" height="20" border=0></a>')) + '</td>';
        // sTableHtml += '<td>' + data.title + '</td>';
        sTableHtml += '<td>' + data.country + '</td>';
        sTableHtml += '<td align=right>' + data.rate + '</td>';
        if(has_trend){
            sTableHtml += '<td align=right><font color=' + (rateTrend > 0 ? 'green' : 'gray') + '>' + rateTrend + '</font></td>';
            sTableHtml += '<td align=right><font color=' + (rankTrend > 0 ? 'green' : 'gray') + '>' + rankTrend + '</font></td>';

        }
        // sTableHtml += '<td align=right>' + (data.games >= 0 ? data.games : '-') + '</td>';
        sTableHtml += '<td align=right>' + data.birthday + '</td>';
        sTableHtml += '</tr>';
    }
    sTableHtml += '</table>';

    var tips = '共获取到（<b>' + dataRows.length + '</b>）条' + (MyConfig.getModeHash()[mode]  ? MyConfig.getModeHash()[mode] : '') + '等级分记录，其中中国选手[<font color="#e76766""">' + chnPlayersCount + '</font>]名。【名次升降】中的“*”表示上次该选手未进入 Top100 排名';

    tips += (countNone > 0) ? ', 同时有（<font color="#e76766">' + countNone + '</font>）人未在库中或更易了英文名，需要处理:' : '';
    sNoneRecHtml = '<table id="tblConfig2Update" style="background: #737E88" border="0" cellspacing="1" cellpadding="3"><tr style="text-align: center; background: #4c67ac; color: #ffffff"><td><b>排名</b></td><td><b>编号</b></td><td><b>姓名</b></td><td><b>译名</b></td><td><b>国家</b></td><td><b>等级分</b></td><td><b>出生年份</b></td></tr>' + sNoneRecHtml;
    sNoneRecHtml += '</table>';
    tips += sNoneRecHtml;
    tips += '<br><button onclick="updateConfig()">更新数据</button>';
    tips += '<span style="margin-left: 5px"><button onclick="copyContent()">拷贝数据</button>&nbsp;<br><br>';

    sTableHtml = tips + sTableHtml;

    Element.update('dvContent', sTableHtml);

    //alert(Object.toJSON(window.analyzeData))
    $('btnAnalyze').disabled = false;
}
function copyContent(){
    var tbl = $('tblContent');
    var txt = $('txtContent');
    txt.textContent = tbl.innerText;
    txt.select();
    if(document.execCommand('copy')){
        alert('已拷贝表格内容到剪贴板');
    }
    txt.blur();
    
}
function updateConfig() {
    var tbl = $('tblConfig2Update');
    var configEntity = window.currentConfigEntity;
    var mode = window.currentConfigMode;
    var truncat_num = window.currentTruncatNum;
    if (!configEntity || !mode) {
        return;
    }
    var updateEntities = [];
    if (tbl) {
        for (i = 1; i < tbl.rows.length; i++) {
            var row = tbl.rows[i];
            var id = row.cells[1].innerHTML;
            var zname = row.cells[3].firstChild.value;
            if (!containsChinese(zname)) continue;
            updateEntities.push(Object.extend(configEntity[id], {
                'id': id,
                'zname': zname
            }));
        }
    }
    if (updateEntities.length == 0) {
        alert('没有要更新的选手或者填写不正确（必须是中文名）！请检查填写项。');
        return;
    }
    MyFile.writeConfigEntity(updateEntities, new function () {
        alert('配置更新完毕');
        loadCurrentRate(mode, truncat_num);
    });

}
function containsChinese(str) {
    const REGEX_CHINESE = /[\u3040-\u30ff\u3400-\u4dbf\u4e00-\u9fff\uf900-\ufaff\uff66-\uff9f]/;
    return str.match(REGEX_CHINESE);
}
function getConfigHash(bIsLady) {
    var result = {};

    return result;
}
function editRow(id, lnk) {
    var row = lnk.parentNode.parentNode;
    row.className = 'o-alert';
    lnk.style.display = 'none';
    var data = Object.extend({ id: id }, window.currentConfigEntity[id]);

    var tbl = $('tblConfig2Update');
    if (tbl) {
        var newRow = tbl.insertRow();
        newRow.className = 'o-alert';
        var tds = makeNoneRecRowHtml(data, true);
        for (var index = 0; index < tds.length; index++) {
            newRow.insertCell().innerHTML = tds[index];
        }
    }
}
function makeNoneRecRowHtml(data, bReturnTdList) {
    var result = [];
    result[0] = data.rank;
    result[1] = data.id;
    result[2] = data.name;
    result[3] = '<input type="text" name="" value="' + data.zname + '" onfocus="this.select()">';
    // result[4] = (data.title || '').toUpperCase();//MyConfig.getTitleHash()[data.title] || data.title;
    result[4] = MyConfig.getCountryHash()[data.country] || data.country;
    result[5] = data.rate;
    result[6] = data.birthday;
    if (!bReturnTdList) {
        result = '<tr class="o-alert"><td>' + result.join('</td><td>') + '</td></tr>';
    }
    return result
}
function hasNoChnChar(str) {
    if (str != null && str.match(/^[\x00-\xff]/)) {
        return true;
    }
    //else
    return false;
}
function toJSONStr(json) {
    var result = [];
    for (var name in json) {
        result.push(name + ':' + '\'' + json[name] + '\'');
    }
    return '{' + result.join(',') + '}'
}
window.analyzeData = {
    country: {}, birthday: {}, rate: {}, title: {}
};
var categorys = ['country', 'title', 'rate', 'birthday'];
function findCategoryIndex(name) {
    for (var i = 0; i < categorys.length; i++) {
        if (categorys[i] == name) {
            return i;
        }
    }
    //else
    return -1;
}
var CHART_DV_PREFFIX = 'chart_container_';
window.showTips = true;
function analyseData() {
    var sContent = '';
    for (var i = 0; i < categorys.length; i++) {
        var category = categorys[i];
        var chartDataArr = retrieveChartData(category);

        var ratePieDvId = 'pieChart_' + category;
        var rateBarDvId = 'barChart_' + category;
        var tipsHtml = chartDataArr[2];
        //<tr><td>piechart</td><td rowspan=2 valign=top>tips</td></tr>
        //<tr><td>barchart</td></tr>
        var chartHtml = '<table id=' + CHART_DV_PREFFIX + category + '>';
        chartHtml += '<tr><td id=' + ratePieDvId + '></td>'
        if (window.showTips) chartHtml += '<td rowspan=2 valign=top>' + tipsHtml + '</td>'
        chartHtml += '</tr>';
        chartHtml += '<tr><td id=' + rateBarDvId + '></td></tr>';
        chartHtml += '</table>'
        new Insertion.Bottom('dvCharts', chartHtml);//'<span id="' + ratePieDvId + '"></span>');

        var pieChart = new FusionCharts("src/Pie2D.swf", "myChartId", "520", "420", "0", "1");
        pieChart.setXMLData(chartDataArr[0]);
        pieChart.render(ratePieDvId);

        var barChart = new FusionCharts("src/Column2D.swf", "myChartId", "520", "150", "0", "1");
        barChart.setXMLData(chartDataArr[1]);
        barChart.render(rateBarDvId);

        //seperator
        new Insertion.Bottom('dvCharts', '<div class="separator_bar" />');
    }
}
window.allRateArr = [];
function getAllRateValues(rates) {
    var maxTemp = Math.max.apply(Math, rates) / 100, max = Math.round(maxTemp);
    max = (max < maxTemp ? (max + 0.5) : max) * 100;
    var minTemp = Math.min.apply(Math, rates) / 100, min = Math.round(minTemp);
    min = (min > minTemp ? (min - 0.5) : min) * 100;
    var avg = Math.avg(rates);
    return [avg, min, max]
}
function pushAnalyzeData(data) {
    for (var i = 0; i < categorys.length; i++) {
        var category = categorys[i];
        var entity = window.analyzeData[category];
        var key = data[category];
        if (category == 'rate') {
            key = Math.floor(key / 100) * 100;
        } else if (category == 'birthday') {
            key = Math.floor(key / 10) * 10;
        }
        //alert(category);
        entity[key] = entity[key] || { 'ids': [], 'rate': [] };
        entity[key]['ids'].push(data.id);
        entity[key]['rate'].push(data.rate);
        window.allRateArr.push(data.rate);
    }
}
function hideDetails() {
    Element.hide('dvChartDetails');
}
function showDetails(category, sIds) {

    try {
        var sTableHtml = '<table style="background: #737E88" border="0" cellspacing="1" cellpadding="3">';
        sTableHtml += '<tr class="e-row"><td colspan=11><a href="#" onclick="hideDetails(); return false;">&nbsp;Close</a></td></tr>';
        sTableHtml += '<tr style="text-align: center; background: #4c67ac; color: #ffffff"><td><b>#</b></td><td><b>排名</b></td><td><b>姓名</b></td><td><b>译名</b></td><td><b>国家</b></td><td><b>等级分</b><td><b>对局数</b></td><td><b>出生年份</b></td></tr>';
        var hConfigHash = window.currentConfigEntity;
        var hCountryHash = MyConfig.getCountryHash();
        var ids = sIds.split(','), ranks = [], rates = [], birthdays = [];
        for (var i = 0; i < ids.length; i++) {
            var data = Object.extend({}, hConfigHash[ids[i]]);

            data.country = hCountryHash[data.country] || data.country;
            //data.title = hTitleHash[data.title];

            //构造html
            sTableHtml += '<tr class="' + (i % 2 == 0 ? 'e-row' : 'o-row') + '">';
            sTableHtml += '<td align=center>' + (i + 1) + '</td>';
            sTableHtml += '<td align=center>' + data.rank + '</td>';
            sTableHtml += '<td><font color=' + (data.country == '中国' ? 'red' : '') + '>' + data.name + '</font></td>';
            sTableHtml += '<td>' + data.zname + '</td>';
            sTableHtml += '<td>' + data.title + '</td>';
            sTableHtml += '<td>' + data.country + '</td>';
            sTableHtml += '<td align=right>' + data.rate + '</td>';
            sTableHtml += '<td align=right>' + data.games + '</td>';
            sTableHtml += '<td align=right>' + data.birthday + '</td>';
            sTableHtml += '</tr>';
            ranks.push(data.rank);
            rates.push(data.rate);
            birthdays.push(data.birthday);
        }
        sTableHtml += '<tr class=e-row>';
        sTableHtml += '<td align=center><b>AVG</b></td>';
        sTableHtml += '<td class=focusTd align=right>' + Math.avg(ranks) + '</td>';
        sTableHtml += '<td class=focusTd align=right colspan=5>' + Math.avg(rates) + '</td>';
        var year = (new Date()).getFullYear();
        sTableHtml += '<td class=focusTd align=right colspan=2>' + (year - Math.avg(birthdays)) + '</td>';
        sTableHtml += '</tr>';
        sTableHtml += '<tr class="e-row"><td colspan=11 align=right><a href="#" onclick="hideDetails(); return false;">Close&nbsp;</a></td></tr>';
        sTableHtml += '</table>';

        Element.update('dvChartDetails', sTableHtml);
        var currChartDv = $(CHART_DV_PREFFIX + category);
        var contianer = $('dvChartDetails');
        Position.absolutize(contianer);
        Position.clone(currChartDv, contianer);
        contianer.style.left = 535 + (window.showTips ? 120 : 0) + 'px';
        contianer.style.top = (parseInt(contianer.style.top, '10') + 2) + 'px';

        Element.show('dvChartDetails');

    } catch (ex) {
        alert([ex.message, ex.stack]);
    }
}
function retrieveChartData(category) {
    var str = "<chart caption='" + category + "'>";
    var entitys = quickSort(window.analyzeData[category]);
    var count = 0, othersEntityIds = [], othersEntityAvgs = [], avgArr = [], categoryCounterArr = [];
    for (var name in entitys) {
        count++;
        var entity = entitys[name];
        var ids = entity['ids'];
        var avg = entity['avg'];
        if (count > 10) {
            othersEntityIds.push(ids);
            othersEntityAvgs.push(avg);
            continue;
        }
        avgArr.push(avg + '_' + name);
        categoryCounterArr.push(ids);
        str += "<set label='" + name + "' value='" + ids.length + "' link=\"j-showDetails('" + category + "', '" + ids.join(',') + "')\" />";
    }
    if (othersEntityIds.length > 0) {
        var sOthersName = 'Others';
        str += "<set label='" + sOthersName + "' value='" + othersEntityIds.length + "' link=\"j-showDetails('" + category + "', '" + othersEntityIds.join(',') + "')\" />";
        avgArr.push(Math.avg(othersEntityAvgs) + '_' + sOthersName);
        categoryCounterArr.push(othersEntityIds);
    }
    str += "</chart>";

    //TODO calc max/min
    var avgAllValue = getAllRateValues(window.allRateArr)[0];
    var allAvgValues = [];
    var strAvg = '', strAvgTbl = '<table class=tipslist>';
    for (var i = 0; i < avgArr.length; i++) {
        var avgStr = avgArr[i];
        var parts = avgStr.split('_');
        var key = parts[1] ? parts[1] : 'NA', value = parts[0];
        strAvg += "<set label='" + key + "' value='" + value + "'/>";
        allAvgValues.push(value);

        var ids = categoryCounterArr[i], showFunc = "showDetails('" + category + "', '" + ids.join(',') + "')";
        strAvgTbl += '<tr><td><a href="javascript:' + showFunc + '">' + key + '</a></td><td>' + value + '</td><td>' + ids.length + '</td></tr>';
    }
    var limits = getAllRateValues(allAvgValues);
    var strAvg = "<chart borderColor='737E88' borderThickness='3' bgColor='#ffffff' useRoundEdges='1' formatNumberScale='0' formatNumber='0' yAxisMinValue='" + limits[1] + "' yAxisMaxValue='" + limits[2] + "'>" + strAvg;
    strAvg += "<trendLines>" +
        "<line startValue='" + avgAllValue + "' color='ff0000' displayvalue='' /> " +
        "</trendLines>" + "</chart>";

    strAvgTbl += '<tr><td>AVG</td><td colspan=2>' + avgAllValue + '</td></tr>';
    strAvgTbl += '</table>';
    return [str, strAvg, strAvgTbl];
}
function quickSort(map) {
    var arr = [];
    var hashMap = {};
    for (var name in map) {
        var entity = map[name];
        var ids = entity['ids'];
        var avg = Math.avg(entity['rate'], false);
        var count = ids.length;
        var key = (count >= 10 ? count : '0' + count) + '_' + avg + '_' + name;
        arr.push(key);
        hashMap[key] = { 'ids': ids, 'avg': Math.round(avg) };
    }
    arr = arr.sort().reverse();
    var result = {};
    for (var i = 0; i < arr.length; i++) {
        var str = arr[i];
        var parts = str.split('_');
        result[parts[2]] = hashMap[str];
    }
    return result;
}
Object.extend(Math, {
    avg: function (arr, bRound) {
        var num = 0, len = arr.length;
        for (var i = 0; i < len; i++) {
            num += parseFloat(arr[i]);
        }
        var result = parseFloat(num / len);
        return bRound === false ? result : Math.round(result);
    }
});

loadConfig();