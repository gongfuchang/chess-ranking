function doCustomSearch(opt, sourceElm){
    Element.hide('dvAdvancedSearch');
    Element.show('dvSearchResult');
    if(opt){
        loadCurrentRate(opt);
        Filter.updateSearchOptStatus(opt);
        Filter.updateFilterLinkStatus(sourceElm);
        return;
    }
    var opt = Filter.collectSearchOpt();
    loadCurrentRate(opt);         
}
function doTopSearch(opt, sourceElm){
    Element.hide('dvAdvancedSearch');
    Element.show('dvSearchResult');
    loadCurrentTopRate(opt);
    Filter.updateSearchOptStatus(opt);
    Filter.updateFilterLinkStatus(sourceElm);        
}
const DASHBOARD_URL = 'http://chesskb.kittygpt.cn/app/dashboards#/view';
const DASHBOARD_DEFAULT_PARAMS = '_g=(refreshInterval%3A(pause%3A!t%2Cvalue%3A60000)%2Ctime%3A(from%3Anow-150y%2Cto%3Anow))&show-time-filter=true'

function openAdvancedSearch(dashboard){
    var src = `${DASHBOARD_URL}/${dashboard}?${DASHBOARD_DEFAULT_PARAMS}`;
    window.open(src, '_blank');
}
function age2Bday(age){
    if (!age) return null;
    return (new Date()).getFullYear() - age;
}
async function loadCurrentRate(options) {
    var opt = options || window.currentSearchOptions;
    if(!opt){
        alert('找不到查找数据的参数！请重新点击过滤器或者查找按钮。');
        return;
    }

    var sUrl = '/player/current?url=' + encodeURIComponent('https://ratings.fide.com/'), remotePart;

    if(opt.topfilter){
        remotePart = 'a_top.php?list=' + opt.topfilter 
    }else{
        remotePart = 'incl_search_l.php?search_inactive=on';
        remotePart += '&search_country=' + (opt.country || 'all')
            + `&&search_low=${opt.rateLow || 'all'}&search_high=3500`
            + '&search_gender=' + (opt.gender || 'all') 
            + '&search_rating=' + (opt.rating || 'std')
            + `&search_bday_start=${age2Bday(opt.maxAge) || 'all'}&search_bday_end=${age2Bday(opt.minAge) || 'all'}`
            + '&search_radio=rating&search_asc=descending';
    }
           
    sUrl += encodeURIComponent(remotePart);  

    // if(true) sUrl = 'test.html'
    // if(true) sUrl = 'https://ratings.fide.com/' + remotePart


    toggleLoadingTips(true);
    try {
        const resp = await fetch(sUrl, {
            method: 'GET'
        });
        resp.text().then(content => {
            window.currentSearchOptions = opt;
            renderTable(content, opt.topn);
        }) 
    } catch (err) {
        console.error(err);
        alert('请求 Fide 数据发生错误，请重新请求试试。');
        
    }    
    toggleLoadingTips(false);
}
const TITLE_HASH = PlayerConfig.getTitleHash2();
const FED_HASH = PlayerConfig.getCountryHash();
const FIDE_SITE = 'https://ratings.fide.com/'; 
function updateHeaderDisplay(table){
	headerHash = {'#' : '#', Name: '姓名', Title: '称号', Fed: '棋协', Rating: '等级分', '+-': '换名', 'B-Year': '出生年份', 'Avg12M': '12月平均'};
    var searchRating = window.currentSearchOptions.rating || 'std';
    // convert from 'std' to 'Std.'
    var ratingKey = searchRating.charAt(0).toUpperCase() + searchRating.slice(1) + '.';
    headerHash[ratingKey] = '等级分';

    var indexedHeaderDict = {};
	table.querySelectorAll('thead th').forEach(function(it, index){
        if (headerHash[it.innerText]){
            indexedHeaderDict[it.innerText] = index;
            it.innerText= headerHash[it.innerText] || it.innerText;
        }else{
            it.parentNode.removeChild(it);
        }
    })	
    return indexedHeaderDict;
}
function updateContentDisplay(table, indexedHeaderDict){
	rows = table.querySelectorAll('tbody tr').forEach(function(row){
        // change profile link
		var cols = row.cells;

        // find name column
        var nameColIndex = indexedHeaderDict['Name'];
		var nameLink = cols[nameColIndex].querySelector('a');
		nameLink.href = FIDE_SITE + nameLink.href.split('/').slice(-2).join('/');
		nameLink.setAttribute('target', 'blank');
		
        // title 
        var titleColIndex = indexedHeaderDict['Title'];
        if (titleColIndex){
            var titleCol = cols[titleColIndex];
            var titleStr = titleCol.innerText.toLowerCase();
            // titleCol.innerText = TITLE_HASH[titleStr] || titleCol.innerText;
            titleCol.setAttribute('title', TITLE_HASH[titleStr] || titleCol.innerText);
            titleCol.innerText = titleCol.innerText.toUpperCase();
        }


        // fed name and country flag
        var fedColIndex = indexedHeaderDict['Fed'];
		var fedCol = cols[fedColIndex];
		var fedFlag = fedCol.querySelector('img');
		fedFlag.src = FIDE_SITE + fedFlag.src.split('/').slice(-2).join('/');
		fedFlag.setAttribute('height', '16');
        var fedStr = fedCol.innerText.trim();
		fedCol.childNodes[2].textContent = FED_HASH[fedStr] || fedCol.innerText
        row.setAttribute('_country', fedStr);

        // for chinese fed, hightlight them
        var opt = window.currentSearchOptions;
        if(opt?.country != 'CHN' && fedStr == 'CHN') row.className = 'highlight';
	})	
    // remove column(s) that not in the indexedHeaderDict
    var indexList = Object.values(indexedHeaderDict);
    table.querySelectorAll('tbody tr').forEach(function(row){
        Array.from(row.cells).forEach(function(cell, index){
            if(!indexList.include(index)){
                cell.parentNode.removeChild(cell);
            }
        });
    })


}

function extractProfileId(row){
	if(!row) return null;
	var nameLink = row.querySelector('a');
	return nameLink.href.split('/').slice(-1);
}
function insertColumn(table, index, title, colInsertFunc){
    index = index >= 0 ? (index + 1) : table.querySelectorAll('thead th').length;

    if(title){
        var headerCol = table.querySelector(`thead th:nth-of-type(${index})`);
        if(!headerCol) console.error(`no element in position ${index} of given table!`);
        var znameHeaderCol = document.createElement('th');
        znameHeaderCol.innerText = title;
        headerCol.parentNode.insertBefore(znameHeaderCol, headerCol);
    
    }

	index = index - 1;
    if(colInsertFunc){
        table.querySelectorAll('#dvContent tbody tr').forEach(function(row){
            var cols = row.cells;
            var col = cols[index];
            col.parentNode.insertBefore(colInsertFunc.call(this, col.parentNode, col), col);
        });
    }
	
}
function renderTable(sContent, truncat_num) {
    // if contains 'Too many results', show error info
    if(sContent.includes('Too many results')) {
        // strip number from '<i><strong>number</strong></i>'
        var num = sContent.match(/<i><strong>(\d+)<\/strong><\/i>/)[1];
        alert(`返回了【${num}】条数据，数据量过大，请缩小范围再试，例如限制【等级分下限】。`);
        return;
    }
    // trim any script firstly
    sContent = sContent.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');

    // truncate rows of table, before render it
    var parser = new DOMParser();
    var doc = parser.parseFromString(sContent, 'text/html');
    var table = doc.querySelector('table');
    // if the first row contains colspan, remove the entire row
    if(table.rows[0].cells[0].colSpan > 1) table.deleteRow(0);
    while (table.rows.length > truncat_num + 1) {
        table.deleteRow(truncat_num + 1);
    }

    var dvContent = $('dvContent');
    // Element.update(dvContent, sContent);
    Element.update(dvContent, table.outerHTML);

    // remove redundent elements
    // dvContent.removeChild(dvContent.querySelector('div.title-page-sm'));
    var titleDiv = dvContent.querySelector('div.title-page')
    if (titleDiv) 
        dvContent.removeChild(titleDiv);

    var scriptBlock = dvContent.querySelector('script')
    if (scriptBlock) 
        dvContent.removeChild(scriptBlock);

	table = dvContent.querySelector('table'); 

	// update table header
	var indexedHeaderDict = updateHeaderDisplay(table);

	// update table style
	updateContentDisplay(table, indexedHeaderDict)

    // if there is no index column, just add one, which is showing '#' at header and the row number in each row
    if(indexedHeaderDict['#'] === undefined) {
        insertColumn(table, 0, '#');
        table.querySelectorAll('tbody tr').forEach(function(row, index){
            var col = document.createElement('td');
            col.innerText = index + 1;
            row.insertBefore(col, row.cells[0]);
        });
    }

    // truncat rows
    var rowsCount = table.rows.length - 1; // exclude header row
    if(truncat_num){
        table.querySelectorAll('tbody tr').forEach(function(row, index){
            if(index + 1 > truncat_num) row.parentNode.removeChild(row);
        });
    }    

	// insert zname column
	const configHash = Midware.getConfigEntity();
	insertColumn(table, 2, '中文名', function(row){
		var profileId = extractProfileId(row);
        row.setAttribute('_id', profileId);

		var config = configHash[profileId];
		var col = document.createElement('td');
		col.innerText = config?.zname || '';
		return col;
	});
  
    // if these is no zname, hightlight it
    table.querySelectorAll('tbody tr').forEach(function(row){
        if(!row.cells[2].innerText.trim()){
            row.className = 'o-alert';
        }
    })

    // update hints    
    var chnPlayersCount = Array.from(table.querySelectorAll('tbody tr')).filter(row => row.getAttribute('_country') == 'CHN').length;
    var countNone = Array.from(table.querySelectorAll('tbody tr')).filter(row => !row.cells[2].innerText.trim()).length;
    var hints = `共获取到（<b>${rowsCount}</b>）条记录，展示其中 ${truncat_num || rowsCount} 条${chnPlayersCount > 0 ? '，其中中国选手 [ <font color="#dd1a2a""">' + chnPlayersCount + '</font> ] 名' : ''}。`;
    hints += (countNone > 0) ? '同时有（ <font color="#dd1a2a">' + countNone + '</font> ）人未在库中或更易了英文名，需要处理:' : '';
    Element.update('dvHints', hints);
    
    var flagImgs = Array.from(table.getElementsByTagName('img'));
    flagImgs.forEach(function(elm){
        var fide = elm.parentElement.parentElement.getAttribute('_country');
        elm.src = elm.src.replace(/flags\/[a-z]+\.svg$/, 'svg/' + fide + '.svg');
            
    })

    // update with sex and other info, and then assembly editor table: copy the data table and remove rows with zname, then change the edit column
    // updateExtraInfo(table).then(data => {assemblyEditorTable()});
    assemblyEditorTable();

    // insert edit column
    insertColumn(table, 3, '编辑', function(row, sibling){
		var profileId = row.getAttribute('_id');
		var col = document.createElement('td');
        if(sibling.previousSibling.innerText.trim()){
            col.innerHTML = `
                <a href="#" onclick="editRow(${profileId}, this); return false;">
                    <img src="images/edit.png" width="20" height="20" border=0>
                </a> 
            `;
        }		
		return col;
	});

    Element.show('dvContent');
    Element.show('dvEditableContent');
}
function assemblyEditorTable(){
    var dvEditableContent = $('dvEditableContent')
    Element.update(dvEditableContent, dvContent.innerHTML);
    Array.from(dvEditableContent.querySelectorAll('tbody tr')).forEach(function(row, index){
        if(row.cells[2].innerText.trim()){
            row.parentNode.removeChild(row); // remove the rows that contains znames
        }else{
            updateZnameEditor(row);
        }
        
    });
}
async function updateExtraInfo(table){
    var ids = Array.from(table.querySelectorAll('tbody tr')).map(it=>it.getAttribute('_id'));

    try {
        const controller = new AbortController();
        const id = setTimeout(() => controller.abort(), 2000);

        const resp = await fetch("/player/extra", {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Basic ZWxhc3RpYzp3czEyMzQ1Ng=='
            },
            body: JSON.stringify({ids: ids.join(',')}),
            signal: controller.signal
        });
        clearTimeout(id);
        return resp.json().then(jso =>{
            var entries = jso;
            if(!entries.length) return;
            insertColumn(table, 6, '性别'); // add header first
            insertColumn(table, 7, null, function(row){        
                var col = document.createElement('td');
                col.innerText = entries.find(it=>it?._id==row.getAttribute('_id'))?._source?.Sex || '';
                // col.innerText = col.innerText == 'M' ? '' : col.innerText;
                if(col.innerText == 'F') row.className = row.className ? row.className + ' pink' : 'pink';
                return col;
            });
        }); 
    } catch (err) {
        console.error(err);
        // alert('请求 Extra 数据发生错误，请重新请求试试。');
    }
}

function editRow(id, lnk) {
    var rawRow = lnk.parentNode.parentNode;
    rawRow.className = 'o-alert';
    lnk.style.display = 'none';

    var tbl = $('dvEditableContent').querySelector('table tbody');
    var newRow = tbl.insertRow();
    newRow.innerHTML = rawRow.innerHTML;
    newRow.deleteCell(3); // delete the editor column
    newRow.setAttribute('_id', id);
    newRow.className = rawRow.className;
    updateZnameEditor(newRow, rawRow.cells[2].innerText); // update with zname
}
function updateZnameEditor(row, zname){
    row.cells[2].innerHTML = `<input type="text" name="" value="${zname ? zname : row.cells[1].innerText}" onfocus="this.select()">`;
}

function updateConfig() {
    var tbl = $('dvEditableContent').querySelector('table');
    var configEntity = Midware.getConfigEntity();
    if (!configEntity) {
        return;
    }
    var updateEntities = [];
    if (tbl) {
        for (i = 1; i < tbl.rows.length; i++) {
            var row = tbl.rows[i];
            var id = row.getAttribute('_id');
            var zname = row.cells[2].firstChild.value;
            if (!containsChinese(zname)) continue;
            updateEntities.push(Object.extend(configEntity[id] || {}, collectConfigEntity(row)));
        }
    }
    if (updateEntities.length == 0) {
        alert('没有要更新的选手或者填写不正确（必须是中文名）！请检查填写项。');
        return;
    }
    toggleLoadingTips(true);
    Midware.writeConfigEntity(updateEntities).then(jso =>{
        alert('配置更新完毕');
        Midware.loadConfigEntity().then(data => {window.currentSearchOptions.topfilter ? loadCurrentTopRate() : loadCurrentRate()});
    });
}

function collectConfigEntity(row){
    var cols = row.cells;
    return {
        id: row.getAttribute('_id'),
        zname: cols[2].firstChild.value,
    }
}


function loadConfig() {
    toggleLoadingTips(true);
    Midware.loadConfigEntity().then(data =>{toggleLoadingTips(false);});

    Filter.loadFilters();

    document.body.style['background-image'] = `url('/images/bg-${Math.ceil(Math.random() * 5)}.jpg')`;
}
function toggleLoadingTips(show) {
    show ? Element.show('dvLoadingTips') : Element.hide('dvLoadingTips');
    document.querySelectorAll('#dvMain button').forEach(function(elm){
        elm.disabled = show;
    })
    document.querySelectorAll('#dvMain a').forEach(function(elm){
        elm.style['pointer-events'] = show ? 'none' : 'all';
    })

}

function copyContent(useEnglishName){
    var tbl = $('dvContent').querySelector('table');
    var txt = $('txtContent');
    var rowTextArr = [];
    // var excludedCols = tbl.rows[0].children.length == 9 ? [3, 6, 8] : [3, 4]; // 编辑，换名，12月平均 | 编辑
	var includedNames = useEnglishName ? ['#', '姓名', '棋协', '等级分', '出生年份'] : ['#', '中文名', '棋协', '等级分', '出生年份'];
	var excludedCols = Array.from(tbl.rows[0].cells).map((_, index) => includedNames.include(_.textContent) ? index : -1).filter( i=>i>=0);
     
    Array.from(tbl.rows).forEach(function(row){
        var textArr = Array.from(row.cells).filter(
            function(it,index){return excludedCols.include(index)}
        ).map(it=> it.innerText.trim());
        // 如果是第一行
        if(row.rowIndex == 0){
            textArr = textArr.map(name => {
                if (name === "中文名") return "姓名";
                if (name === "出生年份") return "出生";
                return name;
              });
        }
        rowTextArr.push(textArr.join('	'));
    })
    txt.textContent = rowTextArr.join('\n');
    txt.select();
    if(document.execCommand('copy')){
        alert('已拷贝表格内容到剪贴板');
    }
    txt.blur();
    
}
function containsChinese(str) {
    const REGEX_CHINESE = /[\u3040-\u30ff\u3400-\u4dbf\u4e00-\u9fff\uf900-\ufaff\uff66-\uff9f]/;
    return str.match(REGEX_CHINESE);
}


loadConfig();