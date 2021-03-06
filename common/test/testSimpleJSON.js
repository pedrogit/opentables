/* eslint-env mocha */
const chai = require("chai");
const SimpleJSON = require("../simpleJSON");

const { expect } = chai;

const replaceStrInObject = (obj, searchStr, replaceStr) => {
  const newObj = { ...obj };
  Object.keys(obj).forEach((key) => {
    if (
      Object.prototype.hasOwnProperty.call(newObj, key) &&
      (typeof newObj[key] === "string" || newObj[key] instanceof String)
    ) {
      newObj[key] = newObj[key].replace(searchStr, replaceStr);
    } else if (
      typeof newObj[key] === "object" &&
      !Array.isArray(newObj[key]) &&
      newObj[key] !== null
    ) {
      newObj[key] = replaceStrInObject(newObj[key], searchStr, replaceStr);
    }
  });
  return newObj;
};

describe("testSimpleJSON.js Test simpleJSON functions", () => {
  describe("A - Test trimFromEdges()", () => {
    it('1 - Simple test. Default to removing double quotes"', () => {
      expect(SimpleJSON.trimFromEdges('"aaaa"')).to.equal("aaaa");
    });

    it("2 - Simple test. Explicitly provides double quotes as a character", () => {
      expect(SimpleJSON.trimFromEdges('"aaaa"', '"')).to.equal("aaaa");
    });

    it("3 - Simple test. Explicitly provides double quotes as an array", () => {
      expect(SimpleJSON.trimFromEdges('"aaaa"', ['"'])).to.equal("aaaa");
    });

    it("4 - Provides 2 characters long remove strings", () => {
      expect(() => {
        SimpleJSON.trimFromEdges('"aaaa"', ["({", "})"]);
      }).to.throw("Trim strings should contain only one character...");
    });

    it("5 - Provides 3 remove strings", () => {
      expect(() => {
        SimpleJSON.trimFromEdges('"aaaa"', ["({", "})", '"']);
      }).to.throw("Trim array should not contain more than two strings...");
    });

    it("6 - With space at the end without removing them first", () => {
      const result = SimpleJSON.trimFromEdges('"aaaa" ');
      expect(result).to.equal('"aaaa" ');
    });

    it("7 - With space at the end removing them first", () => {
      const result = SimpleJSON.trimFromEdges('"aaaa" ', '"', true, true);
      expect(result).to.equal("aaaa");
    });

    it("8 - With space at the end removing them first and removing inside spaces too", () => {
      const result = SimpleJSON.trimFromEdges('"aaaa " ', '"', true, true);
      expect(result).to.equal("aaaa");
    });

    it("9 - With two brackets", () => {
      const result = SimpleJSON.trimFromEdges("{aaaa}", ["{", "}"]);
      expect(result).to.equal("aaaa");
    });

    it("10 - Remove surrounding space even if trimming characters are not found", () => {
      const result = SimpleJSON.trimFromEdges(" {aaaa}", '"', true, false);
      expect(result).to.equal("{aaaa}");
    });

    it("11 - Remove space surrounding trimmed string when trimming characters are not found has no effect", () => {
      const result = SimpleJSON.trimFromEdges(" {aaaa }", '"', true, true);
      expect(result).to.equal("{aaaa }");
    });
  });

  describe("B - Test isSurroundedBy()", () => {
    it("1 - First arg undefined", () => {
      expect(SimpleJSON.isSurroundedBy(undefined, '"')).to.equal(false);
    });

    it("2 - Second arg undefined", () => {
      expect(SimpleJSON.isSurroundedBy('"aaaa"', undefined)).to.equal(false);
    });

    it("3 - Simple test", () => {
      expect(SimpleJSON.isSurroundedBy('"aaaa"', '"')).to.equal(true);
    });
  });

  describe("C - Test completeTrueValues()", () => {
    it("1 - Simple test", () => {
      const result = SimpleJSON.completeTrueValues("{pr1: {required}}");
      expect(result).to.equal("{pr1: {required: true}}");
    });

    it("2 - Simple string", () => {
      const result = SimpleJSON.completeTrueValues("pr1, pr2, pr3");
      expect(result).to.equal("pr1: true, pr2: true, pr3: true");
    });

    it("3 - No spaces", () => {
      const result = SimpleJSON.completeTrueValues("{pr1:{required}}");
      expect(result).to.equal("{pr1:{required: true}}");
    });

    it("4 - More spaces", () => {
      const result = SimpleJSON.completeTrueValues("{pr1: {  required  }}");
      expect(result).to.equal("{pr1: {  required: true  }}");
    });

    it("5 - More complex key", () => {
      const result = SimpleJSON.completeTrueValues(
        "{00fi-eld_1: {00fi-eld_2}}"
      );
      expect(result).to.equal("{00fi-eld_1: {00fi-eld_2: true}}");
    });

    it("6 - Double quoted key", () => {
      const result = SimpleJSON.completeTrueValues('{pr1: {  "required"  }}');
      expect(result).to.equal('{pr1: {  "required": true  }}');
    });

    it("7 - More values", () => {
      const result = SimpleJSON.completeTrueValues("{a: {b, c}}");
      expect(result).to.equal("{a: {b: true, c: true}}");
    });

    it("8 - Double quoted keys", () => {
      const result = SimpleJSON.completeTrueValues('{a: {"b"}}');
      expect(result).to.equal('{a: {"b": true}}');
    });

    it("9 - Single quoted keys", () => {
      const result = SimpleJSON.completeTrueValues("{a: {'b'}}");
      expect(result).to.equal("{a: {'b': true}}");
    });

    it("10 - Array of strings", () => {
      const result = SimpleJSON.completeTrueValues("{a: [b, c, d]}");
      expect(result).to.equal("{a: [b, c, d]}");
    });

    it("11 - Double quoted list of strings", () => {
      const result = SimpleJSON.completeTrueValues('{a: "b, c, d"}');
      expect(result).to.equal('{a: "b, c, d"}');
    });
  });

  describe("D - Test unescapeChar()", () => {
    it("1 - Single quote alone 1", () => {
      const result = SimpleJSON.unescapeChar("'", "'");
      expect(result).to.deep.equal("'");
    });

    it("2 - Single quote alone 2", () => {
      const result = SimpleJSON.unescapeChar("'", "'");
      expect(result).to.deep.equal("'");
    });

    it("3 - Implicitely escaped single quote", () => {
      const result = SimpleJSON.unescapeChar("\\'", "'");
      expect(result).to.deep.equal("'");
    });

    it("4 - Explicitely escaped single quote", () => {
      const result = SimpleJSON.unescapeChar("\\'", "'");
      expect(result).to.deep.equal("'");
    });

    it("5 - Unescaped single quote preceded by two backslashes", () => {
      const result = SimpleJSON.unescapeChar("\\\\'", "'");
      expect(result).to.deep.equal("\\\\'");
    });

    it("6 - Implicitely escaped single quote preceded by two backslashes", () => {
      const result = SimpleJSON.unescapeChar("\\\\'", "'");
      expect(result).to.deep.equal("\\\\'");
    });

    it("7 - Explicitely escaped single quote preceded by two backslashes", () => {
      const result = SimpleJSON.unescapeChar("\\\\\\'", "'");
      expect(result).to.deep.equal("\\\\'");
    });

    it("8 - Unescape final double quote", () => {
      const result = SimpleJSON.unescapeChar('\\"', '"$');
      expect(result).to.deep.equal('"');
    });

    it("9 - Unescape final double quote", () => {
      const result = SimpleJSON.unescapeChar('\\"', '"$');
      expect(result).to.deep.equal('"');
    });

    it("10 - Unescape final double quote", () => {
      const result = SimpleJSON.unescapeChar('\\\\"', '"$');
      expect(result).to.deep.equal('\\\\"');
    });
  });

  describe("E - Test escapeUnescapedChar()", () => {
    it("1 - Single quote alone", () => {
      // there is zero escape char so ' is escaped
      const result = SimpleJSON.escapeUnescapedChar("'", "'");
      expect(result).to.deep.equal("\\'");
    });

    it("2 - Single quote with 0 backslash", () => {
      // there is zero escape char so ' is escaped
      const result = SimpleJSON.escapeUnescapedChar("a'b", "'");
      expect(result).to.deep.equal("a\\'b");
    });

    it("3 - Single quote with 1 backslash", () => {
      // \ count for zero escape char so ' is escaped
      const result = SimpleJSON.escapeUnescapedChar("a'bc'd", "'");
      expect(result).to.deep.equal("a\\'bc\\'d");
    });

    it("4 - Single quote with 2 backslash", () => {
      // \\ count for one escape char so it is just kept, not escaped
      const result = SimpleJSON.escapeUnescapedChar("a\\'bc\\'d", "'");
      expect(result).to.deep.equal("a\\'bc\\'d");
    });

    it("5 - Single quote with 3 backslash", () => {
      // \\ count for one escape char and \' is unescaped
      const result = SimpleJSON.escapeUnescapedChar("a\\'bc\\'d", "'");
      expect(result).to.deep.equal("a\\'bc\\'d");
    });

    it("6 - Single quote with 4 backslash", () => {
      // \\\\ are two backslashes, they are both escaped
      const result = SimpleJSON.escapeUnescapedChar("a\\\\'bc\\\\'d", "'");
      expect(result).to.deep.equal("a\\\\\\\\\\'bc\\\\\\\\\\'d");
    });

    it("7 - Single quote with 5 backslash", () => {
      const result = SimpleJSON.escapeUnescapedChar("a\\\\'bc\\\\'d", "'");
      expect(result).to.deep.equal("a\\\\\\\\\\'bc\\\\\\\\\\'d");
    });

    it("8 - Double quote with 0 backslash", () => {
      const result = SimpleJSON.escapeUnescapedChar('a"b', '"');
      expect(result).to.deep.equal('a\\"b');
    });

    it("9 - Double quote with 1 backslash", () => {
      const result = SimpleJSON.escapeUnescapedChar('a"b', '"');
      expect(result).to.deep.equal('a\\"b');
    });

    it("10 - Double quote with 2 backslash", () => {
      const result = SimpleJSON.escapeUnescapedChar('a\\"b', '"');
      expect(result).to.deep.equal('a\\"b');
    });

    it("11 - Double quote with 3 backslash", () => {
      const result = SimpleJSON.escapeUnescapedChar('a\\"b', '"');
      expect(result).to.deep.equal('a\\"b');
    });

    it("12 - Double quote with 4 backslash", () => {
      const result = SimpleJSON.escapeUnescapedChar('a\\\\"b', '"');
      expect(result).to.deep.equal('a\\\\\\\\\\"b');
    });

    it("13 - Double quote with 5 backslash", () => {
      const result = SimpleJSON.escapeUnescapedChar('a\\\\"b', '"');
      expect(result).to.deep.equal('a\\\\\\\\\\"b');
    });
  });

  describe("F - Test doubleQuoteKeys()", () => {
    it("1 - Simple test", () => {
      const result = SimpleJSON.doubleQuoteKeys("{pr1: required}");
      expect(result).to.equal('{"pr1": required}');
    });

    it("2 - Already double quoted", () => {
      const result = SimpleJSON.doubleQuoteKeys('{"pr1": required}');
      expect(result).to.equal('{"pr1": required}');
    });

    it("3 - Key starting with a dollars sign", () => {
      const result = SimpleJSON.doubleQuoteKeys("{$pr1: required}");
      expect(result).to.equal('{"$pr1": required}');
    });

    it("4 - Quoted value containing a key", () => {
      const result = SimpleJSON.doubleQuoteKeys('{pr1: "b:", pr2: ""}');
      expect(result).to.equal('{"pr1": "b:", "pr2": ""}');
    });

    it("5 - Quoted value containing a key and excaped quotes", () => {
      const result = SimpleJSON.doubleQuoteKeys(
        '{pr1: "b :\\"", pr2: "b :\\"\\""}'
      );
      expect(result).to.equal('{"pr1": "b :\\"", "pr2": "b :\\"\\""}');
    });

    it("6 - Quoted value containing a boolean", () => {
      const result = SimpleJSON.doubleQuoteKeys("{pr1: true, pr2: false}");
      expect(result).to.equal('{"pr1": true, "pr2": false}');
    });
  });

  const specialCaseTestNames = {
    test00: "Simple string containing @",
    test01: "Boolean",
  };

  const specialCaseTests = {
    test00: "pr1: @owner",
    test01: "pr1: true, pr2: TruE, pr3: false, pr4: FalSe",
  };

  const specialCaseExpectedObj = {
    test00: { pr1: "@owner" },
    test01: { pr1: true, pr2: true, pr3: false, pr4: false },
  };

  const specialCaseExpectedStr = {
    test00: 'pr1: "@owner"',
    test01: "pr1: true, pr2: true, pr3: false, pr4: false",
  };

  describe("G - Test doubleQuoteValues() with special cases", () => {
    Object.keys(specialCaseTestNames).forEach((key) => {
      // console.log(key + ": " + testNb + " - " + specialCaseTestNames[key]);
      if (Object.prototype.hasOwnProperty.call(specialCaseTestNames, key)) {
        it(`${key} - ${specialCaseTestNames[key]}`, () => {
          /* if (key === 'test27') {
            console.log(key);
          } */
          const result = SimpleJSON.doubleQuoteValues(
            specialCaseTests[key].trim()
          );
          expect(result).to.equal(specialCaseExpectedStr[key].trim());
        });
      }
    });
  });

  describe("H - Test simpleJSONToJSON() with special cases", () => {
    Object.keys(specialCaseTestNames).forEach((key) => {
      // console.log(key + ": " + testNb + " - " + specialCaseTestNames[key]);
      if (Object.prototype.hasOwnProperty.call(specialCaseTestNames, key)) {
        it(`${key} - ${specialCaseTestNames[key]}`, () => {
          /* if (key === 'test01') {
            console.log(key);
          } */
          const result = SimpleJSON.simpleJSONToJSON(
            specialCaseTests[key].trim()
          );
          expect(result).to.deep.equal(specialCaseExpectedObj[key]);
        });
      }
    });
  });

  const singleQuotesTestNames = {
    // simple tests
    test00: "Empty value",
    test01: "Simple value",

    // including unescaped quotes
    test10: "Single quote",
    test11: "Single quote and value",
    test12: "Single quote, value and space",

    // including escaped quotes
    test20: "Escaped single quote",
    test21: "Escaped single quote and value",
    test22: "Double escaped single quote",
    test23: "Double escaped single quote and value",
    test24: "Triple escaped single quote and value",

    // including commas
    test30: "Comma",
    test31: "Comma and value",
    test32: "Comma, value and space",

    // unescaped and escaped quotes followed by JSON separators (,}])
    // quotes are not interpreted as string terminators
    test40: "Single quote and comma",
    test41: "Escaped single quote and comma",
    test42: "Double escaped single quote and comma",

    test43: "Single quote and closing brace",
    test44: "Escaped single quote and closing brace",
    test45: "Double escaped single quote and closing brace",

    test46: "Single quote and closing braquet",
    test47: "Escaped single quote and closing braquet",
    test48: "Double escaped single quote and closing braquet",

    // unescaped quotes followed by a JSON separators (,}]) a key and a semi column
    // quotes are interpreted as string terminators
    test50: "Unescaped single quote, comma and key",
    test51: "Unescaped single quote, space, comma and key",

    test52: "Opening brace, unescaped single quote, closing brace and key",
    test53: "Unescaped single quote, space, closing brace and key",
    test54: "Opening brace, unescaped single quote, closing brace and key",
    test55: "Unescaped single quote, space, closing brace and key",

    test56: "Unescaped single quote, closing braquet and key",
    test57: "Unescaped single quote, space, closing braquet and key",

    // escaped quotes followed by JSON separators (,}])
    // quotes are not interpreted as string terminators
    test60: "Escaped single quote, comma and key",
    test61: "Escaped single quote, space, comma and key",
    /*
    test62: "Escaped single quote, closing brace and key",
    test63: "Escaped single quote, space, closing brace and key",
    */

    // variable number of backslashes
    test70: "One \\",
    test71: "Two \\",
    test72: "Three \\",
    test73: "Four \\",
    test74: "Five \\",
    test75: "Six \\",
    test76: "Seven \\",
    test77: "Height \\",
    test78: "One, two, three and four \\ in the same string",

    // other tests
    test80: "Double quotes",
    test81: "Already quoted keys",
    test82: "Key and array",
    test83: "Already quoted array values",
    test84: "Quoted list of strings",
  };

  const singleQuotesTests = {
    // simple tests
    test00:
      "pr1: '', pr2: ' '                                                           ",
    test01:
      "pr1: 'aa bb', pr2: ' aa bb ', pr3: 'aa'                                     ",

    // including unescaped quotes
    test10:
      "pr1: ''', pr2: ' '', pr3: '' ', pr4: ' ' '                                  ",
    test11:
      "pr1: ''a', pr2: 'a'', pr3: ''a''                                            ",
    test12:
      "pr1: ' 'a', pr2: 'a' ', pr3: ' 'a ', pr4: ' a' '                            ",

    // including escaped quotes
    test20:
      "pr1: ''', pr2: ' '', pr3: '' ', pr4: ' ' '                              ",
    test21:
      "pr1: ''a', pr2: ' a'', pr3: ''a ', pr4: ' a' '                          ",
    test22:
      "pr1: '\\'', pr2: ' \\'', pr3: '\\' ', pr4: ' \\' '                          ",
    test23:
      "pr1: '\\'a', pr2: ' a\\'', pr3: '\\'a ', pr4: ' a\\' '                      ",
    test24:
      "pr1: '\\'a', pr2: ' a\\'', pr3: '\\'a ', pr4: ' a\\' '                  ",

    // including commas
    test30:
      "pr1: ',', pr2: ' ,', pr3: ', ', pr4: ' , '                                  ",
    test31:
      "pr1: ',a', pr2: 'a,', pr3: 'a,b'                                            ",
    test32:
      "pr1: ' ,a', pr2: ',a ', pr3: ' a,', pr4: 'a, '                              ",

    // unescaped and escaped quotes followed by JSON separators (,}])
    // quotes are not interpreted as string terminators
    test40:
      "pr1: '',', pr2: ' ,'', pr3: ',' ', pr4: ' ', '                              ",
    test41:
      "pr1: '',', pr2: ' ,'', pr3: ',' ', pr4: ' ', '                          ",
    test42:
      "pr1: '\\',', pr2: ' ,\\'', pr3: ',\\' ', pr4: ' \\', '                      ",

    test43:
      "pr1: ''}', pr2: ' }'', pr3: '}' ', pr4: ' '} '                              ",
    test44:
      "pr1: ''}', pr2: ' }'', pr3: '}' ', pr4: ' '} '                          ",
    test45:
      "pr1: '\\'}', pr2: ' }\\'', pr3: '}\\' ', pr4: ' \\'} '                      ",

    test46:
      "pr1: '']', pr2: ' ]'', pr3: ']' ', pr4: ' '] '                              ",
    test47:
      "pr1: '']', pr2: ' ]'', pr3: ']' ', pr4: ' '] '                          ",
    test48:
      "pr1: '\\']', pr2: ' ]\\'', pr3: ']\\' ', pr4: ' \\'] '                      ",

    // unescaped quotes followed by a JSON separators (,}]) a key and a semi column
    // quotes is automatically interpreted as a string terminator when followed by a comma
    // quotes is interpreted as a string terminator when followed by a braquet not
    // matching an opening braquet
    test50:
      "pr1: 'aa',pr2: 'bb'                                                         ",
    test51:
      "pr1: 'aa'  ,  pr2: 'bb'                                                     ",

    test52:
      "pr1: {pr2: 'aa'},pr3: 'bb'                                                  ",
    test53:
      "pr1: 'aa'},pr3: 'bb'                                                        ",
    test54:
      "pr1: {pr2: 'aa'}  ,  pr3: 'bb'                                              ",
    test55:
      "pr1: 'aa'}  ,  pr3: 'bb'                                                    ",

    test56:
      "pr1: ['aa', 'bb'],pr2: 'cc'                                                 ",
    test57:
      "pr1: ['aa', 'bb']  ,  pr2: 'cc'                                             ",

    // escaped quote followed by a JSON separators (,}]) a key and a semi column
    // escaped quote followed by a comma is not interpreted as a tring terminator
    // escaped quote followed by a closing brace or a closing braquet are interpreted
    // as a string terminator only when they are not
    test60:
      "pr1: 'aa\\',pr2: 'bb'                                                       ",
    test61:
      "pr1: 'aa\\'  ,  pr2: 'bb'                                                   ",

    /*
    test62: "pr1: {pr2: 'aa\\'},pr3: 'bb'                                                ",
    test63: "pr1: 'aa\\'}  ,  pr3: 'bb'                                              ",
    */

    // variable number of backslashes
    test70:
      "pr1: ''                                                                    ",
    test71:
      "pr1: '\\'                                                                   ",
    test72:
      "pr1: '\\'                                                                  ",
    test73:
      "pr1: '\\\\'                                                                 ",
    test74:
      "pr1: '\\\\'                                                                ",
    test75:
      "pr1: '\\\\\\'                                                               ",
    test76:
      "pr1: '\\\\\\'                                                              ",
    test77:
      "pr1: '\\\\\\\\'                                                             ",
    test78:
      "pr1: '', pr2: '\\', pr3: '\\', pr4: '\\\\'                                ",

    // other tests
    test80:
      "pr1: '\"', pr2: '\"\"'                                                      ",
    test81:
      "\"pr1\": 'aa', \"pr2\": 'bb'                                                ",
    test82:
      "$contains: [$pr1, aaa]                                                      ",
    test83: "$contains: [  '$pr1'  ,  \"aaa\"  ,  'bbb'  ,  \"ccc\"  ]",
    test84: 'prop1: {type: string, options: "a, b, c"}',
  };

  const singleQuotesExpectedObj = {
    test00: { pr1: "", pr2: " " },
    test01: { pr1: "aa bb", pr2: " aa bb ", pr3: "aa" },

    test10: { pr1: "'", pr2: " '", pr3: "' ", pr4: " ' " },
    test11: { pr1: "'a", pr2: "a'", pr3: "'a'" },
    test12: { pr1: " 'a", pr2: "a' ", pr3: " 'a ", pr4: " a' " },

    test20: { pr1: "'", pr2: " '", pr3: "' ", pr4: " ' " },
    test21: { pr1: "'a", pr2: " a'", pr3: "'a ", pr4: " a' " },
    test22: { pr1: "'", pr2: " '", pr3: "' ", pr4: " ' " },
    test23: { pr1: "'a", pr2: " a'", pr3: "'a ", pr4: " a' " },
    test24: { pr1: "'a", pr2: " a'", pr3: "'a ", pr4: " a' " },

    test30: { pr1: ",", pr2: " ,", pr3: ", ", pr4: " , " },
    test31: { pr1: ",a", pr2: "a,", pr3: "a,b" },
    test32: { pr1: " ,a", pr2: ",a ", pr3: " a,", pr4: "a, " },

    test40: { pr1: "',", pr2: " ,'", pr3: ",' ", pr4: " ', " },
    test41: { pr1: "',", pr2: " ,'", pr3: ",' ", pr4: " ', " },
    test42: { pr1: "',", pr2: " ,'", pr3: ",' ", pr4: " ', " },

    test43: { pr1: "'}", pr2: " }'", pr3: "}' ", pr4: " '} " },
    test44: { pr1: "'}", pr2: " }'", pr3: "}' ", pr4: " '} " },
    test45: { pr1: "'}", pr2: " }'", pr3: "}' ", pr4: " '} " },

    test46: { pr1: "']", pr2: " ]'", pr3: "]' ", pr4: " '] " },
    test47: { pr1: "']", pr2: " ]'", pr3: "]' ", pr4: " '] " },
    test48: { pr1: "']", pr2: " ]'", pr3: "]' ", pr4: " '] " },

    test50: { pr1: "aa", pr2: "bb" },
    test51: { pr1: "aa", pr2: "bb" },

    test52: { pr1: { pr2: "aa" }, pr3: "bb" },
    test53: "Unexpected token , in JSON at position 13",
    test54: { pr1: { pr2: "aa" }, pr3: "bb" },
    test55: "Unexpected token , in JSON at position 15",

    test56: { pr1: ["aa", "bb"], pr2: "cc" },
    test57: { pr1: ["aa", "bb"], pr2: "cc" },

    test60: { pr1: "aa',pr2: 'bb" },
    test61: { pr1: "aa'  ,  pr2: 'bb" },

    test70: { pr1: "" },
    test71: { pr1: "\\" },
    test72: { pr1: "\\" },
    test73: { pr1: "\\" },
    test74: { pr1: "\\" },
    test75: { pr1: "\\\\" },
    test76: { pr1: "\\\\" },
    test77: { pr1: "\\\\" },
    test78: { pr1: "", pr2: "', pr3: '', pr4: '\\" },

    test80: { pr1: '"', pr2: '""' },
    test81: { pr1: "aa", pr2: "bb" },
    test82: { $contains: ["$pr1", "aaa"] },
    test83: { $contains: ["$pr1", "aaa", "bbb", "ccc"] },
    test84: { prop1: { type: "string", options: "a, b, c" } },
  };

  const singleQuotesExpectedStr = {
    test00:
      'pr1: "", pr2: " "                                                          ',
    test01:
      'pr1: "aa bb", pr2: " aa bb ", pr3: "aa"                                  ',

    test10:
      'pr1: "\'", pr2: " \'", pr3: "\' ", pr4: " \' "                             ',
    test11:
      'pr1: "\'a", pr2: "a\'", pr3: "\'a\'"                                         ',
    test12:
      'pr1: " \'a", pr2: "a\' ", pr3: " \'a ", pr4: " a\' "                       ',

    test20:
      'pr1: "\'", pr2: " \'", pr3: "\' ", pr4: " \' "                             ',
    test21:
      'pr1: "\'a", pr2: " a\'", pr3: "\'a ", pr4: " a\' "                         ',
    test22:
      'pr1: "\'", pr2: " \'", pr3: "\' ", pr4: " \' "                             ',
    test23:
      'pr1: "\'a", pr2: " a\'", pr3: "\'a ", pr4: " a\' "                         ',
    test24:
      'pr1: "\'a", pr2: " a\'", pr3: "\'a ", pr4: " a\' "                         ',

    test30:
      'pr1: ",", pr2: " ,", pr3: ", ", pr4: " , "                             ',
    test31:
      'pr1: ",a", pr2: "a,", pr3: "a,b"                                         ',
    test32:
      'pr1: " ,a", pr2: ",a ", pr3: " a,", pr4: "a, "                         ',

    test40:
      'pr1: "\',", pr2: " ,\'", pr3: ",\' ", pr4: " \', "                         ',
    test41:
      'pr1: "\',", pr2: " ,\'", pr3: ",\' ", pr4: " \', "                         ',
    test42:
      'pr1: "\',", pr2: " ,\'", pr3: ",\' ", pr4: " \', "                         ',

    test43:
      'pr1: "\'}", pr2: " }\'", pr3: "}\' ", pr4: " \'} "                         ',
    test44:
      'pr1: "\'}", pr2: " }\'", pr3: "}\' ", pr4: " \'} "                         ',
    test45:
      'pr1: "\'}", pr2: " }\'", pr3: "}\' ", pr4: " \'} "                         ',

    test46:
      'pr1: "\']", pr2: " ]\'", pr3: "]\' ", pr4: " \'] "                         ',
    test47:
      'pr1: "\']", pr2: " ]\'", pr3: "]\' ", pr4: " \'] "                         ',
    test48:
      'pr1: "\']", pr2: " ]\'", pr3: "]\' ", pr4: " \'] "                         ',

    test50:
      'pr1: "aa",pr2: "bb"                                                        ',
    test51:
      'pr1: "aa",  pr2: "bb"                                                      ',

    test52:
      'pr1: {pr2: "aa"},pr3: "bb"                                                 ',
    test53:
      'pr1: "aa"},pr3: "bb"                                                       ',
    test54:
      'pr1: {pr2: "aa"}  ,  pr3: "bb"                                             ',
    test55:
      'pr1: "aa"}  ,  pr3: "bb"                                                   ',

    test56:
      'pr1: [ "aa", "bb"],pr2: "cc"                                                      ',
    test57:
      'pr1: [ "aa", "bb"]  ,  pr2: "cc"                                                  ',

    test60:
      "pr1: \"aa',pr2: 'bb\"                                                          ",
    test61:
      "pr1: \"aa'  ,  pr2: 'bb\"                                                      ",

    test70:
      'pr1: ""                                                                      ',
    test71:
      'pr1: "\\\\"                                                                  ',
    test72:
      'pr1: "\\\\"                                                                  ',
    test73:
      'pr1: "\\\\"                                                                  ',
    test74:
      'pr1: "\\\\"                                                                  ',
    test75:
      'pr1: "\\\\\\\\"                                                              ',
    test76:
      'pr1: "\\\\\\\\"                                                              ',
    test77:
      'pr1: "\\\\\\\\"                                                              ',
    test78:
      "pr1: \"\", pr2: \"', pr3: '', pr4: '\\\\\"                                     ",

    test80:
      'pr1: "\\"", pr2: "\\"\\""                                               ',
    test81:
      '"pr1": "aa", "pr2": "bb"                                               ',
    test82:
      '$contains: [ "$pr1", "aaa"]                                                ',
    test83:
      '$contains: [ "$pr1", "aaa", "bbb", "ccc"]                              ',
    test84:
      'prop1: {type: "string", options: "a, b, c"}                                ',
  };

  describe("I - Test doubleQuoteValues() with single quoted string", () => {
    // https://regex101.com/r/0pHSRF/1
    // problematic characters are ['"\,]
    //
    // 1) enclosing ' must be converted to " for JSON.parse to work properly
    //   e.g. JSON.parse('{"x": \'a\'}')
    //        Uncaught SyntaxError: Unexpected token ' in JSON at position 6
    //
    //   e.g. JSON.parse('{"x": "a"}')
    //        {x: 'a'}
    //
    // 2) inner " must be escaped because they end up enclosed by ""
    //   e.g. JSON.parse('{"x": "a""}')
    //        Uncaught SyntaxError: Unexpected string in JSON at position 9
    //
    //   e.g. JSON.parse('{"x": "a\\""}')
    //        {x: 'a"'}
    //
    // 3) remaining \ must be escaped so they actually convert to \
    //   e.g. JSON.parse('{"x": "\"}')
    //        {x: ''}
    //
    //   e.g. JSON.parse('{"x": "\\"}')
    //        Uncaught SyntaxError: Unexpected end of JSON input
    //
    //   e.g. JSON.parse('{"x": "\\\"}')
    //        Uncaught SyntaxError: Unexpected end of JSON input
    //
    //   e.g. JSON.parse('{"x": "\\\\"}')
    //        {x: '\'}
    //
    //   e.g. JSON.parse('{"x": "\\\\\"}')
    //        {x: '\'}
    //
    //   e.g. JSON.parse('{"x": "\\\\\\"}')
    //        Uncaught SyntaxError: Unexpected end of JSON input
    //
    //   e.g. JSON.parse('{"x": "\\\\\\\"}')
    //        Uncaught SyntaxError: Unexpected end of JSON input
    //
    //   e.g. JSON.parse('{"x": "\\\\\\\\"}')
    //        {x: '\\'}
    //
    //   e.g. JSON.parse('{"x": "\b"}')
    //        Uncaught SyntaxError: Unexpected token  in JSON at position 7
    //
    //   e.g. JSON.parse('{"x": "\\\\b"}')
    //        {x: '\b'}
    //
    // 4) unescaped single quotes followed by a comma followed by a key and a value
    //    must be interpreted as enclosing quotes (recursive: impossible to implement)
    //      x: ''' = {"x": "'"}
    //      x: ','' = {"x": ",'"}
    //      x: '',' = {"x": "',"}
    //      x: '',b' = {"x": "',b"}
    //      x: '',key:' = {"x": "',key:"}
    //      x: '',key:'' = {"x": "", "b": ""}
    //      x: '\',key:'' = {"x": "',key:'"}
    //
    // 4) unescaped single quotes followed by a comma followed by a key and a : (colon)
    //    must be interpreted as enclosing quotes
    //      x: ''' = {"x": "'"}
    //      x: ','' = {"x": ",'"}
    //      x: '',' = {"x": "',"}
    //      x: '',:' = {"x": "',:"}
    //      x: '',b' = {"x": "',b"}
    //      x: '',key:' = {"x": "", "b": null} instead of {"x": "',key:"}
    //      x: '\',key:'' = {"x": "',key:'"}

    // ?) inner ' must be escaped for JSON.parse to work properly

    Object.keys(singleQuotesTestNames).forEach((key) => {
      // console.log(key + ": " + testNb + " - " + singleQuotesTestNames[key]);
      if (Object.prototype.hasOwnProperty.call(singleQuotesTestNames, key)) {
        it(`${key} - ${singleQuotesTestNames[key]}`, () => {
          /* if (key === 'test83') {
            console.log(key);
          } */
          const result = SimpleJSON.doubleQuoteValues(
            singleQuotesTests[key].trim()
          );
          expect(result).to.equal(singleQuotesExpectedStr[key].trim());
        });
      }
    });
  });

  describe("J - Test simpleJSONToJSON() with multi level object strings", () => {
    it("Simple test", () => {
      const result = SimpleJSON.simpleJSONToJSON("pr1: {required}");
      expect(result).to.deep.equal({ pr1: { required: true } });
    });

    it("Test empty JSON schema", () => {
      const result = SimpleJSON.simpleJSONToJSON("{}");
      expect(result).to.deep.equal({});
    });

    it("Test simple string", () => {
      const result = SimpleJSON.simpleJSONToJSON("abc");
      expect(result).to.deep.equal({ abc: true });
    });

    it("Simple test with two values", () => {
      const result = SimpleJSON.simpleJSONToJSON("a: {b, c}");
      expect(result).to.deep.equal({ a: { b: true, c: true } });
    });

    it("Simple test with one set value and two unset values", () => {
      const result = SimpleJSON.simpleJSONToJSON("a: {b, c:true, d}");
      expect(result).to.deep.equal({ a: { b: true, c: true, d: true } });
    });

    it("Simple test with two base values", () => {
      const result = SimpleJSON.simpleJSONToJSON("a: {b, c}, d: {e}");
      expect(result).to.deep.equal({ a: { b: true, c: true }, d: { e: true } });
    });
  });

  describe("K - Test simpleJSONToJSON() with single quotes", () => {
    Object.keys(singleQuotesTestNames).forEach((key) => {
      // console.log(key + ": " + testNb + " - " + singleQuotesTestNames[key]);
      if (Object.prototype.hasOwnProperty.call(singleQuotesTestNames, key)) {
        it(`${key} - ${singleQuotesTestNames[key]}`, () => {
          if (key === "test84") {
            console.log(key);
          }
          if (key === "test53" || key === "test55") {
            /* try {
              SimpleJSON.simpleJSONToJSON(singleQuotesTests[key].trim());
            }
            catch(err) {
              console.log(err);
            } */
            expect(() => {
              SimpleJSON.simpleJSONToJSON(singleQuotesTests[key].trim());
            }).to.throw(singleQuotesExpectedObj[key]);
          } else {
            const result = SimpleJSON.simpleJSONToJSON(
              singleQuotesTests[key].trim()
            );
            expect(result).to.deep.equal(singleQuotesExpectedObj[key]);
          }
        });
      }
    });
  });

  describe("L - Test simpleJSONToJSON() with double quotes", () => {
    Object.keys(singleQuotesTestNames).forEach((key) => {
      // console.log(key + ": " + testNb + " - " + singleQuotesTestNames[key]);
      if (Object.prototype.hasOwnProperty.call(singleQuotesTestNames, key)) {
        it(`${key} - ${singleQuotesTestNames[key]
          .replace("Single", "Double")
          .replace("single", "double")}`, () => {
          /* if (key === 'test55') {
            console.log(key);
          } */
          if (key === "test53" || key === "test55") {
            /* try {
              SimpleJSON.simpleJSONToJSON(singleQuotesTests[key].replace(/'/g, "\"").trim());
            }
            catch(err) {
              console.log(err);
            } */
            expect(() => {
              SimpleJSON.simpleJSONToJSON(
                singleQuotesTests[key].replace(/'/g, '"').trim()
              );
            }).to.throw(singleQuotesExpectedObj[key]);
          } else {
            const result = SimpleJSON.simpleJSONToJSON(
              singleQuotesTests[key].replace(/'/g, '"').trim()
            );
            expect(result).to.deep.equal(
              replaceStrInObject(singleQuotesExpectedObj[key], /'/g, '"')
            );
          }
        });
      }
    });
  });
});
