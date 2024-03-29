var miscSliders;
var storedImage;
var actionsSlider;
var selectedDate;

$(() => {
    init();

    $(window).on('scroll', setNavbarBackground);
    $('body').on('click', '.filter-header', toggleFilterBlock);
    $('body').on('change', 'input', consoleForm);
    $('body').on('click', '#reset-filters', resetFilters);
    $('body').on('change', '.filter-block input', updateFiltersHeader);
    $('body').on('click', '.sidenav .folder', toggleSidenavFolder);
    $('body').on('click', '.filters-trigger', toggleFilters);
    $('body').on('click', '#account tr', toggleRow);
    $('body').on('click', '.hidden-block-trigger', toggleBlock);
    $('body').on('change', '[name="del"]', updateAddressList);
    $('body').on('change', '[name="addr"]', updateAddressField);
    $('body').on('change', '[name="delivery-period"]', toggleDeliveryPeriod);
    $('body').on('change', '[name="delivery-interval"]', toggleNotRecall);
});

//= Загрузка диапазонов ===================================================
function loadIntervals(date){
    var dom = `<div class="input-field"><input type="radio" name="delivery-interval" class="styled" id="interval-[+id+]"><label for="interval-[+id+]">[+label+]</label></div>`;
    var dom_ready = "";

    $.ajax({
        url: $('#delivery-date').data('url'),
        type: "POST",
        dataType: "JSON",
        data: {
            delivery_date: date.getTime()/1000
        },
        success: (res) => {
            for(var key in res.intervals){
                var t = dom;
                t = t.replaceAll('[+id+]', (+key+1)).replace('[+label+]', res.intervals[key]);
                dom_ready += t;
            }
            $('#interval-wrapper').html(dom_ready);
            $('#delivery-interval').removeClass('hidden');
            $('#interval-0').prop('checked', 'checked');
        },
        error: (err) => {
            console.error(err)
        }
    });
}

//= Переключение флажка «не перезванивать» ================================
function toggleNotRecall(){
    if($(this).next().text() == 'Не указан'){
        $('#dont-recall + label').addClass('hidden');
    }else{
        $('#dont-recall + label').removeClass('hidden');
    }
}

//= Переключение периода доставки =========================================
function toggleDeliveryPeriod(e){
    if($(this).next().text() == 'Другая дата'){
        $('#delivery-date').removeClass('hidden');
        $('.delivery-info').removeClass('hidden');
    }else{
        $('#delivery-date').addClass('hidden');
        $('.delivery-info').addClass('hidden');
    }
}

//= Переключение доп.адреса ===============================================
function updateAddressField(e){
	if($(this).val() == 'user-address'){
		$('#user-address').removeClass('hidden');
	}else{
		$('#user-address').addClass('hidden');
	}
}

//= Переключение блока адресов ============================================
function updateAddressList(e){
	if($(this).hasClass('need-address')){
		$('.address-list').removeClass('hidden');
	}else{
		$('.address-list').addClass('hidden');
	}
}

//= Переключение скрытых блоков ===========================================
function toggleBlock(e){
    
    var cssClass = $(this).prop('checked') ? '' : 'hidden';
    $(this).parent().next().removeClass('hidden').addClass(cssClass);
}

//= Переключение видимости фильтров в мобильной адаптации==================
function toggleRow(e){


    // Проверка на клик по ссылке
    if(!e.originalEvent){
        return;
    }

    var path = e.originalEvent.path;
    var link = $(path).filter((index, el) => {
        return el.tagName === 'A';
    });

    if(!link.length){

        var already = !$(this).next().css('display') == 'none';
    
        $('.subtable-td, .subtable-wrapper').slideUp('fast');
    
        var detailsRow = $(this).next();
        if(!already){
            detailsRow.find('.subtable-td').css('display', 'table-cell').find('.subtable-wrapper').slideDown('fast');
        }
    }
}

//= Отображение фильтров
function toggleFilters(e){
    e.preventDefault();
    $('.filter-block').toggleClass('shown');
}

//= Открытие/закрытие папок в боковом меню ================================
function toggleSidenavFolder(e){
    e.preventDefault();
    $(this).toggleClass('expanded');
}

//= Обновление заголовка фильтров при изменении их значения ===============
function updateFiltersHeader(){
    var type = $(this).attr("type");
    var value = "";
    
    if(type == "radio"){
        var val = $(this).parents('.filter-block').find(':checked').val();
        if(val == 0){
            value = "";
        }else{
            value = $(this).parents('.filter-block').find(':checked').next('label').text();
        }
    }

    if(type == "checkbox"){
        val = $(this).parents(".filter-block").find(":checked").length;
        if(val > 0){
            value = val;
        }else{
            value = "";
        }
    }
    
    $(this).parents('.filter-block').find('.filters-val').text(value);
}

//= Сброс фильтров ========================================================
function resetFilters(e){
    e.preventDefault()
    $(this).parents('form').get(0).reset();
    $(this).parents('form').find('input').trigger('change');
}

//= Реализация "аккордеона" фильтров ======================================
function toggleFilterBlock(e){
    e.preventDefault();
    var already = $(this).parents('.filter-block').hasClass('expanded') ? "" : "expanded";

    $('.filter-block').removeClass('expanded');
    $(this).parents('.filter-block').addClass(already);
}

//= Вывод в консоль данных формы фильтров (для отладки) ===================
function consoleForm(){
    var form = $(this).parents('form').serialize();
    console.log(form);
}

//= Установка фона навигационной панели ===================================
function setNavbarBackground(){
    if($('html, body').scrollTop() >= 50){
        $('header').addClass('scrolled');
    }else{
        $('header').removeClass('scrolled');
    }
}

//= Сохранение URL картинки перед ее открытием в полный экран =============
function storeDataImage(){
    storedImage = $(this.el).css('background-image');
}

//= Восстановление URL карнтинки после ее закрытия из полноэкранного режима
function restoreDataImage(){
    $(this.el).css({
        backgroundImage: storedImage
    })
}

//= Инициализация тултипов
function initTooltip(){
    var elems = document.querySelectorAll('.tooltipped');
    var instances = M.Tooltip.init(elems, {
        enterDelay: 800
    });
}

//= Общая инициализация ===================================================
function init(){
    $('.lazy-image, .lazy').lazy();
    initTooltip();
    $('.sidenav').sidenav();
    $('.modal').modal();

    $('.materialboxed').materialbox({
        onOpenStart: storeDataImage,
        onCloseEnd: restoreDataImage
    });

    setNavbarBackground();
    $('.tabs').tabs();
    if($('.misc-slider').length) {
        miscSliders = new Swiper('.misc-slider', {
            loop: true,
            spaceBetween: 20,
            navigation: {
                prevEl: '.swiper-button-prev',
                nextEl: '.swiper-button-next',
            },
            breakpoints: {
                420: {
                    slidesPerView: 1,
                },
                520: {
                    slidesPerView: 2,
                },
                800: {
                    slidesPerView: 3,
                },
                1400: {
                    slidesPerView: 4,
                }
            }
        });

        $(miscSliders).each((index, swiper) => {
            swiper.on('slideChange', () => {
                $('.lazy-image').lazy();
                initTooltip();
            })
        });
    }

    actionsSlider = new Swiper('#actions-slider', {
        pagination: {
            el: ".swiper-pagination",
            type: "bullets",
            clickable: true
        },
        loop: true,
        autoplay: {
            delay: 5000
        }
    });
    actionsSlider.on('slideChange', () => {
        $('.lazy, .lazy-image').lazy();
    })

    $('textarea').each(function () {
        this.setAttribute('style', 'height:' + (this.scrollHeight) + 'px;overflow-y:hidden;');
    }).on('input', function () {
        this.style.height = 'auto';
        this.style.height = (this.scrollHeight) + 'px';
    });
    
    $('.indeterminate').each((index, element) => {
        element.checked = true;
        element.indeterminate = true;

        $(element).on('change', setIndeterminate);
    });

    //Получаем завтрашнюю дату
    var current_date = new Date();
    var tommorow = current_date.setDate(current_date.getDate() + 1);

    var datepickers = M.Datepicker.init(document.querySelectorAll('.datepicker'), {
        firstDay: 1,
        autoClose: true,
        format: 'dd mmmm yyyy',
        minDate: new Date(tommorow),
        onSelect: loadIntervals,
        i18n: {
            done: "OK",
            cancel: "Отмена",
            clear: "Очистить",
            setDefaultDate: true,
            months: [
                "Январь",
                "Февраль",
                "Март",
                "Апрель",
                "Май",
                "Июнь",
                "Июль",
                "Август",
                "Сентябрь",
                "Октябрь",
                "Ноябрь",
                "Декабрь"
            ],
            monthsShort: [
                "Янв",
                "Фев",
                "Мрт",
                "Апр",
                "Май",
                "Июн",
                "Июл",
                "Авг",
                "Сен",
                "Окт",
                "Ноя",
                "Дек"
            ],
            weekdays: [
                "Воскресенье",
                "Понедельник",
                "Вториник",
                "Среда",
                "Четвер",
                "Пятница",
                "Суббота",
            ],
            weekdaysShort: [
                "Вс",
                "Пн",
                "Вт",
                "Ср",
                "Чт",
                "Пт",
                "Сб",
            ],
            weekdaysAbbrev: [
                'В',
                'П',
                'В',
                'С',
                'Ч',
                'П',
                'С',
            ]
        }
    });
    
}

//= Асинхронная загрузка скриптов =========================================
loadScript = (url, callback) => {

	var script = document.createElement("script")
	script.type = "text/javascript";

	if (script.readyState){  //IE
		script.onreadystatechange = function(){
			if (script.readyState == "loaded" ||
					script.readyState == "complete"){
				script.onreadystatechange = null;
				callback();
			}
		};
	} else {  //Others
		script.onload = function(){
			callback();
		};
	}

	script.src = url;
	document.getElementsByTagName("head")[0].appendChild(script);
}

//= Вызов инициализации карты =============================================
if($('#map').length){
    loadScript("https://cdn.jsdelivr.net/gh/openlayers/openlayers.github.io@master/en/v6.4.3/build/ol.js", () => {
        initMap();
    })
}

//= Инициализация карты ===================================================
function initMap(){

    var coords = [37.7400938, 44.7267618];
    
    var style = new ol.style.Style({
        image: new ol.style.Icon({
            anchor: [.5, 1],
            src: '/img/map_marker.png'
        })
    });
    
    var marker = new ol.Feature({
        type: 'icon',
        geometry: new ol.geom.Point(ol.proj.fromLonLat(coords))
    })

    var vectorSource = new ol.source.Vector({
        features: [marker]
    })

    var vectorLayer = new ol.layer.Vector({
		source: vectorSource,
        style: style
	});

    var map = new ol.Map({
        target: 'map',  // The DOM element that will contains the map
        interactions: ol.interaction.defaults({mouseWheelZoom:false}), //Disable scroll event
		renderer: 'canvas', // Force the renderer to be used
		layers: [
			// Add a new Tile layer getting tiles from OpenStreetMap source
			new ol.layer.Tile({
				source: new ol.source.OSM({
					url: "https://basemaps.cartocdn.com/rastertiles/light_all/{z}/{x}/{y}{r}.png"
				})
			}),
			vectorLayer
		],
		// Create a view centered on the specified location and zoom level
		view: new ol.View({
			center: ol.proj.fromLonLat(coords),
			zoom: 16
		})
    });  
    
    // Эвент по клику на маркере
    map.on('click', function(evt) {
        var f = map.forEachFeatureAtPixel(
            evt.pixel,
            function(ft, layer){return ft;}
        );
        if (f && f.get('type') == 'icon') {

            var url = "https://yandex.ru/maps/?pt=";
            url += coords[0]+","
                + coords[1]+"&"
                + "z=17&l=map";

            var linkEl = $('<a href="'+url+'" target="_blank">Google</a>');
            $('#map').append(linkEl);
            linkEl[0].click();
            $(linkEl).remove();
        }        
    });

    map.on("pointermove", function (evt) {
        var hit = this.forEachFeatureAtPixel(evt.pixel, function(feature, layer) {
            return true;
        }); 
        if (hit) {
            this.getTargetElement().style.cursor = 'pointer';
        } else {
            this.getTargetElement().style.cursor = '';
        }
    });
}
