declare function determineLargestAttribute(attributeSizes: any): string;
declare function calculateItemSizeInBytes(item: any): {
    size: number;
    sizes: {
        [key: string]: {
            sizeOfName: number;
            attributeSize: number;
            total: number;
        };
    };
};
declare function calculateItemSize(item: any): {
    size: number;
    sizes: any;
    largestAttribute: string;
};
declare function isItem4KBAllowed(item: any): boolean;
declare function calculateCapacityDynamo(item: any): {
    rcus: number;
    rcusEventualConsistency: number;
    rcusPartOfATransaction: number;
    wcus: number;
    wcusPartOfATransaction: number;
};

export { calculateCapacityDynamo, calculateItemSize, calculateItemSizeInBytes, determineLargestAttribute, isItem4KBAllowed };
