import { request, CrudReqOpts, RequestType } from './request';

export const CONSTANTS = {
    version: 'v5',
    SUCCESS: 200,
};

/**
 * axios get请求不支持带body
 * @param url
 * @param opts
 */
export function reqGet(url: string, opts: Omit<CrudReqOpts, 'data'> = {}) {
    const { params = {}, headers = {}, responseType, source, baseUrl, requestId, moduleRouter } = opts;

    return request({
        url,
        type: RequestType.GET,
        params,
        headers,
        responseType,
        source,
        baseUrl,
        moduleRouter,
        requestId,
    });
}

export function reqPost(url: string, opts: CrudReqOpts = {}) {
    const { data, params = {}, headers = {}, responseType, source, baseUrl, moduleRouter, requestId, noTimeOut } = opts;

    return request({
        url,
        type: RequestType.POST,
        data,
        params,
        headers,
        responseType,
        source,
        baseUrl,
        moduleRouter,
        requestId,
        noTimeOut,
    });
}

export function reqDelete(url: string, opts: CrudReqOpts = {}) {
    const { data, params = {}, headers = {}, source, baseUrl, requestId } = opts;

    return request({
        url,
        type: RequestType.DELETE,
        data,
        params,
        headers,
        source,
        baseUrl,
        requestId,
    });
}

export function reqPut(url: string, opts: CrudReqOpts = {}) {
    const { data, params = {}, headers = {}, source, baseUrl, requestId } = opts;

    return request({
        url,
        type: RequestType.PUT,
        data,
        params,
        headers,
        source,
        baseUrl,
        requestId,
    });
}

export function getReqURL() {
    // return BI.fineServletURL ? BI.fineServletURL : Dec.fineServletURL;
    return 'xxx';
}

export function getReqOptions(originalReqOptions: CrudReqOpts = {}) {
    const reqOptions = { ...originalReqOptions };
    reqOptions.baseUrl = reqOptions.baseUrl
        ? reqOptions.baseUrl
        : `${getReqURL()}/${CONSTANTS.version}/${
              originalReqOptions.moduleRouter ? originalReqOptions.moduleRouter : ''
          }`;
    reqOptions.headers = reqOptions.headers || {};
    // reqOptions.headers.sessionId = reqOptions.headers.sessionId || BI.sessionId;
    // const token = BI.getToken();
    const token = 'xxx';
    reqOptions.headers.sessionId = reqOptions.headers.sessionId || 'xxx';
    if (token) {
        reqOptions.headers.Authorization = `Bearer ${token}`;
    }

    return reqOptions;
}
