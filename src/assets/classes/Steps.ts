import _ from "lodash";

export default class Step {
    public id: string;
    public name: string;
    public description: string;
    public image: string;
    public stepTime: number;
    constructor(TypeData: QuoiBouffeEt.StepData){
        this.id = TypeData.id;
        this.name = TypeData.name;
        this.description = TypeData.description;
        this.image = TypeData.image;
        this.stepTime = (isNaN(parseInt(TypeData.stepTime))) ? 0 : parseInt(TypeData.stepTime);
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