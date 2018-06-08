import { Component } from '@nestjs/common';
import * as mongoose from 'mongoose';


@Component()
export class DatabaseService {

  constructor() {

  }

  connect() {

    return mongoose.connect(`mongodb://localhost:27017/${process.env.MONGO_DB_NAME}`)
      .then(() => {
        console.log('Connected');
      })
      .catch((err) => {
        console.log('err: ', err);
      });

  }

}