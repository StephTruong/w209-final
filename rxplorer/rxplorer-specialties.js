var specialties=(function(module){
    module.init=function(endpoint, sel) {
	module.specialty=sel;
	$.get(endpoint).done(function(resp) {
	    if(resp.data) {
		resp.data.forEach(function(row) {
			      var opt=$("<option>");
		    opt.attr('value',row.Specialty);
		    opt.text(row.Specialty);
		    specialties.specialty.append(opt);
		});
	    }
	    if(resp.err && resp.err.length>0) {
		alert(resp.err);
	    }
	});
	sel.on('change', function(ev) {
	    var opts=ev.target.selectedOptions;
	    var chosen={}
	    for(var i=0; i < opts.length; ++i) {
		if(opts[i].value!=='') {
		    chosen[opts[i].value]=1;
		} else {
		    chosen={};
		    break;
		}
	    }
	});
	return module;
    }
    return module;
}(specialties||{}))
