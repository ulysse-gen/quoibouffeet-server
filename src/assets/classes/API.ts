import http from "http";
import express, { Express } from "express";
import jwt, { JsonWebTokenError } from "jsonwebtoken";
import cors from "cors";

import MainRoutes from "../API/routes";
import User from "./User";
import db from "../utilities/db";
import { randomUUID } from "crypto";
import moment from "moment";

export default class API {
    private secret!: string;

    private Router!: Express;
    private HTTPServer!: http.Server;

    private Users: Map<string, User>;
    constructor() {
        this.secret = process.env.DB_USER || "QU01B0UFF37";

        this.Users = new Map<string, User>;
    }

    async init() {
        this.Router = express();
        this.Router.use(express.urlencoded({extended: true}));
        this.Router.use(express.json());
        this.Router.use(cors({
            optionsSuccessStatus: 200
        }));

        this.Router.use((req, res, next) => {
            res.header('Access-Control-Allow-Origin', '*');
            if (req.method === 'OPTIONS') {
                res.header('Access-Control-Allow-Methods', 'GET, PUT, POST, DELETE, PATCH');
                return res.status(200).json({});
            }
            req.API = this;
            next();
        });

        this.Router.use('/', MainRoutes);
        this.Router.use('/v1', MainRoutes);

        this.Router.use((_req, res) => {
            return res.status(404).json({
                message: new Error("Not Found").message,
            });
        });

        this.HTTPServer = http.createServer(this.Router);
        return new Promise((res, _rej) => {
            this.HTTPServer.listen(process.env.API_PORT || 669, () => {
                res(console.log(`[${moment().format('DD/MM/YYYY HH:mm:ss')}] API Server listenning on port ${process.env.API_PORT || 669}`));
            })
        });
    }

    async genToken(User: User){
        const tokenId = randomUUID();
        const token = jwt.sign({userId: User.id, tokenId: tokenId}, this.secret, {
            expiresIn: '30d'
        });
        return {token, tokenId};
    }

    async verifyToken(req: express.Request, res: express.Response, next: express.NextFunction) {
        let token = (req.headers['x-access-token'] || req.headers['authorization']) as string;
        if (token && token.startsWith('Bearer ')) {
            token = token.slice(7, token.length);
            token = token.replace('Bearer ', '');
        }
    
        if (!token)return res.status(401).json({
            message: new Error('Missing Token').message
        });
    
        jwt.verify(token, this.secret, async (error: any, decoded: any) => {
            if (error)return res.status(401).json({
                message: new Error('Invalid Token').message,
                error
            });
            try {
                const jwtpayload = decoded as QuoiBouffeEt.JWTPayload;
                const userquery = await db.query(`SELECT users.*, tokens.expiresAt AS tokenExpiresAt, tokens.valid AS tokenValidity FROM users LEFT JOIN tokens ON (tokens.userId = users.id) WHERE users.id = ? AND tokens.id = ?;`, [jwtpayload.userId, jwtpayload.tokenId]) as Array<QuoiBouffeEt.UserDataWithToken>;
                if (userquery.length == 0)return res.status(401).json({
                    message: new Error('Invalid Token').message
                });
                if (!userquery[0].tokenValidity)return res.status(401).json({
                    message: new Error('Invalid Token').message
                });
                if (moment(userquery[0].tokenExpiresAt).isBefore(moment()))return res.status(401).json({
                    message: new Error('Invalid Token').message
                });
                const user = (this.Users.has(userquery[0].id)) ? await (this.Users.get(userquery[0].id) as User).Update(userquery[0]) : await new User(userquery[0]).AddToMap(this.Users);
                req.User = user;
                user.revokeTokensBut(jwtpayload.tokenId)
                const tokenIsValid = await user.IsTokenValid(token);
                if (!tokenIsValid)return res.status(401).json({
                    message: new Error('Invalid Token').message
                });
                return next();
            } catch(e) {
                return res.status(500).json({
                    message: new Error('Server Error')
                })
            }
        });
    }

    async requirePermissionLevel (requiredPermissionLevel: number) {
        return async (req: express.Request, res: express.Response, next: express.NextFunction) => {
            let userPermissionLevel = req.User.PermissionLevel;
            if (userPermissionLevel >= requiredPermissionLevel) {
                return next();
            } else {
                return res.status(403).json({
                    message: new Error('Unauthorized').message
                })
            }
        };
    }
}