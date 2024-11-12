// src/index.ts
import { encode } from "utf8";
import { marshall } from "@aws-sdk/util-dynamodb";
import Decimal from "decimal.js-light";
var BASE_LOGICAL_SIZE_OF_NESTED_TYPES = 1;
var LOGICAL_SIZE_OF_EMPTY_DOCUMENT = 3;
var LIMIT_SIZE_DYNAMO_BYTES = 4096;
function determineLargestAttribute(attributeSizes) {
  let largestAttribute = "";
  let maxSize = 0;
  for (let currentAttribute in attributeSizes) {
    if (!attributeSizes.hasOwnProperty(currentAttribute)) continue;
    let { total: currentSize } = attributeSizes[currentAttribute];
    if (currentSize > maxSize) {
      maxSize = currentSize;
      largestAttribute = currentAttribute;
    }
  }
  return largestAttribute;
}
function calculateItemSizeInBytes(item) {
  let sizes = {};
  let totalSize = 0;
  for (let name in item) {
    if (!item.hasOwnProperty(name)) continue;
    let size = {
      sizeOfName: encode(name).length,
      attributeSize: calculateAttributeSizeInBytes(item[name]),
      total: 0
    };
    size.total = size.sizeOfName + size.attributeSize;
    totalSize += size.total;
    sizes[name] = size;
  }
  return { size: totalSize, sizes };
}
function calculateAttributeSizeInBytes(attr) {
  if (!attr) return 0;
  if (attr.hasOwnProperty("B")) {
    return atob(attr.B).length;
  }
  if (attr.hasOwnProperty("S")) {
    return encode(attr.S).length;
  }
  if (attr.hasOwnProperty("N")) {
    return calculateNumberSizeInBytes(attr.N);
  }
  if (attr.hasOwnProperty("BS")) {
    let size = 0;
    for (let i = 0; i < attr.BS.length; i++) {
      size += atob(attr.BS[i]).length;
    }
    return size;
  }
  if (attr.hasOwnProperty("SS")) {
    let size = 0;
    for (let i = 0; i < attr.SS.length; i++) {
      size += encode(attr.SS[i]).length;
    }
    return size;
  }
  if (attr.hasOwnProperty("NS")) {
    let size = 0;
    for (let i = 0; i < attr.NS.length; i++) {
      size += calculateNumberSizeInBytes(attr.NS[i]);
    }
    return size;
  }
  if (attr.hasOwnProperty("BOOL")) {
    return 1;
  }
  if (attr.hasOwnProperty("NULL")) {
    return 1;
  }
  if (attr.hasOwnProperty("M")) {
    let size = LOGICAL_SIZE_OF_EMPTY_DOCUMENT;
    for (let name in attr.M) {
      if (!attr.M.hasOwnProperty(name)) continue;
      size += encode(name).length;
      size += calculateAttributeSizeInBytes(attr.M[name]);
      size += BASE_LOGICAL_SIZE_OF_NESTED_TYPES;
    }
    return size;
  }
  if (attr.hasOwnProperty("L")) {
    let size = LOGICAL_SIZE_OF_EMPTY_DOCUMENT;
    for (let i = 0; i < attr.L.length; i++) {
      size += calculateAttributeSizeInBytes(attr.L[i]);
      size += BASE_LOGICAL_SIZE_OF_NESTED_TYPES;
    }
    return size;
  }
  throw "unknown data type in " + JSON.stringify(attr);
}
function calculateNumberSizeInBytes(n) {
  let decimal = new Decimal(n);
  if (decimal.isZero()) return 1;
  let fixed = decimal.toFixed();
  let size = measure(fixed.replace("-", "")) + 1;
  if (fixed.startsWith("-")) size++;
  if (size > 21) size = 21;
  return size;
}
function measure(n) {
  if (n.indexOf(".") !== -1) {
    let parts = n.split(".");
    let p0 = parts[0];
    let p1 = parts[1];
    if (p0 === "0") {
      p0 = "";
      p1 = zeros(p1, true);
    }
    if (p0.length % 2 !== 0) p0 = "Z" + p0;
    if (p1.length % 2 !== 0) p1 = p1 + "Z";
    return measure(p0 + p1);
  }
  n = zeros(n, true, true);
  return Math.ceil(n.length / 2);
}
function zeros(n, left, right = false) {
  while (left && true) {
    let t = n.replace(/^(0{2})/, "");
    if (t.length == n.length) break;
    n = t;
  }
  while (right && true) {
    let t = n.replace(/(0{2})$/, "");
    if (t.length == n.length) break;
    n = t;
  }
  return n;
}
function calculateItemSize(item) {
  const { size, sizes } = calculateItemSizeInBytes(marshall(item));
  const largestAttribute = determineLargestAttribute(sizes);
  return { size, sizes, largestAttribute };
}
function isItem4KBAllowed(item) {
  const { size } = calculateItemSize(item);
  return size <= LIMIT_SIZE_DYNAMO_BYTES;
}
function calculateCapacityDynamo(item) {
  const { size } = calculateItemSizeInBytes(marshall(item));
  const rcus = Math.ceil(size / 4096);
  const rcusEventualConsistency = rcus / 2;
  const rcusPartOfATransaction = rcus * 2;
  const wcus = Math.ceil(size / 1024);
  const wcusPartOfATransaction = wcus * 2;
  return {
    rcus,
    rcusEventualConsistency,
    rcusPartOfATransaction,
    wcus,
    wcusPartOfATransaction
  };
}
export {
  calculateCapacityDynamo,
  calculateItemSize,
  calculateItemSizeInBytes,
  determineLargestAttribute,
  isItem4KBAllowed
};
//# sourceMappingURL=index.mjs.map