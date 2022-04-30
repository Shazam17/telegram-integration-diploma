import { InstancesRepository } from '../../repositories/InstancesRepository';

export class SendMessageInput {
  chatId: string;
  message: string;
}

export class SendMessageUsecase {
  constructor(private instances: InstancesRepository) {}

  async execute(input: SendMessageInput) {}
}
