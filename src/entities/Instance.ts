import { TelegramClient } from 'telegram';
import { StringSession } from 'telegram/sessions';
import { NewMessage, NewMessageEvent } from 'telegram/events';

enum TELEGRAM_STATE {
  NOT_INITIALIZED,
  NEED_CODE,
  NEED_PASSWORD,
  WORKING,
  FAILED,
}

const MAP_REQ = ['PHONE', 'CODE', 'PASSWORD'];

export class Instance {
  private client: TelegramClient;

  state = TELEGRAM_STATE.NOT_INITIALIZED;
  apiId = 3242840;
  apiHash = 'a3e9f2da2f96a5f4225603e2c754139f';
  stringSession = new StringSession(``); // fill this later with the value from session.save()

  async getAuthPromise(type: TELEGRAM_STATE): Promise<string> {
    console.log(`state is ${MAP_REQ[type]}`);
    this.state = type;
    const promiseValue = await new Promise<string>((resolve) => {
      this.promiseStack.push(resolve);
    });
    return promiseValue;
  }

  promiseStack: object[] = [];

  async initClient() {
    this.client = new TelegramClient(
      this.stringSession,
      this.apiId,
      this.apiHash,
      {
        connectionRetries: 5,
      },
    );
    this.client.start({
      phoneNumber: () => this.getAuthPromise(TELEGRAM_STATE.NOT_INITIALIZED),
      password: () => this.getAuthPromise(TELEGRAM_STATE.NEED_PASSWORD),
      phoneCode: () => this.getAuthPromise(TELEGRAM_STATE.NEED_CODE),
      onError: (err) => console.log(err),
    });
    this.addEventListener()
  }

  async addEventListener() {
    this.client.addEventHandler(this.eventPrint, new NewMessage({}));
  }

  async eventPrint(event: NewMessageEvent) {
    const message = event.message;
    if (event.isPrivate) {
      // prints sender id
      console.log(message.senderId);
      // read message
      console.log(message);
      // if (message.text == 'hello') {
      //   const sender = await message.getSender();
      //   console.log('sender is', sender);
      //   await client.sendMessage(sender, {
      //     message: `hi your id is ${message.senderId}`,
      //   });
      // }
    }
  }

  async sendMessage() {
    await this.client.sendMessage('me', { message: 'Hello!' });
  }

  async saveSession() {
    await this.client.session.save();
  }

  async pushAuth(value: string) {
    const resolver = this.promiseStack.pop();
    // @ts-ignore
    resolver(value);
  }

  async getState() {
    return MAP_REQ[this.state];
  }
}
