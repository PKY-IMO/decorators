import { request } from "../crud/request";
import { UserController } from "./controller";

class Module {
    public controllerList: any[] = [];
    constructor (controllerClassList: any[]) {
        controllerClassList.forEach(controllerClass => {
            this.controllerList.push(new controllerClass())
        })
    }
}

function initial() {
    return new Module([UserController])
}

const requestsList: any[] = [
    {method: 'get', route: 'user/details', option: {params: {'id': 11290, 'name': 'nameJack'}, head: 'xx'}},
    {method: 'get', route: 'user/tom', option: {params: {'id': 11, 'name': 22}, head: 'yy'}}
]

function main() {
    // const module = initial()
    // const controllers = module.controllerList;
    // requestsList.forEach(req => {
    //     for (let controller of controllers) {
    //         // if (controller.root !== req.route) continue;
    //         // const result = controller.getAll(req.option);
    //         // console.log(req, result);

    //         switch(req.method) {
    //             case 'get':
    //                 controller.handler.forEach((handler: any) => {
    //                     // 完整路由
    //                     const subRoute = !handler.route ? controller.root : `${controller.root}/${handler.route}`;
    //                     if (subRoute !== req.route) return;
    //                     const result = controller[handler.method](req.option)
    //                     console.log(result);
    //                 })
    //         }
    //     }
    // });


    const userService = new UserController();
    // console.log(userService.getOne({simple: 1}));
    // userService.getAll({params: {'name': 10}}).then((res: any) => {
    //     console.log(res)
    // });
    // userService.getById(requestsList[0].option, requestsList[0].option);

    // userService.postOne(requestsList[0].option).then((res: Object) => {
    //     console.log(res);
    // });
    // TODO 现在是一个大数组，可以分开存储需要的时候遍历
    // console.log('根路由', Reflect.getMetadata('path', UserController))
    // console.log('全部信息', Reflect.getMetadata('handler', userService))

    // userService.postTask( 'task1', {userName: 'jack', status: 'success'}).then((res: Object) => {
    //     console.log(res);
    // });

    // userService.getByNameClass('jerry', 'class1', {data: 1}).then((res: Object) => {
    //     console.log(res);
    // });

    // userService.getOneCustom('diy111').then((res: Object) => {
    //     console.log(res);
    // });
    // userService.getOneCustom('diy22').then((res: Object) => {
    //     console.log(res);
    // });
    // userService.getOneCustom('diy3').then((res) => {
    //     console.log(res);
    // });

    userService.deleteOne('xx', 'user', { user: 'test', class: 1 });

    // userService.getByNameClass('testName1', 'class1', {date: 'xxx'})
    // userService.getByNameClass('testName2', 'class2', {date: 'yyy'})
    // userService.getByNameClass('testName2', 'class2', {date: 'yyy'})
    // userService.getByNameClass('testName2', 'class2', {date: 'yyy'})
    // userService.getByNameClass('testName2', 'class2', {date: 'yyy'})

    
}

main()