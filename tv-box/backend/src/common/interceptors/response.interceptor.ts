import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import type { ApiResponse } from '../interfaces/response.interface';

/**
 * 响应拦截器
 * 统一处理响应格式
 */
@Injectable()
export class ResponseInterceptor<T>
  implements NestInterceptor<T, ApiResponse<T>>
{
  intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Observable<ApiResponse<T>> {
    return next.handle().pipe(
      map((data) => {
        // 如果已经是标准响应格式，直接返回
        if (data && data.code !== undefined && data.message !== undefined) {
          return data;
        }

        // 否则包装为标准响应格式
        return {
          code: 200,
          message: 'success',
          data: data,
          timestamp: Date.now(),
        };
      }),
    );
  }
}
