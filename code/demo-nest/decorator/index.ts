import 'reflect-metadata'

export const METHOD_NAME = Symbol('methodName');

export const Controller = (prefix: string): ClassDecorator => 
(target: Function) => {
    Reflect.defineMetadata('path', prefix, target);
}

const createGlobalHandlerDecorator = (state: 'success' | 'complete' | 'error') => (fn: Function): ClassDecorator  =>
(target: Function) => {
    Reflect.defineMetadata('NeedGlobalHandler', true, target);
    Reflect.defineMetadata(state, fn, target);
}

export const SuccessAll = createGlobalHandlerDecorator('success');
export const CompleteAll = createGlobalHandlerDecorator('complete');
export const ErrorAll = createGlobalHandlerDecorator('error');

const createHandlerDecorator = (state: 'success' | 'complete' | 'error') => (fn: Function): MethodDecorator  =>
(target: Object, propertyKey: string | symbol, _) => {
    Reflect.defineMetadata('NeedSpecificHandler', true, target, propertyKey);
    Reflect.defineMetadata(state, fn, target, propertyKey);
}

export const Success = createHandlerDecorator('success');
export const Complete = createHandlerDecorator('complete');
export const Error = createHandlerDecorator('error');


const createRequestDecorator = (method: string) => (route?: string)  =>
(target: Object, propertyKey: string, descriptor: PropertyDescriptor) => {

    // Controller 登记注册 内部实现文档
    const prevHandler = Reflect.getMetadata('handler', target) || [];
    const newHandler = [...prevHandler, {
        route: route ?? '',
        method: method,
        methodName: propertyKey
    }];
    Reflect.defineMetadata('handler', newHandler, target);


    // 修饰原有函数
    const fnMethod = descriptor.value;
    // 必须 function 留住上下文
    descriptor.value = function() {
        // 方法名
        Reflect.defineMetadata('_methodName', propertyKey, target, METHOD_NAME)
        // 路由
        const root = Reflect.getMetadata('path', target.constructor);
        const fullRoute = !route ? root : `${root}/${route}`; 
        // 记录信息
        const payload = {
            root,
            fullRoute,
            method
        };
        Reflect.defineMetadata('_payload', payload, target, propertyKey);
        // 没有请求处理
        if (!Reflect.getMetadata(`NeedGlobalHandler`, target.constructor) && !Reflect.getMetadata(`NeedSpecificHandler`, target, propertyKey)) {
            return fnMethod.call(this, ...arguments);
        }
        // 请求处理
        let successHandler, errorHandler, completeHandler;
        successHandler = Reflect.getMetadata('success', target, propertyKey) || Reflect.getMetadata('success', target.constructor);
        completeHandler = Reflect.getMetadata('complete', target, propertyKey) || Reflect.getMetadata('complete', target.constructor);
        errorHandler = Reflect.getMetadata('error', target, propertyKey) || Reflect.getMetadata('error', target.constructor);
        errorHandler = errorHandler || completeHandler;

        return fnMethod.call(this, ...arguments)
                            .then(successHandler)
                            .then(completeHandler)
                            .catch(errorHandler);
    }
}

export const Get = createRequestDecorator('GET');
export const Post = createRequestDecorator('POST');
export const Put = createRequestDecorator('PUT');
export const Delete = createRequestDecorator('DELETE');


// 自定义接口
export const Custom: MethodDecorator = 
(target: Object, propertyKey: string | symbol, _descriptor: PropertyDescriptor)  => {
    // Controller 登记注册
    Reflect.defineMetadata('custom', true, target, propertyKey);
}

const createParamDecorator = (paramName: string) =>
(target: Object, methodName: string, parameterIndex: number) => {
    const paramOrder = Reflect.getMetadata(`paramOrder`, target, methodName) || [];
    paramOrder[parameterIndex] = paramName;
    Reflect.defineMetadata(`paramOrder`, paramOrder, target, methodName);
}

// TODO: 可以增加属性校验/过滤等功能
export const Params = createParamDecorator('Params');
export const Options = createParamDecorator('Options');
export const Data = createParamDecorator('Data');

// fileName
export const Route = (filedName: string) => 
(target: Object, methodName: string, parameterIndex: number) => {
    const paramOrder = Reflect.getMetadata(`paramOrder`, target, methodName) || [];
    paramOrder[parameterIndex] = filedName ? `Route/${filedName}` : 'Route';
    Reflect.defineMetadata(`paramOrder`, paramOrder, target, methodName);
}


function requestDeliver(method: string, url: string, option: any) {
    const {
        data,
        params = {},
        headers = {},
        responseType,
        source,
        baseUrl,
        moduleRouter,
        requestId,
        noTimeOut,
    } = option;
    const basicOption = {
        url,
        type: method,
        params,
        headers,
        source,
        baseUrl,
        requestId,
    };
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
            };
            break;
        case 'POST':
            restOption = {
                data,
                responseType,
                moduleRouter,
                noTimeOut,
            };
            break;
        case 'DELETE':
            restOption = {
                data,
            };
            break;
        case 'PUT':
            restOption = {
                data,
            };
            break;
        default:
    }

    return request({ ...basicOption, ...restOption });
}
function request(options: any) {

}