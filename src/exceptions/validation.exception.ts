import { RequestException } from './request.exception';

export class ValidationException extends RequestException {
  code = 19;
  message = 'Validation error: ';

  constructor(errors) {
    super();
    this.message += errors[0];
    this.data = errors;
  }
}