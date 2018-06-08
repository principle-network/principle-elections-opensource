import { NestFactory } from '@nestjs/core';
import { ApplicationModule } from './app.module';
import { ValidatorPipe } from './pipes/validator.pipe';
import * as cors from 'cors';
import { RequestExceptionFilter } from './filters/requestException.filter';
import { DefaultExceptionFilter } from './filters/defaultException.filter';
import * as express from 'express';
import * as bodyParser from 'body-parser';

const corsOptions = {
  origin: 'http://localhost:4200',
  credentials: true,
  optionsSuccessStatus: 200 // some legacy browsers (IE11, various SmartTVs) choke on 204
};

async function bootstrap() {

  const app = await NestFactory.create(ApplicationModule);
  app.use('/assets', express.static('public/assets'));
  app.use(cors(corsOptions));
  app.set('view engine', 'ejs');
  app.use(bodyParser.json());
  app.use(bodyParser.urlencoded());
  app.useGlobalFilters(new RequestExceptionFilter(), new DefaultExceptionFilter());
  app.useGlobalPipes(new ValidatorPipe());
  await app.listen(process.env.API_PORT, '0.0.0.0');

}

bootstrap();