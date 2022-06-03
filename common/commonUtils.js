const jwt = require("jsonwebtoken");

/*
exports.objKeysInObjKeys = function (obj1, obj2) {
  for (var key of Object.keys(obj1)) {
    if (!key.startsWith("$") && !obj2.hasOwnProperty(key)) {
      return { isTrue: false, outKey: key };
    }
  }
  return { isTrue: true, outKey: null };
};
*/

exports.objWithout = function (obj, without) {
  if (typeof obj === "object") {
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
  }
  return obj;
};

/*
exports.isObjEmpty = function (obj) {
  return (
    obj &&
    Object.keys(obj).length === 0 &&
    Object.getPrototypeOf(obj) === Object.prototype
  );
};
*/





