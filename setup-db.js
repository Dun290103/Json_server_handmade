const fs = require('fs');
const { faker } = require('@faker-js/faker');

// Đọc dữ liệu từ db.json
const dbFilePath = 'db.json';
const dbData = JSON.parse(fs.readFileSync(dbFilePath, 'utf8'));

// Hàm để thêm hoặc ghi đè trường id
const updateIds = (data) => {
  if (Array.isArray(data)) {
    return data.map((item) => {
      item.id = faker.string.uuid(); // Ghi đè id hiện tại
      return item;
    });
  }
  return data;
};

// Cập nhật dữ liệu trong db.json
dbData.products = updateIds(dbData.products);

fs.writeFileSync(dbFilePath, JSON.stringify(dbData, null, 2), 'utf8');
