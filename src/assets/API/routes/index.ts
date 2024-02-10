import express from "express";

var router = express.Router();

//Import other routes
import usersRoutes from './users';
import ingredientsRoutes from './ingredients';
import typesRoutes from './types';
import recipesRoutes from './recipes';

router.get('/', async (req: express.Request, res: express.Response) => {
    res.status(404).json({
        message: new Error('Not Found').message
    });
});

router.use('/users', usersRoutes);
router.use('/ingredients', ingredientsRoutes);
router.use('/types', typesRoutes);
router.use('/recipes', recipesRoutes);

export default router;