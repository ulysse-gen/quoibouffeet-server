CREATE VIEW `recipes_with_ingredients` AS
WITH recipes_grouped AS (
	SELECT DISTINCT recipes.*, JSON_OBJECT('id', ingredients_with_types.id, 'name', ingredients_with_types.name, 'slug', ingredients_with_types.slug, 'description', ingredients_with_types.description, 'image', ingredients_with_types.image, 'types', ingredients_with_types.types) AS ingredients
    FROM recipes
    LEFT JOIN recipes_ingredients ON (recipes_ingredients.recipeId = recipes.id)
    LEFT JOIN ingredients_with_types ON (ingredients_with_types.id = recipes_ingredients.ingredientId)
    GROUP BY recipes.id, ingredients_with_types.id, ingredients_with_types.types
)
SELECT DISTINCT recipes.id, recipes.name, recipes.slug, recipes.description, recipes.preparationTime, JSON_ARRAYAGG(recipes.ingredients) OVER (PARTITION BY recipes.id) AS ingredients
FROM recipes_grouped AS recipes
GROUP BY recipes.id, recipes.ingredients;