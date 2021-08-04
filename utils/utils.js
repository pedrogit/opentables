const { assert } = require("chai");

exports.objKeysInObjKeys = function(obj1, obj2) {
  for (var key of Object.keys(obj1)) {
    if (!(key.startsWith('$')) && !(obj2.hasOwnProperty(key))) {
      return {isTrue: false, outKey: key};;
    }
  }
  return {isTrue: true, outKey: null};
};

exports.prefixAllKeys = function(obj, prefix) {
  var newObj = {};
  for (var key of Object.keys(obj)) {
    newObj[prefix + key] = obj[key];
  }
  return newObj;
}

exports.trimFromEdges = function(str, trim = '"', trimSpacesBefore = false, trimSpacesAfter = false) {
  var trimArr = [];
  if (!(trim instanceof Array)) {
    trimArr.push(trim);
  }
  else {
    trimArr = trim;
  }
  if (trimArr.length == 1) {
    trimArr.push(trimArr[0]);
  }
  assert(trimArr.length == 2);
  assert(trimArr[0].length == 1);
  assert(trimArr[1].length == 1);

  // remove trimming spaces before trimming provided characters if requested
  if (trimSpacesBefore) {
    str = str.trim();
  }

  // remove characters only if they area at both end
  if (str.length > 1 && 
      str.slice(0, 1) == trimArr[0] && 
      str.slice(-1) == trimArr[1]) {
    str = str.slice(1).slice(0, str.length - 2);
  }
  
  // remove trimming spaces after trimming provided characters if requested
  if (trimSpacesAfter) {
    str = str.trim();
  }
  return str;
}

exports.OTSchemaToJSON = function(otschema) {
  // double quote keys
  var jsonSchema = otschema.replace(/([a-zA-Z0-9_-]+)\s*:/ig, '"$1":');

  jsonSchema = '{field1: {required}, field2: {"toto": true}}'.replace(/([a-zA-Z0-9_-]+)\s*:/ig, '"$1":');
  // double quote values
  //jsonSchema = '{"22fi_eld1":{"required",sdf,"ab"}'.replace(/[a-z0-9_]*"\s*:\s*{\s*([^,:{}]+)/ig, )
  return jsonSchema;
}
