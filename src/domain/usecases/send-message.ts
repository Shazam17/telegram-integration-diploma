import { InstancesRepository } from '../../repositories/InstancesRepository';
import { MessagesRepository } from '../../repositories/MessagesRepository';

export class SendMessageInput {
  instanceId: string;
  chatId: string;
  message: string;
}

export class SendMessageUsecase {
  constructor(
    private instances: InstancesRepository,
    private messages: MessagesRepository,
  ) {}

  async execute(input: SendMessageInput) {
    const user = await this.messages.getChatById(input.chatId);
    if (!user) {
      console.log('User not found');
      return;
    }

    const instance = await this.instances.getRawInstance(input.instanceId);
    if (!instance) {
      console.log('Instance not found');
      return;
    }

    await instance.sendMessage(user.chatId, input.message);
  }
}
