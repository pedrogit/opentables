const Globals = require("./globals");

const beforeJsonValueRX = "(?<=:)\\s*";
const afterJsonValueRX = "(?=[\\,\\}\\]]|$)";

const beforeJsonArrayRX = "(?<=(?::\\s{0,10}\\[|\\s{0,10},))\\s*";
const afterJsonArrayRX = "(?=\\]|,)";

const numberValueRX = /^-?[0-9]+(.[0-9]+)?$/i;

const booleanValueRX = /^(true|false)$/i;

const worldValueRX = "[a-zA-Z0-9-_\\@\\#\\$\\%\\&]+";

const singleQuotedStrWithQuoteRX =
  "'" + // opening quote
  "(" + // group of valid characters
  "\\\\\\\\" + // double backslashes
  "|" + // or
  "[^'\\\\]" + // any char not a quote or a backslash
  "|" + // or
  "\\\\[^\\\\]" + // backslash followed by a non backslash
  "|" + // or
  `'(?!(\\s*,|\\s*}\\s*,?|\\s*\\]\\s*,?)\\s*"?${Globals.identifierRegEx}"?\\s*:)` + // quote not followed by a separator, a key and a
  "|" + // or
  "\\\\(?='$)" + // any character other than ' and end of string preceded by a backslash
  ")*" +
  "'"; // closing quote

const doubleQuotedStrWithQuoteRX = singleQuotedStrWithQuoteRX.replace(
  /'/g,
  '"'
);

const singleQuotedStrRX = "'(?:\\\\'|[^'])*'";
const doubleQuotedStrRX = singleQuotedStrRX.replace(/'/g, '"');

exports.RXStr = {
  singleQuotedStr: singleQuotedStrRX,
  doubleQuotedStr: doubleQuotedStrRX,
  worldValue: worldValueRX,
};

exports.isSurroundedBy = (str, edges) => {
  if (str === undefined || edges === undefined) {
    return false;
  }
  let edgeArr = [];
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

exports.prefixAllKeys = (obj, prefix) => {
  const newObj = {};
  Object.keys(obj).forEach((key) => {
    newObj[prefix + key] = obj[key];
  });
  return newObj;
};

exports.trimFromEdges = (
  str,
  trim = '"',
  trimSpacesBefore = false,
  trimSpacesAfter = false
) => {
  let newStr = str;
  let trimArr = [];
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
    newStr = newStr.trim();
  }

  // remove characters only if they area at both end
  if (exports.isSurroundedBy(newStr, trimArr)) {
    newStr = newStr.slice(1).slice(0, newStr.length - 2);
  }

  // remove trimming spaces after trimming provided characters if requested
  if (trimSpacesAfter) {
    newStr = newStr.trim();
  }
  return newStr;
};

exports.completeTrueValues = (jsonStr) => {
  const nonQuotedOrQuotedKey = `"${Globals.identifierRegEx}"|'${Globals.identifierRegEx}'|${Globals.identifierRegEx}`;

  const beforeKeyWithoutValueRX = "(?<=^|,\\s*|{\\s*)";
  const afterKeyWithoutValueRX = "(?=\\s*(?:,|}|$))";
  const beforeQuotedStrValueRX = "(?:\\:\\s*)";

  const regex = new RegExp(
    // quoted string
    `${beforeQuotedStrValueRX}\\"(?:\\s*(?:${singleQuotedStrRX}|${worldValueRX})\\s*,?)+\\"` +
      `|` +
      // array of strings
      `\\[(?:\\s*(?:${singleQuotedStrRX}|${doubleQuotedStrRX}|${worldValueRX})\\s*,?)+\\]` +
      `|${beforeKeyWithoutValueRX}(?:${nonQuotedOrQuotedKey})${afterKeyWithoutValueRX}`,
    "ig"
  );

  let newJsonStr = jsonStr;

  newJsonStr = newJsonStr.replace(regex, (match) => {
    if (exports.isSurroundedBy(match, ["[", "]"])) {
      return match;
    }
    const notValue = /^:\s*/;
    if (notValue.test(match)) {
      return match;
    }
    return `${match}: true`;
  });
  return newJsonStr;
};

exports.doubleQuoteKeys = (jsonStr) => {
  const regex = new RegExp(
    `"(?:\\\\"|[^"])*"|${Globals.identifierRegEx}(?=\\s*:)`,
    "ig"
  );
  const newJsonStr = jsonStr.replace(regex, (match) => {
    if (!exports.isSurroundedBy(match, '"')) {
      return `"${match}"`;
    }
    return match;
  });
  return newJsonStr;
};

exports.escapeUnescapedChar = (str, char, all = false) => {
  // when all is false match only an even number of preceding backslashes
  let regex = new RegExp(`(?<=[^\\\\]|^)(\\\\\\\\)*(${char})`, "g"); // even (pair) number of baskslashes
  if (all) {
    regex = new RegExp(`()(${char})`, "g"); // odd (impair) number of baskslashes
  }
  return str.replace(regex, "$1$1\\$2");
};

exports.unescapeChar = (str, char) => {
  // when all is false match only an even number of preceding backslashes
  const regex = new RegExp(
    `([^\\\\](?:\\\\\\\\)*|^(?:\\\\\\\\)*)(?:\\\\(${char}))`,
    "g"
  );
  return str.replace(regex, "$1$2");
};

exports.doubleQuoteValues = (jsonStr) => {
  const regex = new RegExp(
    `(?:${beforeJsonValueRX}(${singleQuotedStrWithQuoteRX}|${doubleQuotedStrWithQuoteRX}|${worldValueRX})\\s*${afterJsonValueRX})|(?:${beforeJsonArrayRX}(${singleQuotedStrRX}|${doubleQuotedStrRX}|${worldValueRX})\\s*${afterJsonArrayRX})`,
    "ig"
  );
  const newJsonStr = jsonStr.replace(regex, (match, p1, p2, p3, p4, p5, p6) => {
    const group = p1 || p6;
    if (numberValueRX.test(group)) {
      return ` ${group}`;
    }

    if (booleanValueRX.test(group)) {
      return ` ${group.toLowerCase()}`;
    }

    if (exports.isSurroundedBy(group, '"')) {
      let matchTrimmed = exports.trimFromEdges(group, '"');

      // unescape escaped single quotes (only those preceded by an ood number of backslashes)
      matchTrimmed = exports.unescapeChar(matchTrimmed, '"');

      // escape backslashes
      matchTrimmed = matchTrimmed.replace("\\", "\\\\");

      // escape double quotes
      matchTrimmed = exports.escapeUnescapedChar(matchTrimmed, '"', true);

      // enclose in double quotes
      matchTrimmed = ` "${matchTrimmed}"`;

      // unescape final double quote
      matchTrimmed = exports.unescapeChar(matchTrimmed, '"$');

      return matchTrimmed;
    }

    if (exports.isSurroundedBy(group, "'")) {
      let matchTrimmed = exports.trimFromEdges(group, "'");

      // unescape escaped single quotes (only those preceded by an ood number of backslashes)
      matchTrimmed = exports.unescapeChar(matchTrimmed, "'");

      // escape backslashes
      matchTrimmed = matchTrimmed.replace("\\", "\\\\");

      // escape double quotes
      matchTrimmed = exports.escapeUnescapedChar(matchTrimmed, '"', true);

      // enclose in double quotes
      matchTrimmed = ` "${matchTrimmed}"`;

      // unescape final double quote
      matchTrimmed = exports.unescapeChar(matchTrimmed, '"$');

      return matchTrimmed;
    }

    return ` "${group}"`;
  });
  return newJsonStr;
};

exports.simpleJSONToJSON = (simpleJSONStr) => {
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
  let jsonStr = exports.completeTrueValues(simpleJSONStr);
  jsonStr = exports.trimFromEdges(jsonStr, ["{", "}"], true, true);
  jsonStr = exports.doubleQuoteValues(jsonStr);
  jsonStr = exports.doubleQuoteKeys(jsonStr);
  jsonStr = `{${jsonStr}}`;
  let parsedSchema = "";
  try {
    parsedSchema = JSON.parse(jsonStr);
  } catch (err) {
    throw new Error(err.message);
  }
  return parsedSchema;
};
