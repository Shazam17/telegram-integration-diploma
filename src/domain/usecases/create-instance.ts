import { InstancesRepository } from '../../repositories/InstancesRepository';
import { Queue } from 'bull';

export class CreateInstanceInput {
  userId: string;
}

export class CreateInstanceUsecase {
  constructor(
    private instances: InstancesRepository,
    private eventsQueue: Queue,
  ) {}

  async execute(input: CreateInstanceInput) {
    return this.instances.createInstance(input.userId, this.eventsQueue);
  }
}
