# Dynamo Calculator

## Description

Dynamo Calculator is a powerful and efficient tool designed to perform complex mathematical calculations with ease. It supports a wide range of functions including basic arithmetic, algebra, calculus, and more. Whether you are a student, educator, or professional, Dynamo Calculator provides a user-friendly interface and robust features to meet your computational needs.

## Installation

To install Dynamo Calculator, run the following command in your terminal:

```bash
npm install dynamo-calculator
```

## Usage

Validate if an element is allowed to be inserted in DynamoDb, considering that it has a maximum of 4KB.

```typescript
import { isItem4KBAllowed } from "dynamo-calculator";
const item = {
  name: "foobar",
};
console.log(isItem4KBAllowed(item)) //true
if (isItem4KBAllowed(item)) {
  // Your super logic here!!
}
```

In contrast, this is an item that exceeds the size of a 4KB item supported by DynamoDb.

```typescript
import { isItem4KBAllowed } from "dynamo-calculator";
const item = {
  name: "foobar".repeat(6291556),
};
console.log(isItem4KBAllowed(item)) //false
```

Get additional DynamoDb query cost information for this item

```typescript
import { calculateCapacityDynamo } from "dynamo-calculator";
const item = {
  id: "f0ba8d6c",
  fullName: "Kevin Luera",
  isAdmin: true,
  favouriteNumber: -1e-131,
  foods: ["encebollado", "tonga"],
};
const data = calculateCapacityDynamo(item);
console.log(data);
/*
{
  rcus: 1, 
  rcusEventualConsistency: 0.5,
  rcusPartOfATransaction: 2,
  wcus: 1,
  wcusPartOfATransaction: 2,
}
*/
```

Get info about size for this item

```typescript
import { calculateItemSize } from "dynamo-calculator";
const item = {
  id: "f0ba8d6c",
  fullName: "Kevin Luera",
  isAdmin: true,
  favouriteNumber: -1e-131,
  foods: ["encebollado", "tonga"],
};
const data = calculateItemSize(item);
console.log(data);
/*
{
  size: 81, //In bytes
  sizes: {
    id: { sizeOfName: 2, attributeSize: 8, total: 10 },
    fullName: { sizeOfName: 8, attributeSize: 11, total: 19 },
    isAdmin: { sizeOfName: 7, attributeSize: 1, total: 8 },
    favouriteNumber: { sizeOfName: 15, attributeSize: 3, total: 18 },
    foods: { sizeOfName: 5, attributeSize: 21, total: 26 }
  },
  largestAttribute: 'foods'
}
*/
```

## Tests

To run the tests, use the following command:

```bash
npm test
```

## Contributing

Guidelines for contributing to the project.

1. Fork the repository.
2. Create a new branch (`git checkout -b feature-branch`).
3. Make your changes.
4. Commit your changes (`git commit -m 'Add some feature'`).
5. Push to the branch (`git push origin feature-branch`).
6. Open a pull request.

## License

Information about the project's license.

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Contact

Information on how to contact the project maintainers.

- Name: Kevin
- Email: kevin@example.com
- GitHub: [kevinlupera](https://github.com/kevinlupera)

## Credits

I would like to thank [Zac Charles](https://zaccharles.medium.com/) for their work on [post](https://zaccharles.medium.com/calculating-a-dynamodb-items-size-and-consumed-capacity-d1728942eb7c), which served as an invaluable source of inspiration and foundation for developing this library. Their contribution has been essential to this project. Thank you for sharing your knowledge!
