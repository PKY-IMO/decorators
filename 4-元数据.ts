import 'reflect-metadata'

let Meta = {
    name: "prevName",
}

Reflect.defineMetadata('data', { metaName: 'xx' }, Meta, 'name');

console.log(Reflect.getMetadata('data', Meta, 'name'));