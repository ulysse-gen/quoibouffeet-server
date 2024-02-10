import _ from "lodash";

export default class Type {
    public id: string;
    public name: string;
    public slug: string;
    public description: string;
    constructor(TypeData: QuoiBouffeEt.TypeData){
        this.id = TypeData.id;
        this.name = TypeData.name;
        this.slug = TypeData.slug;
        this.description = TypeData.description;
    }

    get clientVersion() {
        let clientVersion: any = _.mapValues(this, (el: any) => {
            return (!el) ? undefined : (Array.isArray(el)) ? el.map((sel: any) => {
                return (sel.clientVersion) ? sel.clientVersion : sel
            }) : (el.clientVersion) ? el.clientVersion : el
        });
        clientVersion = _.omit(clientVersion, ["id"]);
        return clientVersion;
    }
}