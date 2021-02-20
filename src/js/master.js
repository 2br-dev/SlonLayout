var miscSliders;
var storedImage;

$(() => {
    init();

    $(window).on('scroll', setNavbarBackground);
    $('body').on('click', '.filter-header', toggleFilterBlock);
    $('body').on('change', 'input', consoleForm);
    $('body').on('click', '#reset-filters', resetFilters);
    $('body').on('change', '.filter-block input', updateFiltersHeader);
    $('body').on('click', '.sidenav .folder', toggleSidenavFolder);
    $('body').on('click', '.filters-trigger', toggleFilters);
});

//= Переключение видимости фильтров в мобильной адаптации==================
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
    if($('html, body').scrollTop() >= 100){
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

//= Общая инициализация ===================================================
function init(){
    $('.lazy-image').lazy();
    $('.tooltipped').tooltip();
    $('.sidenav').sidenav();
    $('.materialboxed').materialbox({
        onOpenStart: storeDataImage,
        onCloseEnd: restoreDataImage
    });
    setNavbarBackground();

    miscSliders = new Swiper('.misc-slider', {
        loop: true,
        spaceBetween: 20,
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
        })
    });
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