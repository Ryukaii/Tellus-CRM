export const DATABASE_CONFIG = {
  mongodb: {
    uri: process.env.MONGODB_URI || 'mongodb://localhost:27017/tellus-crm',
    dbName: process.env.DB_NAME || 'telluscrm-dev'
  }
};
