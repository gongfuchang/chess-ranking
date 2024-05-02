const FILTER_STORAGE_NAME = "com.dan.chess.rank.filters";
var Filter = {   
    doDeleteFilter: function(id){
        var savedFilters = JSON.parse(localStorage.getItem(FILTER_STORAGE_NAME) || '{}');
        if(savedFilters[id] && confirm(`确定要删除【${id}】？`)){
            delete savedFilters[id];
            localStorage.setItem(FILTER_STORAGE_NAME, JSON.stringify(savedFilters));
            this.loadFilters();
        }
    },
    loadFilters: function(){
        var filters = Object.entries(JSON.parse(localStorage.getItem(FILTER_STORAGE_NAME) || '{}')); 
        var container = $('dvCustomFilters');
        if(filters.length == 0){
            Element.hide(container);
            return;
        }
        var htmlContent = filters.length > 0 ? '<span>自定义查找：</span>' : '';
        filters.forEach(function(ft){
            htmlContent += `
                <a onclick="Filter.doCustomSearchByFilter('${ft[0]}', this)" href='#'>${ft[0]}</a>
                <span class='spButton'><a onclick="Filter.doDeleteFilter('${ft[0]}')" href='#' title='点击删除' class='btn'>X</a></span>
            `;
        });
        if(htmlContent){
            container.innerHTML = htmlContent;
            Element.show(container);
        }
        
    },
    saveFilter: function(){
        var opt = this.collectSearchOpt();
        var desc = Object.entries(opt).filter(it=>it[1]).map( it => `${it[0]} = ${it[1]}`).join(', ');
        var name = prompt(`请在保存如下查询参数时起个名字：${desc}`, this.getFilterName(opt)); // TODO auto name
        var savedFilters = JSON.parse(localStorage.getItem(FILTER_STORAGE_NAME) || '{}');
        if(name){
            // save to storage
            savedFilters[name] = opt;
            localStorage.setItem(FILTER_STORAGE_NAME, JSON.stringify(savedFilters));
            this.loadFilters();
        }
    },
    getFilterName: function(opt){
        var form = document.querySelector('#customSearch');
        var items = Object.entries(opt).filter(it=>it[1]); // 规律掉“表头”
        var result = [];
        items.forEach(function(item){
            var key = item[0], value = item[1]; // 'country', 'RUS'
            var selectElm = form[key];
            var found = Array.from(selectElm.options).map(it=>[it.value, it.text]).find(it => it[0] == value); // ['RUS', '俄罗斯']
            result.push(found[1]);
        });
        return result.join('-');
    },
    doCustomSearchByFilter: function(id, sourceElm){
        var savedFilters = JSON.parse(localStorage.getItem(FILTER_STORAGE_NAME) || '{}');
        var filter = savedFilters[id];
        if(filter){
            doCustomSearch(filter, sourceElm);
        }
    },
    collectSearchOpt: function(){
        var form = document.querySelector('#customSearch');
        opt = {
            'country': form.country.value,
            'gender': form.gender.value,
            'rating': form.rating.value,
            'topn': form.topn.value,
            'rateLow': form.rateLow.value,
        }
        if(parseInt(form.minAge.value) > parseInt(form.maxAge.value)){
            form.ageMin.value = '';
            form.ageMax.value = '';
        }else{
            opt['minAge'] = form.minAge.value
            opt['maxAge'] = form.maxAge.value
        }
        return opt;
    },

    updateSearchOptStatus: function(opt){
        // opt: {'country': 'RUS', 'ageMin': 20 ...}
        var form = document.querySelector('#customSearch');
        Array.from(form.querySelectorAll('select')).forEach(function(elm){
            var key = elm.name; // 'country' -> 'RUS'
            elm.value = opt[key] || (key == 'rating' ? 'standard' : '');
            // set style of event source link element
            var source = event.target || event.srcElement;
        });
    },
    updateFilterLinkStatus: function(sourceElm){
        if(!sourceElm) return;
        // console.log(sourceElm)
        var currLinkText = sourceElm.text;
        var links = Array.from(document.querySelectorAll('#dvMain a:not(.btn)'))
        links.filter(it=>it.text.trim() == currLinkText)[0].setAttribute('class', 'hightlight');
        links.filter(it=>it.text.trim() != currLinkText).map(it=>it.setAttribute('class', ''));
    }
}