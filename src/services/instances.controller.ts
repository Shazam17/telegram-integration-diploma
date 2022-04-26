import { Body, Controller, Post } from '@nestjs/common';
import { Instance } from '../entities/Instance';

@Controller()
export class InstancesController {
  private instances: Instance[];

  constructor() {
    this.instances = [];
  }

  @Post('/new-instance')
  public async newInstance(@Body() body: object) {
    const instance = new Instance();
    await instance.initClient();
    this.instances.push(instance);
    return true;
  }

  @Post('/push-auth')
  public async pushAuth(@Body() body: object) {
    // @ts-ignore
    await this.instances[0].pushAuth(body.value);
    return true;
  }

  @Post('/get-state')
  public async getState(@Body() body: object) {
    // @ts-ignore
    return this.instances[0].getState();
  }
}
