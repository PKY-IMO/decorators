import 'reflect-metadata';

export enum RequestType {
    GET = 'GET',
    POST = 'POST',
    PUT = 'PUT',
    DELETE = 'DELETE',
}

const METHOD_NAME = Symbol('METHOD_NAME');

const URL = {
    ROOT: 'root',
    SUB_ROUTE: 'subRoute',
    NO_ROOT: 'noRoot',
};

const PARAM = {
    ORDER: 'paramOrder',
    PARAMS: 'params',
    DATA: 'data',
    OPTIONS: 'options',
    URL: 'url',
    ROUTE: 'route',
};

enum StateType {
    SUCCESS = 'success',
    COMPLETE = 'complete',
    ERROR = 'error',
}

const HANDLER = {
    GLOBAL: 'needGlobalHandler',
    SPECIFIC: 'needSpecificHandler',
};

const CACHE = {
    METHOD_NAME: '_methodName',
    PAYLOAD: '_payload',
};

export const Controller = (prefix?: string): ClassDecorator => (target: Function) => {
    let adjustRoot = prefix;
    if (prefix?.startsWith('/')) {
        adjustRoot = prefix?.slice(1);
    }
    Reflect.defineMetadata(URL.ROOT, adjustRoot, target);
};

const createGlobalHandlerDecorator = (state: StateType) => (fn: Function): ClassDecorator => (target: Function) => {
    Reflect.defineMetadata(HANDLER.GLOBAL, true, target);
    Reflect.defineMetadata(state, fn, target);
};

export const SuccessAll = createGlobalHandlerDecorator(StateType.SUCCESS);
export const CompleteAll = createGlobalHandlerDecorator(StateType.COMPLETE);
export const ErrorAll = createGlobalHandlerDecorator(StateType.ERROR);

const createHandlerDecorator = (state: StateType) => (fn: Function): MethodDecorator => (
    target: Object,
    propertyKey: string | symbol,
    _
) => {
    Reflect.defineMetadata(HANDLER.SPECIFIC, true, target, propertyKey);
    Reflect.defineMetadata(state, fn, target, propertyKey);
};

export const Success = createHandlerDecorator(StateType.SUCCESS);
export const Complete = createHandlerDecorator(StateType.COMPLETE);
export const Error = createHandlerDecorator(StateType.ERROR);

const createRequestDecorator = (method: RequestType) => (subRoute?: string): MethodDecorator => (
    target: Object,
    propertyKey: string | symbol,
    descriptor: PropertyDescriptor
) => {
    let adjustSubRoute = subRoute;
    if (subRoute?.startsWith('/')) {
        adjustSubRoute = subRoute?.slice(1);
    }
    Reflect.defineMetadata(URL.SUB_ROUTE, adjustSubRoute, target, propertyKey);

    const fnMethod = descriptor.value;
    descriptor.value = function () {
        // 记录信息
        Reflect.defineMetadata(CACHE.METHOD_NAME, propertyKey, target, METHOD_NAME);
        const root = Reflect.getMetadata(URL.ROOT, target.constructor);
        const noRoot = Reflect.getMetadata(URL.NO_ROOT, target, propertyKey);
        const adjustRoot = noRoot ? '' : root; 
        const fullRoute = !adjustSubRoute ? adjustRoot : `${adjustRoot}/${adjustSubRoute}`;      
        const adjustFullRoute = fullRoute?.startsWith('/') ? fullRoute?.slice(1) : fullRoute;
        if (!adjustFullRoute) {
            return Promise.reject('路由错误!');
        }
        
        const payload = {
            fullRoute: adjustFullRoute,
            method,
        };
        Reflect.defineMetadata(CACHE.PAYLOAD, payload, target, propertyKey);
        // 没有请求处理
        if (
            !Reflect.getMetadata(HANDLER.GLOBAL, target.constructor) &&
            !Reflect.getMetadata(HANDLER.SPECIFIC, target, propertyKey)
        ) {
            return fnMethod.call(this, ...arguments);
        }
        // 请求处理
        const successHandler =
            Reflect.getMetadata(StateType.SUCCESS, target, propertyKey) ||
            Reflect.getMetadata(StateType.SUCCESS, target.constructor);
        const completeHandler =
            Reflect.getMetadata(StateType.COMPLETE, target, propertyKey) ||
            Reflect.getMetadata(StateType.COMPLETE, target.constructor);
        let errorHandler =
            Reflect.getMetadata(StateType.ERROR, target, propertyKey) ||
            Reflect.getMetadata(StateType.ERROR, target.constructor);
        errorHandler = errorHandler || completeHandler;

        return fnMethod
            .call(this, ...arguments)
            .then(successHandler)
            .then(completeHandler)
            .catch(errorHandler);
    };
};

export const Get = createRequestDecorator(RequestType.GET);
export const Post = createRequestDecorator(RequestType.POST);
export const Put = createRequestDecorator(RequestType.PUT);
export const Delete = createRequestDecorator(RequestType.DELETE);

// 自定义接口
export const Custom = (target: Object, propertyKey: string | symbol, _descriptor: PropertyDescriptor) => {
    // Controller 登记注册
    Reflect.defineMetadata('custom', true, target, propertyKey);
};

const createParamDecorator = (paramName: string) => (
    target: Object,
    methodName: string | symbol,
    parameterIndex: number
) => {
    const paramOrder = Reflect.getMetadata(PARAM.ORDER, target, methodName) || [];
    paramOrder[parameterIndex] = paramName;
    Reflect.defineMetadata(PARAM.ORDER, paramOrder, target, methodName);
};

// TODO: 可以增加属性校验/过滤等功能
export const Params = createParamDecorator(PARAM.PARAMS);
export const Options = createParamDecorator(PARAM.OPTIONS);
export const Data = createParamDecorator(PARAM.DATA);

// fileName Route->
export const Route = (filedName: string) => (target: Object, methodName: string | symbol, parameterIndex: number) => {
    const paramOrder = Reflect.getMetadata(PARAM.ORDER, target, methodName) || [];
    paramOrder[parameterIndex] = filedName ? `${PARAM.ROUTE}/${filedName}` : PARAM.ROUTE;
    Reflect.defineMetadata(PARAM.ORDER, paramOrder, target, methodName);
};

export const NoRoot = (): MethodDecorator => (
    target: Object,
    propertyKey: string | symbol,
    _descriptor: PropertyDescriptor
) => {
    Reflect.defineMetadata(URL.NO_ROOT, true, target, propertyKey);
};

export function requestController(this: Object, ...args: any[]) {
    const _arguments = args;
    // 方法名
    const propertyKey = Reflect.getMetadata(CACHE.METHOD_NAME, this, METHOD_NAME);
    // 追加的基本配置
    const payload = Reflect.getMetadata(CACHE.PAYLOAD, this, propertyKey);
    const { root, method, fullRoute } = payload;
    // 自定义参数
    const isCustom = Reflect.getMetadata('custom', this, propertyKey);
    // 参数顺序
    const paramOrder = Reflect.getMetadata(PARAM.ORDER, this, propertyKey);
    // 删除
    Reflect.deleteMetadata(CACHE.PAYLOAD, this, propertyKey);
    Reflect.deleteMetadata(CACHE.METHOD_NAME, this, METHOD_NAME);

    // 自定义直接走请求逻辑
    if (isCustom) {
        let adjustSubRoute = _arguments[0];
        if (adjustSubRoute?.startsWith('/')) {
            adjustSubRoute = adjustSubRoute?.slice(1);
        }

        return requestDeliver(method, `${root}/${_arguments[0]}`, _arguments[1]);
    }

    // 不是自定义：调整好参数再发送请求
    // 参数必须全部按顺序传过来
    console.log(arguments.length, paramOrder.length);
    // if (arguments.length !== paramOrder.length) {
    //     return Promise.reject('参数错误!');
    // }
    const totalParams: any = {};
    let targetURLNumber = 0;
    paramOrder?.forEach((decoratorName: string, idx: number) => {
        if (decoratorName.startsWith(PARAM.ROUTE)) {
            const temp = decoratorName.split('/');
            // id name
            if (temp.length === 2) {
                targetURLNumber++;
                totalParams[temp[1]] = _arguments[idx];
            }
        }
        totalParams[decoratorName] = _arguments[idx];
    });
    const { params, data } = totalParams;
    let { options } = totalParams;

    // 获取真实的路径 url
    // 'user/get/:id/today/:name' 和 id name
    // ？可以换成原来的 getEncodeURL -> 会全局使用 Func.
    // url: "/v5/design/{tableName}/{fieldName}" routes: {tableName: "A", fieldName: "a"}

    // :id :name
    const replaceURLs = fullRoute?.match(/:([^/]+)/g);
    let url = fullRoute;
    if (replaceURLs.length) {
        // TODO @Route() 和 encodeURL
        if (targetURLNumber !== replaceURLs.length) {
            return Promise.reject('动态参数错误!');
        }

        replaceURLs.forEach((key: string) => {
            const temp = key.slice(1);
            // encodeURI
            url = url.replace(key, totalParams[temp]);
        });
    }

    // 根据请求方式不同整理参数
    if (!options) options = {};
    options.params = params;
    options.data = data;

    return requestDeliver(method, url, options);
}

function requestDeliver(method: string, url: string, option: any) {
    const { data, params = {}, headers = {}, responseType, source, baseUrl, moduleRouter, requestId, noTimeOut } = option;
    const basicOption = {
        url,
        type: method,
        params,
        headers,
        source,
        baseUrl,
        requestId
    }
    let restOption = {};
    switch (method) {
        case 'GET':
            if (data) {
                // BI.req 的校正
                basicOption.params = data;
            }
            restOption = {
                responseType,
                moduleRouter,
            }
            break;
        case 'POST':
            restOption = {
                data,
                responseType,
                moduleRouter,
                noTimeOut,
            }
            break;
        case 'DELETE':
            restOption = {
                data
            }
            break;
        case 'PUT':
            restOption = {
                data
            }
            break;
        default:
    }
    return request({...basicOption, ...restOption});
}

async function request(option: any) {
    console.log(option);
    return new Promise(resolve => {
        setTimeout(() => {
            resolve({data: [{name: '1'}, {name: '2'}]});
        },2000);
    });
}