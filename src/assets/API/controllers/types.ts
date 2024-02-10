import express from "express";
import db, { generateRandomIDForTable, query, queryTransaction } from "../../utilities/db";
import _ from 'lodash';
import Ingredient from "../../classes/Ingredients";
import Type from "../../classes/Types";

export async function createType(req: express.Request, res: express.Response) {
    let { name, description } = req.body;

    if (!name)return res.status(400).json({
        message: new Error('Missing name').message,
        missing: 'name'
    });
    if (!description)return res.status(400).json({
        message: new Error('Missing description').message,
        missing: 'description'
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

    const TypeExists = await db.query('SELECT * FROM types WHERE name = ? OR slug = ? OR id = ?', [name, slug, name]) as Array<QuoiBouffeEt.UserData>;
    if (TypeExists.length != 0)return res.status(404).json({
        message: new Error('Type already exists').message,
        error: 'typeExists'
    });

    const uuid = await generateRandomIDForTable('types');

    await db.query(`INSERT INTO types (id, name, slug, description) VALUES (?,?,?,?)`, [uuid, name, slug, description]);

    return res.status(200).json({
        message: 'Type created'
    });
}

export async function patchType(req: express.Request, res: express.Response) {
    const type = req.params.username;

    if (!type)return res.status(400).json({
        message: new Error('Missing type').message,
        missing: 'type'
    });

    return res.status(500).send('Not implemented');
}

export async function getType(req: express.Request, res: express.Response) {
    const { type } = req.params;

    if (!type)return res.status(400).json({
        message: new Error('Missing type').message,
        missing: 'type'
    });

    const TypeExists = await db.query('SELECT * FROM types WHERE slug = ? OR name = ? OR id = ?', [type, type, type]) as Array<QuoiBouffeEt.TypeData>;
    if (TypeExists.length == 0)return res.status(404).json({
        message: new Error('Unknown type').message,
        error: 'noType'
    });

    const type_ = TypeExists.map(typedata => new Type(typedata).clientVersion) as Array<Type>;

    return res.status(200).json(type_);
}

export async function getTypeIngredients(req: express.Request, res: express.Response) {
    const { type } = req.params;

    if (!type)return res.status(400).json({
        message: new Error('Missing type').message,
        missing: 'type'
    });

    const TypeExists = await db.query('SELECT * FROM types WHERE slug = ? OR name = ? OR id = ?', [type, type, type]) as Array<QuoiBouffeEt.TypeData>;
    if (TypeExists.length == 0)return res.status(404).json({
        message: new Error('Unknown type').message,
        error: 'noType'
    });

    const TypeIngredients = await db.query('SELECT ingredients_with_types.* FROM ingredients_with_types LEFT JOIN ingredients_types ON (ingredients_types.ingredientId = ingredients_with_types.id) LEFT JOIN types ON (types.id = ingredients_types.typeId) WHERE types.slug = ? OR types.name = ? OR types.id = ?;', [type, type, type]) as Array<QuoiBouffeEt.IngredientData>;

    const Ingredients = TypeIngredients.map(ingredient => new Ingredient(ingredient).clientVersion);

    return res.status(200).json(Ingredients);
}

export async function getAllTypes(req: express.Request, res: express.Response) {
    const TypeExists = await db.query('SELECT * FROM types') as Array<QuoiBouffeEt.TypeData>;
    if (TypeExists.length == 0)return res.status(404).json({
        message: new Error('No types').message,
        error: 'noTypes'
    });

    const type = TypeExists.map(typedata => new Type(typedata).clientVersion) as Array<Type>;

    return res.status(200).json(type);
}