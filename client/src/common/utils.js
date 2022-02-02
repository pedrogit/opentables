require("dotenv").config();
const { assert } = require("chai");
const jwt = require("jsonwebtoken");

const Globals = require("./globals");
const Errors = require("../common/errors");
const { str } = require("ajv");

const beforeJsonValueRX = "(?<=:)\\s*";
const afterJsonValueRX = "(?=[\\,\\}\\]]|$)";

const afterJsonKeyRX = "(?=[\\,\\}]|$)";

const beforeJsonArrayRX = "(?<=(?::\\s{0,10}\\[|\\s{0,10},))\\s*";
const afterJsonArrayRX = "(?=\\]|,)";

const numberValueRX = new RegExp("^-?[0-9]+(.[0-9]+)?$", "i");

const booleanValueRX = new RegExp("^(true|false)$", "i");

const worldValueRX = "[a-zA-Z0-9-_\\@\\#\\$\\%\\&]+";

const singleQuotedStrWithQuoteRX = "'" +        // opening quote
                              "(" +        // group of valid characters
                              "\\\\\\\\" + // double backslashes
                              "|" +        // or
                              "[^'\\\\]" + // any char not a quote or a backslash
                              "|" +        // or
                              "\\\\[^\\\\]" + // backslash followed by a non backslash
                              "|" +        // or
                              "'(?!(\\s*,|\\s*}\\s*,?|\\s*\\]\\s*,?)\\s*\"?" + Globals.identifierRegEx + "\"?\\s*:)" + // quote not followed by a separator, a key and a 
                              "|" +        // or
                              "\\\\(?='$)" + // any character other than ' and end of string preceded by a backslash
                              ")*" +
                              "'";         // closing quote

const doubleQuotedStrWithQuoteRX = singleQuotedStrWithQuoteRX.replace(/'/g, "\"");

const singleQuotedStrRX = "'(?:\\\\'|[^'])*'";
const doubleQuotedStrRX = singleQuotedStrRX.replace(/'/g, "\"");

exports.objKeysInObjKeys = function (obj1, obj2) {
  for (var key of Object.keys(obj1)) {
    if (!key.startsWith("$") && !obj2.hasOwnProperty(key)) {
      return { isTrue: false, outKey: key };
    }
  }
  return { isTrue: true, outKey: null };
};

exports.isSurroundedBy = function (str, edges) {
  if (str === undefined || edges === undefined) {
    return false;
  }
  var edgeArr = [];
  if (edges instanceof Array) {
    edgeArr = edges;
  } else {
    edgeArr.push(edges);
  }
  if (edgeArr.length === 1) {
    edgeArr.push(edgeArr[0]);
  }
  assert(edgeArr.length === 2);
  assert(edgeArr[0].length === 1);
  assert(edgeArr[1].length === 1);
  return (
    str.length > 1 &&
    str.slice(0, 1) === edgeArr[0] &&
    str.slice(-1) === edgeArr[1]
  );
};

exports.prefixAllKeys = function (obj, prefix) {
  var newObj = {};
  for (var key of Object.keys(obj)) {
    newObj[prefix + key] = obj[key];
  }
  return newObj;
};

exports.trimFromEdges = function (
  str,
  trim = '"',
  trimSpacesBefore = false,
  trimSpacesAfter = false
) {
  var trimArr = [];
  if (trim instanceof Array) {
    trimArr = trim;
  } else {
    trimArr.push(trim);
  }
  if (trimArr.length === 1) {
    trimArr.push(trimArr[0]);
  }
  assert(trimArr.length === 2);
  assert(trimArr[0].length === 1);
  assert(trimArr[1].length === 1);

  // remove trimming spaces before trimming provided characters if requested
  if (trimSpacesBefore) {
    str = str.trim();
  }

  // remove characters only if they area at both end
  if (exports.isSurroundedBy(str, trimArr)) {
    str = str.slice(1).slice(0, str.length - 2);
  }

  // remove trimming spaces after trimming provided characters if requested
  if (trimSpacesAfter) {
    str = str.trim();
  }
  return str;
};

exports.completeTrueValues = function (jsonStr) {
  const nonQuotedOrQuotedKey =
    '"' + Globals.identifierRegEx + '"' + '|\'' + Globals.identifierRegEx + '\'|' + Globals.identifierRegEx;

  const beforeKeyWithoutValueRX = "(?<=^|,\\s*|{\\s*)";
  const afterKeyWithoutValueRX = "(?=\\s*(?:,|}|$))";

  var regex = new RegExp(
    "\\[(?:\\s*(?:" +
    singleQuotedStrRX +
    "|" +
    doubleQuotedStrRX +
    "|" +
    worldValueRX + ")\\s*,?)+\\]" +
    "|" +
    beforeKeyWithoutValueRX +
    "(?:" +
    nonQuotedOrQuotedKey +
    ")" +
    afterKeyWithoutValueRX, "ig"
  );

  jsonStr = jsonStr.replace(regex, match => {
    if (exports.isSurroundedBy(match, ['[', "]"])) {
      return match;
    }
    return match + ": true"
  });
  return jsonStr;
};

exports.doubleQuoteKeys = function (jsonStr) {
  const regex = new RegExp('"(?:\\\\"|[^"])*"|' + Globals.identifierRegEx + '(?=\\s*:)', "ig");
  jsonStr = jsonStr.replace(regex, (match, p1, p2, p3, offset, string) => {
    if (!(exports.isSurroundedBy(match, '"'))) {
      return '"' + match + '"';
    }
    return match;
  });
  return jsonStr;
};

exports.escapeUnescapedChar = function (str, char, all = false) {
  // when all is false match only an even number of preceding backslashes
  var regex = new RegExp("(?<=[^\\\\]|^)(\\\\\\\\)*(" + char + ")", "g"); // even (pair) number of baskslashes
  if (all) {
    regex = new RegExp("()(" + char + ")", "g"); // odd (impair) number of baskslashes
  }
  return str.replace(regex, "$1$1\\$2");
};

exports.unescapeChar = function (str, char) {
  // when all is false match only an even number of preceding backslashes
  var regex = new RegExp("([^\\\\](?:\\\\\\\\)*|^(?:\\\\\\\\)*)(?:\\\\(" + char + "))", "g");
  return str.replace(regex, "$1$2");
};

exports.doubleQuoteValues = function (jsonStr) {
  /*const regex = new RegExp(
      beforeJsonValueRX +
      "(" +
      singleQuotedStrWithQuoteRX + 
      "|" +
      doubleQuotedStrWithQuoteRX +
      "|" +
      worldValueRX + ")\\s*" +
      afterJsonValueRX, "ig"
  );*/

  const regex = new RegExp(
    "(?:" +
    beforeJsonValueRX +
    "(" +
    singleQuotedStrWithQuoteRX + 
    "|" +
    doubleQuotedStrWithQuoteRX +
    "|" +
    worldValueRX + ")\\s*" +
    afterJsonValueRX +
    ")|(?:" +
    beforeJsonArrayRX +
    "(" +
    singleQuotedStrRX +
    "|" +
    doubleQuotedStrRX +
    "|" +
    worldValueRX + ")\\s*" +
    afterJsonArrayRX +
    ")", "ig"
  );
  jsonStr = jsonStr.replace(regex, (match, p1, p2, p3, p4, p5, p6, offset, string) => {
    var group = p1 || p6;
    if (numberValueRX.test(group)) {
      return ' ' + group;
    }
    
    if (booleanValueRX.test(group)) {
      return ' ' + group.toLowerCase();
    }

    if (exports.isSurroundedBy(group, '"')) {
      var matchTrimmed = exports.trimFromEdges(group, '"');

      // unescape escaped single quotes (only those preceded by an ood number of backslashes)
      matchTrimmed = exports.unescapeChar(matchTrimmed, "\"")
      
      // escape backslashes
      matchTrimmed = matchTrimmed.replace('\\', "\\\\");

      // escape double quotes
      matchTrimmed = exports.escapeUnescapedChar(matchTrimmed, '"', true);

      // enclose in double quotes
      matchTrimmed = ' "' + matchTrimmed + '"';

      // unescape final double quote
      matchTrimmed = exports.unescapeChar(matchTrimmed, '"$');

      return matchTrimmed;
    }
    
    if (exports.isSurroundedBy(group, "'")) {
      var matchTrimmed = exports.trimFromEdges(group, "'");

      // unescape escaped single quotes (only those preceded by an ood number of backslashes)
      matchTrimmed = exports.unescapeChar(matchTrimmed, "'")
      
      // escape backslashes
      matchTrimmed = matchTrimmed.replace('\\', "\\\\");

      // escape double quotes
      matchTrimmed = exports.escapeUnescapedChar(matchTrimmed, '"', true);

      // enclose in double quotes
      matchTrimmed = ' "' + matchTrimmed + '"';

      // unescape final double quote
      matchTrimmed = exports.unescapeChar(matchTrimmed, '"$');

      return matchTrimmed;
    }

    return ' "' + group + '"';
  });
  return jsonStr;
};

exports.simpleJSONToJSON = function (simpleJSONStr) {
  // Simple JSON string are like JSON strings excepts that:
  //  - external braces {} are not required
  //  - keys do not have to be quoted
  //  - keys without values are interpreted as boolean TRUE
  //  - whole word values do not have to be quoted
  // e.g. 'field1: {type: string, required}' is equivalent to
  //      the JSON string '{"field1": {"type": "string", "required": true}}'

  // Simple, unbraced strings (e.g. 'simple_string') are
  // also converted to boolean. If they are true simple strings then
  // simpleJSONToJSON should not be called.

  // double quote keys
  var jsonStr = exports.completeTrueValues(simpleJSONStr);
  jsonStr = exports.trimFromEdges(jsonStr, ["{", "}"], true, true);
  jsonStr = exports.doubleQuoteValues(jsonStr);
  jsonStr = exports.doubleQuoteKeys(jsonStr);
  //jsonStr = exports.doubleQuoteSingleQuotedParts(jsonStr);
  jsonStr = "{" + jsonStr + "}";
  var parsedSchema = "";
  try {
    parsedSchema = JSON.parse(jsonStr);
  } catch (err) {
    throw new Error(err.message);
  }
  return parsedSchema;
};

exports.objWithout = function (obj, without) {
  var newObj = { ...obj };
  if (without && typeof without === "string") {
    without = [without];
  }
  if (typeof newObj === "object" && without instanceof Array) {
    without.forEach((x) => {
      if (newObj.hasOwnProperty(x)) {
        delete newObj[x];
      }
    });
  }
  return newObj;
};

exports.setCookieJWT = function (req, res, payload) {
  var jwtoken = jwt.sign(payload, process.env.TOKEN_SECRET, {
    algorithm: "HS256",
  });
  res.cookie("authtoken", jwtoken, { httpOnly: false });
  req.user = payload.email;
};

exports.isObjEmpty = function (obj) {
  return (
    obj &&
    Object.keys(obj).length === 0 &&
    Object.getPrototypeOf(obj) === Object.prototype
  );
};

exports.validatePerm = function(user, listOwner, listCPerm, listWPerm, listRPerm, throwerror = true)
{
  // admin and listowner have all permissions
  if (user === process.env.ADMIN_EMAIL || user === listOwner) {
    return true;
  }

  if (user !== Globals.unauthUserName && user !== '') {
    // if listCPerm permission is @all or the user is listed, grant permission
    if (
      listCPerm &&
      (listCPerm === "@all" || listCPerm.split(/\s*,\s*/).includes(user))
    ) {
      return true;
    }

    // if listWPerm permission is @all or the user is listed, grant permission
    if (
      listWPerm &&
      (listWPerm === "@all" || listWPerm.split(/\s*,\s*/).includes(user))
    ) {
      return true;
    }
  }

  // if listRPerm permission is @all or the user is listed, grant permission
  if (
    listRPerm &&
    (listRPerm === "@all" || listRPerm.split(/\s*,\s*/).includes(user))
  ) {
    return true;
  }
  if (throwerror) {
    throw new Errors.Forbidden(Errors.ErrMsg.Forbidden);
  }
  return false;
}



