import * as mongoose from 'mongoose';
import * as bluebird from 'bluebird';
(mongoose as any).Promise = bluebird;

export const databaseProvider = {
  provide: 'AsyncDbConnection',
  useFactory: async () => {
    return mongoose.connect(`mongodb://localhost:27017/${process.env.MONGO_DB_NAME}`);
  },
};