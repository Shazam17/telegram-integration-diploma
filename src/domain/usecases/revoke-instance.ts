import { InstancesRepository } from '../../repositories/InstancesRepository';

export class CreateInstanceInput {
  userId: string;
  phoneNumber: string;
}

export class RevokeInstance {
  constructor(private instances: InstancesRepository) {}

  async execute(input: CreateInstanceInput) {
    // return this.instances.createInstance(input.userId, th);
  }
}
