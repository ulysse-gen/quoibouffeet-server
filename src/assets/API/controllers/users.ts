import express from "express";
import bcrypt from 'bcrypt';
import db, { generateRandomIDForTable, query } from "../../utilities/db";
import _ from 'lodash';
import User from "../../classes/User";

export async function patchUser(req: express.Request, res: express.Response) {
    const targetUsername = req.params.username;
    const { username, email } = req.body;

    if (!targetUsername)return res.status(400).json({
        message: new Error('Missing username').message,
        missing: 'username'
    });

    return res.status(200).json({targetUsername, username, email});
}

export async function getUser(req: express.Request, res: express.Response) {
    const { username } = req.params;

    if (!username)return res.status(400).json({
        message: new Error('Missing username').message,
        missing: 'username'
    });

    const UserExists = await db.query('SELECT * FROM users WHERE username = ?', [username]) as Array<QuoiBouffeEt.UserData>;
    if (UserExists.length == 0)return res.status(404).json({
        message: new Error('Unknown user').message,
        error: 'noUser'
    });

    return res.status(200).json(_.omit(UserExists[0], ["id", "password"]));
}

export async function auth(req: express.Request, res: express.Response) {
    const { username, password } = req.body;

    if (!username)return res.status(400).json({
        message: new Error('Missing username').message,
        missing: 'username'
    });
    if (!password)return res.status(400).json({
        message: new Error('Missing password').message,
        missing: 'password'
    });

    const UserExists = await db.query('SELECT * FROM users WHERE username = ?', [username]) as Array<QuoiBouffeEt.UserData>;
    if (UserExists.length == 0)return res.status(404).json({
        message: new Error('Wrong username - password combo').message,
        error: 'wrongCombo'
    });
    const PasswordVerification = await bcrypt.compare(password, UserExists[0].password);
    if (!PasswordVerification)return res.status(404).json({
        message: new Error('Wrong username - password combo').message,
        error: 'wrongCombo'
    });

    const user = new User(UserExists[0]);
    const UserToken = await req.API.genToken(user);
    await user.saveToken(UserToken.tokenId);
    
    res.setHeader('Authorization', 'Bearer ' + UserToken.token);
    return res.status(200).json({
        message: 'Authentification success',
        user: {
            username: UserExists[0].username,
            token: UserToken.token
        }
    });
}

export async function register(req: express.Request, res: express.Response) {
    let { username, email, password, passwordVerify } = req.body;

    if (!email)return res.status(400).json({
        message: new Error('Missing email').message,
        missing: 'email'
    });
    if (!username)return res.status(400).json({
        message: new Error('Missing username').message,
        missing: 'username'
    });
    if (!password)return res.status(400).json({
        message: new Error('Missing password').message,
        missing: 'password'
    });
    if (!passwordVerify)return res.status(400).json({
        message: new Error('Missing password verification').message,
        missing: 'passwordVerify'
    });
    if (password != passwordVerify)return res.status(400).json({
        message: new Error('Passwords do not match').message,
        error: 'passwordMismatch'
    });

    if (username.length > 50)return res.status(400).json({
        message: new Error('Username cannot be longer than 50 chars').message,
        error: 'usernameTooLong'
    });

    if (username != username.toLowerCase())return res.status(400).json({
        message: new Error('Username can only contain lowercase').message,
        error: 'usernameHasCaps'
    });

    const NonAllowedChars_Username = ["&", "é", "~", "'", '"', "#", "{", "}", "(", ")", "[", "]", "|", "è", "`", "\\", "ç", "^", "à", "@", "°", "=", "+", "*", "/", ",", "?", ";", ":", "!", "§", "¨", "$", "£", "μ", "%", "ù", "<", ">"];

    if (username != NonAllowedChars_Username.reduce(((Accumulator, Current) => (Accumulator) ? Accumulator : username.includes(Current)), true))return res.status(400).json({
        message: new Error('Username can only certain special chars').message,
        allowedChars: [".", "-", "_"],
        error: 'usernameHasUnallowedChars'
    });

    username = username.toLowerCase();

    const UserExists = await db.query('SELECT * FROM users WHERE username = ? OR email = ?', [username, email]) as Array<QuoiBouffeEt.UserData>;
    if (UserExists.length != 0){
        if (UserExists[0].username == username)return res.status(404).json({
            message: new Error('Username already in use').message,
            error: 'usernameExists'
        });
        if (UserExists[0].email == email)return res.status(404).json({
            message: new Error('Email already in use').message,
            error: 'emailExists'
        })
    }

    const uuid = await generateRandomIDForTable('users');
    const passwordHash = await bcrypt.hash(password, 10);

    const UserQuery = await query('INSERT INTO users (id, username, email, password) VALUES (?,?,?,?)', [uuid.toString(), username, email, passwordHash]);

    return res.status(200).json({
        message: 'User created'
    });
}