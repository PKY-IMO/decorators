import 'reflect-metadata'

const RequiredParam: ParameterDecorator = 
    (target: Object, methodName: string | symbol, parameterIndex: number) => {
        // 需要验证的参数
        let requiredParamIndexes: number[] = []
        requiredParamIndexes.push(parameterIndex);

        Reflect.defineMetadata('required', requiredParamIndexes, target, methodName);
    }

const validate: MethodDecorator = 
    (target: Object, propertyKey: string | symbol, descriptor: PropertyDescriptor) => {
        const { value: method } = descriptor
        descriptor.value = function() {
            const requireParams:number[] = Reflect.getMetadata('required', target, propertyKey) || [];
            requireParams.forEach(index => {
                if(index > arguments.length || arguments[index] === undefined) {
                    throw new Error('请传递必要的参数')
                }
            })
            return method.apply(this, arguments);
        }
    
    }
class Client {
    @validate
    find(name: string, @RequiredParam id: number) {
        console.log(id);
    }
}

new Client().find('xx', 21);