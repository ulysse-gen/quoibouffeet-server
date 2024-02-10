import express from "express";

export function getMyself(req: express.Request, res: express.Response, next: express.NextFunction) {
    req.params.username = req.User.username;
    req.body.username = req.User.username;
    next();
}