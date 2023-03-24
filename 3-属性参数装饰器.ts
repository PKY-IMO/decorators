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

class TX {
    @LowerDecorator
    public title: string | undefined;
}

const obj = new TX()
obj.title = 'HHH';
console.log(obj.title);