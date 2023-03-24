import { getMultiPath } from "./demo";

class ExampleModel {
    static xtype = "bi.decorator.example"
    private keyword = '';
    private relations = '';
    private tablePositionMap = '';

    actions = {
        setKeyWord: (v: string) => {
            this.keyword = v;
        },
        getData: () => {
            getMultiPath().then(res => {
                const data = res.data;
                this.relations = data.relations;
                this.tablePositionMap = data.tablePositionMap || {};
            });
        },
    };
}