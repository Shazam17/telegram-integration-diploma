import { Body, Controller, Post } from '@nestjs/common';
import {
  CreateInstanceInput,
  CreateInstanceUsecase,
} from '../domain/usecases/create-instance';
import { InstancesRepository } from '../repositories/InstancesRepository';
import { PushAuthInput, PushAuthUsecase } from '../domain/usecases/push-auth';
import {
  GetInstanceStateUsecase,
  GetStateInput,
} from '../domain/usecases/get-instance-state';
import {
  SendMessageInput,
  SendMessageUsecase,
} from '../domain/usecases/send-message';
import { InjectQueue } from '@nestjs/bull';
import { Queue } from 'bull';
import { EVENT_QUEUE_NAME } from '../shared/constants';
import { MessagesRepository } from '../repositories/MessagesRepository';

@Controller()
export class InstancesController {
  constructor(
    private instances: InstancesRepository,
    private messages: MessagesRepository,
    @InjectQueue(EVENT_QUEUE_NAME) private eventsQueue: Queue,
  ) {
    this.instances.revokeAllWorkingInstances(this.eventsQueue);
  }

  @Post('/new-instance')
  public async newInstance(@Body() input: CreateInstanceInput) {
    const usecase = new CreateInstanceUsecase(this.instances, this.eventsQueue);
    return usecase.execute(input);
  }

  @Post('/push-auth')
  public async pushAuth(@Body() input: PushAuthInput) {
    const usecase = new PushAuthUsecase(this.instances);
    return usecase.execute(input);
  }

  @Post('/get-state')
  public async getState(@Body() input: GetStateInput) {
    const usecase = new GetInstanceStateUsecase(this.instances);
    return usecase.execute(input);
  }

  @Post('/send-message')
  public async sendMessage(@Body() input: SendMessageInput) {
    const usecase = new SendMessageUsecase(this.instances, this.messages);
    return usecase.execute(input);
  }

  @Post('/revoke-instance')
  public async revokeInstance() {}

  @Post('/revoke-instance-by-id')
  public async revokeInstanceById() {}
}
