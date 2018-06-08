import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { DatabaseModule } from './modules/common/database/database.module';
import { UserModule } from './modules/user/user.module';

@Module({
  modules: [
    DatabaseModule,
    UserModule
  ],
  controllers: [AppController],
  components: [],
})
export class ApplicationModule {

}
