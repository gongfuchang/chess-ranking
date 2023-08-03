const FILTER_STORAGE_NAME = "com.dan.chess.rank.filters";

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

    loadFilters();

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
function prefixInt(num, length) {
    return (num / Math.pow(10, length)).toFixed(length).substring(2);
}
function doDeleteFilter(id){
    var savedFilters = JSON.parse(localStorage.getItem(FILTER_STORAGE_NAME) || '{}');
    if(savedFilters[id] && confirm(`确定要删除【${id}】？`)){
        delete savedFilters[id];
        localStorage.setItem(FILTER_STORAGE_NAME, JSON.stringify(savedFilters));
        loadFilters();
    }
}
function loadFilters(){
    var filters = Object.entries(JSON.parse(localStorage.getItem(FILTER_STORAGE_NAME) || '{}')); 
    var container = $('dvCustomFilters');
    var htmlContent = filters.length > 0 ? '<span>自定义查找：</span>' : '';
    filters.forEach(function(ft){
        htmlContent += `
            <span>
                <a onclick="doCustomSearchByFilter('${ft[0]}', this)" href='#'>${ft[0]}</a>
            </span>
            <span class='delButton'>(<a onclick="doDeleteFilter('${ft[0]}')" href='#' title='点击删除' class='btn'>X</a>)</span>
        `;
    });
    if(htmlContent){
        container.innerHTML = htmlContent;
        Element.show(container);
    }
    
}
function saveFilter(){
    var opt = collectSearchOpt();
    var desc = Object.entries(opt).filter(it=>it[1]).map( it => `${it[0]} = ${it[1]}`).join(', ');
    var name = prompt(`请在保存如下查询参数时起个名字：${desc}`, getFilterName(opt)); // TODO auto name
    var savedFilters = JSON.parse(localStorage.getItem(FILTER_STORAGE_NAME) || '{}');
    if(name){
        // save to storage
        savedFilters[name] = opt;
        localStorage.setItem(FILTER_STORAGE_NAME, JSON.stringify(savedFilters));
        loadFilters();
    }
}
function getFilterName(opt){
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
}
function doCustomSearchByFilter(id, sourceElm){
    var savedFilters = JSON.parse(localStorage.getItem(FILTER_STORAGE_NAME) || '{}');
    var filter = savedFilters[id];
    if(filter){
        doCustomSearch(filter, sourceElm);
    }
}
function collectSearchOpt(){
    var form = document.querySelector('#customSearch');
    opt = {
        'country': form.country.value,
        'gender': form.gender.value,
        'rating': form.rating.value,
        'topn': form.topn.value
    }
    if(parseInt(form.minAge.value) > parseInt(form.maxAge.value)){
        form.ageMin.value = '';
        form.ageMax.value = '';
    }else{
        opt['minAge'] = form.minAge.value
        opt['maxAge'] = form.maxAge.value
    }
    return opt;
}

function updateSearchOptStatus(opt){
    // opt: {'country': 'RUS', 'ageMin': 20 ...}
    var form = document.querySelector('#customSearch');
    Array.from(form.querySelectorAll('select')).forEach(function(elm){
        var key = elm.name; // 'country' -> 'RUS'
        elm.value = opt[key] || (key == 'rating' ? 'standard' : '');
        // set style of event source link element
        var source = event.target || event.srcElement;
    });
}
function updateFilterLinkStatus(sourceElm){
    if(!sourceElm) return;
    // console.log(sourceElm)
    var currLinkText = sourceElm.text;
    var links = Array.from(document.querySelectorAll('#dvMain a:not(.btn)'))
    links.filter(it=>it.text.trim() == currLinkText)[0].setAttribute('class', 'hightlight');
    links.filter(it=>it.text.trim() != currLinkText).map(it=>it.setAttribute('class', ''));
}
function doCustomSearch(opt, sourceElm){
    if(opt){
        loadCurrentRate(opt);
        updateSearchOptStatus(opt);
        updateFilterLinkStatus(sourceElm);
        return;
    }
    var opt = collectSearchOpt();
    loadCurrentRate(opt);     
}
function showCustomSearch(){
    Element.show('dvCustomOptions')
}

function getCurrentDate(){
    dt = new Date();
    return dt.getFullYear() + '-' + prefixInt(dt.getMonth() + 1, 2) + '-01';
}
function loadCurrentRate(options) {
    var opt = options || window.currentSearchOptions;
    if(!opt){
        alert('找不到查找数据的参数！请重新点击过滤器或者查找按钮。');
        return;
    }

    var sUrl = '/player/current?url=' + encodeURIComponent('https://ratings.fide.com/'), remotePart, has_trend = true, complex = true;
    remotePart = `a_top_var.php?continent=0&country=${opt.country||''}&rating=${opt.rating||'standard'}&gender=${opt.gender||''}&age1=${opt.minAge||''}&age2=${opt.maxAge||''}&period=1&period2=1`;
           
    sUrl += encodeURIComponent(remotePart);
    if(true){
        content = `
        
        <div class="title-page-sm col-12 " style="padding-left: 10px;" id="f1" ">PERIOD: AUGUST 2023 <br> RANK STANDARD RATING WORLD   AGE: 23 AND YOUNGER</div>
        <table>
            <thead>
            <tr>
                <th>#</th>											
                <th>Name</th>
                <th>Title</th>
                <th>Fed</th>
                <th>Rating</th>
                <th>B-Year</th>
            </tr>
            </thead>
            <tr>
            <td>1</td>
            <td><a href=/profile/12573981>Firouzja, Alireza</a></td>
            <td>GM</td>
            <td class=" flag-wrapper">
            <img src="/svg/FRA.svg" height=20> FRA
            </td>
            <td>2777</td>

            <td>2003</td>
            </tr>
            <tr>
                <td>2</td>
                <td><a href=/profile/46616543>Gukesh D</a></td>
                <td>GM</td>
                <td class="flag-wrapper">
                    <img src="/svg/IND.svg" height=20> IND
                </td>
                <td>2751</td>

                <td>2006</td>
            </tr>
            <tr>
                <td>3</td>
                <td><a href=/profile/14204118>Abdusattorov, Nodirbek</a></td>
                <td>GM</td>
                <td class="flag-wrapper">
                    <img src="/svg/UZB.svg" height=20> UZB
                </td>
                <td>2725</td>

                <td>2004</td>
            </tr>
            <tr>
                <td>4</td>
                <td><a href=/profile/25059530>Praggnanandhaa R</a></td>
                <td>GM</td>
                <td class="flag-wrapper">
                    <img src="/svg/IND.svg" height=20> IND
                </td>
                <td>2707</td>

                <td>2005</td>
            </tr>
            <tr>
                <td>5</td>
                <td><a href=/profile/35009192>Erigaisi Arjun</a></td>
                <td>GM</td>
                <td class="flag-wrapper">
                    <img src="/svg/IND.svg" height=20> IND
                </td>
                <td>2704</td>

                <td>2003</td>
            </tr>
            <tr>
                <td>6</td>
                <td><a href=/profile/12539929>Maghsoodloo, Parham</a></td>
                <td>GM</td>
                <td class="flag-wrapper">
                    <img src="/svg/IRI.svg" height=20> IRI
                </td>
                <td>2702</td>

                <td>2000</td>
            </tr>
            <tr>
                <td>7</td>
                <td><a href=/profile/12940690>Keymer, Vincent</a></td>
                <td>GM</td>
                <td class="flag-wrapper">
                    <img src="/svg/GER.svg" height=20> GER
                </td>
                <td>2701</td>

                <td>2004</td>
            </tr>
            <tr>
                <td>8</td>
                <td><a href=/profile/1226380>Deac, Bogdan-Daniel</a></td>
                <td>GM</td>
                <td class="flag-wrapper">
                    <img src="/svg/ROU.svg" height=20> ROU
                </td>
                <td>2698</td>

                <td>2001</td>
            </tr>
            <tr>
                <td>9</td>
                <td><a href=/profile/2040506>Sevian, Samuel</a></td>
                <td>GM</td>
                <td class="flag-wrapper">
                    <img src="/svg/USA.svg" height=20> USA
                </td>
                <td>2698</td>

                <td>2000</td>
            </tr>
            <tr>
                <td>10</td>
                <td><a href=/profile/12521213>Tabatabaei, M. Amin</a></td>
                <td>GM</td>
                <td class="flag-wrapper">
                    <img src="/svg/IRI.svg" height=20> IRI
                </td>
                <td>2696</td>

                <td>2001</td>
            </tr>
            <tr>
                <td>11</td>
                <td><a href=/profile/2047640>Xiong, Jeffery</a></td>
                <td>GM</td>
                <td class="flag-wrapper">
                    <img src="/svg/USA.svg" height=20> USA
                </td>
                <td>2693</td>

                <td>2000</td>
            </tr>
            <tr>
                <td>12</td>
                <td><a href=/profile/24133795>Sarana, Alexey</a></td>
                <td>GM</td>
                <td class="flag-wrapper">
                    <img src="/svg/SRB.svg" height=20> SRB
                </td>
                <td>2685</td>

                <td>2000</td>
            </tr>
            <tr>
                <td>13</td>
                <td><a href=/profile/25092340>Nihal Sarin</a></td>
                <td>GM</td>
                <td class="flag-wrapper">
                    <img src="/svg/IND.svg" height=20> IND
                </td>
                <td>2684</td>

                <td>2004</td>
            </tr>
            <tr>
                <td>14</td>
                <td><a href=/profile/13306553>Martirosyan, Haik M.</a></td>
                <td>GM</td>
                <td class="flag-wrapper">
                    <img src="/svg/ARM.svg" height=20> ARM
                </td>
                <td>2683</td>

                <td>2000</td>
            </tr>
            <tr>
                <td>15</td>
                <td><a href=/profile/24175439>Esipenko, Andrey</a></td>
                <td>GM</td>
                <td class="flag-wrapper">
                    <img src="/svg/FID.svg" height=20> FID
                </td>
                <td>2683</td>

                <td>2002</td>
            </tr>
            <tr>
                <td>16</td>
                <td><a href=/profile/14129574>Shevchenko, Kirill</a></td>
                <td>GM</td>
                <td class="flag-wrapper">
                    <img src="/svg/ROU.svg" height=20> ROU
                </td>
                <td>2675</td>

                <td>2002</td>
            </tr>
            <tr>
                <td>17</td>
                <td><a href=/profile/2093596>Niemann, Hans Moke</a></td>
                <td>GM</td>
                <td class="flag-wrapper">
                    <img src="/svg/USA.svg" height=20> USA
                </td>
                <td>2660</td>

                <td>2003</td>
            </tr>
            <tr>
                <td>18</td>
                <td><a href=/profile/14205483>Sindarov, Javokhir</a></td>
                <td>GM</td>
                <td class="flag-wrapper">
                    <img src="/svg/UZB.svg" height=20> UZB
                </td>
                <td>2659</td>

                <td>2005</td>
            </tr>
            <tr>
                <td>19</td>
                <td><a href=/profile/2056437>Liang, Awonder</a></td>
                <td>GM</td>
                <td class="flag-wrapper">
                    <img src="/svg/USA.svg" height=20> USA
                </td>
                <td>2649</td>

                <td>2003</td>
            </tr>
            <tr>
                <td>20</td>
                <td><a href=/profile/5084423>Aryan Chopra</a></td>
                <td>GM</td>
                <td class="flag-wrapper">
                    <img src="/svg/IND.svg" height=20> IND
                </td>
                <td>2641</td>

                <td>2001</td>
            </tr>
            <tr>
                <td>21</td>
                <td><a href=/profile/13306766>Sargsyan, Shant</a></td>
                <td>GM</td>
                <td class="flag-wrapper">
                    <img src="/svg/ARM.svg" height=20> ARM
                </td>
                <td>2639</td>

                <td>2002</td>
            </tr>
            <tr>
                <td>22</td>
                <td><a href=/profile/358878>Nguyen, Thai Dai Van</a></td>
                <td>GM</td>
                <td class="flag-wrapper">
                    <img src="/svg/CZE.svg" height=20> CZE
                </td>
                <td>2637</td>

                <td>2001</td>
            </tr>
            <tr>
                <td>23</td>
                <td><a href=/profile/12923044>Svane, Frederik</a></td>
                <td>GM</td>
                <td class="flag-wrapper">
                    <img src="/svg/GER.svg" height=20> GER
                </td>
                <td>2634</td>

                <td>2004</td>
            </tr>
            <tr>
                <td>24</td>
                <td><a href=/profile/1048104>Warmerdam, Max</a></td>
                <td>GM</td>
                <td class="flag-wrapper">
                    <img src="/svg/NED.svg" height=20> NED
                </td>
                <td>2633</td>

                <td>2000</td>
            </tr>
            <tr>
                <td>25</td>
                <td><a href=/profile/44155573>Murzin, Volodar</a></td>
                <td>GM</td>
                <td class="flag-wrapper">
                    <img src="/svg/FID.svg" height=20> FID
                </td>
                <td>2631</td>

                <td>2006</td>
            </tr>
            <tr>
                <td>26</td>
                <td><a href=/profile/14203987>Yakubboev, Nodirbek</a></td>
                <td>GM</td>
                <td class="flag-wrapper">
                    <img src="/svg/UZB.svg" height=20> UZB
                </td>
                <td>2630</td>

                <td>2002</td>
            </tr>
            <tr>
                <td>27</td>
                <td><a href=/profile/35028561>Mendonca, Leon Luke</a></td>
                <td>GM</td>
                <td class="flag-wrapper">
                    <img src="/svg/IND.svg" height=20> IND
                </td>
                <td>2628</td>

                <td>2006</td>
            </tr>
            <tr>
                <td>28</td>
                <td><a href=/profile/35093487>Sadhwani, Raunak</a></td>
                <td>GM</td>
                <td class="flag-wrapper">
                    <img src="/svg/IND.svg" height=20> IND
                </td>
                <td>2624</td>

                <td>2005</td>
            </tr>
            <tr>
                <td>29</td>
                <td><a href=/profile/1444948>Bjerre, Jonas Buhl</a></td>
                <td>GM</td>
                <td class="flag-wrapper">
                    <img src="/svg/DEN.svg" height=20> DEN
                </td>
                <td>2624</td>

                <td>2004</td>
            </tr>
            <tr>
                <td>30</td>
                <td><a href=/profile/13306677>Hakobyan, Aram</a></td>
                <td>GM</td>
                <td class="flag-wrapper">
                    <img src="/svg/ARM.svg" height=20> ARM
                </td>
                <td>2612</td>

                <td>2001</td>
            </tr>
            <tr>
                <td>31</td>
                <td><a href=/profile/5061245>Puranik, Abhimanyu</a></td>
                <td>GM</td>
                <td class="flag-wrapper">
                    <img src="/svg/IND.svg" height=20> IND
                </td>
                <td>2611</td>

                <td>2000</td>
            </tr>
            <tr>
                <td>32</td>
                <td><a href=/profile/30909694>Yoo, Christopher Woojin</a></td>
                <td>GM</td>
                <td class="flag-wrapper">
                    <img src="/svg/USA.svg" height=20> USA
                </td>
                <td>2606</td>

                <td>2006</td>
            </tr>
            <tr>
                <td>33</td>
                <td><a href=/profile/240990>Dardha, Daniel</a></td>
                <td>GM</td>
                <td class="flag-wrapper">
                    <img src="/svg/BEL.svg" height=20> BEL
                </td>
                <td>2598</td>

                <td>2005</td>
            </tr>
            <tr>
                <td>34</td>
                <td><a href=/profile/14204223>Vokhidov, Shamsiddin</a></td>
                <td>GM</td>
                <td class="flag-wrapper">
                    <img src="/svg/UZB.svg" height=20> UZB
                </td>
                <td>2597</td>

                <td>2002</td>
            </tr>
            <tr>
                <td>35</td>
                <td><a href=/profile/2070901>Burke, John M</a></td>
                <td>GM</td>
                <td class="flag-wrapper">
                    <img src="/svg/USA.svg" height=20> USA
                </td>
                <td>2592</td>

                <td>2001</td>
            </tr>
            <tr>
                <td>36</td>
                <td><a href=/profile/1188062>Gumularz, Szymon</a></td>
                <td>GM</td>
                <td class="flag-wrapper">
                    <img src="/svg/POL.svg" height=20> POL
                </td>
                <td>2588</td>

                <td>2001</td>
            </tr>
            <tr>
                <td>37</td>
                <td><a href=/profile/25060783>Pranav, V</a></td>
                <td>GM</td>
                <td class="flag-wrapper">
                    <img src="/svg/IND.svg" height=20> IND
                </td>
                <td>2588</td>

                <td>2006</td>
            </tr>
            <tr>
                <td>38</td>
                <td><a href=/profile/1185934>Teclaf, Pawel</a></td>
                <td>IM</td>
                <td class="flag-wrapper">
                    <img src="/svg/POL.svg" height=20> POL
                </td>
                <td>2586</td>

                <td>2003</td>
            </tr>
            <tr>
                <td>39</td>
                <td><a href=/profile/3208923>Smirnov, Anton</a></td>
                <td>GM</td>
                <td class="flag-wrapper">
                    <img src="/svg/AUS.svg" height=20> AUS
                </td>
                <td>2586</td>

                <td>2001</td>
            </tr>
            <tr>
                <td>40</td>
                <td><a href=/profile/13413937>Suleymanli, Aydin</a></td>
                <td>GM</td>
                <td class="flag-wrapper">
                    <img src="/svg/AZE.svg" height=20> AZE
                </td>
                <td>2586</td>

                <td>2005</td>
            </tr>
            <tr>
                <td>41</td>
                <td><a href=/profile/4262875>Theodorou, Nikolas</a></td>
                <td>GM</td>
                <td class="flag-wrapper">
                    <img src="/svg/GRE.svg" height=20> GRE
                </td>
                <td>2586</td>

                <td>2000</td>
            </tr>
            <tr>
                <td>42</td>
                <td><a href=/profile/30920019>Mishra, Abhimanyu</a></td>
                <td>GM</td>
                <td class="flag-wrapper">
                    <img src="/svg/USA.svg" height=20> USA
                </td>
                <td>2585</td>

                <td>2009</td>
            </tr>
            <tr>
                <td>43</td>
                <td><a href=/profile/14203049>Kuybokarov, Temur</a></td>
                <td>GM</td>
                <td class="flag-wrapper">
                    <img src="/svg/AUS.svg" height=20> AUS
                </td>
                <td>2581</td>

                <td>2000</td>
            </tr>
            <tr>
                <td>44</td>
                <td><a href=/profile/14926970>Pechac, Jergus</a></td>
                <td>GM</td>
                <td class="flag-wrapper">
                    <img src="/svg/SVK.svg" height=20> SVK
                </td>
                <td>2580</td>

                <td>2001</td>
            </tr>
            <tr>
                <td>45</td>
                <td><a href=/profile/8608962>Liu, Yan</a></td>
                <td>GM</td>
                <td class="flag-wrapper">
                    <img src="/svg/CHN.svg" height=20> CHN
                </td>
                <td>2579</td>

                <td>2000</td>
            </tr>
            <tr>
                <td>46</td>
                <td><a href=/profile/35042025>Aditya Mittal</a></td>
                <td>GM</td>
                <td class="flag-wrapper">
                    <img src="/svg/IND.svg" height=20> IND
                </td>
                <td>2577</td>

                <td>2006</td>
            </tr>
            <tr>
                <td>47</td>
                <td><a href=/profile/3518736>Albornoz Cabrera, Carlos Daniel</a></td>
                <td>GM</td>
                <td class="flag-wrapper">
                    <img src="/svg/CUB.svg" height=20> CUB
                </td>
                <td>2575</td>

                <td>2000</td>
            </tr>
            <tr>
                <td>48</td>
                <td><a href=/profile/753246>Kozak, Adam</a></td>
                <td>GM</td>
                <td class="flag-wrapper">
                    <img src="/svg/HUN.svg" height=20> HUN
                </td>
                <td>2574</td>

                <td>2002</td>
            </tr>
            <tr>
                <td>49</td>
                <td><a href=/profile/865834>Moroni, Luca Jr</a></td>
                <td>GM</td>
                <td class="flag-wrapper">
                    <img src="/svg/ITA.svg" height=20> ITA
                </td>
                <td>2573</td>

                <td>2000</td>
            </tr>
            <tr>
                <td>50</td>
                <td><a href=/profile/5804418>Tin, Jingyao</a></td>
                <td>GM</td>
                <td class="flag-wrapper">
                    <img src="/svg/SGP.svg" height=20> SGP
                </td>
                <td>2573</td>

                <td>2000</td>
            </tr>
            <tr>
                <td>51</td>
                <td><a href=/profile/12576468>Daneshvar, Bardiya</a></td>
                <td>GM</td>
                <td class="flag-wrapper">
                    <img src="/svg/IRI.svg" height=20> IRI
                </td>
                <td>2570</td>

                <td>2006</td>
            </tr>
            <tr>
                <td>52</td>
                <td><a href=/profile/950122>Ivic, Velimir</a></td>
                <td>GM</td>
                <td class="flag-wrapper">
                    <img src="/svg/SRB.svg" height=20> SRB
                </td>
                <td>2570</td>

                <td>2002</td>
            </tr>
            <tr>
                <td>53</td>
                <td><a href=/profile/24198455>Nesterov, Arseniy</a></td>
                <td>GM</td>
                <td class="flag-wrapper">
                    <img src="/svg/FID.svg" height=20> FID
                </td>
                <td>2569</td>

                <td>2003</td>
            </tr>
            <tr>
                <td>54</td>
                <td><a href=/profile/14165414>Galperin, Platon</a></td>
                <td>GM</td>
                <td class="flag-wrapper">
                    <img src="/svg/SWE.svg" height=20> SWE
                </td>
                <td>2566</td>

                <td>2003</td>
            </tr>
            <tr>
                <td>55</td>
                <td><a href=/profile/36083534>Maurizzi, MarcAndria</a></td>
                <td>GM</td>
                <td class="flag-wrapper">
                    <img src="/svg/FRA.svg" height=20> FRA
                </td>
                <td>2564</td>

                <td>2007</td>
            </tr>
            <tr>
                <td>56</td>
                <td><a href=/profile/895733>Sonis, Francesco</a></td>
                <td>GM</td>
                <td class="flag-wrapper">
                    <img src="/svg/ITA.svg" height=20> ITA
                </td>
                <td>2564</td>

                <td>2002</td>
            </tr>
            <tr>
                <td>57</td>
                <td><a href=/profile/13405764>Asadli, Vugar</a></td>
                <td>GM</td>
                <td class="flag-wrapper">
                    <img src="/svg/AZE.svg" height=20> AZE
                </td>
                <td>2563</td>

                <td>2001</td>
            </tr>
            <tr>
                <td>58</td>
                <td><a href=/profile/5078776>Harsha Bharathakoti</a></td>
                <td>GM</td>
                <td class="flag-wrapper">
                    <img src="/svg/IND.svg" height=20> IND
                </td>
                <td>2563</td>

                <td>2000</td>
            </tr>
            <tr>
                <td>59</td>
                <td><a href=/profile/13515110>Lazavik, Denis</a></td>
                <td>GM</td>
                <td class="flag-wrapper">
                    <img src="/svg/BLR.svg" height=20> BLR
                </td>
                <td>2560</td>

                <td>2006</td>
            </tr>
            <tr>
                <td>60</td>
                <td><a href=/profile/1048333>Vrolijk, Liam</a></td>
                <td>GM</td>
                <td class="flag-wrapper">
                    <img src="/svg/NED.svg" height=20> NED
                </td>
                <td>2558</td>

                <td>2002</td>
            </tr>
            <tr>
                <td>61</td>
                <td><a href=/profile/13507443>Kazakouski, Valery</a></td>
                <td>GM</td>
                <td class="flag-wrapper">
                    <img src="/svg/LTU.svg" height=20> LTU
                </td>
                <td>2558</td>

                <td>2000</td>
            </tr>
            <tr>
                <td>62</td>
                <td><a href=/profile/14531534>Livaic, Leon</a></td>
                <td>GM</td>
                <td class="flag-wrapper">
                    <img src="/svg/CRO.svg" height=20> CRO
                </td>
                <td>2558</td>

                <td>2000</td>
            </tr>
            <tr>
                <td>63</td>
                <td><a href=/profile/13409301>Muradli, Mahammad</a></td>
                <td>GM</td>
                <td class="flag-wrapper">
                    <img src="/svg/AZE.svg" height=20> AZE
                </td>
                <td>2554</td>

                <td>2003</td>
            </tr>
            <tr>
                <td>64</td>
                <td><a href=/profile/14928752>Gazik, Viktor</a></td>
                <td>GM</td>
                <td class="flag-wrapper">
                    <img src="/svg/SVK.svg" height=20> SVK
                </td>
                <td>2550</td>

                <td>2001</td>
            </tr>
            <tr>
                <td>65</td>
                <td><a href=/profile/14129850>Matviishen, Viktor</a></td>
                <td>GM</td>
                <td class="flag-wrapper">
                    <img src="/svg/UKR.svg" height=20> UKR
                </td>
                <td>2550</td>

                <td>2002</td>
            </tr>
            <tr>
                <td>66</td>
                <td><a href=/profile/24176460>Sorokin, Aleksey</a></td>
                <td>GM</td>
                <td class="flag-wrapper">
                    <img src="/svg/RUS.svg" height=20> RUS
                </td>
                <td>2547</td>

                <td>2000</td>
            </tr>
            <tr>
                <td>67</td>
                <td><a href=/profile/12961523>Engel, Luis</a></td>
                <td>GM</td>
                <td class="flag-wrapper">
                    <img src="/svg/GER.svg" height=20> GER
                </td>
                <td>2547</td>

                <td>2002</td>
            </tr>
            <tr>
                <td>68</td>
                <td><a href=/profile/44105681>Makarian, Rudik</a></td>
                <td>IM</td>
                <td class="flag-wrapper">
                    <img src="/svg/FID.svg" height=20> FID
                </td>
                <td>2546</td>

                <td>2004</td>
            </tr>
            <tr>
                <td>69</td>
                <td><a href=/profile/25073060>Koustav Chatterjee</a></td>
                <td>IM</td>
                <td class="flag-wrapper">
                    <img src="/svg/IND.svg" height=20> IND
                </td>
                <td>2546</td>

                <td>2003</td>
            </tr>
            <tr>
                <td>70</td>
                <td><a href=/profile/24164879>Lomasov, Semyon</a></td>
                <td>GM</td>
                <td class="flag-wrapper">
                    <img src="/svg/ISR.svg" height=20> ISR
                </td>
                <td>2542</td>

                <td>2002</td>
            </tr>
            <tr>
                <td>71</td>
                <td><a href=/profile/1039792>Van Foreest, Lucas</a></td>
                <td>GM</td>
                <td class="flag-wrapper">
                    <img src="/svg/NED.svg" height=20> NED
                </td>
                <td>2540</td>

                <td>2001</td>
            </tr>
            <tr>
                <td>72</td>
                <td><a href=/profile/1159259>Janik, Igor</a></td>
                <td>GM</td>
                <td class="flag-wrapper">
                    <img src="/svg/POL.svg" height=20> POL
                </td>
                <td>2539</td>

                <td>2000</td>
            </tr>
            <tr>
                <td>73</td>
                <td><a href=/profile/25072846>Aronyak Ghosh</a></td>
                <td>IM</td>
                <td class="flag-wrapper">
                    <img src="/svg/IND.svg" height=20> IND
                </td>
                <td>2538</td>

                <td>2003</td>
            </tr>
            <tr>
                <td>74</td>
                <td><a href=/profile/34184934>Dudin, Gleb</a></td>
                <td>IM</td>
                <td class="flag-wrapper">
                    <img src="/svg/HUN.svg" height=20> HUN
                </td>
                <td>2537</td>

                <td>2004</td>
            </tr>
            <tr>
                <td>75</td>
                <td><a href=/profile/30901561>Jacobson, Brandon</a></td>
                <td>GM</td>
                <td class="flag-wrapper">
                    <img src="/svg/USA.svg" height=20> USA
                </td>
                <td>2537</td>

                <td>2003</td>
            </tr>
            <tr>
                <td>76</td>
                <td><a href=/profile/24183555>Afanasiev, Nikita</a></td>
                <td>GM</td>
                <td class="flag-wrapper">
                    <img src="/svg/RUS.svg" height=20> RUS
                </td>
                <td>2537</td>

                <td>2000</td>
            </tr>
            <tr>
                <td>77</td>
                <td><a href=/profile/884189>Lodici, Lorenzo</a></td>
                <td>GM</td>
                <td class="flag-wrapper">
                    <img src="/svg/ITA.svg" height=20> ITA
                </td>
                <td>2536</td>

                <td>2000</td>
            </tr>
            <tr>
                <td>78</td>
                <td><a href=/profile/10613129>Fawzy, Adham</a></td>
                <td>GM</td>
                <td class="flag-wrapper">
                    <img src="/svg/EGY.svg" height=20> EGY
                </td>
                <td>2533</td>

                <td>2000</td>
            </tr>
            <tr>
                <td>79</td>
                <td><a href=/profile/46626786>Pranav Anand</a></td>
                <td>GM</td>
                <td class="flag-wrapper">
                    <img src="/svg/IND.svg" height=20> IND
                </td>
                <td>2529</td>

                <td>2006</td>
            </tr>
            <tr>
                <td>80</td>
                <td><a href=/profile/26017962>Laurent-Paoli, Pierre</a></td>
                <td>IM</td>
                <td class="flag-wrapper">
                    <img src="/svg/FRA.svg" height=20> FRA
                </td>
                <td>2529</td>

                <td>2000</td>
            </tr>
            <tr>
                <td>81</td>
                <td><a href=/profile/1227190>Gavrilescu, David</a></td>
                <td>GM</td>
                <td class="flag-wrapper">
                    <img src="/svg/ROU.svg" height=20> ROU
                </td>
                <td>2526</td>

                <td>2003</td>
            </tr>
            <tr>
                <td>82</td>
                <td><a href=/profile/8610550>Peng, Xiongjian</a></td>
                <td></td>
                <td class="flag-wrapper">
                    <img src="/svg/CHN.svg" height=20> CHN
                </td>
                <td>2525</td>

                <td>2000</td>
            </tr>
            <tr>
                <td>83</td>
                <td><a href=/profile/2099438>Hong, Andrew</a></td>
                <td>GM</td>
                <td class="flag-wrapper">
                    <img src="/svg/USA.svg" height=20> USA
                </td>
                <td>2525</td>

                <td>2004</td>
            </tr>
            <tr>
                <td>84</td>
                <td><a href=/profile/12809390>Pultinevicius, Paulius</a></td>
                <td>GM</td>
                <td class="flag-wrapper">
                    <img src="/svg/LTU.svg" height=20> LTU
                </td>
                <td>2525</td>

                <td>2001</td>
            </tr>
            <tr>
                <td>85</td>
                <td><a href=/profile/1533533>Abdrlauf, Elham</a></td>
                <td>IM</td>
                <td class="flag-wrapper">
                    <img src="/svg/NOR.svg" height=20> NOR
                </td>
                <td>2523</td>

                <td>2005</td>
            </tr>
            <tr>
                <td>86</td>
                <td><a href=/profile/5089000>Raja Harshit</a></td>
                <td>GM</td>
                <td class="flag-wrapper">
                    <img src="/svg/IND.svg" height=20> IND
                </td>
                <td>2522</td>

                <td>2001</td>
            </tr>
            <tr>
                <td>87</td>
                <td><a href=/profile/5097010>Sankalp Gupta</a></td>
                <td>GM</td>
                <td class="flag-wrapper">
                    <img src="/svg/IND.svg" height=20> IND
                </td>
                <td>2522</td>

                <td>2003</td>
            </tr>
            <tr>
                <td>88</td>
                <td><a href=/profile/1046730>Schoppen, Casper</a></td>
                <td>GM</td>
                <td class="flag-wrapper">
                    <img src="/svg/NED.svg" height=20> NED
                </td>
                <td>2522</td>

                <td>2002</td>
            </tr>
            <tr>
                <td>89</td>
                <td><a href=/profile/1632051>Blohberger, Felix</a></td>
                <td>GM</td>
                <td class="flag-wrapper">
                    <img src="/svg/AUT.svg" height=20> AUT
                </td>
                <td>2522</td>

                <td>2002</td>
            </tr>
            <tr>
                <td>90</td>
                <td><a href=/profile/13506862>Nikitenko, Mihail</a></td>
                <td>GM</td>
                <td class="flag-wrapper">
                    <img src="/svg/BLR.svg" height=20> BLR
                </td>
                <td>2521</td>

                <td>2000</td>
            </tr>
            <tr>
                <td>91</td>
                <td><a href=/profile/12572896>Pour Agha Bala, Amirreza</a></td>
                <td></td>
                <td class="flag-wrapper">
                    <img src="/svg/IRI.svg" height=20> IRI
                </td>
                <td>2521</td>

                <td>2004</td>
            </tr>
            <tr>
                <td>92</td>
                <td><a href=/profile/24183750>Lobanov, Sergei</a></td>
                <td>GM</td>
                <td class="flag-wrapper">
                    <img src="/svg/FID.svg" height=20> FID
                </td>
                <td>2520</td>

                <td>2001</td>
            </tr>
            <tr>
                <td>93</td>
                <td><a href=/profile/30911370>Wang, Justin</a></td>
                <td>IM</td>
                <td class="flag-wrapper">
                    <img src="/svg/USA.svg" height=20> USA
                </td>
                <td>2520</td>

                <td>2005</td>
            </tr>
            <tr>
                <td>94</td>
                <td><a href=/profile/13413007>Ahmadzada, Ahmad</a></td>
                <td>IM</td>
                <td class="flag-wrapper">
                    <img src="/svg/AZE.svg" height=20> AZE
                </td>
                <td>2519</td>

                <td>2004</td>
            </tr>
            <tr>
                <td>95</td>
                <td><a href=/profile/13611860>Kacharava, Nikolozi</a></td>
                <td>IM</td>
                <td class="flag-wrapper">
                    <img src="/svg/GEO.svg" height=20> GEO
                </td>
                <td>2519</td>

                <td>2004</td>
            </tr>
            <tr>
                <td>96</td>
                <td><a href=/profile/4902920>Batsuren, Dambasuren</a></td>
                <td>GM</td>
                <td class="flag-wrapper">
                    <img src="/svg/MGL.svg" height=20> MGL
                </td>
                <td>2519</td>

                <td>2004</td>
            </tr>
            <tr>
                <td>97</td>
                <td><a href=/profile/30903114>Guo, Arthur</a></td>
                <td>IM</td>
                <td class="flag-wrapper">
                    <img src="/svg/USA.svg" height=20> USA
                </td>
                <td>2517</td>

                <td>2006</td>
            </tr>
            <tr>
                <td>98</td>
                <td><a href=/profile/1040634>Kevlishvili, Robby</a></td>
                <td>GM</td>
                <td class="flag-wrapper">
                    <img src="/svg/NED.svg" height=20> NED
                </td>
                <td>2517</td>

                <td>2001</td>
            </tr>
            <tr>
                <td>99</td>
                <td><a href=/profile/32096585>Henderson de La Fuente, Lance</a></td>
                <td>GM</td>
                <td class="flag-wrapper">
                    <img src="/svg/AND.svg" height=20> AND
                </td>
                <td>2517</td>

                <td>2003</td>
            </tr>
            <tr>
                <td>100</td>
                <td><a href=/profile/2069342>Checa, Nicolas</a></td>
                <td>GM</td>
                <td class="flag-wrapper">
                    <img src="/svg/USA.svg" height=20> USA
                </td>
                <td>2517</td>

                <td>2001</td>
            </tr>
            </table>
        `;
        window.currentSearchOptions = opt;
        renderTable(content, opt.topn);        
        return;
    }

    

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
                console.error(err);
                //TODO
                alert('请求 Fide 数据发生错误，请重新请求试试。');
                toggleLoadingTips(false);
            }

            toggleLoadingTips(false);
        }
    });
}
const TITLE_HASH = MyConfig.getTitleHash2();
const FED_HASH = MyConfig.getCountryHash();
const FIDE_SITE = 'https://ratings.fide.com/'; 
function updateHeaderDisplay(table){
	headerHash = {Name: '姓名', Title: '称号', Fed: '棋协', Rating: '等级分', 'B-Year': '出生年份'}
	table.querySelectorAll('thead th').forEach(function(it){
		it.innerText= headerHash[it.innerText] || it.innerText;}
	)	
}
function updateContentDisplay(table){
	rows = table.querySelectorAll('tbody tr').forEach(function(row){
		// change profile link
		var cols = row.cells;
		var nameLink = cols[1].querySelector('a');
		nameLink.href = FIDE_SITE + nameLink.href.split('/').slice(-2).join('/');
		nameLink.setAttribute('target', 'blank');
		
        // title 
		var titleCol = cols[2];
        var titleStr = titleCol.innerText.toLowerCase();
		titleCol.innerText = TITLE_HASH[titleStr] || titleCol.innerText;
        row.setAttribute('_title', titleStr);

        // fed name and country flag
		var fedCol = cols[3];
		var fedFlag = fedCol.querySelector('img');
		fedFlag.src = FIDE_SITE + fedFlag.src.split('/').slice(-2).join('/');
		fedFlag.setAttribute('height', '16');
        var fedStr = fedCol.innerText.trim();
		fedCol.childNodes[2].textContent = FED_HASH[fedStr] || fedCol.innerText
        row.setAttribute('country', fedStr);

        // for chinese fed, hightlight them
        var opt = window.currentSearchOptions;
        if(opt?.country != 'CHN' && fedStr == 'CHN') row.className = 'highlight';
	})	
}

function extractProfileId(row){
	if(!row) return null;
	var cols = row.cells;
	var nameLink = cols[1].querySelector('a');
	return nameLink.href.split('/').slice(-1);
}
function insertColumn(table, index, title, colInsertFunc){
	index += 1;
	var headerCol = table.querySelector(`thead th:nth-of-type(${index})`);
	if(!headerCol) console.error(`no element in position ${index} of given table!`);
	var znameHeaderCol = document.createElement('th');
	znameHeaderCol.innerText = title;
	headerCol.parentNode.insertBefore(znameHeaderCol, headerCol);

	index -= 1;
	table.querySelectorAll('#dvContent tbody tr').forEach(function(row){
		var cols = row.cells;
		var col = cols[index];
		col.parentNode.insertBefore(colInsertFunc.call(this, col.parentNode, col), col);
	});
	
}
function renderTable(sContent, truncat_num) {
    var dvContent = $('dvContent');
    Element.update(dvContent, sContent);

    // remove redundent elements
    dvContent.removeChild(dvContent.querySelector('div.title-page-sm'));

	table = document.querySelector('#dvContent table'); 


	// update table header
	updateHeaderDisplay(table);

	// update table style
	updateContentDisplay(table)

    // truncat rows
    var rowsCount = table.rows.length - 1; // exclude header row
    if(truncat_num){
        table.querySelectorAll('tbody tr').forEach(function(row, index){
            if(index + 1 > truncat_num) row.parentNode.removeChild(row);
        });
    }    

	// insert zname column
	const configHash = MyFile.getConfigEntity();
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
    var chnPlayersCount = Array.from(table.querySelectorAll('tbody tr')).filter(row => row.getAttribute('country') == 'CHN').length;
    var countNone = Array.from(table.querySelectorAll('tbody tr')).filter(row => !row.cells[2].innerText.trim()).length;
    var hints = `共获取到（<b>${rowsCount}</b>）条记录，展示其中 ${truncat_num} 条${chnPlayersCount > 0 ? '，其中中国选手 [ <font color="#dd1a2a""">' + chnPlayersCount + '</font> ] 名' : ''}。`;
    hints += (countNone > 0) ? '同时有（ <font color="#dd1a2a">' + countNone + '</font> ）人未在库中或更易了英文名，需要处理:' : '';
    Element.update('dvHints', hints);
    
    // assembly editor table: copy the data table and remove rows with zname, then change the edit column
    var dvEditableContent = $('dvEditableContent')
    Element.update(dvEditableContent, dvContent.innerHTML);
    Array.from(dvEditableContent.querySelectorAll('tbody tr')).forEach(function(row, index){
        if(row.cells[2].innerText.trim()){
            row.parentNode.removeChild(row);
        }else{
            updateZnameEditor(row);
        }
        
    });
    
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

function editRow(id, lnk) {
    var rawRow = lnk.parentNode.parentNode;
    rawRow.className = 'o-alert';
    lnk.style.display = 'none';

    var data = Object.extend({ id: id }, MyFile.getConfigEntity[id]);

    var tbl = $('dvEditableContent').querySelector('table tbody');
    var newRow = tbl.insertRow();
    newRow.innerHTML = rawRow.innerHTML;
    newRow.deleteCell(3); // delete the editor column
    updateZnameEditor(newRow, rawRow.cells[2].innerText); // update with zname
}
function updateZnameEditor(row, zname){
    row.cells[2].innerHTML = `<input type="text" name="" value="${zname ? zname : row.cells[1].innerText}" onfocus="this.select()">`;
}

function updateConfig() {
    var tbl = $('dvEditableContent').querySelector('table');
    var configEntity = MyFile.getConfigEntity();
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
    MyFile.writeConfigEntity(updateEntities, function () {
        alert('配置更新完毕');
        toggleLoadingTips(false);
        loadCurrentRate();
    });
}
function collectConfigEntity(row){
    var cols = row.cells;
    return {
        id: row.getAttribute('_id'),
        rank: cols[0].innerText,
        name: cols[1].innerText,
        zname: cols[2].firstChild.value,
        title: row.getAttribute('_title'),
        country: row.getAttribute('country'),
        rate: cols[5].innerText,
        birthday: cols[6].innerText
    }
}
function copyContent(){
    var tbl = $('dvContent').querySelector('table');
    var txt = $('txtContent');
    var rowTextArr = [];
    Array.from(tbl.rows).forEach(function(row){
        var textArr = Array.from(row.cells).filter(function(it,index){return index != 3 & index !=4}).map(it=> it.innerText.trim());
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