import { Column, Model, PrimaryKey, Table } from 'sequelize-typescript';
import { Injectable } from '@nestjs/common';
import { v5 as uuidv5 } from 'uuid';

const NAMESPACE = '94061970-aac9-4394-a209-2cfdd83902a8';

@Table({ tableName: 'Messages' })
export class MessageModel extends Model {
  @PrimaryKey
  @Column
  id: string;
  @Column
  text: string;
  @Column
  fromUser: string;
  @Column
  toUser: string;
  @Column
  attachmentUrl: string;
}

@Table({ tableName: 'Chats' })
export class ChatModel extends Model {
  @PrimaryKey
  @Column
  id: string;
  @Column
  chatId: string;
  @Column
  instanceId: string;
}

@Table({ tableName: 'Users' })
export class UserModel extends Model {
  @PrimaryKey
  @Column
  id: string;
  @Column
  telegramId: string;
}

@Injectable()
export class MessagesRepository {
  async getChatByChatId(id: string): Promise<ChatModel> {
    return ChatModel.findOne({ where: { chatId: id } });
  }

  async getChatById(id: string): Promise<ChatModel> {
    return ChatModel.findOne({ where: { id } });
  }

  async createChat(chatId: string, instanceId: string) {
    const id = uuidv5(`${chatId}-${instanceId}`, NAMESPACE);
    const found = await ChatModel.findOne({ where: { id } });
    if (found) {
      return found;
    }
    return ChatModel.create({ id, chatId, instanceId }).catch(console.log);
  }

  async createUser(id: string, telegramId: string) {
    const found = await UserModel.findOne({ where: { telegramId } });
    if (found) {
      return found;
    }
    return UserModel.create({ id, telegramId });
  }

  async createMessage(
    id: string,
    chatId: string,
    fromUser: string,
    toUser: string,
    text: string,
    attachmentUrl: string,
  ) {
    return MessageModel.create({
      id,
      chatId,
      fromUser,
      toUser,
      text,
      attachmentUrl,
    });
  }
}
