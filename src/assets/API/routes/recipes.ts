import express from "express";

import { PermissionLevel, requirePermissionLevel, verifyToken } from "../middlewares/security";
import { createRecipe, getAllRecipes, getRecipe, patchRecipe } from "../controllers/recipes";

var router = express.Router();

router.get('/', async (req: express.Request, res: express.Response) => {
    res.status(404).json({
        message: new Error('Not Found').message
    });
});

router.post('/create', verifyToken, requirePermissionLevel(PermissionLevel.MOD), createRecipe);

router.patch('/@:recipe', verifyToken, requirePermissionLevel(PermissionLevel.MOD), patchRecipe);

router.get('/@:recipe', verifyToken, getRecipe);
router.get('/*', verifyToken, getAllRecipes);

export default router;