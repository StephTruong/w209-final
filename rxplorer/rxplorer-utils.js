module.reset_filters = function() {
    Object.keys(module._resetData).forEach(function(attr) {
	module[attr]=module._resetData[attr];
    });
}
// factory to make attributes (var/getter/setter) given their name
// and a default val/resetter
function makeAttribute(module, attrName, defaultVal, subAccessor) {
    var _attrName='_'+attrName;
    module[_attrName]=defaultVal||null;
    module._resetData
    if(subAccessor) {
        module[attrName]=function(_) {
            if(arguments.length>0) {
                module[_attrName]=_;
                return module;
            }
            return subAccessor(module[_attrName]);
        }
    } else {
        module[attrName]=function(_) {
            if(arguments.length>0) {
                    module[_attrName]=_;
                return module;
            }
            return module[_attrName];
        }
    }
}
