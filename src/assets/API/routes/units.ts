import express from "express";

import { PermissionLevel, requirePermissionLevel, verifyToken } from "../middlewares/security";
import { createUnit, getUnit, patchUnit, getAllUnits } from "../controllers/units";

var router = express.Router();

router.get('/', async (req: express.Request, res: express.Response) => {
    res.status(404).json({
        message: new Error('Not Found').message
    });
});

router.post('/create', verifyToken, requirePermissionLevel(PermissionLevel.MOD), createUnit);

router.patch('/@:unit', verifyToken, requirePermissionLevel(PermissionLevel.MOD), patchUnit);

router.get('/@:unit', verifyToken, getUnit);
router.get('/*', verifyToken, getAllUnits);

export default router;