/* eslint-disable no-param-reassign */
const NodeUtil = require("util");

const SimpleJSON = require("./simpleJSON");
const Errors = require("./errors");

class Filter {
  constructor(filter) {
    if (typeof filter === "string") {
      try {
        this.filter = SimpleJSON.simpleJSONToJSON(filter);
      } catch (err) {
        throw new Error(
          NodeUtil.format(Errors.ErrMsg.OTFilter_InvalidFilter, filter)
        );
      }
    } else {
      this.filter = filter;
    }
  }

  // traverse a json object calling provided callbacks according to the right level
  traverse(obj, level = 0, callbacks = null) {
    // eslint-disable-next-line no-restricted-syntax
    for (const key in obj) {
      if (Object.prototype.hasOwnProperty.call(obj, key)) {
        // if a method with the name exists, call it
        if (key.startsWith("$")) {
          const methodName = `convert_${key.slice(1)}`;
          if (Filter[methodName]) {
            Filter[methodName](obj); // pass object by value so the validator can modify it directly
          }
        }

        if (obj[key] !== null && typeof obj[key] === "object") {
          // going one step down in the object tree!!
          this.final(obj[key], key, level + 1, callbacks);
        }
      }
    }
    return obj;
  }

  final() {
    if (this.filter) {
      return this.traverse(this.filter);
    }
    return null;
  }

  static convert_contains(obj) {
    // console.log(obj);
    // obj['$gt'] = [{'$indexOfCP': [ obj['$contains'][0], obj['$contains'][1] ]}, -1];
    obj.$regexFind = {
      input: obj.$contains[0],
      regex: obj.$contains[1],
    };
    delete obj.$contains;
  }

  static convert_contains_i(obj) {
    obj.$contains = obj.$contains_i;
    delete obj.$contains_i;
    Filter.convert_contains(obj);
    obj.$regexFind.options = "i";
  }

  static convert_isexactly(obj) {
    obj.$contains = obj.$isexactly;
    delete obj.$isexactly;
    Filter.convert_contains(obj);
    obj.$regexFind.regex = `^${obj.$regexFind.regex}$`;
  }

  static convert_isexactly_i(obj) {
    obj.$contains = obj.$isexactly_i;
    delete obj.$isexactly_i;
    Filter.convert_contains(obj);
    obj.$regexFind.regex = `^${obj.$regexFind.regex}$`;
    obj.$regexFind.options = "i";
  }
}

module.exports = Filter;
