const { assert } = require("chai");

const identifierRegEx = '[a-zA-Z0-9_-]+';

const afterJsonValue = '(?=[\\,\\}]|$)';

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
const afterJsonValue = '(?=[\\,\\}]|$)';
var regex = new RegExp('{\\s*(' + nonQuotedOrQuotedId + ')\\s*' + afterJsonValue, 'ig');
  jsonstr = jsonstr.replace(regex, '{$1: true');
  regex = new RegExp(',\\s*(' + nonQuotedOrQuotedId + ')\\s*' + afterJsonValue, 'ig');
  return jsonstr.replace(regex, ', $1: true');
}

exports.doubleQuoteKeys = function(jsonstr) {
  const regex = new RegExp('(' + identifierRegEx + ')\\s*:', 'ig');
  return jsonstr.replace(regex, '"$1":');
}

exports.doubleQuoteWordValues = function(jsonstr) {
  const regex = new RegExp('(' + identifierRegEx + ')\\s*' + afterJsonValue, 'ig');
  const boolRegex = new RegExp('true|false', 'i');
  var newStr = jsonstr;
  while ((result = regex.exec(jsonstr)) !== null) {
    if (!(boolRegex.test(result[0]))) {
      //const foundRegEx = new RegExp('("' + result[0] + '")|(' + result[0] + ')', 'i');
      const foundRegEx = new RegExp('(?<!")(' + result[0] + ')(?!")', 'i');
      newStr = newStr.replace(foundRegEx, '"$1"');
    }
  }
  return newStr;
}

exports.OTSchemaToJSON = function(otschema) {
  // double quote keys
  var jsonSchema = exports.completeTrueValues(otschema);
  jsonSchema = exports.trimFromEdges(jsonSchema, ['{', '}'], true, true);
  jsonSchema = exports.doubleQuoteWordValues(jsonSchema);
  jsonSchema = '{' + exports.doubleQuoteKeys(jsonSchema) + '}';
  var parsedSchema = '';
  try {
    parsedSchema = JSON.parse(jsonSchema);
  } catch(err) {
    throw new Error('Invalid OTSchema (' + otschema + ')...');
  }
  return parsedSchema;
}
