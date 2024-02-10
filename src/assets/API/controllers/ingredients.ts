import express from "express";
import db, { generateRandomIDForTable, query, queryTransaction } from "../../utilities/db";
import _ from 'lodash';
import Ingredient from "../../classes/Ingredients";

export async function createIngredient(req: express.Request, res: express.Response) {
    let { name, description, type, image } = req.body;

    if (!name)return res.status(400).json({
        message: new Error('Missing name').message,
        missing: 'name'
    });
    if (!description)return res.status(400).json({
        message: new Error('Missing description').message,
        missing: 'description'
    });
    if (!type)return res.status(400).json({
        message: new Error('Missing type').message,
        missing: 'type'
    });
    if (!image)return res.status(400).json({
        message: new Error('Missing image').message,
        missing: 'image'
    });

    if (name.length > 100)return res.status(400).json({
        message: new Error('Name cannot be longer than 100 chars').message,
        error: 'nameTooLong'
    });

    if (description.length > 500)return res.status(400).json({
        message: new Error('Description cannot be longer than 500 chars').message,
        error: 'descriptionTooLong'
    });

    const NonAllowedChars_Slug = ["&", "é", "~", "'", '"', "#", "{", "}", "(", ")", "[", "]", "|", "è", "`", "\\", "ç", "^", "à", "@", "°", "=", "+", "*", "/", ",", "?", ";", ":", "!", "§", "¨", "$", "£", "μ", "%", "ù", "<", ">"];

    const slug = NonAllowedChars_Slug.reduce(((Accumulator, Current) => Accumulator.replace(`/${Current}/g`, "")), name).toLocaleLowerCase().replace(/ /g, "_");

    const IngredientExists = await db.query('SELECT * FROM ingredients_with_types WHERE name = ? OR slug = ? OR id = ?', [name, slug, name]) as Array<QuoiBouffeEt.UserData>;
    if (IngredientExists.length != 0)return res.status(404).json({
        message: new Error('Ingredient already exists').message,
        error: 'ingredientExists'
    });

    const typeSlug = NonAllowedChars_Slug.reduce(((Accumulator, Current) => Accumulator.replace(`/${Current}/g`, "")), type).toLocaleLowerCase().replace(/ /g, "_");

    const TypeExists = await db.query('SELECT * FROM types WHERE name = ? OR slug = ? OR id = ?', [type, typeSlug, type]) as Array<QuoiBouffeEt.UserData>;
    if (TypeExists.length == 0)return res.status(404).json({
        message: new Error('Unknown type').message,
        error: 'unknownType'
    });

    const uuid = await generateRandomIDForTable('ingredients');

    const IngredientQueries = [
        {sql: 'INSERT INTO ingredients (id, name, slug, description, image) VALUES (?,?,?,?,?)', params: [uuid.toString(), name, slug, description, image]},
        {sql: 'INSERT INTO ingredients_types (ingredientId, typeId) SELECT id, ? FROM ingredients WHERE slug = ?', params: [TypeExists[0].id, slug]}
    ]

    await queryTransaction(IngredientQueries);

    return res.status(200).json({
        message: 'Ingredient created'
    });
}

export async function patchIngredient(req: express.Request, res: express.Response) {
    const ingredient = req.params.username;

    if (!ingredient)return res.status(400).json({
        message: new Error('Missing ingredient').message,
        missing: 'ingredient'
    });

    return res.status(500).send('Not implemented');
}

export async function getIngredient(req: express.Request, res: express.Response) {
    const { ingredient } = req.params;

    if (!ingredient)return res.status(400).json({
        message: new Error('Missing ingredient').message,
        missing: 'ingredient'
    });

    const IngredientExists = await db.query('SELECT * FROM ingredients_with_types WHERE slug = ? OR name = ? OR id = ?', [ingredient,ingredient,ingredient]) as Array<QuoiBouffeEt.IngredientData>;
    if (IngredientExists.length == 0)return res.status(404).json({
        message: new Error('Unknown ingredient').message,
        error: 'noIngredient'
    });

    const Ingredients = IngredientExists.map(ingredient => new Ingredient(ingredient))[0].clientVersion;

    return res.status(200).json(Ingredients);
}

export async function getAllIngredient(req: express.Request, res: express.Response) {
    const IngredientExists = await db.query('SELECT * FROM ingredients_with_types') as Array<QuoiBouffeEt.IngredientData>;
    if (IngredientExists.length == 0)return res.status(404).json({
        message: new Error('No ingredients').message,
        error: 'noIngredients'
    });

    const Ingredients = IngredientExists.map(ingredient => new Ingredient(ingredient).clientVersion);

    return res.status(200).json(Ingredients);
}