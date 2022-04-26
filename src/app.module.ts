import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { MessageRepository } from './repositories/MessagesRepository';
import { EventsController } from './services/events.controller';
import { InstancesController } from './services/instances.controller';

@Module({
  imports: [
    SequelizeModule.forRoot({
      dialect: 'postgres',
      host: 'localhost',
      port: 5432,
      username: 'admin',
      password: 'password',
      database: 'telegram_db',
      models: [],
    }),
  ],
  controllers: [EventsController, InstancesController],
  providers: [MessageRepository],
})
export class AppModule {}
