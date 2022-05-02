import { Process, Processor } from '@nestjs/bull';
import { Job } from 'bull';
import { EVENT_QUEUE_NAME } from '../../shared/constants';
import { MessagesRepository } from '../../repositories/MessagesRepository';
import { InstancesRepository } from '../../repositories/InstancesRepository';
import {
  ParseIncomingMessageInput,
  ParseIncomingMessageUsecase,
} from '../../domain/usecases/parse-incoming-message';

@Processor(EVENT_QUEUE_NAME)
export class QueueConsumer {
  constructor(
    private messages: MessagesRepository,
    private instances: InstancesRepository,
  ) {}

  @Process()
  async processMessages(job: Job<unknown>) {
    console.log('incoming message');
    console.log(job.data);

    const usecase = new ParseIncomingMessageUsecase(
      this.instances,
      this.messages,
    );
    await usecase.execute(job.data as ParseIncomingMessageInput);
  }

}
