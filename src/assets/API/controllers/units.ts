import express from "express";
import db, { generateRandomIDForTable, query, queryTransaction } from "../../utilities/db";
import _ from 'lodash';
import Ingredient from "../../classes/Ingredients";
import Type from "../../classes/Types";
import Unit from "../../classes/Units";

export async function createUnit(req: express.Request, res: express.Response) {
    let { name, short } = req.body;

    if (!name)return res.status(400).json({
        message: new Error('Missing name').message,
        missing: 'name'
    });
    if (!short)return res.status(400).json({
        message: new Error('Missing short').message,
        missing: 'short'
    });

    if (name.length > 100)return res.status(400).json({
        message: new Error('Name cannot be longer than 100 chars').message,
        error: 'nameTooLong'
    });

    if (short.length > 20)return res.status(400).json({
        message: new Error('Shorts cannot be longer than 25 chars').message,
        error: 'shortTooLong'
    });

    const NonAllowedChars_Slug = ["&", "é", "~", "'", '"', "#", "{", "}", "(", ")", "[", "]", "|", "è", "`", "\\", "ç", "^", "à", "@", "°", "=", "+", "*", "/", ",", "?", ";", ":", "!", "§", "¨", "$", "£", "μ", "%", "ù", "<", ">"];

    const slug = NonAllowedChars_Slug.reduce(((Accumulator, Current) => Accumulator.replace(`/${Current}/g`, "")), name).toLocaleLowerCase().replace(/ /g, "_");

    const TypeExists = await db.query('SELECT * FROM units WHERE name = ? OR slug = ? OR id = ?', [name, slug, name]) as Array<QuoiBouffeEt.UnitData>;
    if (TypeExists.length != 0)return res.status(404).json({
        message: new Error('Unit already exists').message,
        error: 'unitExists'
    });

    const uuid = await generateRandomIDForTable('types');

    await db.query(`INSERT INTO units (id, name, slug, short) VALUES (?,?,?,?)`, [uuid, name, slug, short]);

    return res.status(200).json({
        message: 'Type created'
    });
}

export async function patchUnit(req: express.Request, res: express.Response) {
    const type = req.params.username;

    if (!type)return res.status(400).json({
        message: new Error('Missing unit').message,
        missing: 'unit'
    });

    return res.status(500).send('Not implemented');
}

export async function getUnit(req: express.Request, res: express.Response) {
    const { unit } = req.params;

    if (!unit)return res.status(400).json({
        message: new Error('Missing unit').message,
        missing: 'unit'
    });

    const UnitExists = await db.query('SELECT * FROM units WHERE slug = ? OR name = ? OR id = ?', [unit, unit, unit]) as Array<QuoiBouffeEt.UnitData>;
    if (UnitExists.length == 0)return res.status(404).json({
        message: new Error('Unknown unit').message,
        error: 'noUnit'
    });

    const unit_ = UnitExists.map(unitdata => new Unit(unitdata).clientVersion) as Array<Unit>;

    return res.status(200).json(unit_);
}

export async function getAllUnits(req: express.Request, res: express.Response) {
    const UnitExists = await db.query('SELECT * FROM units') as Array<QuoiBouffeEt.UnitData>;
    if (UnitExists.length == 0)return res.status(404).json({
        message: new Error('No units').message,
        error: 'noUnit'
    });

    const unit = UnitExists.map(unitdata => new Unit(unitdata).clientVersion) as Array<Unit>;

    return res.status(200).json(unit);
}