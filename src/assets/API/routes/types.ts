import express from "express";

import { PermissionLevel, requirePermissionLevel, verifyToken } from "../middlewares/security";
import { createType, getType, patchType, getTypeIngredients, getAllTypes } from "../controllers/types";

var router = express.Router();

router.get('/', async (req: express.Request, res: express.Response) => {
    res.status(404).json({
        message: new Error('Not Found').message
    });
});

router.post('/create', verifyToken, requirePermissionLevel(PermissionLevel.MOD), createType);

router.patch('/@:type', verifyToken, requirePermissionLevel(PermissionLevel.MOD), patchType);

router.get('/@:type', verifyToken, getType);
router.get('/@:type/ingredients', verifyToken, getTypeIngredients);
router.get('/*', verifyToken, getAllTypes);

export default router;