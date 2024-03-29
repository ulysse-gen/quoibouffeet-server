import express from "express";
import db, { generateRandomIDForTable, query, queryTransaction } from "../../utilities/db";
import _ from 'lodash';
import Recipe from "../../classes/Recipes";

export async function createRecipe(req: express.Request, res: express.Response) {
    let { name, description, preparationTime, ingredients, steps } = req.body;
    console.log(req.body)

    if (!name)return res.status(400).json({
        message: new Error('Missing name').message,
        missing: 'name'
    });
    if (!description)return res.status(400).json({
        message: new Error('Missing description').message,
        missing: 'description'
    });
    if (!preparationTime)return res.status(400).json({
        message: new Error('Missing preparation time').message,
        missing: 'preparationTime'
    });
    if (!ingredients)return res.status(400).json({
        message: new Error('Missing ingredients').message,
        missing: 'ingredients'
    });
    if (!steps)return res.status(400).json({
        message: new Error('Missing steps').message,
        missing: 'steps'
    });

    if (name.length > 100)return res.status(400).json({
        message: new Error('Name cannot be longer than 100 chars').message,
        error: 'nameTooLong'
    });

    if (description.length > 500)return res.status(400).json({
        message: new Error('Description cannot be longer than 500 chars').message,
        error: 'descriptionTooLong'
    });

    preparationTime = parseInt(preparationTime);

    if (isNaN(preparationTime))return res.status(400).json({
        message: new Error('Preparation time is not a number').message,
        error: 'NaNPreparationTime'
    });

    const NonAllowedChars_Slug = ["&", "é", "~", "'", '"', "#", "{", "}", "(", ")", "[", "]", "|", "è", "`", "\\", "ç", "^", "à", "@", "°", "=", "+", "*", "/", ",", "?", ";", ":", "!", "§", "¨", "$", "£", "μ", "%", "ù", "<", ">"];

    const slug = NonAllowedChars_Slug.reduce(((Accumulator, Current) => Accumulator.replace(`/${Current}/g`, "")), name).toLocaleLowerCase().replace(/ /g, "_");

    const RecipeExists = await db.query('SELECT * FROM recipes_with_ingredients WHERE slug = ? OR id = ?', [slug, name]) as Array<QuoiBouffeEt.RecipeData>;
    if (RecipeExists.length != 0)return res.status(404).json({
        message: new Error('Recipe already exists').message,
        error: 'recipeExists'
    });

    /*const IngredientsParsed = JSON.parse(ingredients);
    if (IngredientsParsed.length == 0)return res.status(400).json({
        message: new Error('Cannot create a recipe with no ingredients').message,
        error: 'missingIngredients'
    });*/

    const IngredientsParsed = ingredients;
    const StepsParsed = steps;

    /*const StepsParsed = JSON.parse(steps);
    if (StepsParsed.length == 0)return res.status(400).json({
        message: new Error('Cannot create a recipe with no steps').message,
        error: 'missingSteps'
    });*/

    const IngredientsExistanceCheck = IngredientsParsed.map(async (ingredient: {slug: string, quantity: string, unit: { slug: string }}) => {
        return db.query('SELECT * FROM ingredients_with_types WHERE name = ? OR slug = ? OR id = ?', [ingredient.slug, ingredient.slug, ingredient.slug]).then(async (IngredientData: any) => {
            return (IngredientData.length == 0) ? undefined : IngredientData[0];
        })
    })
    
    const UnknownIngredient = (await Promise.all(IngredientsExistanceCheck)).findIndex(IngredientData => IngredientData == undefined);

    if (UnknownIngredient != -1)return res.status(400).json({
        message: new Error('Unknown ingredient provided').message,
        error: 'unknownIngredient',
        unknown: IngredientsParsed[UnknownIngredient]
    });

    const uuid = await generateRandomIDForTable('recipes');

    const RecipeQueries = IngredientsParsed.map((ingredient: {slug: string, quantity: string, unit: { slug: string }}) => {
        return {sql: 'INSERT INTO recipes_ingredients (recipeId, ingredientId, quantity, unitId) SELECT ?, ingredientId, ?, unitId FROM (SELECT ingredients.id AS ingredientId, 1 AS CommonID FROM ingredients WHERE ingredients.slug = ? OR ingredients.name = ? OR ingredients.id = ?) AS ingredient INNER JOIN (SELECT units.id AS unitId, 1 AS CommonID FROM units WHERE units.short = ? OR units.name = ? OR units.id = ?) AS unit', params: [uuid, ingredient.quantity, ingredient.slug, ingredient.slug, ingredient.slug, ingredient.unit.slug, ingredient.unit.slug, ingredient.unit.slug]}
    }) as Array<{sql: string, params: Array<string>}>;

    const RecipeQuery = {
        sql: 'INSERT INTO recipes (id, name, slug, description, preparationTime) VALUES (?,?,?,?,?)', params: [uuid, name, slug, description, preparationTime]
    }

    RecipeQueries.unshift(RecipeQuery);

    await queryTransaction(RecipeQueries);

    return res.status(200).json({
        message: 'Recipe created'
    });
}

export async function patchRecipe(req: express.Request, res: express.Response) {
    const recipe = req.params.username;

    if (!recipe)return res.status(400).json({
        message: new Error('Missing recipe').message,
        missing: 'recipe'
    });

    return res.status(500).send('Not implemented');
}

export async function getRecipe(req: express.Request, res: express.Response) {
    const { recipe } = req.params;

    if (!recipe)return res.status(400).json({
        message: new Error('Missing recipe').message,
        missing: 'recipe'
    });

    const RecipeExists = await db.query('SELECT * FROM recipes_with_ingredients WHERE slug = ? OR name = ? OR id = ?', [recipe,recipe,recipe]) as Array<QuoiBouffeEt.RecipeData>;
    if (RecipeExists.length == 0)return res.status(404).json({
        message: new Error('Unknown recipe').message,
        error: 'noRecipe'
    });

    const recipe_ = new Recipe(RecipeExists[0]).clientVersion;

    return res.status(200).json(recipe_);
}

export async function getAllRecipes(req: express.Request, res: express.Response) {
    const RecipeExists = await db.query('SELECT * FROM recipes_with_ingredients') as Array<QuoiBouffeEt.RecipeData>;
    if (RecipeExists.length == 0)return res.status(404).json({
        message: new Error('No recipes').message,
        error: 'noRecipes'
    });

    const recipe = RecipeExists.map(recipeData => new Recipe(recipeData).clientVersion) as Array<Recipe>;

    return res.status(200).json(recipe);
}