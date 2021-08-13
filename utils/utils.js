const { assert } = require("chai");

const identifierRegEx = '[a-zA-Z0-9_-]+';
const afterJsonValueRegEx = '(?=[\\,\\}]|$)';

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

exports.completeTrueValues = function(jsonstr) {
  const nonQuotedOrQuotedId = identifierRegEx + '|"' + identifierRegEx + '"';
  var regex = new RegExp('{\\s*(' + nonQuotedOrQuotedId + ')\\s*' + afterJsonValueRegEx, 'ig');
  jsonstr = jsonstr.replace(regex, '{$1: true');
  regex = new RegExp(',\\s*(' + nonQuotedOrQuotedId + ')\\s*' + afterJsonValueRegEx, 'ig');
  return jsonstr.replace(regex, ', $1: true');
}

exports.doubleQuoteKeys = function(jsonstr) {
  const regex = new RegExp('(' + identifierRegEx + ')\\s*:', 'ig');
  return jsonstr.replace(regex, '"$1":');
}

exports.doubleQuoteWordValues = function(jsonstr) {
  const regex = new RegExp('(' + identifierRegEx + ')\\s*' + afterJsonValueRegEx, 'ig');
  const boolAndNumberRegex = new RegExp('true|false|-?[0-9]+(.[0-9]+)?', 'i');
  var newStr = jsonstr;
  while ((result = regex.exec(jsonstr)) !== null) {
    if (!(boolAndNumberRegex.test(result[0]))) {
      const foundRegEx = new RegExp('(?<!")(' + result[0] + ')(?!")', 'i');
      newStr = newStr.replace(foundRegEx, '"$1"');
    }
  }
  return newStr;
}

