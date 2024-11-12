import {
  calculateItemSize,
  isItem4KBAllowed,
  calculateCapacityDynamo,
  determineLargestAttribute,
} from "../src/index";

describe("calculateItemSize", () => {
  it("should calculate the size of an item correctly", () => {
    const item = { id: "123", name: "Test Item", value: 100 };
    const result = calculateItemSize(item);
    expect(result.size).toBeGreaterThan(0);
    expect(result.sizes).toHaveProperty("id");
    expect(result.sizes).toHaveProperty("name");
    expect(result.sizes).toHaveProperty("value");
  });

  it("should determine the largest attribute correctly", () => {
    const item = { id: "123", name: "Test Item", value: 100 };
    const result = calculateItemSize(item);
    expect(result.largestAttribute).toBe("name");
  });
});

describe("isItem4KBAllowed", () => {
  it("should return true if item size is within limit", () => {
    const item = { id: "123", name: "Test Item", value: 100 };
    const result = isItem4KBAllowed(item);
    expect(result).toBe(true);
  });

  it("should return false if item size exceeds limit", () => {
    const item = { id: "123", name: "Test Item", value: "a".repeat(5000) };
    const result = isItem4KBAllowed(item);
    expect(result).toBe(false);
  });
});

describe("calculateCapacityDynamo", () => {
  it("should calculate the capacity units correctly", () => {
    const item = {
      id: "f0ba8d6c",
      fullName: "Kevin Lupera",
      isAdmin: true,
      favouriteNumber: -1e-131,
      foods: ["encebollado", "tonga"],
    };
    const result = calculateCapacityDynamo(item);
    expect(result.rcus).toBeGreaterThanOrEqual(1);
    expect(result.rcusEventualConsistency).toBeGreaterThanOrEqual(0.5);
    expect(result.rcusPartOfATransaction).toBeGreaterThanOrEqual(2);
    expect(result.wcus).toBeGreaterThanOrEqual(1);
    expect(result.wcusPartOfATransaction).toBeGreaterThanOrEqual(2);
  });
});

describe("determineLargestAttribute", () => {
  it("should return the largest attribute", () => {
    const attributeSizes = {
      id: { sizeOfName: 2, attributeSize: 3, total: 5 },
      name: { sizeOfName: 4, attributeSize: 10, total: 14 },
      value: { sizeOfName: 5, attributeSize: 2, total: 7 },
    };
    const result = determineLargestAttribute(attributeSizes);
    expect(result).toBe("name");
  });
});
