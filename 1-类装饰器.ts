const moveDecorator: ClassDecorator = (target: Function) => {
    target.prototype.getPosition = () => {
        return 'position';
    }
    target.prototype.testName = 'test';
}


@moveDecorator
class Tank {

}

const tank1 = new Tank();
console.log((<any>tank1).testName);



// 装饰器本质: 语法糖
// class Tank {
// }

// const tank1 = new Tank();
// moveDecorator(Tank)

