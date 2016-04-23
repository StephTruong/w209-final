//RxPlorer uses Leaflet for its map access.
var map=(function(module){
    //draw a map using the provided selector.
    module.init = function(selector_string) {
	var mapnode=$(selector_string);
	mapnode.css('height', 0.75*mapnode[0].getBoundingClientRect().width);
	// We avoid calling Leaflet until init-time (document ready) since
	// some of the calls do not appear to work.
    	// TODO: figure these out and run more code at load time if possible
	module._max_bounds =
	    L.latLngBounds(
		L.latLng(24.396308, -124.848974),
		L.latLng(49.384358,  -66.885444));
	module.map = L.map(selector_string,{
	    zoom: 4
	});
	module._zipMarkerIcon=L.icon({
	    iconUrl: '/images/gold-star.png',
	    iconSize: [38,38],
	    iconAnchor: [19,19],
	    popupAncor: [19,38]
	});
	module.baseTiles=L.tileLayer('http://{s}.tile.osm.org/{z}/{x}/{y}.png', {
	    attribution: '&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
	})
	    .addTo(module.map);
	module.reset();
	return module;
    }

    // Put the map into its default view state.
    module.reset = function() {
	module.clearMarkers();
	module.map.setView(module._max_bounds.getCenter(), 4);
	return module;
    }

    // Put the map into the requested state.
    module.refresh = function(options) {
	var opts={
	    center: map.map.getCenter(),
	    zoom: module.map.getZoom(),
	    maxBounds: module._max_bounds
	};
	Object.assign(opts, options); // merge
	module.map.setView(opts.center, opts.zoom, {animate: true});
	return module;
    }
    
    // Add physician location markers, using jquery to associate the
    // data record with the element.
    module.addMarker = function(loc, msg, title, data) {
	var marker=L.marker(loc, {
	    title: title
	})
	    .addTo(module.map)
	    .bindPopup(msg);
	module._markers.push(marker);
	$(marker).data('psData', data);
	return marker;
    }
    // Remove all physician location markers
    module.clearMarkers = function() {
	if(module._markers) {
	    module._markers.forEach(function(marker){
		module.map.removeLayer(marker);
	    });
	}
	module._markers=[];
	return module;
    }

    // TODO/WIP:
    // Put a unique different colored marker up
    // for the specified zip code, and recenter the map.
    module.setZipMarker = function(loc, zip) {
	module.clearZipMarker();
	module.refresh({center: loc});
	var zipMsg=`ZIP code ${zip}`;
	module._zipMarker=L.marker(loc,{title: zipMsg,
					icon: module._zipMarkerIcon});
	return module._zipMarker
	    .addTo(module.map)
	    .bindPopup(zipMsg);
    }
    module.clearZipMarker = function(loc, zip) {
	if(module._zipMarker) {
	    module.map.removeLayer(module._zipMarker);
	    module._zipMarker=undefined;
	}
	return module;
    }
    
    return module;
}(map||{}));
