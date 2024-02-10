import express from "express";

import { PermissionLevel, requirePermissionLevel, verifyToken } from "../middlewares/security";
import { createIngredient, getAllIngredient, getIngredient, patchIngredient } from "../controllers/ingredients";

var router = express.Router();

router.get('/', async (req: express.Request, res: express.Response) => {
    res.status(404).json({
        message: new Error('Not Found').message
    });
});

router.post('/create', verifyToken, requirePermissionLevel(PermissionLevel.MOD), createIngredient);

router.patch('/@:ingredient', verifyToken, requirePermissionLevel(PermissionLevel.MOD), patchIngredient);

router.get('/@:ingredient', verifyToken, getIngredient);
router.get('/*', verifyToken, getAllIngredient);

export default router;