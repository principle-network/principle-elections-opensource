import { Catch } from '@nestjs/common';
import { ExceptionFilter } from '@nestjs/common/interfaces/exceptions';

@Catch()
export class WSDefaultExceptionFilter implements ExceptionFilter {

  public catch(exception: Error, client): void {
    console.error(JSON.parse(JSON.stringify(exception)));
    client.emit('exception', exception);
  }
}
