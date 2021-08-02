exports.objKeysInObjKeys = function(obj1, obj2){
  for (var key of Object.keys(obj1)) {
    if (!(key.startsWith('$')) && !(obj2.hasOwnProperty(key))){
      return {isTrue: false, outKey: key};;
    }
  }
  return {isTrue: true, outKey: null};
};

exports.prefixAllKeys = function(obj, prefix){
  var newObj = {};
  for (var key of Object.keys(obj)) {
    newObj[prefix + key] = obj[key];
  }
  return newObj;
}
