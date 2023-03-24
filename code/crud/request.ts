import { AxiosResponse, ResponseType } from 'axios';
import { getReqOptions } from './base.crud';
import { fetch, FetchSource, generateSource } from './fetch';

interface KeyMap<T> {
    [key: string]: T;
}

/**
 * 请求类型
 */
export enum RequestType {
    GET = 'GET',
    POST = 'POST',
    PUT = 'PUT',
    DELETE = 'DELETE',
}

export enum RequestCancelType {
    /**
     * 自动取消, 用于连续的请求只保留最后一次
     */
    AUTO = 'auto',
    /**
     * 手动取消, 用于手动取消并重试
     */
    CUSTOM = 'custom',
}

// url中可能存在的异常参数场景
function isUnexpectedUrl(url: string | undefined) {
    // return url && url.indexOf(BICst.UNEXPECTED_PARAM) > -1;
    return url;
}
// 先移过来 async放在两个文件会生成两份 async regenerate-runtime
export async function request(originalReqOptions: CrudReqOpts = {}) {
    if (isUnexpectedUrl(originalReqOptions.url)) {
        return Promise.reject();
    }

    return basicRequest(getReqOptions(originalReqOptions)).then((response: AxiosResponse) => {
        const status = response?.status;

        return status === 200 ? response.data : { status };
    });
}

export async function basicRequest(reqOptions: CrudReqOpts = {}): Promise<AxiosResponse> {
    const {
        url,
        type,
        headers,
        data,
        params,
        source = generateSource(),
        responseType,
        baseUrl,
        requestId,
        noTimeOut,
    } = reqOptions;
    // const token = BI.getToken();
    const token = 'xxx';

    return fetch.request({
        requestId: requestId || source.id,
        url,
        baseURL: baseUrl,
        method: type,
        headers: {
            'X-Requested-With': 'XMLHttpRequest',
            'Content-Type': 'application/json;charset=UTF-8',
            ...(!token
                ? {}
                : {
                      Authorization: `Bearer ${token}`,
                  }),
            ...headers,
        },
        params,
        data,
        source,
        responseType,
        noTimeOut,
    });
}

export interface CrudReqOpts {
    /**
     * 请求path
     */
    url?: string;
    /**
     * 请求类型
     */
    type?: RequestType;
    /**
     * body
     */
    data?: any;
    /**
     * 请求头
     */
    headers?: KeyMap<string>;
    /**
     * 请求参数
     */
    params?: CrudParams;
    /**
     * 取消请求用的source
     */
    source?: FetchSource;
    /**
     * 请求返回的类型, 默认json
     */
    responseType?: ResponseType;
    /**
     * 前缀
     */
    baseUrl?: string;
    /**
     * 模块
     */
    moduleRouter?: string;
    /**
     * 请求id
     */
    requestId?: string;
    /**
     * 不出现超时弹窗
     */
    noTimeOut?: boolean;
}

export interface CrudParams {
    [key: string]: string | number | boolean | { [key: string]: any } | undefined;
}

export interface Result<T = any> {
    data: T;
    errorCode: null | string;
    errorMsg?: null | string;
    detailErrorMsg?: T;
}
