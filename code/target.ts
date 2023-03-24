import { CrudReqOpts, request, RequestType } from "./crud";

// export function getBasicPool() {
//     return reqGet('design/report/pool/basic').then(res => {
//         return res.data;
//     });
// }

function reqGet(url: string, opts: Omit<CrudReqOpts, 'data'> = {}) {
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

function reqPost(url: string, opts: CrudReqOpts = {}) {
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

const Get = 
    (url: string, opts: Omit<CrudReqOpts, 'data'> = {}): MethodDecorator  =>
    (target: Object, propertyKey: string | symbol, descriptor: PropertyDescriptor) => {
        const method = descriptor.value;
        const { params = {}, headers = {}, responseType, source, baseUrl, requestId, moduleRouter } = opts;

        // 保留this
        descriptor.value = function() {
            const _this = this;
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
            }).then((res) => {
                method.apply(_this, res);
            })
        }
    }

const Post = 
(url: string, opts: Omit<CrudReqOpts, 'data'> = {}): MethodDecorator  =>
(target: Object, propertyKey: string | symbol, descriptor: PropertyDescriptor) => {
    const method = descriptor.value;
    const { params = {}, headers = {}, responseType, source, baseUrl, requestId, moduleRouter } = opts;

    // 保留this
    descriptor.value = function() {
        const _this = this;
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
        }).then((res) => {
            method.apply(_this, res);
        })
    }
}

const Controller = 
(prefix: string): ClassDecorator  => 
(target: Function) => {
    target.prototype.root = prefix;
}


@Controller('perfix')
class ExampleController {

    @Get('design/report/pool/basic')
    public getBasicPool(res: any) {
        
        return res.data 
    }

    public savePackUpdateSetting(data: any) {
        return reqPost(`conf/update/packs/${data.packId}/settings`, {
            data,
        }).then(res => {
            // return packOperatorHandler(res);
        });
    }

}


