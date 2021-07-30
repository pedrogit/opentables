function objKeysInObjKeys(obj1, obj2){
  //var c = 0;
  //var ret = {isTrue: true, outKey: null};
  for (var key of Object.keys(obj1)) {
    //console.log(c++);
    if (!(key.startsWith('$')) && !(obj2.hasOwnProperty(key))){
      return {isTrue: false, outKey: key};;
    }
    //console.log(c++);
  }
  //console.log(c++);
  return {isTrue: true, outKey: null};
};

module.exports.objKeysInObjKeys = objKeysInObjKeys;