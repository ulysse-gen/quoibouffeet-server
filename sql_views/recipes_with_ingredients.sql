CREATE VIEW `recipes_with_ingredients` AS
WITH steps_obj AS (
    SELECT DISTINCT recipe.id AS recipeId, JSON_OBJECT('id', steps.id, 'name', steps.name, 'description', steps.description, 'image', steps.image, 'stepTime', steps.stepTime) AS steps
    FROM recipes AS recipe
    LEFT JOIN steps ON (steps.recipeId = recipe.id)
    GROUP BY recipe.id, steps.id
), ingredients_obj AS (
    SELECT DISTINCT recipe.id AS recipeId, JSON_OBJECT('quantity', recipes_ingredients.quantity, 'id', ingredients_with_types.id, 'name', ingredients_with_types.name, 'slug', ingredients_with_types.slug, 'description', ingredients_with_types.description, 'image', ingredients_with_types.image, 'types', ingredients_with_types.types, 'unit', JSON_OBJECT("id", units.id, "name", units.name, "slug", units.slug, "short", units.short)) AS ingredients
    FROM recipes AS recipe
    LEFT JOIN recipes_ingredients ON (recipes_ingredients.recipeId = recipe.id)
    LEFT JOIN ingredients_with_types ON (ingredients_with_types.id = recipes_ingredients.ingredientId)
    LEFT JOIN units ON (units.id = recipes_ingredients.unitId)
    GROUP BY recipe.id, recipes_ingredients.ingredientId, ingredients_with_types.id, ingredients_with_types.types
), steps_arr AS (
    SELECT DISTINCT steps.recipeId, JSON_ARRAYAGG(steps.steps) OVER (PARTITION BY steps.recipeId) AS steps
    FROM steps_obj AS steps
    GROUP BY steps.recipeId, steps.steps
), ingredients_arr AS (
    SELECT DISTINCT ingredients.recipeId, JSON_ARRAYAGG(ingredients.ingredients) OVER (PARTITION BY ingredients.recipeId) AS ingredients
    FROM ingredients_obj AS ingredients
    GROUP BY ingredients.recipeId, ingredients.ingredients
)
SELECT DISTINCT recipe.*, ingredients.ingredients, steps.steps
FROM recipes AS recipe
LEFT JOIN ingredients_arr AS ingredients ON (ingredients.recipeId = recipe.id)
LEFT JOIN steps_arr AS steps ON (steps.recipeId = recipe.id);