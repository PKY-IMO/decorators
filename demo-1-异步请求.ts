const RequestDecorator = 
    (url: string): MethodDecorator => 
    (target: Object, propertyKey: string | symbol, descriptor: PropertyDescriptor) => {
        const method = descriptor.value;
        // axios.get(url).then()
        new Promise(resolve => {
            setTimeout(() => {
                resolve([{name: '1'}, {name: '2'}]);
            },2000);
        }).then((res) => {
            method(res);
        })
    }



class NetWork {
    @RequestDecorator('https://www.houdunren.com/api/user')
    public all(users: any[]) {
        console.log(users);
    }
}