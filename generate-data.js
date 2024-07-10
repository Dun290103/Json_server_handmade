const { faker } = require('@faker-js/faker');
const fs = require('fs');
const accessKey = 'sORSikgPQZ-HBIDxq3r37meKgn5NGHNQmHxAMn8TOG4';

// Danh sách các danh mục tùy chỉnh chỉ bao gồm các mặt hàng handmade
const customCategories = [
  'Tranh thêu tay',
  'Bông tai handmade',
  'Gấu bông handmade',
  'Móc khóa handmade',
  'Quà lưu niệm tự làm',
  'Vòng tay handmade',
  'Balo handmade',
  'Phụ kiện handmade',
];

const getUnsplashImages = async (query, numberOfImages) => {
  const imagesPerPage = 30;
  let totalImages = [];
  let page = 1;

  while (totalImages.length < numberOfImages) {
    const response = await fetch(
      `https://api.unsplash.com/search/photos?query=${query}&page=${page}&per_page=${Math.min(
        imagesPerPage,
        numberOfImages - totalImages.length,
      )}&client_id=${accessKey}`,
    );
    const data = await response.json();
    totalImages = totalImages.concat(data.results.map((result) => result.urls.raw));

    // Check if we've fetched all available images or there are no more results
    if (data.results.length === 0) {
      break;
    }

    page++;
  }

  return totalImages.slice(0, numberOfImages);
};

const randomCategoryList = (categories) => {
  if (!categories || categories.length === 0) return [];

  const categoryList = [];

  // Loop and push category
  categories.forEach((categoryName) => {
    const category = {
      id: faker.string.uuid(),
      name: categoryName,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };

    categoryList.push(category);
  });

  return categoryList;
};

const randomProductList = async (categoryList, numberOfProducts) => {
  if (numberOfProducts <= 0) return [];

  const productList = [];
  const totalImagesNeeded = categoryList.length * numberOfProducts;
  const imageUrls = await getUnsplashImages('handmade', totalImagesNeeded);

  // Random data
  let imageIndex = 0;
  for (const category of categoryList) {
    for (let i = 0; i < numberOfProducts; i++) {
      const image_url = imageUrls[imageIndex]; // Lấy ảnh theo thứ tự
      imageIndex++;

      const product = {
        id: faker.string.uuid(),
        categoryId: category.id,
        name: faker.commerce.productName(),
        description: faker.commerce.productDescription(),
        price: +faker.commerce.price({
          min: 1000,
          max: 1000000,
        }),
        image_url: image_url,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };

      productList.push(product);
    }
  }

  return productList;
};

(async () => {
  // Random data
  const categoryList = randomCategoryList(customCategories);
  const productList = await randomProductList(categoryList, 5);

  // Prepare db object
  const db = {
    categories: categoryList,
    products: productList,
    profile: {
      name: 'po',
    },
  };

  // Write db object to db.json
  fs.writeFile('db.json', JSON.stringify(db), (err) => {
    if (err) {
      console.error('Error writing file', err);
    } else {
      console.log('Data successfully written to db.json');
    }
  });
})();
