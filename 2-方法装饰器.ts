/**
 * 方法装饰器
 * @param target 
 * @param propertyKey 
 * @param descriptor 
 */
const showDecorator: MethodDecorator = (target: Object, propertyKey: string | symbol, descriptor: PropertyDescriptor) => {
    descriptor.value = () => {
        console.log('new');
    }
}

class User {
    @showDecorator
    public show() {
        console.log('old normal');
    }
}

// 数据属性 基本情况
// 数据属性包含一个数据值的位置。在这个位置可以读取和写入值。共有四个描述其行为的特征:
// [[Configurable]]：配置，表示能否删除修改属性的特性，或者把属性修改为访问器属性。默认false
// [[Enumerable]]：枚举，表示能否通过for-in循环返回属性。默认false
// [[Writable]]：可写，表示能否修改属性值。默认false
// [[Value]]：属性的数据值。读写属性值从该位置。默认undefined

// 装饰器内部的 descriptor
// value: Function
// writable: true
// enumerable: true
// configurable: true

class Player {
    @showDecorator
    public static show() {
        console.log('old static');
    }
}

// 普通方法
new User().show()
// 静态方法
Player.show()


const highLightDecorator: MethodDecorator = (target: Object, propertyKey: string | symbol, descriptor: PropertyDescriptor) => {
    const method = descriptor.value;
    descriptor.value = () => {
        return `--${method()}--`;
    }
}

const suffixDecorator = 
    (content: string): MethodDecorator => 
    (target: Object, propertyKey: string | symbol, descriptor: PropertyDescriptor) => {
        // const [,,descrniptor] = args;
        const method = descriptor.value;
        descriptor.value = () => {
            console.log(`${method()}-${content}`)
        }
    }

class Demo {
    @highLightDecorator
    public getText() {
        return '文本';
    }

    @suffixDecorator('suffix')
    public getName() {
        return "name1";
    }
}

console.log(new Demo().getText())
new Demo().getName()

// 奇怪技巧
// document.body.insertAdjacentHTML('beforeend', new Demo().getText());
// console.log(`%c输出`, 'color:green;font-size:30px;');

