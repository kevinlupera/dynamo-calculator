import { encode } from "utf8";
import { marshall } from "@aws-sdk/util-dynamodb";
import Decimal, { Numeric } from "decimal.js-light";

const BASE_LOGICAL_SIZE_OF_NESTED_TYPES = 1;
const LOGICAL_SIZE_OF_EMPTY_DOCUMENT = 3;
const LIMIT_SIZE_DYNAMO_BYTES = 4096;

export function determineLargestAttribute(attributeSizes: any): string {
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

export function calculateItemSizeInBytes(item: any) {
  let sizes: {
    [key: string]: { sizeOfName: number; attributeSize: number; total: number };
  } = {};
  let totalSize = 0;

  for (let name in item) {
    if (!item.hasOwnProperty(name)) continue;

    let size = {
      sizeOfName: encode(name).length,
      attributeSize: calculateAttributeSizeInBytes(item[name]),
      total: 0,
    };
    size.total = size.sizeOfName + size.attributeSize;

    totalSize += size.total;
    sizes[name] = size;
  }

  return { size: totalSize, sizes };
}

function calculateAttributeSizeInBytes(attr: {
  hasOwnProperty: (arg0: string) => any;
  B: string;
  S: string;
  N: any;
  BS: string | any[];
  SS: string | any[];
  NS: string | any[];
  M: { [x: string]: any; hasOwnProperty: (arg0: string) => any };
  L: string | any[];
}) {
  if (!attr) return 0;

  // Binary
  if (attr.hasOwnProperty("B")) {
    return atob(attr.B).length;
  }

  // String
  if (attr.hasOwnProperty("S")) {
    return encode(attr.S).length;
  }

  // Number
  if (attr.hasOwnProperty("N")) {
    return calculateNumberSizeInBytes(attr.N);
  }

  // BinarySet
  if (attr.hasOwnProperty("BS")) {
    let size = 0;

    for (let i = 0; i < attr.BS.length; i++) {
      size += atob(attr.BS[i]).length;
    }

    return size;
  }

  // StringSet
  if (attr.hasOwnProperty("SS")) {
    let size = 0;

    for (let i = 0; i < attr.SS.length; i++) {
      size += encode(attr.SS[i]).length;
    }

    return size;
  }

  //  NumberSet
  if (attr.hasOwnProperty("NS")) {
    let size = 0;

    for (let i = 0; i < attr.NS.length; i++) {
      size += calculateNumberSizeInBytes(attr.NS[i]);
    }

    return size;
  }

  // Boolean
  if (attr.hasOwnProperty("BOOL")) {
    return 1;
  }

  // Null
  if (attr.hasOwnProperty("NULL")) {
    return 1;
  }

  // Map
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

  // List
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

function calculateNumberSizeInBytes(n: Numeric | string) {
  let decimal = new Decimal(n);
  if (decimal.isZero()) return 1;
  let fixed = decimal.toFixed();
  let size = measure(fixed.replace("-", "")) + 1;
  if (fixed.startsWith("-")) size++;
  if (size > 21) size = 21;
  return size;
}

function measure(n: string) {
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

function zeros(n: any, left: any, right = false) {
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

export function calculateItemSize(item: any): {
  size: number;
  sizes: any;
  largestAttribute: string;
} {
  const { size, sizes } = calculateItemSizeInBytes(marshall(item));
  const largestAttribute = determineLargestAttribute(sizes);
  return { size, sizes, largestAttribute };
}

export function isItem4KBAllowed(item: any) {
  const { size } = calculateItemSize(item);
  return size <= LIMIT_SIZE_DYNAMO_BYTES;
}

export function calculateCapacityDynamo(item: any): {
  rcus: number;
  rcusEventualConsistency: number;
  rcusPartOfATransaction: number;
  wcus: number;
  wcusPartOfATransaction: number;
} {
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
    wcusPartOfATransaction,
  };
}
