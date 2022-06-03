const Globals = require("./globals");

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

exports.RXStr = {
  singleQuotedStr: singleQuotedStrRX,
  doubleQuotedStr: doubleQuotedStrRX,
  worldValue: worldValueRX
}

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
      if (trim.length > 2) {
        throw new Error("Trim array should not contain more than two strings...");
      }
      trimArr = trim;
    } else {
      trimArr.push(trim);
    }
    if (trimArr.length === 1) {
      trimArr.push(trimArr[0]);
    }
  
    if (trimArr[0].length > 1 || trimArr[1].length > 1) {
      throw new Error("Trim strings should contain only one character...");
    }
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
    const beforeQuotedStrValueRX = "(?:\\:\\s*)";
  
    var regex = new RegExp(
      // quoted string
      beforeQuotedStrValueRX +
      "\\\"(?:\\s*(?:" +
      singleQuotedStrRX +
      "|" +
      worldValueRX + ")\\s*,?)+\\\"" +
      "|" +
      // array of strings
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
      const notValue = new RegExp("^\\:\\s*")
      if (notValue.test(match)) {
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