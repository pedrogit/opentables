const Utils = require('./utils');
const Errors = require('./errors');
const NodeUtil = require('util');

class listItemFilter {
  constructor(filter) {
      if (typeof filter === 'string') {
        try {
          this.filter = Utils.simpleJSONToJSON(filter);
        } catch(err) {
          throw new Error(NodeUtil.format(Errors.ErrMsg.OTFilter_InvalidFilter, filter));
        }
      }
      else {
        this.filter = filter;      
      }

      /*if (typeof this.filter !== 'object') {
        throw new Error(Errors.ErrMsg.OTFilter_Malformed);
      }*/
  };

  // traverse a json object calling provided callbacks according to the right level
  traverse(obj, parentKey = null) {
    for (var key in obj) {
      // if a method with the name exists, call it
      if (key.startsWith('$')){
        var methodName = 'convert_' + key.slice(1);
        if (this[methodName]) {
          this[methodName](obj); // pass object by value so the validator can modify it directly
        }
      }

      if (obj[key] !== null && typeof(obj[key]) == "object") {
          //going one step down in the object tree!!
          this.final(obj[key], key, ++level, callbacks);
          level--;
      };
    };
    return obj;
  };

  final() {
    if (this.filter) {
      return this.traverse(this.filter);
    }
    return null;
  }

  convert_contains(obj) {
    //console.log(obj);
    //obj['$gt'] = [{'$indexOfCP': [ obj['$contains'][0], obj['$contains'][1] ]}, -1];
    obj['$regexFind'] = {input: obj['$contains'][0], regex: obj['$contains'][1]};
    delete obj['$contains'];
  };

  convert_contains_i(obj) {
    obj['$contains'] = obj['$contains_i'];
    delete obj['$contains_i'];
    this.convert_contains(obj);
    obj['$regexFind'].options = 'i';
  };

  convert_isexactly(obj) {
    obj['$contains'] = obj['$isexactly'];
    delete obj['$isexactly'];
    this.convert_contains(obj);
    obj['$regexFind'].regex = '^' + obj['$regexFind'].regex + '$';
  };

  convert_isexactly_i(obj) {
    obj['$contains'] = obj['$isexactly_i'];
    delete obj['$isexactly_i'];
    this.convert_contains(obj);
    obj['$regexFind'].regex = '^' + obj['$regexFind'].regex + '$';
    obj['$regexFind'].options = 'i';
  };
};

module.exports = listItemFilter;
