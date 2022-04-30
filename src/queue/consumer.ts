import { Process, Processor } from '@nestjs/bull';
import { Job } from 'bull';
import { EVENT_QUEUE_NAME } from '../shared/constants';
import { MessagesRepository } from '../repositories/MessagesRepository';
import { InstancesRepository } from '../repositories/InstancesRepository';

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
  }
}
