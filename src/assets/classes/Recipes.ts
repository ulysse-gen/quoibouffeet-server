import _ from "lodash";
import Ingredient from "./Ingredients";
import Type from "./Types";
import Step from "./Steps";

export default class Recipe {
    public id: string;
    public name: string;
    public slug: string;
    public description: string;
    public preparationTime: number;
    public ingredients: Array<Ingredient>;
    public steps: Array<Step>;
    public types: Array<Type>;
    public image: string;
    constructor(RecipeData: QuoiBouffeEt.RecipeData) {
        this.id = RecipeData.id;
        this.name = RecipeData.name;
        this.slug = RecipeData.slug;
        this.description = RecipeData.description;
        this.preparationTime = RecipeData.preparationTime;
        this.ingredients = IngredientsFromDB(RecipeData);
        this.steps = StepsFromDB(RecipeData);
        this.types = this._types;
        this.image = RecipeData.image;
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

    get _types() {
        const IngredientsTypes = this.ingredients.map(ingredient => ingredient.types).flat();
        return _.uniq(IngredientsTypes);
    }
}

function IngredientsFromDB(RecipeData: QuoiBouffeEt.RecipeData): Array<Ingredient> {
    var Ingredients: string | Array<Ingredient> | Array<String> = RecipeData.ingredients;
    try {
        if (typeof Ingredients == "string") {
            Ingredients = JSON.parse(Ingredients);
        }
        if (Array.isArray(Ingredients)){
            if (Ingredients.length == 0)return [];
            if (Ingredients[0] instanceof Ingredient)return Ingredients as Array<Ingredient>;
            if (typeof Ingredients[0] == "string")Ingredients = Ingredients.map((Ingredient: any) => JSON.parse(Ingredient));
            if (typeof Ingredients[0] == "object")Ingredients = Ingredients.map((IngredientData: any) => new Ingredient(IngredientData));
        }
    } catch(e) {
        return [];
    }
    return (Ingredients as Array<Ingredient>).filter(ingredient => ingredient.id && ingredient.name && ingredient.slug);
}

function StepsFromDB(StepData: QuoiBouffeEt.RecipeData): Array<any> {
    var Steps: string | Array<any> | Array<String> = StepData.steps;
    try {
        if (typeof Steps == "string") {
            Steps = JSON.parse(Steps);
        }
        if (Array.isArray(Steps)){
            if (Steps.length == 0)return [];
            if (Steps[0] instanceof Ingredient)return Steps as Array<Type>;
            if (typeof Steps[0] == "string")Steps = Steps.map((Step: any) => JSON.parse(Step));
            if (typeof Steps[0] == "object")Steps = Steps.map((StepData: any) => new Step(StepData));
        }
    } catch(e) {
        return [];
    }
    return (Steps as Array<Type>).filter(step => step.id && step.description);
}