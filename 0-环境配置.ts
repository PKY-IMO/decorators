function decorator(target: object) {

}

@decorator
class Hd {

}

// tsc --init
// 开始 decorator 配置
// tsc -w 自动编译

// 类装饰器：一个入参：类的构造函数

// 方法装饰器：三个入参
//     target: 
//         普通方法-类的实例/原型对象
//         静态方法-类的构造函数
//     propertyKey: 方法名称
//     descriptor: 描述

// 属性装饰器：两个入参
//     target: 
//         普通属性-类的实例/原型对象
//         静态属性-类的构造函数
//     propertyKey: 属性名称

// 参数装饰器：三个入参
//     target: 
//         普通方法-类的实例
//         静态方法-类的构造函数
//     methodName: 方法名称
//     parameterIndex: 参数顺序