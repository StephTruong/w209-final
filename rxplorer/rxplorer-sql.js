/* Module to wrap rxplorer's sql interatcion.
 This has copies of various bits of state like the filtersm=. (why did I do that again?)

TODO: pass in filters as arguments instead of using attributes, and remove reset if no state is left
*/

var sql=(function(module){
    // helper to turn leaflet L.LatLng to Mariadb 'Lon Lat' string
    module._llstring = function(ll) {
	return `${ll.lng} ${ll.lat}`;
    }
    // helper to turn leaflet L.BoundingBox to a WKT polygon string
    module._bbstring = function(bb) {
	return `POLYGON ((${module._llstring(bb.getNorthEast())}, ${module._llstring(bb.getNorthWest())}, ${module._llstring(bb.getSouthEast())}, ${module._llstring(bb.getSouthWest())}, ${module._llstring(bb.getNorthEast())}))`;
    }
    
    // helper to make a WHERE clause string from the filters set
    // Mariadb is case insensitive by default, so this isn't littered with LCASEs
    module.make_where = function(opts) {
	var where=['PhysicianProfileZip5=Zip5'];
	if(opts.bbox) {
	    where.push(`ST_WITHIN(Coords, ST_GeomFromText("${module._bbstring(opts.bbox)}"))`);
	}
	if(opts.specialties && opts.specialties.length>0) {
	    var quoted=[]
	    for(var i=0;i<opts.specialties.length;++i) {
		quoted.push('"'+opts.specialties[i]+'"');
	    }
	    var qstr=quoted.join(',');
	    where.push(`PhysicianProfilePrimarySpecialty IN (${qstr})`);
	}
	if(opts.name) {
	    var name=opts.name;
	    if(name.first) {
		where.push(`PhysicianProfileFirstName="${opts.name.first}"`);
	    }
	    if(name.middle) {
		where.push(`PhysicianProfileMiddleName="${opts.name.middle}"`);
	    }
	    if(name.last) {
		where.push(`PhysicianProfileLastName="${opts.name.last}"`);
	    }
	    if(name.sfx) {
		where.push(`PhysicianProfileSuffix="${opts.name.sfx}"`);
	    }
	}
	
	if(opts.addr) {
	    where.push(`InAddress like "${'%'+opts.addr+'%'}"`);
	}
	if(opts.city) {
	    where.push(`PhysicianProfileCity=${opts.city}`);
	}
	if(opts.state) {
	    where.push(`PhysicianProfileStae=${opts.state}`);
	}
	if(opts.zip) {
	    where.push(`Zip5=${opts.zip}`);
	}

	if(where) {
	    return "WHERE "+where.join('\n AND ');
	}
	return '';
    }
    // Helper to construct the RxPlorer physician query
    module.make_query = function(opts) {
	return `SELECT
	PhysicianProfileID         AS physId,
	PhysicianProfileLastName as lastName,
	CONCAT_WS(' ',
		  PhysicianProfileFirstName, 
		  PhysicianProfileMiddleName,
		  PhysicianProfileSuffix
		 ) AS name,
	PhysicianProfilePrimarySpecialty AS spec,
	CONCAT_WS(' ',
		   PhysicianProfileAddressLine1,
		   PhysicianProfileAddressLine2
		  ) AS addr,
	PhysicianProfileCity AS city,
	PhysicianProfileState AS state,
	Zip5 AS zip,
	CONCAT('{"lat":', ST_Y(Coords), ',"lng":', ST_X(Coords),'}') AS latLng,
	CONCAT('{"lat":', ST_Y(loc), ',"lng":', ST_X(loc),'}') AS zipLatLng
	FROM PhysicianProfileSupplement
	INNER JOIN GeolocatedAddresses on GeolocAddrID=ID
	INNER JOIN ZipLoc on zip=Zip5

	${module.make_where(opts)}
	${opts.limit?'LIMIT '+opts.limit.toString():''};`;
    }

    // low priv query endpoint to the UI.
    // TODO: Once the queries settle down, move them in to more restricted
    // explicit endpoints
    module._endpoint = 'http://169.53.15.199:20900/sql';

    // This calls the query api and returns the resulting oboe object
    // for the user to await data
    module.query = function(query) {
	return oboe({url: module._endpoint+'?query='+encodeURIComponent(query),
		     cached: true});
    }
    // Main API to retrieve providers
    module.find_providers = function(opts) {
	return module.query(module.make_query(opts));
    }

    return module;
}(sql||{}))
