const mongoose = require('mongoose');

// Setup test database
beforeAll(async () => {
  // Connect to test database
  const mongoUri = process.env.MONGODB_TEST_URI || 'mongodb://localhost:27017/news-aggregator-test';
  await mongoose.connect(mongoUri, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });
});

// Clean up after each test
afterEach(async () => {
  // Clean up all collections
  const collections = mongoose.connection.collections;
  for (const key in collections) {
    const collection = collections[key];
    await collection.deleteMany({});
  }
});

// Close database connection after all tests
afterAll(async () => {
  await mongoose.connection.close();
});
