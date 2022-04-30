import { InstancesRepository } from '../../repositories/InstancesRepository';
import { TELEGRAM_STATE } from '../../entities/Instance';

export class PushAuthInput {
  instanceId: string;
  value: string;
  state: TELEGRAM_STATE;
}

export class PushAuthUsecase {
  constructor(private instances: InstancesRepository) {}

  async execute(input: PushAuthInput) {
    await this.instances.pushAuth(input.instanceId, input.state, input.value);
    return true;
  }
}
