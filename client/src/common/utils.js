require("dotenv").config();
const { assert } = require("chai");
const jwt = require("jsonwebtoken");

const Globals = require("./globals");
const Errors = require("../common/errors");

const beforeJsonValueRX = "(?<=:)\\s*";
const afterJsonValueRX = "(?=[\\,\\}\\]]|$)";

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
    '"' + Globals.identifierRegEx + '"|\'' + Globals.identifierRegEx + '\'|' + Globals.identifierRegEx;

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
      let matchTrimmed = exports.trimFromEdges(group, '"');

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
      let matchTrimmed = exports.trimFromEdges(group, "'");

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
  req.user = payload[Globals.emailFieldName];
};

exports.isObjEmpty = function (obj) {
  return (
    obj &&
    Object.keys(obj).length === 0 &&
    Object.getPrototypeOf(obj) === Object.prototype
  );
};


/*
Permission model

BASIC - All views, lists and items, can have a r_permission or a rw_permission (or both) set. 
  r_permission determines who can view (and list) view, list or item properties. 
  rw_permission determines who can edit view, list or item properties.

  For lists, when r_permission is not set, it defaults to @all.
  For lists, when rw_permission is not set, it defaults to @owner.

  For views and items, when r_permission (or rw_permission) is not set, it uses the parent 
  list item_r_permission (or item_rw_permission).

ITEMS - List, and only lists, can have an item_r_permission or an item_rw_permission (or both) set. 
  item_r_permission determines globally who can view (and list) list item properties. 
  item_rw_permission determines globally who can edit list item properties.

BOTH SETS - When both list item_r_permission and list item r_permission (or item_rw_permission 
  and list item rw_permission) are set, list item r_permission (or rw_permission) 
  takes precedence (see argument below).

ITEM_R UNSET - When item_r_permission (or item_rw_permission) is not set (undefined or null), 
  childs items r_permission (or rw_permission) are used if they are set.

BOTH UNSET - When both list item_r_permission and list item r_permission (or item_rw_permission 
  and list item rw_permission) are not set (undefined or null) list r_permission is used.

OTHER RULES

INHERITANCE - rw_permission always grant r_permission

DELETE - rw_permission grants delete permission on an object only when this object does 
  not have an owner property (case of must list items). When it does, only the owner can 
  delete the object (case of views and lists).

DEFAULT OWNER - If the item owner property is not set, the list owner is the owner of all 
  the items.

OWNER DEFAULT PERMISSION - Being the owner of an object (view, list or item) always grants 
  rw_permission to this object.

PROPERTY LEVEL READ PERMISSION - Schemas can set properties as “read_by_edit_only” so that 
  they can be only viewed by user having rw_permission
*/
exports.validateRWPerm = function(
  {
    user,
    list,
    item,
    readWrite = true,
    throwError = true
  } = {}
) {
  // if user is not defined return false
  if (user) {
    // admin has all permissions
    if (user === process.env.ADMIN_EMAIL) {
      return true;
    }
    // validate owners
    if ((item && item.hasOwnProperty(Globals.ownerFieldName) && user === item[Globals.ownerFieldName]) || 
        (list && list.hasOwnProperty(Globals.ownerFieldName) && user === list[Globals.ownerFieldName])) {
        return true;
    }

    var mergedPerm = [];
    // if list read permission is not set = default (nothing or @all)


    if (list && list.hasOwnProperty(Globals.readWritePermFieldName)) {
      mergedPerm = list[Globals.readWritePermFieldName].split(/\s*,\s*/);
    }
    else {
      mergedPerm = (readWrite ? [] : [Globals.allUserName]);
    }

    // if list item permission is not set, set to = []
    if (list && list.hasOwnProperty(Globals.itemReadWritePermFieldName)) {
      let splittedRW = list[Globals.itemReadWritePermFieldName].split(/\s*,\s*/);
      
      if (readWrite) {
        mergedPerm = mergedPerm.concat(splittedRW);
      }
      else {
        mergedPerm = splittedRW;
      }
    }

    // if item permission is not set, set to = []
    if (item && item.hasOwnProperty(Globals.readWritePermFieldName)) {
      let splittedRW = item[Globals.readWritePermFieldName].split(/\s*,\s*/);
      if (readWrite) {
        mergedPerm = mergedPerm.concat(splittedRW);
      }
      else {
        mergedPerm = splittedRW;
      }
    }

    if (
      mergedPerm.includes(Globals.allUserName) ||
      (mergedPerm.includes(Globals.authUserName) && user !== Globals.allUserName) ||
      mergedPerm.includes(user)
    ) {
      return true;
    }
  }

  if (throwError) {
    throw new Errors.Forbidden(Errors.ErrMsg.Forbidden);
  }
  return false;
}

// read permissions
exports.validateRPerm = function(
  {
    user,
    list, 
    item,
    throwError = true
  } = {}
) {
  // if user has RW permission, he also has read permission
  if (exports.validateRWPerm({
    user: user,
    list: list,
    item: item,
    throwError: false
  })) {
    return true;
  }

  var newList = {...list};
  if (list) {
    if (list.hasOwnProperty(Globals.readPermFieldName)) {
      newList[Globals.readWritePermFieldName] = list[Globals.readPermFieldName]
    }
    else {
      delete newList[Globals.readWritePermFieldName]
    }
    if (list.hasOwnProperty(Globals.itemReadPermFieldName)) {
      newList[Globals.itemReadWritePermFieldName] = list[Globals.itemReadPermFieldName]
    }
    else {
      delete newList[Globals.itemReadWritePermFieldName]
    }
  }
  var newItem = {...item};
  if (item) {
    if (item.hasOwnProperty(Globals.readPermFieldName)) {
      newItem[Globals.readWritePermFieldName] = item[Globals.readPermFieldName]
    }
    else {
      delete newItem[Globals.readWritePermFieldName]
    }
  }
  // reuse the RW version of the function to check for read permission
  return exports.validateRWPerm({
    user: user,
    list: newList,
    item: newItem,
    readWrite: false,
    throwError: throwError
  });
}

// delete permissions
exports.validateDPerm = function(
  {
    user,
    list, 
    item,
     throwError = true
  } = {}
) {
  if (user && user === process.env.ADMIN_EMAIL) {
    return true;
  }
    
  // if list or item owner are set, user must be owner
  // if list or item owner are not set, must have RW permission
  if (list && list.hasOwnProperty(Globals.ownerFieldName) && user === list[Globals.ownerFieldName])
  {
    return true;
  }
  if (item && item.hasOwnProperty(Globals.ownerFieldName)) {
    if (user === item[Globals.ownerFieldName])
    {
      return true;
    }
  }
  else if (((list && list.hasOwnProperty(Globals.itemReadWritePermFieldName)) || 
       (item && item.hasOwnProperty(Globals.readWritePermFieldName))) &&
      exports.validateRWPerm({
      user: user,
      list: list,
      item: item,
      throwError: throwError
    })) {
      return true;
  }; 


  if (throwError) {
    throw new Errors.Forbidden(Errors.ErrMsg.Forbidden);
  }
  return false;
}

exports.getURLParam = (paramName) => {
  var url = new URL(window.location.href);
  return url.searchParams.get(paramName);
}



