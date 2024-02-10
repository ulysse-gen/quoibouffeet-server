CREATE VIEW `ingredients_with_types` AS
-- ingredients_with_types
WITH types_grouped AS (
	SELECT DISTINCT ingredients.*, JSON_OBJECT('id', types.id, 'name', types.name, 'slug', types.slug, 'description', types.description) AS ingredientType
    FROM ingredients
    LEFT JOIN ingredients_types ON (ingredients_types.ingredientId = ingredients.id)
    LEFT JOIN types ON (ingredients_types.typeId = types.id)
    GROUP BY ingredients.id, types.id
)
SELECT DISTINCT ingredients.id, ingredients.name, ingredients.slug, ingredients.description, ingredients.image, JSON_ARRAYAGG(ingredients.ingredientType) OVER (PARTITION BY ingredients.id) AS types
FROM types_grouped AS ingredients
GROUP BY ingredients.ingredientType, ingredients.id;