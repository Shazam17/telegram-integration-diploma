import { Column, Model, Table } from 'sequelize-typescript';
import { Injectable } from '@nestjs/common';

@Table({ tableName: 'Messages' })
export class MessageModel extends Model {
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
  @Column
  id: string;
  @Column
  chatId: string;
}

@Injectable()
export class MessagesRepository {
  async getChatById(id: string) {
    return ChatModel.findOne({ where: { id } });
  }

  async createChat(id: string, chatId: string) {
    return ChatModel.create({ id, chatId });
  }
}
