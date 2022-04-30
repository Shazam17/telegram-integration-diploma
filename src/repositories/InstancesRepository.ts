import { Injectable, OnModuleInit } from '@nestjs/common';
import { Column, Model, PrimaryKey, Table } from 'sequelize-typescript';
import { Instance, TELEGRAM_STATE } from '../entities/Instance';
import { v4 as uuidv4 } from 'uuid';
import { Queue } from 'bull';

@Table({ tableName: 'Instances' })
export class InstanceModel extends Model {
  @PrimaryKey
  @Column
  id: string;
  @Column
  authString: string;
  @Column
  phoneNumber: string;
  @Column
  state: string;
}

@Injectable()
export class InstancesRepository implements OnModuleInit {
  private instances: Map<string, Instance>;

  onModuleInit(): any {}

  constructor() {
    this.instances = new Map();
  }

  async revokeAllWorkingInstances(queue: Queue) {
    const models = await InstanceModel.findAll({
      where: { state: TELEGRAM_STATE.WORKING },
    });
    models.map(async (item) => {
      const instance = new Instance();
      await instance.setListener((data) => {
        queue.add(data);
      });
      await instance.initClient(item.authString);
      this.instances.set(item.id, instance);
    });
  }

  async revokeInstance(userId: string, phoneNumber: string) {
    const model = await InstanceModel.findOne({
      where: { userId, phoneNumber },
    });
    if (!model) {
      return;
    }
    const instance = new Instance();
    await instance.initClient(model.authString);
    this.instances.set(model.id, instance);
  }

  async revokeInstanceById(id: string) {
    const model = await InstanceModel.findOne({ where: { id } });
    if (!model) {
      return;
    }
    const instance = new Instance();
    await instance.initClient(model.authString);
    this.instances.set(model.id, instance);
  }

  async createInstance(userId: string, queue: Queue) {
    const instance = new Instance();
    const id = uuidv4();
    await instance.setListener((data) => queue.add(data));
    instance.initClient().then(async (authString: string) => {
      const model = await InstanceModel.findOne({ where: { id } });
      if (!model) {
        return;
      }
      model.authString = authString;
      model.state = TELEGRAM_STATE.WORKING;
      await model.save();
    });
    const instanceModel = await InstanceModel.create({
      id,
      userId,
      authString: '',
      state: TELEGRAM_STATE.NOT_INITIALIZED,
      phoneNumber: '',
    });
    this.instances.set(instanceModel.id, instance);
    return instanceModel.id;
  }

  async pushAuth(id: string, state: string, value: string) {
    const instance = this.instances.get(id);

    if (!instance) {
      console.log('Instance not found');
      //TODO: throw error
      return null;
    }

    const model = await InstanceModel.findOne({ where: { id } });

    if (!model) {
      console.log('Model not found');
      //TODO: make handler
      return null;
    }
    const instanceState = instance.getState();

    if (instanceState === state) {
      await instance.pushAuth(value);
    } else {
      return;
    }

    switch (state) {
      case TELEGRAM_STATE.NOT_INITIALIZED: {
        model.phoneNumber = value;
        model.state = TELEGRAM_STATE.NEED_CODE;
        break;
      }
      case TELEGRAM_STATE.NEED_CODE: {
        model.state = TELEGRAM_STATE.NEED_PASSWORD;
        break;
      }
      default:
        break;
    }
    await model.save();
  }

  async getInstanceByPhone(phoneNumber: string) {
    return InstanceModel.findAll({ where: { phoneNumber } });
  }

  getInstance(id: string): Promise<InstanceModel> {
    return InstanceModel.findOne({ where: { id } });
  }

  getAllUserInstances(userId: string) {}
}
