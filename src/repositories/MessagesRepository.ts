import { Column, Model, Table } from 'sequelize-typescript';
import { Injectable } from '@nestjs/common';

@Table({ tableName: 'Messages' })
export class Message extends Model {
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

@Injectable()
export class MessageRepository {}
