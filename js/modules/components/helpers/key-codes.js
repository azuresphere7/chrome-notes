var code = {
  _0: 48,
  _1: 49,
  _2: 50,
  _3: 51,
  _4: 52,
  _5: 53,
  _6: 54,
  _7: 55,
  _8: 56,
  _9: 57,
  a: 65,
  b: 66,
  c: 67,
  d: 68,
  e: 69,
  f: 70,
  g: 71,
  h: 72,
  i: 73,
  j: 74,
  k: 75,
  l: 76,
  m: 77,
  n: 78,
  o: 79,
  p: 80,
  q: 81,
  r: 82,
  s: 83,
  t: 84,
  u: 85,
  v: 86,
  w: 87,
  x: 88,
  y: 89,
  z: 90,
  tab: 9,
  enter: 13,
  del: 46,
  right: 37,
  up: 38,
  left: 39,
  down: 40,
  pageUp: 33,
  pageDowm: 34,
  end: 35,
  home: 36,
  shiftKey: 16,
  ctrlKey: 17,
  altKey: 18,
  metaKey: 91,
  ctrl: 1000,
  shift: 1000,
  sysKeys: null,
  back: 8,
  uid: function (ctrlKey, shiftKey, keyCode) {
    return ((ctrlKey << shiftKey) * 1000) + keyCode;
  }
};

code.sysKeys = [
  code.a, code.c, 
  code.v, 
  code.x, code.right, code.left, code.up, code.down, 
  code.shiftKey, code.ctrlKey, code.altKey, code.metaKey,
  code.r
];

code.comKeys = [code.shiftKey, code.ctrlKey]
code.allowed = [
  code.shiftKey, code.ctrlKey, code.right, code.left, code.up, code.down, code.home, code.end, 
  code.pageUp, code.pageDowm
];

