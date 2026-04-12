import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';

/**
 * HTTP 异常过滤器
 * 统一处理异常响应
 */
@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(HttpExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message = 'Internal server error';
    let errorDetails: any = null;

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const exceptionResponse = exception.getResponse();

      if (typeof exceptionResponse === 'string') {
        message = exceptionResponse;
      } else if (typeof exceptionResponse === 'object') {
        const responseObj = exceptionResponse as any;
        message = responseObj.message || message;
        errorDetails = responseObj.error || null;
      }
    } else if (exception instanceof Error) {
      message = exception.message;
      this.logger.error(
        `Exception: ${exception.message}`,
        exception.stack,
      );
    }

    const errorResponse = {
      code: status,
      message,
      data: errorDetails,
      timestamp: Date.now(),
      path: request.url,
    };

    response.status(status).json(errorResponse);
  }
}
