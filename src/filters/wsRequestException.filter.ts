import { WsExceptionFilter } from '@nestjs/common/interfaces/exceptions';
import { RequestException } from '../exceptions/request.exception';
import { Catch } from '@nestjs/common';

@Catch(RequestException)
export class WSRequestExceptionFilter implements WsExceptionFilter {

  public catch(exception: RequestException, client): void {
    console.error(JSON.parse(JSON.stringify(exception)));
    client.emit('exception', exception);
  }
}
