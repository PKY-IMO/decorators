import axios, { AxiosRequestConfig, AxiosResponse } from 'axios';

/**
 * 提供基本的request方法，与beforeRequest和afterResponse的钩子
 */

// 请求的配置对象接口
interface FetchOptions extends AxiosRequestConfig {
    requestId?: string;
    ignoreError?: boolean;
    source?: FetchSource;
    noTimeOut?: boolean;
}

// 请求响应对象接口
// interface FetchResponse<T = any> extends AxiosResponse {
//     data: T;
//     config: FetchOptions;
// }

type Fulfilled<V> = (value: V) => V | Promise<V>;
type Rejected = (error: any) => any;
interface HandlerMap {
    fulfilled?: Fulfilled<any>;
    rejected?: Rejected;
}

class InterceptorManager<T> {
    private handlers: (HandlerMap | null)[] = [];

    use(onFulfilled?: Fulfilled<T>, onRejected?: Rejected): number {
        this.handlers.push({
            fulfilled: onFulfilled,
            rejected: onRejected,
        });

        return this.handlers.length - 1;
    }

    eject(id: number) {
        if (this.handlers[id]) {
            this.handlers[id] = null;
        }
    }

    forEach(fn: (h: HandlerMap) => any) {
        this.handlers.forEach(handler => {
            if (handler !== null) {
                fn(handler);
            }
        });
    }

    empty() {
        this.handlers = [];
    }
}

class Request {
    interceptors = {
        request: new InterceptorManager<FetchOptions>(),
        response: new InterceptorManager<any>(),
    };

    request(options: FetchOptions): Promise<any> {
        const chain: any[] = [(config: AxiosRequestConfig) => axios.request(config), undefined];

        let promise = Promise.resolve(options);

        this.interceptors.request.forEach(interceptor => {
            chain.unshift(interceptor.fulfilled, interceptor.rejected);
        });

        this.interceptors.response.forEach(interceptor => {
            chain.push(interceptor.fulfilled, interceptor.rejected);
        });

        while (chain.length) {
            promise = promise.then(chain.shift(), chain.shift());
        }

        return promise as Promise<any>;
    }
}

export class FetchSource {
    public origin = axios.CancelToken.source();
    public id: string;

    constructor(id?: string) {
        // this.id = id || BI.UUID();
        this.id = id || 'xxx';
    }

    cancel(info?: string, data?: any) {
        // @ts-ignore
        this.origin.cancel({
            id: this.id,
            info,
            data,
        });

        // BI.PerformanceHelperService.removeRequest(this.id);
        console.log('xxx');
    }

    // @ts-ignore
    get token() {
        return this.origin.token;
    }
}

export function generateSource(id?: string) {
    return new FetchSource(id);
}

export const fetch = new Request();
