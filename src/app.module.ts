import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { EventsController } from './services/events.controller';
import { InstancesController } from './services/instances.controller';
import {
  InstanceModel,
  InstancesRepository,
} from './repositories/InstancesRepository';
import {ChatModel, MessageModel, MessagesRepository, UserModel} from './repositories/MessagesRepository';
import { BullModule } from '@nestjs/bull';
import { QueueConsumer } from './infrastructure/queue/consumer';
import { EVENT_QUEUE_NAME } from './shared/constants';
import { ConfigModule } from '@nestjs/config';
@Module({
  imports: [
    SequelizeModule.forRoot({
      dialect: 'postgres',
      host: 'localhost',
      port: 5432,
      username: 'admin',
      password: 'password',
      database: 'telegram_db',
      models: [InstanceModel, ChatModel, MessageModel, UserModel],
    }),
    BullModule.forRoot({
      redis: {
        host: 'localhost',
        port: 6379,
      },
    }),
    BullModule.registerQueue({
      name: EVENT_QUEUE_NAME,
    }),
    ConfigModule.forRoot(),
  ],
  controllers: [EventsController, InstancesController],
  providers: [MessagesRepository, InstancesRepository, QueueConsumer],
})
export class AppModule {}
