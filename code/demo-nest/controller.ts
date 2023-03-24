// import { request } from "../crud";
import 'reflect-metadata'
// import { Controller, Custom, Data, Delete, Error, Get, Params, Post, Route, Success } from "./decorator";
import { requestController, Controller, Custom, Data, Delete, Error, Get, Params, Post, Route, Success, NoRoot } from './decorator/decorator';

// export function requestController(this: Object,...args: any[]) {
//     const _arguments = args;
//     // 方法名
//     const propertyKey = Reflect.getMetadata('_methodName', this, METHOD_NAME);
//     // 追加的基本配置
//     const payload = Reflect.getMetadata(`_payload`, this, propertyKey);
//     const { root, method, fullRoute } = payload;
//     // 自定义参数
//     const isCustom = Reflect.getMetadata('custom', this, propertyKey);
//     // 参数顺序
//     const paramOrder = Reflect.getMetadata(`paramOrder`, this, propertyKey); 
//     // 删除
//     Reflect.deleteMetadata(`_payload`, this, propertyKey);
//     Reflect.deleteMetadata('_methodName', this, METHOD_NAME)

//     // 自定义直接走请求逻辑
//     if (isCustom) {
//         // 矫正 options
//         if (!_arguments[1]) _arguments[1] = {};
//         return requestDeliver(method, `${root}/${_arguments[0]}`, _arguments[1]);
//     }

//     // 不是自定义：调整好参数再发送请求
//     // 参数必须全部按顺序传过来
//     if (arguments.length !== paramOrder.length) {
//         return Promise.reject('参数错误!');
//     }
//     const totalParams: any = {};
//     let targetURLNumber = 0;
//     paramOrder?.forEach((decoratorName: string, idx: number) => {
//         if (decoratorName.startsWith('Route')) {
//             const temp = decoratorName.split('/');
//             // id name
//             if (temp.length == 2) {
//                 targetURLNumber ++;
//                 totalParams[temp[1]] = _arguments[idx];
//             }
//         }
//         totalParams[decoratorName] = _arguments[idx];
//     })
//     let { Params: params, Data: data, Options: options } = totalParams;

//     // 获取真实的路径 url
//     // 'user/get/:id/today/:name' 和 id name
//     // 可以换成原来的 getEncodeURL -> 会全局使用
//     // getEncodeURL逻辑：url: "/v5/design/{tableName}/{fieldName}" routes: {tableName: "A", fieldName: "a"}
//     // :id :name
//     const replaceURLs = fullRoute?.match(/\:([^\/]+)/g);
//     let url = fullRoute;
//     if (replaceURLs.length) {
//         // TODO @Route() 和 encodeURL
//         if (targetURLNumber !== replaceURLs.length) {
//             return Promise.reject('动态参数错误!');
//         }

//         replaceURLs.forEach((key: string) => {
//             const temp = key.slice(1);
//             // encodeURI
//             url = url.replace(key, totalParams[temp]);
//         })
//     }

//     // 根据请求方式不同整理参数
//     if (!options) options = {};
//     options.params = params;
//     options.data = data;
//     return requestDeliver(method, url, options);
// }

// function requestDeliver(method: string, url: string, option: any) {
//     const { data, params = {}, headers = {}, responseType, source, baseUrl, moduleRouter, requestId, noTimeOut } = option;
//     const basicOption = {
//         url,
//         type: method,
//         params,
//         headers,
//         source,
//         baseUrl,
//         requestId
//     }
//     let restOption = {};
//     switch (method) {
//         case 'GET':
//             if (data) {
//                 // BI.req 的校正
//                 basicOption.params = data;
//             }
//             restOption = {
//                 responseType,
//                 moduleRouter,
//             }
//             break;
//         case 'POST':
//             restOption = {
//                 data,
//                 responseType,
//                 moduleRouter,
//                 noTimeOut,
//             }
//             break;
//         case 'DELETE':
//             restOption = {
//                 data
//             }
//             break;
//         case 'PUT':
//             restOption = {
//                 data
//             }
//             break;
//         default:
//     }
//     return request({...basicOption, ...restOption});
// }

// async function request(option: any) {
//     console.log(option);
//     return new Promise(resolve => {
//         setTimeout(() => {
//             resolve({data: [{name: '1'}, {name: '2'}]});
//         },2000);
//     });
// }

export const LowerDecorator: PropertyDecorator = (target: Object, propertyKey: string | symbol) => {
    // console.log(propertyKey); // title
    let value: string;
    Object.defineProperty(target, propertyKey, {
        get: () => {
            return value.toLowerCase();
        },
        set: v => {
            value = v
        }
    })
}


/**
 * 用户请求
 * @root 'user'
 */
@Controller('user')
export class  UserController {
    private service = requestController

    /**
     * 请求某个学生
     * @method GET
     * @param name
     * @path user/student/:name
     * 
     */
    @Get('student/:name')
    getStudentByName(@Route('name') name: string) {
        return this.service(name);
    }

    @Get('details')
    @Error((e: Error) => { console.log(e); })
    getAll(option: any) {

        // begin

        return this.service();
        
        // end

    }

    @Post('student/:name/today/:class')
    @Success((res: any) => res.data)
    getByNameClass(@Route('name') _name: string, @Route('class') _class: string, @Data data: any) {

        // begin

        return this.service(...arguments);
        
        // end

    }
    

    // @Get('student/:id/today/:name')
    // @Error((e: Error) => { console.log(e); })// TODO promise处理
    // TODO: 接口写死 
    // BI.reqGet: url data->params
    // reqGet: url option[url type data headers params source responseType baseUrl moduleRouter requestId noTimeOut]
    // @Params @Options @Data
    // getById(@Params('id') _id: string, @Params('name') _name: string) {

    //     // begin 装饰器内拦截了参数 call(this, ...args)

    //     return this.service(_id, _name, arguments).then((res) => {
    //         return res;
    //     });
        
    //     // end

    // }

    @Post('task/student/:id')
    // @Success((res: any) => (res.data))
    @Error((e: Error) => { console.log(e); })
    // TODO 传的data参数 要挂在 options的属性上 当作options.data传走
    // TODO 传的Params参数 要挂在 option 的属性上 当作options.param传走
    // @route 要解决 getEncodeURL('conf/tables/fields/page', options) 动态参数
    postTask(@Route('id') id: string, @Data data: any) {
        return this.service(id, data);
    }

    @Post('design/widget/template/session/:sessionId/')
    // TODO 需要一个custom参数
    // 这样 this.service q就必须按规定格式传参数 url option 这两个参数
    // request 多态
    @Custom
    randomPost(widgetHelper: any) {
        const sessionId = widgetHelper.getTemplateHelper().getSessionId();
        const data = {
            wId: widgetHelper.getWidgetId(),
            sessionId,
        };
        return this.service(`design/widget/template/session/${sessionId}/`,{ data });
    }

    @Post('student/:id')
    postOne(@Route('id') id: string) {
        return this.service(id);
    }

    @Custom
    @Get('student/custom/:id')
    @Success((res: any) => (res.data))
    getOneCustom(id: string) {
        return this.service(`student/custom/${id}`);
    }


    @NoRoot()
    @Delete('student/:id')
    deleteOne(@Route('id') id: string, @Params params: any, options: any) {
        // 对相关位置参数进行更改
        params = {
            data: options[params],
            params
        }
        // 传到下层
        return this.service(id, params);
    }
}
