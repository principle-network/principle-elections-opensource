import { RequestException } from '../../../exceptions/request.exception';

export class PhoneExists extends RequestException {
  code: number = 1;

  constructor(phone: string) {
    super();
    this.message = `Phone "${phone}" already registered.`;
  }
}

export class PhonePrefixNotSupported extends RequestException {
  code: number = 1;

  constructor(prefix: string) {
    super();
    this.message = `"${prefix}" not a supported prefix.`;
  }
}

export class RecaptchaError extends RequestException {
  code: number = 1;

  constructor() {
    super();
    this.message = `Recaptcha error`;
  }
}
