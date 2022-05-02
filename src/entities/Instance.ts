import { TelegramClient } from 'telegram';
import { StringSession } from 'telegram/sessions';
import { NewMessage, NewMessageEvent } from 'telegram/events';

export enum TELEGRAM_STATE {
  NOT_INITIALIZED = 'TELEGRAM_NOT_INITIALIZED',
  NEED_CODE = 'TELEGRAM_NEED_CODE',
  NEED_PASSWORD = 'TELEGRAM_NEED_PASSWORD',
  WORKING = 'TELEGRAM_WORKING',
  FAILED = 'TELEGRAM_FAILED',
}

export const CHANNEL_NAME = 'TELEGRAM';

const apiId = process.env.API_ID;
const apiHash = process.env.API_HASH;

export class Instance {
  private client: TelegramClient;

  listener = null;
  state = TELEGRAM_STATE.NOT_INITIALIZED;
  private stringSession: StringSession;
  private id: string;
  private external_user_id: string;

  constructor(id: string, external_user_id: string) {
    this.id = id;
    this.external_user_id = external_user_id;
  }

  async getAuthPromise(type: TELEGRAM_STATE): Promise<string> {
    console.log(`state is ${type}`);
    this.state = type;
    const promiseValue = await new Promise<string>((resolve) => {
      this.promiseStack.push((value) => {
        this.state = type;
        resolve(value);
      });
    });
    return promiseValue;
  }

  promiseStack: object[] = [];

  async initClient(authString = ''): Promise<string> {
    return new Promise((resolve) => {
      this.stringSession = new StringSession(authString);

      this.client = new TelegramClient(
        this.stringSession,
        parseInt(apiId),
        apiHash,
        {
          connectionRetries: 5,
        },
      );
      this.client
        .start({
          phoneNumber: () =>
            this.getAuthPromise(TELEGRAM_STATE.NOT_INITIALIZED),
          password: () => this.getAuthPromise(TELEGRAM_STATE.NEED_PASSWORD),
          phoneCode: () => this.getAuthPromise(TELEGRAM_STATE.NEED_CODE),
          onError: (err) => console.log(err),
        })
        .then(async () => {
          console.log('Instance is working');
          this.state = TELEGRAM_STATE.WORKING;
          const authString = await this.saveSession();
          await this.addEventListener();
          resolve(authString);
        });
    });
  }

  async addEventListener() {
    this.client.addEventHandler(this.eventPrint.bind(this), new NewMessage({}));
  }

  async setListener(listener) {
    this.listener = listener;
  }

  async eventPrint(event: NewMessageEvent) {
    const message = event.message;
    if (event.isPrivate) {
      if (!message.media) {
        console.log(message.date);
        console.log(message.message);
        // @ts-ignore
        const { userId } = message._chatPeer;
        console.log(userId);
        if (this.listener) {
          this.listener({
            date: message.date,
            message: message.message,
            chatId: userId,
            senderId: message.senderId,
            out: message.out,
            userId: message.client._selfInputPeer.userId,
            instanceId: this.id,
            external_user_id: this.external_user_id,
          });
        }
      }
    }
  }

  async sendMessage(chatId: string, message: string) {
    await this.client.sendMessage(chatId, { message });
  }

  async saveSession(): Promise<string> {
    // @ts-ignore
    const session: string = this.client.session.save();
    console.log(session);
    return session;
  }

  async pushAuth(value: string) {
    const resolver = this.promiseStack.pop();
    // @ts-ignore
    resolver(value);
  }

  getState() {
    return this.state;
  }
}
