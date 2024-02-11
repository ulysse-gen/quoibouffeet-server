import _ from "lodash";
import Type from "./Types";
import Unit from "./Units";

export default class Ingredient {
    public id: string;
    public name: string;
    public slug: string;
    public description: string;
    public image: string;
    public types: Array<Type>;
    public quantity?: number;
    public unit?: Unit;
    constructor(IngredientData: QuoiBouffeEt.IngredientData) {
        this.id = IngredientData.id;
        this.name = IngredientData.name;
        this.slug = IngredientData.slug;
        this.description = IngredientData.description;
        this.image = IngredientData.image;
        this.types = TypesFromDB(IngredientData);
        if (IngredientData.quantity)this.quantity = IngredientData.quantity;
        if (IngredientData.unit)this.unit = new Unit(IngredientData.unit);
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

function TypesFromDB(IngredientData: QuoiBouffeEt.IngredientData): Array<Type> {
    var Types: string | Array<Type> | Array<String> = IngredientData.types;
    try {
        if (typeof Types == "string") {
            Types = JSON.parse(Types);
        }
        if (Array.isArray(Types)){
            if (Types.length == 0)return [];
            if (Types[0] instanceof Ingredient)return Types as Array<Type>;
            if (typeof Types[0] == "string")Types = Types.map((Type: any) => JSON.parse(Type));
            if (typeof Types[0] == "object")Types = Types.map((TypeData: any) => new Type(TypeData));
        }
    } catch(e) {
        return [];
    }
    return (Types as Array<Type>).filter(type => type.id && type.name && type.slug);
}