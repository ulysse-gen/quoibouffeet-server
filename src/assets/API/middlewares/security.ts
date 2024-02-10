import express from "express";

export const PermissionLevel = {
    'SYSTEM': 500,
    'DEV': 250,
    'ADMIN': 100,
    'MOD': 50,
    'USER': 10
}

export function requirePermissionLevel (requiredPermissionLevel: number) {
    return async (req: express.Request, res: express.Response, next: express.NextFunction) => {
        let userPermissionLevel = req.User.permissionLevel;
        if (userPermissionLevel >= requiredPermissionLevel) {
            return next();
        } else {
            return res.status(403).json({
                message: new Error('Permission denied').message
            });
        }
    };
}

export function verifyToken (req: express.Request, res: express.Response, next: express.NextFunction) { return req.API.verifyToken(req, res, next); }