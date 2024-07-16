const { faker } = require('@faker-js/faker');
const axios = require('axios'); // Import axios
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

const cache = new Map();

// Call api get image
const getUnsplashImages = async (query, numberOfImages) => {
  const imagesPerPage = 30;
  let totalImages = [];

  // Kiểm tra bộ nhớ đệm
  if (cache.has(query)) {
    totalImages = cache.get(query);
    if (totalImages.length >= numberOfImages) {
      return totalImages.slice(0, numberOfImages);
    }
  }

  try {
    const promises = [];
    let pagesNeeded = Math.ceil(numberOfImages / imagesPerPage);

    for (let page = 1; page <= pagesNeeded; page++) {
      promises.push(
        axios.get('https://api.unsplash.com/search/photos', {
          params: {
            query: query,
            page: page,
            per_page: Math.min(imagesPerPage, numberOfImages - totalImages.length),
            client_id: accessKey,
          },
        }),
      );
    }

    const responses = await Promise.all(promises);
    responses.forEach((response) => {
      const data = response.data;
      totalImages.push(...data.results.map((result) => result.urls.raw));
    });

    // Lưu kết quả vào bộ nhớ đệm
    cache.set(query, totalImages);

    return totalImages.slice(0, numberOfImages);
  } catch (error) {
    console.error(`Lỗi khi lấy ảnh: ${error.response ? error.response.statusText : error.message}`);
    return [];
  }
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

  if (imageUrls.length < totalImagesNeeded) {
    throw new Error('Không đủ số lượng ảnh để tạo sản phẩm');
  }

  // Tạo danh sách sản phẩm ngẫu nhiên
  categoryList.forEach((category, categoryIndex) => {
    for (let i = 0; i < numberOfProducts; i++) {
      const image_url = imageUrls[categoryIndex * numberOfProducts + i];

      const product = {
        id: faker.string.uuid(),
        categoryId: category.id,
        name: faker.commerce.productName(),
        description: faker.commerce.productDescription(),
        price: Math.floor(faker.commerce.price({ min: 1000, max: 3000000 }) / 1000) * 1000,
        image_url: image_url,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };

      productList.push(product);
    }
  });

  return productList;
};

(async () => {
  // Random data
  const categoryList = randomCategoryList(customCategories);
  const productList = await randomProductList(categoryList, 7);

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
