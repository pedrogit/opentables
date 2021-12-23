require("dotenv").config();
const { assert } = require("chai");
const jwt = require("jsonwebtoken");

const Globals = require("./globals");
const Errors = require("../common/errors");

const afterJsonKeyRegEx = "(?=[\\,\\}]|$)";
const afterJsonValueRegEx = "(?=[\\,\\}\\]]|$)";
const anythingDoubleQuoted = '"(?:[^"\\\\]|\\\\.)*"';

exports.objKeysInObjKeys = function (obj1, obj2) {
  for (var key of Object.keys(obj1)) {
    if (!key.startsWith("$") && !obj2.hasOwnProperty(key)) {
      return { isTrue: false, outKey: key };
    }
  }
  return { isTrue: true, outKey: null };
};

exports.isSurroundedBy = function (str, edges) {
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

exports.completeTrueValues = function (jsonstr) {
  const nonQuotedOrQuotedId =
    Globals.identifierRegEx + '|"' + Globals.identifierRegEx + '"';

  // replace identifier at the beginning of a simple JSON string
  var regex = new RegExp(
    "{\\s*(" + nonQuotedOrQuotedId + ")\\s*" + afterJsonKeyRegEx,
    "ig"
  );
  jsonstr = jsonstr.replace(regex, "{$1: true");

  // replace identifier following first properties
  regex = new RegExp(
    ",\\s*(" + nonQuotedOrQuotedId + ")\\s*" + afterJsonKeyRegEx,
    "ig"
  );
  jsonstr = jsonstr.replace(regex, ", $1: true");

  // replace unique identifiers
  regex = new RegExp("^\\s*(" + nonQuotedOrQuotedId + ")\\s*$", "i");
  jsonstr = jsonstr.replace(regex, "$1: true");

  return jsonstr;
};

exports.doubleQuoteKeys = function (jsonstr) {
  const regex = new RegExp("(" + Globals.identifierRegEx + ")\\s*:", "ig");
  return jsonstr.replace(regex, '"$1":');
};

exports.doubleQuoteWordValues = function (jsonstr) {
  const regex = new RegExp(
    "(" +
      anythingDoubleQuoted +
      "|" +
      Globals.identifierRegEx +
      ")\\s*" +
      afterJsonValueRegEx,
    "ig"
  );
  jsonstr = jsonstr.replace(regex, (match, p1, p2, p3, offset, string) => {
    const boolAndNumberRegex = new RegExp(
      "^(true|false|-?[0-9]+(.[0-9]+)?)$",
      "i"
    );
    if (
      exports.isSurroundedBy(match, "'") ||
      exports.isSurroundedBy(match, '"') ||
      boolAndNumberRegex.test(match)
    ) {
      return match;
    }
    return '"' + match + '"';
  });
  return jsonstr;
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
  // also converted. If they are true simple strings then
  // simpleJSONToJSON should not be called.

  // double quote keys
  var jsonStr = exports.completeTrueValues(simpleJSONStr);
  jsonStr = exports.trimFromEdges(jsonStr, ["{", "}"], true, true);
  jsonStr = exports.doubleQuoteWordValues(jsonStr);
  jsonStr = "{" + exports.doubleQuoteKeys(jsonStr) + "}";
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



