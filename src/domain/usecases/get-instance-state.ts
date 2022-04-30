import { InstancesRepository } from '../../repositories/InstancesRepository';
import { TELEGRAM_STATE } from '../../entities/Instance';

export class GetStateInput {
  instanceId: string;
}

export class GetInstanceStateUsecase {
  constructor(private instances: InstancesRepository) {}

  async execute(input: GetStateInput) {
    const instance = await this.instances.getInstance(input.instanceId);

    if (!instance) {
      throw new Error('Instance not found');
    }

    if (instance.state === TELEGRAM_STATE.FAILED) {
      //TODO:
    }

    return instance.state;
  }
}
