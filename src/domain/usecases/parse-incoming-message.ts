import { InstancesRepository } from '../../repositories/InstancesRepository';
import { MessagesRepository } from '../../repositories/MessagesRepository';
import { v4 as uuidv4 } from 'uuid';
import { httpTransport } from '../../infrastructure/event-transports/http-transport';
import { CHANEL_NAME } from '../../shared/constants';

export class ParseIncomingMessageInput {
  userId: string;
  chatId: string;
  senderId: string;
  out: boolean;
  message: string;
  date: number;
  instanceId: string;
  external_user_id: string;
}

export class ParseIncomingMessageUsecase {
  constructor(
    private instances: InstancesRepository,
    private messages: MessagesRepository,
  ) {}

  async execute(input: ParseIncomingMessageInput) {
    try {
      await this.messages.createChat(uuidv4(), input.chatId, input.instanceId);
      const chat = await this.messages.getChatByChatId(input.chatId);
      const fromUser = input.out ? input.userId : input.chatId;
      const toUser = input.out ? input.chatId : input.userId;

      const toUserModel = await this.messages.createUser(uuidv4(), toUser);
      const fromUserModel = await this.messages.createUser(uuidv4(), fromUser);

      const message = await this.messages.createMessage(
        uuidv4(),
        chat.id,
        fromUserModel.id,
        toUserModel.id,
        input.message,
        '',
      );

      await httpTransport
        .post('/notify', {
          message,
          chat,
          external_user_id: input.external_user_id,
          type: CHANEL_NAME,
          instanceId: input.instanceId,
        })
        .catch((axiosError) => console.log(axiosError.response));
    } catch (e) {
      console.log(e);
    }
  }
}
