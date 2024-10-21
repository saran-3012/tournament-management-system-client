export default function HashSet(...values) {
  const _obj = {};

  values.forEach((value) => {
    _obj[value] = value;
  });

  this.contains = function (val) {
    return _obj.hasOwnProperty(val);
  };

  this.add = function (val) {
    _obj[val] = val;
  }

  this.remove = function (val) {
    delete _obj[val];
  }

  this.toArray = function () {
    return Object.keys(_obj);
  };

  this.toString = function () {
    return Object.keys(_obj).join(', ');
  }
}
