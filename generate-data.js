const { faker } = require("@faker-js/faker");
// Set locale to us Vietnamese
const { fakerVI } = require("@faker-js/faker");

const fs = require("fs");

// const randomCategoryList = (n) => {
//   if (n <= 0) return [];

//   const categoryList = [];

//   // Loop and push category
//   Array.from(new Array(n)).forEach(() => {
//     const category = {
//       id: faker.string.uuid(),
//       name: faker.commerce.department(),
//       createAt: Date.now(),
//       updateAt: Date.now(),
//     };

//     categoryList.push(category);
//   });

//   return categoryList;
// };

// Danh sách các danh mục tùy chỉnh chỉ bao gồm các mặt hàng handmade
const customCategories = [
  "Tranh thêu tay",
  "Bông tai handmade",
  "Gấu bông handmade",
  "Móc khóa handmade",
  "Quà lưu niệm tự làm",
  "Vòng tay handmade",
  "Balo handmade",
  "Phụ kiện handmade",
];

const randomCategoryList = (categories) => {
  if (!categories || categories.length === 0) return [];

  const categoryList = [];

  // Loop and push category
  categories.forEach((categoryName) => {
    const category = {
      id: faker.string.uuid(),
      name: categoryName,
      createAt: Date.now(),
      updateAt: Date.now(),
    };

    categoryList.push(category);
  });

  return categoryList;
};

const randomProductList = (categoryList, numberOfProducts) => {
  if (numberOfProducts <= 0) return [];

  const productList = [];

  // Random data
  for (const category of categoryList) {
    Array.from(new Array(numberOfProducts)).forEach(() => {
      const product = {
        id: faker.string.uuid(),
        categoryId: category.id,
        name: faker.commerce.productName(),
        description: faker.commerce.productDescription(),
        price: +faker.commerce.price({
          min: 1000,
          max: 1000000,
        }),
        image_url: "",
        createAt: Date.now(),
        updateAt: Date.now(),
      };

      productList.push(product);
    });
  }

  return productList;
};

(() => {
  // Random data
  const categoryList = randomCategoryList(customCategories);
  const productList = randomProductList(categoryList, 5);

  // Prepare db object
  const db = {
    categories: categoryList,
    products: productList,
    profile: {
      name: "po",
    },
  };

  // Write db object to db.json
  fs.writeFile("db.json", JSON.stringify(db), (err) => {
    if (err) {
      console.error("Error writing file", err);
    } else {
      console.log("Data successfully written to db.json");
    }
  });
})();
