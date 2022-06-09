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

exports.objWithout = (obj, without) => {
  let withoutArr = without;
  if (typeof obj === "object") {
    const newObj = { ...obj };
    if (withoutArr && typeof withoutArr === "string") {
      withoutArr = [without];
    }
    if (typeof newObj === "object" && withoutArr instanceof Array) {
      withoutArr.forEach((x) => {
        if (Object.prototype.hasOwnProperty.call(newObj, x)) {
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
