import express from "express";

import { auth, register, getUser, patchUser } from "../controllers/users";
import { PermissionLevel, requirePermissionLevel, verifyToken } from "../middlewares/security";
import { getMyself } from "../middlewares/utilities";

var router = express.Router();

router.get('/', async (req: express.Request, res: express.Response) => {
    res.status(404).json({
        message: new Error('Not Found').message
    });
});

router.post('/register', register);
router.post('/auth', auth);

router.patch('/@me', verifyToken, getMyself, patchUser);
router.patch('/@:username', verifyToken, requirePermissionLevel(PermissionLevel.MOD), patchUser);

router.get('/@me', verifyToken, getMyself, getUser);
router.get('/@:username', verifyToken, requirePermissionLevel(PermissionLevel.MOD), getUser);

export default router;