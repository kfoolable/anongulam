const express = require("express");
const { Pool } = require("pg");
const multer = require("multer");
const path = require("path");
const fs = require("fs-extra");

const app = express();
const upload = multer({ dest: "uploads/" });
const PORT = 3000;

const bodyParser = require("body-parser");

// Use body-parser middleware to parse incoming request bodies
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// PostgreSQL connection pool (replace with your actual database connection details)
const pool = new Pool({
  user: "postgres",
  host: "localhost",
  database: "db_first",
  password: "somer",
  port: 5433, // Default PostgreSQL port
  // Use the built-in array parser
  arrayMode: "string",
});

// Registration endpoint
/*app.post("/register", (req, res) => {
  console.log("Received registration request:", req.body);
  const { name, email, password, diet_preference, food_restrictions } =
    req.body;

  // Basic input validation
  if (!name || !email || !password || !diet_preference) {
    return res
      .status(400)
      .json({ error: "Please fill in all the required fields." });
  }

  // Check if the email is already registered (assuming you have a 'users' table with an 'email' column)
  const checkEmailQuery = "SELECT * FROM users WHERE email = $1";
  const checkEmailValue = [email];

  pool.query(checkEmailQuery, checkEmailValue, (err, result) => {
    if (err) {
      console.error("Error checking email:", err);
      return res.status(500).json({ error: "Error checking email" });
    }

    if (result.rows.length > 0) {
      return res
        .status(409)
        .json({ error: "Email already exists. Please use a different email." });
    }

    // Generate the current date
    const currentDate = new Date();

    // Prepare food_restrictions to insert as an array or null
    const foodRestrictionsToSend =
      Array.isArray(food_restrictions) && food_restrictions.length > 0
        ? food_restrictions
        : [food_restrictions];

    // Insert user's information into the 'users' table, including the registration_date
    const insertUserQuery =
      "INSERT INTO users (name, email, password, diet_preference, food_restrictions, registration_date) VALUES ($1, $2, $3, $4, $5, $6) RETURNING user_id";
    const insertUserValues = [
      name,
      email,
      password,
      diet_preference,
      foodRestrictionsToSend,
      currentDate,
    ];

    pool.query(insertUserQuery, insertUserValues, (err, userResult) => {
      if (err) {
        console.error("Error inserting user:", err);
        return res.status(500).json({ error: "Error inserting user" });
      }

      const user_id = userResult.rows[0].user_id;

      // Insert user's diet_preference into the 'user_diet_preference' table
      const insertPreferenceQuery =
        "INSERT INTO user_diet_preference (user_id, preference_id) VALUES ($1, (SELECT preference_id FROM diet_preference WHERE preference_name = $2))";
      const insertPreferenceValues = [user_id, diet_preference];

      pool.query(insertPreferenceQuery, insertPreferenceValues, (err) => {
        if (err) {
          console.error("Error inserting user diet_preference:", err);
          return res
            .status(500)
            .json({ error: "Error inserting user diet_preference" });
        }

        // Insert user's food_restrictions into the 'user_food_restrictions' table
        if (
          food_restrictions.length > 0 &&
          !food_restrictions.includes("None")
        ) {
          // Fetch the restriction IDs from the 'food_restrictions' table
          const fetchRestrictionIdsQuery =
            "SELECT restriction_id FROM food_restrictions WHERE restriction_name = ANY($1)";
          const fetchRestrictionIdsValues = [food_restrictions];

          pool.query(
            fetchRestrictionIdsQuery,
            fetchRestrictionIdsValues,
            (err, restrictionIdsResult) => {
              if (err) {
                console.error("Error fetching restriction_ids:", err);
                return res
                  .status(500)
                  .json({ error: "Error fetching restriction_ids" });
              }

              // Get an array of restriction IDs for the user
              const restriction_ids = restrictionIdsResult.rows.map(
                (row) => row.restriction_id
              );

              // Insert user's food_restrictions into the 'user_food_restrictions' table
              const insertRestrictionsQuery =
                "INSERT INTO user_food_restrictions (user_id, restriction_id) VALUES ($1, $2)";

              // Use a loop to insert each restriction separately
              restriction_ids.forEach((restriction_id) => {
                const insertRestrictionsValues = [user_id, restriction_id];
                pool.query(
                  insertRestrictionsQuery,
                  insertRestrictionsValues,
                  (err) => {
                    if (err) {
                      console.error(
                        "Error inserting user food_restrictions:",
                        err
                      );
                      return res.status(500).json({
                        error: "Error inserting user food_restrictions",
                      });
                    }
                  }
                );
              });

              // Return success response
              return res.json({ message: "User registered successfully" });
            }
          );
        } else {
          // When there are no food_restrictions or 'None' is present, insert NULL into the 'user_food_restrictions' table
          const insertRestrictionsQuery =
            "INSERT INTO user_food_restrictions (user_id, restriction_id) VALUES ($1, NULL)";
          const insertRestrictionsValues = [user_id];
          pool.query(
            insertRestrictionsQuery,
            insertRestrictionsValues,
            (err) => {
              if (err) {
                console.error("Error inserting user food_restrictions:", err);
                return res
                  .status(500)
                  .json({ error: "Error inserting user food_restrictions" });
              }

              // Return success response
              return res.json({ message: "User registered successfully" });
            }
          );
        }
      });
    });
  });
});*/

app.post("/register", async (req, res) => {
  console.log("Received registration request:", req.body);
  const { name, email, password, diet_preference, food_restrictions } =
    req.body;

  // Basic input validation
  if (!name || !email || !password || !diet_preference) {
    return res
      .status(400)
      .json({ error: "Please fill in all the required fields." });
  }

  // Check if the email is already registered (assuming you have a 'users' table with an 'email' column)
  const checkEmailQuery = "SELECT * FROM users WHERE email = $1";
  const checkEmailValue = [email];

  try {
    const emailResult = await pool.query(checkEmailQuery, checkEmailValue);
    if (emailResult.rows.length > 0) {
      return res
        .status(409)
        .json({ error: "Email already exists. Please use a different email." });
    }

    // Generate the current date
    const currentDate = new Date();

    // Prepare food_restrictions to insert as an array or null
    const foodRestrictionsToSend =
      Array.isArray(food_restrictions) && food_restrictions.length > 0
        ? food_restrictions
        : [food_restrictions];

    // Insert user's information into the 'users' table, including the registration_date
    const insertUserQuery =
      "INSERT INTO users (name, email, password, diet_preference, food_restrictions, registration_date) VALUES ($1, $2, $3, $4, $5, $6) RETURNING user_id";
    const insertUserValues = [
      name,
      email,
      password,
      diet_preference,
      foodRestrictionsToSend,
      currentDate,
    ];

    const userResult = await pool.query(insertUserQuery, insertUserValues);
    const user_id = userResult.rows[0].user_id;

    // Return success response
    return res.json({ message: "User registered successfully" });
  } catch (error) {
    console.error("Error registering user:", error);
    return res
      .status(500)
      .json({ error: "An error occurred while registering the user." });
  }
});

// Login endpoint
/*app.post("/login", (req, res) => {
  const { email, password } = req.body;

  // Basic input validation
  if (!email || !password) {
    return res
      .status(400)
      .json({ error: "Please provide both email and password." });
  }

  // Check if the email and password match a registered user
  const loginQuery = "SELECT * FROM users WHERE email = $1 AND password = $2";
  const loginValues = [email, password];

  /* Check if the email and password match a registered user (assuming you have a 'users' table with 'email' and 'password' columns)
  const loginQuery =
    "SELECT user_id FROM users WHERE email = $1 AND password = $2";
  const loginValues = [email, password];

  pool.query(loginQuery, loginValues, (err, result) => {
    if (err) {
      console.error("Error during login:", err);
      return res.status(500).json({ error: "Error during login" });
    }

    if (result.rows.length === 0) {
      return res.status(401).json({ error: "Invalid email or password" });
    }

    const user_id = result.rows[0].user_id;

    // Fetch user's diet preference from the 'user_diet_preference' table
    const fetchUserDietPreferenceQuery =
      "SELECT preference_name FROM user_diet_preference INNER JOIN diet_preference ON user_diet_preference.preference_id = diet_preference.preference_id WHERE user_id = $1";
    const fetchUserDietPreferenceValues = [user_id];

    pool.query(
      fetchUserDietPreferenceQuery,
      fetchUserDietPreferenceValues,
      (err, dietPreferenceResult) => {
        if (err) {
          console.error("Error fetching user diet preference:", err);
          return res
            .status(500)
            .json({ error: "Error fetching user diet preference" });
        }

        const diet_preference = dietPreferenceResult.rows[0].preference_name;

        // Fetch user's food restrictions from the 'user_food_restrictions' table
        const fetchUserFoodRestrictionsQuery =
          "SELECT restriction_name FROM user_food_restrictions INNER JOIN food_restrictions ON user_food_restrictions.restriction_id = food_restrictions.restriction_id WHERE user_id = $1";
        const fetchUserFoodRestrictionsValues = [user_id];

        pool.query(
          fetchUserFoodRestrictionsQuery,
          fetchUserFoodRestrictionsValues,
          (err, foodRestrictionsResult) => {
            if (err) {
              console.error("Error fetching user food restrictions:", err);
              return res
                .status(500)
                .json({ error: "Error fetching user food restrictions" });
            }

            const food_restrictions = foodRestrictionsResult.rows.map(
              (row) => row.restriction_name
            );

            // Fetch meals based on user's diet preference and food restrictions
            const fetchMealsQuery = `
  SELECT meal_id, meal_name, diet_preference, food_restrictions, calories
  FROM meals
  WHERE
    (diet_preference = $1 OR ($1 IS NULL AND diet_preference IS NULL))
    ${food_restrictions.length > 0 ? "AND food_restrictions @> $2" : ""}
`;

            // Handle diet preference
            const diet_preference_value =
              diet_preference === "None" ? null : diet_preference;

            const fetchMealsValues = [diet_preference_value];

            // Handle food restrictions
            if (food_restrictions.length > 0) {
              fetchMealsValues.push(food_restrictions);
            }

            // Fetch meals based on user's diet preference and food restrictions
            /*const fetchMealsQuery =
              "SELECT meal_id, meal_name, diet_preference, food_restrictions, calories FROM meals WHERE diet_preference = $1 AND NOT ($2::VARCHAR[] IS NULL OR food_restrictions && $2::VARCHAR[])";

            // Fetch meals based on user's diet preference and food restrictions
            /*const fetchMealsValues = [
             diet_preference,
             food_restrictions.length > 0 ? food_restrictions : null,
           ];

            //const fetchMealsValues = [diet_preference, food_restrictions];

            //console.log("Query:", fetchMealsQuery);
            //console.log("Values:", fetchMealsValues);

            pool.query(
              fetchMealsQuery,
              fetchMealsValues,
              (err, mealsResult) => {
                if (err) {
                  console.error("Error fetching meals:", err);
                  return res
                    .status(500)
                    .json({ error: "Error fetching meals" });
                }

                //const meals = mealsResult.rows;
                const meals = mealsResult.rows.map((meal) => ({
                  meal_id: meal.meal_id,
                  meal_name: meal.meal_name,
                  diet_preference: meal.diet_preference,
                  food_restrictions: meal.food_restrictions,
                  calories: meal.calories,
                }));

                // Log meal names
                //const mealNames = meals.map((meal) => meal.meal_name);
                //console.log("Fetched meal names:", mealNames);
                // Authentication successful, return the user_id in the response

                // Return the filtered meals for the user along with user_id
                return res.json({ user_id, meals });
              }
            );
          }
        );
      }
    );
    //return res.status(200).json({ user_id });
  });
});*/

app.post("/login", (req, res) => {
  const { email, password } = req.body;

  // Basic input validation
  if (!email || !password) {
    return res
      .status(400)
      .json({ error: "Please provide both email and password." });
  }

  // Check if the email and password match a registered user
  const loginQuery = "SELECT * FROM users WHERE email = $1 AND password = $2";
  const loginValues = [email, password];

  pool.query(loginQuery, loginValues, (err, result) => {
    if (err) {
      console.error("Error during login:", err);
      return res.status(500).json({ error: "Error during login" });
    }

    if (result.rows.length === 0) {
      return res.status(401).json({ error: "Invalid email or password" });
    }

    const user_id = result.rows[0].user_id;

    // Fetch user's diet preference from the 'user_diet_preference' table
    const fetchUserDietPreferenceQuery =
      "SELECT preference_name FROM user_diet_preference INNER JOIN diet_preference ON user_diet_preference.preference_id = diet_preference.preference_id WHERE user_id = $1";
    const fetchUserDietPreferenceValues = [user_id];

    pool.query(
      fetchUserDietPreferenceQuery,
      fetchUserDietPreferenceValues,
      (err, dietPreferenceResult) => {
        if (err) {
          console.error("Error fetching user diet preference:", err);
          return res
            .status(500)
            .json({ error: "Error fetching user diet preference" });
        }

        const diet_preference = dietPreferenceResult.rows[0].preference_name;

        // Fetch user's food restrictions from the 'user_food_restrictions' table
        const fetchUserFoodRestrictionsQuery =
          "SELECT restriction_name FROM user_food_restrictions INNER JOIN food_restrictions ON user_food_restrictions.restriction_id = food_restrictions.restriction_id WHERE user_id = $1";
        const fetchUserFoodRestrictionsValues = [user_id];

        pool.query(
          fetchUserFoodRestrictionsQuery,
          fetchUserFoodRestrictionsValues,
          (err, foodRestrictionsResult) => {
            if (err) {
              console.error("Error fetching user food restrictions:", err);
              return res
                .status(500)
                .json({ error: "Error fetching user food restrictions" });
            }

            const food_restrictions = foodRestrictionsResult.rows.map(
              (row) => row.restriction_name
            );

            // Fetch meals based on user's diet preference and food restrictions
            let fetchMealsQuery = `
              SELECT meal_id, meal_name, diet_preference, food_restrictions, calories
              FROM meals
              WHERE
                (diet_preference = $1 OR ($1 IS NULL AND diet_preference IS NULL))
            `;

            let fetchMealsValues = [
              diet_preference === "None" ? null : diet_preference,
            ];

            /*
            if (food_restrictions.length > 0) {
              // Check if food_restrictions include "None"
              if (food_restrictions.includes("None")) {
                // If "None" is included in food_restrictions, fetch all meals regardless of diet_preference
                fetchMealsQuery +=
                  " AND (food_restrictions @> $2 OR diet_preference IS NULL)";
                fetchMealsValues.push(food_restrictions);
              } else {
                // If "None" is not included in food_restrictions, exclude meals containing any of the specified food restrictions
                fetchMealsQuery += `
                  AND (NOT EXISTS (
                    SELECT 1 FROM UNNEST(food_restrictions) AS restriction
                    WHERE restriction = ANY($2)
                  ) OR diet_preference IS NULL)
                `;
                fetchMealsValues.push(food_restrictions);
              }
            }*/

            if (food_restrictions.length > 0) {
              // Check if food_restrictions include "None"
              if (food_restrictions.includes("None")) {
                // If "None" is included in food_restrictions, fetch all meals regardless of diet_preference
                fetchMealsQuery += `
      AND (food_restrictions @> $2 OR diet_preference IS NULL)
    `;
                fetchMealsValues.push(food_restrictions);
              } else {
                // If "None" is not included in food_restrictions, exclude meals containing any of the specified food restrictions
                fetchMealsQuery += `
      AND (NOT EXISTS (
        SELECT 1 FROM UNNEST(food_restrictions) AS restriction
        WHERE restriction = ANY($2)
      ) OR diet_preference IS NULL)
    `;
                fetchMealsValues.push(food_restrictions);
              }
            }

            pool.query(
              fetchMealsQuery,
              fetchMealsValues,
              (err, mealsResult) => {
                if (err) {
                  console.error("Error fetching meals:", err);
                  return res
                    .status(500)
                    .json({ error: "Error fetching meals" });
                }

                const meals = mealsResult.rows.map((meal) => ({
                  meal_id: meal.meal_id,
                  meal_name: meal.meal_name,
                  diet_preference: meal.diet_preference,
                  food_restrictions: meal.food_restrictions,
                  calories: meal.calories,
                }));

                // If the user has selected "None" for both diet preference and food restrictions,
                // fetch all meals available in the 'meals' table
                if (
                  diet_preference === "None" &&
                  food_restrictions.includes("None")
                ) {
                  const fetchAllMealsQuery = "SELECT * FROM meals";
                  pool.query(fetchAllMealsQuery, (err, allMealsResult) => {
                    if (err) {
                      console.error("Error fetching all meals:", err);
                      return res
                        .status(500)
                        .json({ error: "Error fetching all meals" });
                    }

                    const allMeals = allMealsResult.rows.map((meal) => ({
                      meal_id: meal.meal_id,
                      meal_name: meal.meal_name,
                      diet_preference: meal.diet_preference,
                      food_restrictions: meal.food_restrictions,
                      calories: meal.calories,
                    }));

                    // If the user has "None" in food restrictions, exclude meals with the specified food restrictions
                    /*const filteredMeals = allMeals.filter((meal) => {
                      if (food_restrictions.includes("None")) {
                        return (
                          !meal.food_restrictions ||
                          meal.food_restrictions.includes("None")
                        );
                      } else {
                        return !meal.food_restrictions?.some((restriction) =>
                          food_restrictions.includes(restriction)
                        );
                      }
                    });*/

                    // Return the filtered meals for the user along with user_id
                    return res.json({ user_id, meals: filteredMeals });
                  });
                } else {
                  // For user Mima, if her diet preference is "None" but food restrictions are not "None",
                  // fetch meals that match her food restrictions regardless of diet preference
                  if (diet_preference === "None") {
                    const fetchMealsWithFoodRestrictionsQuery = `
                      SELECT meal_id, meal_name, diet_preference, food_restrictions, calories
                      FROM meals
                      WHERE food_restrictions @> $1
                    `;
                    pool.query(
                      fetchMealsWithFoodRestrictionsQuery,
                      [food_restrictions],
                      (err, mealsWithFoodRestrictionsResult) => {
                        if (err) {
                          console.error(
                            "Error fetching meals with food restrictions:",
                            err
                          );
                          return res.status(500).json({
                            error:
                              "Error fetching meals with food restrictions",
                          });
                        }

                        const mealsWithFoodRestrictions =
                          mealsWithFoodRestrictionsResult.rows.map((meal) => ({
                            meal_id: meal.meal_id,
                            meal_name: meal.meal_name,
                            diet_preference: meal.diet_preference,
                            food_restrictions: meal.food_restrictions,
                            calories: meal.calories,
                          }));

                        // Return the filtered meals with food restrictions for the user along with user_id
                        return res.json({
                          user_id,
                          meals: mealsWithFoodRestrictions,
                        });
                      }
                    );
                  } else {
                    // Return the filtered meals for the user along with user_id
                    return res.json({ user_id, meals });
                  }
                }
              }
            );
          }
        );
      }
    );
  });
});

//Fetching meals endpoint
app.get("/meals/:meal_id", (req, res) => {
  const mealId = req.params.meal_id;

  // Query the database to fetch the meal details for the specified meal_id
  const fetchMealQuery =
    "SELECT meal_id, meal_name, diet_preference, food_restrictions, calories FROM meals WHERE meal_id = $1";
  const fetchMealValues = [mealId];

  pool.query(fetchMealQuery, fetchMealValues, (err, result) => {
    if (err) {
      console.error("Error fetching meal:", err);
      return res.status(500).json({ error: "Error fetching meal" });
    }

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Meal not found" });
    }

    const meal = result.rows[0];

    // Query the database to fetch the ingredients for the specified meal_id
    const fetchIngredientsQuery =
      "SELECT ingredient_id, ingredient_name, quantity, unit_of_measurement FROM ingredients WHERE meal_id = $1";
    pool.query(
      fetchIngredientsQuery,
      fetchMealValues,
      (err, ingredientsResult) => {
        if (err) {
          console.error("Error fetching ingredients:", err);
          return res.status(500).json({ error: "Error fetching ingredients" });
        }

        meal.ingredients = ingredientsResult.rows;

        //console.log("Fetched Ingredients:", meal.ingredients);

        // Query the database to fetch the recipe steps for the specified meal_id
        const fetchRecipeStepsQuery =
          "SELECT step_id, step_order, step_description FROM recipe_steps WHERE meal_id = $1";
        pool.query(
          fetchRecipeStepsQuery,
          fetchMealValues,
          (err, stepsResult) => {
            if (err) {
              console.error("Error fetching recipe steps:", err);
              return res
                .status(500)
                .json({ error: "Error fetching recipe steps" });
            }

            meal.recipe_steps = stepsResult.rows;

            // Log the fetched recipe steps for debugging
            //console.log("Fetched Recipe Steps:", meal.recipe_steps);

            return res.json({ meal });
          }
        );
      }
    );
  });
});

// Update user's meals table information
app.put("/meals/:meal_id", (req, res) => {
  const mealId = req.params.meal_id;
  const { meal_name, diet_preference, food_restrictions, calories } = req.body;

  // Query the database to update the meal details for the specified meal_id
  const updateMealQuery =
    "UPDATE meals SET meal_name = $1, diet_preference = $2, food_restrictions = $3, calories = $4 WHERE meal_id = $5";
  const updateMealValues = [
    meal_name,
    diet_preference,
    food_restrictions, // Use the array directly, no JSON.stringify()
    calories,
    mealId,
  ];

  pool.query(updateMealQuery, updateMealValues, (err, result) => {
    if (err) {
      console.error("Error updating meal:", err);
      return res.status(500).json({ error: "Error updating meal" });
    }

    if (result.rowCount === 0) {
      return res.status(404).json({ error: "Meal not found" });
    }

    return res.json({ message: "Meal updated successfully" });
  });
});

//Update user's recipe steps
app.put("/meals/:meal_id/recipe_steps/:step_id", (req, res) => {
  const mealId = req.params.meal_id;
  const stepId = req.params.step_id;
  const { step_description } = req.body;

  // Query the database to update the step_description for the specified meal_id and step_id
  const updateStepDescriptionQuery =
    "UPDATE recipe_steps SET step_description = $1 WHERE meal_id = $2 AND step_id = $3";
  const updateStepDescriptionValues = [step_description, mealId, stepId];

  pool.query(
    updateStepDescriptionQuery,
    updateStepDescriptionValues,
    (err, result) => {
      if (err) {
        console.error("Error updating recipe step:", err);
        return res.status(500).json({ error: "Error updating recipe step" });
      }

      if (result.rowCount === 0) {
        return res.status(404).json({ error: "Recipe step not found" });
      }

      return res.json({ message: "Recipe step updated successfully" });
    }
  );
});

// Update user's ingredients
app.put("/meals/:meal_id/ingredients/:ingredient_id", (req, res) => {
  const mealId = req.params.meal_id;
  const ingredientId = req.params.ingredient_id;
  const { ingredient_name, quantity, unit_of_measurement } = req.body;

  // Query the database to update the ingredient for the specified meal_id and ingredient_id
  const updateIngredientQuery =
    "UPDATE ingredients SET ingredient_name = $1, quantity = $2, unit_of_measurement = $3 WHERE meal_id = $4 AND ingredient_id = $5";
  const updateIngredientValues = [
    ingredient_name,
    quantity,
    unit_of_measurement,
    mealId,
    ingredientId,
  ];

  pool.query(updateIngredientQuery, updateIngredientValues, (err, result) => {
    if (err) {
      console.error("Error updating ingredient:", err);
      return res.status(500).json({ error: "Error updating ingredient" });
    }

    if (result.rowCount === 0) {
      return res.status(404).json({ error: "Ingredient not found" });
    }

    return res.json({ message: "Ingredient updated successfully" });
  });
});

//Delete meal
app.delete("/meals/:meal_id", (req, res) => {
  const mealId = req.params.meal_id;

  // Query the database to delete the meal for the specified meal_id
  const deleteMealQuery = "DELETE FROM meals WHERE meal_id = $1";
  const deleteMealValues = [mealId];

  pool.query(deleteMealQuery, deleteMealValues, (err, result) => {
    if (err) {
      console.error("Error deleting meal:", err);
      return res.status(500).json({ error: "Error deleting meal" });
    }

    if (result.rowCount === 0) {
      return res.status(404).json({ error: "Meal not found" });
    }

    return res.json({ message: "Meal deleted successfully" });
  });
});

//Delete recipe steps
app.delete("/meals/:meal_id/recipe_steps/:step_id", (req, res) => {
  const mealId = req.params.meal_id;
  const stepId = req.params.step_id;

  console.log("Received meal ID:", mealId);
  console.log("Received step ID:", stepId);

  // Query the database to delete the recipe step for the specified meal_id and step_id
  const deleteStepQuery =
    "DELETE FROM recipe_steps WHERE meal_id = $1 AND step_id = $2";
  const deleteStepValues = [mealId, stepId];

  pool.query(deleteStepQuery, deleteStepValues, (err, result) => {
    if (err) {
      console.error("Error deleting recipe step:", err);
      return res.status(500).json({ error: "Error deleting recipe step" });
    }

    if (result.rowCount === 0) {
      return res.status(404).json({ error: "Recipe step not found" });
    }

    return res.json({ message: "Recipe step deleted successfully" });
  });
});

//Delete an ingredient
app.delete("/meals/:meal_id/ingredients/:ingredient_id", (req, res) => {
  const mealId = req.params.meal_id;
  const ingredientId = req.params.ingredient_id;

  console.log("Received meal ID:", mealId);
  console.log("Received ingredient ID:", ingredientId);

  // Query the database to delete the ingredient for the specified meal_id and ingredient_id
  const deleteIngredientQuery =
    "DELETE FROM ingredients WHERE meal_id = $1 AND ingredient_id = $2";
  const deleteIngredientValues = [mealId, ingredientId];

  pool.query(deleteIngredientQuery, deleteIngredientValues, (err, result) => {
    if (err) {
      console.error("Error deleting ingredient:", err);
      return res.status(500).json({ error: "Error deleting ingredient" });
    }

    if (result.rowCount === 0) {
      return res.status(404).json({ error: "Ingredient not found" });
    }

    return res.json({ message: "Ingredient deleted successfully" });
  });
});

// Add recipe step in EditMeal screen
app.post("/meals/:meal_id/recipe_steps", (req, res) => {
  const mealId = req.params.meal_id;
  const { recipe_steps } = req.body;

  // Insert the new recipe steps with the correct step_order
  const insertRecipeStepQuery =
    "INSERT INTO recipe_steps (meal_id, step_order, step_description) VALUES ($1, $2, $3)";

  // Use Promise.all to execute all INSERT queries in parallel
  Promise.all(
    recipe_steps.map(({ step_order, step_description }) => {
      return pool.query(insertRecipeStepQuery, [
        mealId,
        step_order,
        step_description || "", // Use a default empty string if step_description is null or undefined
      ]);
    })
  )
    .then(() => {
      return res.json({ message: "Recipe steps added successfully" });
    })
    .catch((error) => {
      console.error("Error adding recipe steps:", error);
      return res.status(500).json({ error: "Error adding recipe steps" });
    });
});

// Add ingredient in EditMeal screen
app.post("/meals/:meal_id/ingredients", (req, res) => {
  const mealId = req.params.meal_id;
  const ingredientsToAdd = req.body.ingredients; // Access the "ingredients" array

  // Create an array to store all the insert promises
  const insertPromises = [];

  // Loop through each ingredient in the "ingredients" array
  ingredientsToAdd.forEach((ingredient) => {
    const { ingredient_name, quantity, unit_of_measurement } = ingredient;

    // Insert the new ingredient into the ingredients table
    const insertIngredientQuery =
      "INSERT INTO ingredients (meal_id, ingredient_name, quantity, unit_of_measurement) VALUES ($1, $2, $3, $4) RETURNING ingredient_id, ingredient_name, quantity, unit_of_measurement";
    const insertIngredientValues = [
      mealId,
      ingredient_name,
      quantity,
      unit_of_measurement,
    ];

    // Add the insert promise to the array
    const insertPromise = new Promise((resolve, reject) => {
      pool.query(
        insertIngredientQuery,
        insertIngredientValues,
        (err, result) => {
          if (err) {
            console.error("Error adding ingredient:", err);
            reject(err);
          }

          // Get the newly generated ingredient details from the result
          const newIngredient = result.rows[0];
          // Log the newly created ingredient's details
          console.log("New Ingredient:", newIngredient);

          resolve(newIngredient);
        }
      );
    });

    insertPromises.push(insertPromise);
  });

  // Wait for all the insert promises to complete
  Promise.all(insertPromises)
    .then((newIngredients) => {
      // Return the newly added ingredients in the response
      return res.json({
        message: "Ingredients added successfully",
        ingredients: newIngredients,
      });
    })
    .catch((error) => {
      console.error("Error adding new ingredients:", error);
      return res.status(500).json({ error: "Failed to add new ingredients" });
    });
});

//Fetch weekly meals
/*app.get("/weekly-meals/:email/:password", async (req, res) => {
  const { email, password } = req.params;

  try {
    // First, authenticate the user using their email and password
    const authenticateUserQuery =
      "SELECT * FROM users WHERE email = $1 AND password = $2";
    const authenticateUserValues = [email, password];

    const userResult = await pool.query(
      authenticateUserQuery,
      authenticateUserValues
    );

    if (userResult.rows.length === 0) {
      return res.status(401).json({
        error: "Authentication failed. Invalid email or password.",
      });
    }

    // If the user is authenticated, retrieve their diet preferences and food restrictions
    const userPreferencesQuery =
      "SELECT diet_preference, food_restrictions FROM users WHERE email = $1";
    const userPreferencesValues = [email];

    const preferencesResult = await pool.query(
      userPreferencesQuery,
      userPreferencesValues
    );

    const userPreferences = preferencesResult.rows[0];
    const dietPreference = userPreferences.diet_preference;
    const foodRestrictions = userPreferences.food_restrictions;

    // Fetch meals data based on the user's preferences and restrictions
    let fetchMealsQuery;
    let fetchMealsValues;

    if (dietPreference === "None" && foodRestrictions === "None") {
      // If the user has selected "None" for both diet preference and food restrictions,
      // fetch all meals available in the 'meals' table
      fetchMealsQuery = "SELECT meal_id, meal_name FROM meals";
      fetchMealsValues = [];
    } else if (dietPreference === "None") {
      // If the user has selected "None" for diet preference but has food restrictions,
      // fetch meals that do not have any of the food restrictions
      fetchMealsQuery =
        "SELECT meal_id, meal_name FROM meals WHERE NOT (food_restrictions && $1::VARCHAR[])";
      fetchMealsValues = [foodRestrictions];
    } else if (foodRestrictions === "None") {
      // If the user has selected specific diet preference but has "None" in food restrictions,
      // fetch meals that match the diet preference and do not have any food restrictions
      fetchMealsQuery =
        "SELECT meal_id, meal_name FROM meals WHERE diet_preference = $1";
      fetchMealsValues = [dietPreference];
    } else {
      // If the user has selected specific diet preference and specific food restrictions,
      // fetch meals that match the diet preference and do not have any of the food restrictions
      fetchMealsQuery =
        "SELECT meal_id, meal_name FROM meals WHERE diet_preference = $1 AND NOT (food_restrictions && $2::VARCHAR[])";
      fetchMealsValues = [dietPreference, foodRestrictions];
    }

    const mealsResult = await pool.query(fetchMealsQuery, fetchMealsValues);
    const weeklyMeals = mealsResult.rows;

    console.log("Fetched weekly meals for user Gillian:", weeklyMeals); // Log the fetched meals

    // Return the weekly meals as a response
    return res.status(200).json(weeklyMeals);
  } catch (error) {
    console.error("Error fetching weekly meals:", error);
    return res.status(500).json({ error: "Error fetching weekly meals" });
  }
});*/

/*app.get("/weekly-meals/:email/:password", async (req, res) => {
  const { email, password } = req.params;

  try {
    // First, authenticate the user using their email and password
    const authenticateUserQuery =
      "SELECT * FROM users WHERE email = $1 AND password = $2";
    const authenticateUserValues = [email, password];

    const userResult = await pool.query(
      authenticateUserQuery,
      authenticateUserValues
    );

    if (userResult.rows.length === 0) {
      return res.status(401).json({
        error: "Authentication failed. Invalid email or password.",
      });
    }

    // If the user is authenticated, retrieve their diet preferences and food restrictions
    const userPreferencesQuery =
      "SELECT diet_preference, food_restrictions FROM users WHERE email = $1";
    const userPreferencesValues = [email];

    const preferencesResult = await pool.query(
      userPreferencesQuery,
      userPreferencesValues
    );

    const userPreferences = preferencesResult.rows[0];
    const dietPreference = userPreferences.diet_preference;
    const foodRestrictions = userPreferences.food_restrictions;

    // Fetch meals data based on the user's preferences and restrictions
    let fetchMealsQuery;
    let fetchMealsValues;

    if (
      dietPreference === "None" &&
      foodRestrictions &&
      foodRestrictions.includes("None")
    ) {
      // If the user has selected "None" for both diet preference and food restrictions,
      // fetch all meals available in the 'meals' table
      fetchMealsQuery = "SELECT meal_id, meal_name FROM meals";
      fetchMealsValues = [];
    } else if (dietPreference === "None") {
      // If the user has selected "None" for diet preference but has specific food restrictions,
      // fetch meals that do not have any of the food restrictions
      fetchMealsQuery =
        "SELECT meal_id, meal_name FROM meals WHERE NOT ($1 && food_restrictions)";
      fetchMealsValues = [foodRestrictions];
    } else if (foodRestrictions && foodRestrictions.includes("None")) {
      // If the user has selected specific diet preference but has "None" in food restrictions,
      // fetch meals that match the diet preference and do not have any food restrictions
      fetchMealsQuery =
        "SELECT meal_id, meal_name FROM meals WHERE diet_preference = $1 AND (food_restrictions IS NULL OR 'None' = ANY(food_restrictions))";
      fetchMealsValues = [dietPreference];
    } else {
      // If the user has selected specific diet preference and specific food restrictions,
      // fetch meals that match the diet preference and do not have any of the food restrictions
      fetchMealsQuery =
        "SELECT meal_id, meal_name FROM meals WHERE diet_preference = $1 AND NOT ($2 && food_restrictions)";
      fetchMealsValues = [dietPreference, foodRestrictions];
    }

    const mealsResult = await pool.query(fetchMealsQuery, fetchMealsValues);
    const weeklyMeals = mealsResult.rows;

    console.log("Fetched weekly meals for user:", email, weeklyMeals); // Log the fetched meals

    // Return the weekly meals as a response
    return res.status(200).json(weeklyMeals);
  } catch (error) {
    console.error("Error fetching weekly meals:", error);
    return res.status(500).json({ error: "Error fetching weekly meals" });
  }
});*/

app.get("/weekly-meals/:email/:password", async (req, res) => {
  const { email, password } = req.params;

  try {
    // First, authenticate the user using their email and password
    const authenticateUserQuery =
      "SELECT * FROM users WHERE email = $1 AND password = $2";
    const authenticateUserValues = [email, password];

    const userResult = await pool.query(
      authenticateUserQuery,
      authenticateUserValues
    );

    if (userResult.rows.length === 0) {
      return res.status(401).json({
        error: "Authentication failed. Invalid email or password.",
      });
    }

    // If the user is authenticated, retrieve their diet preferences and food restrictions
    const userPreferencesQuery =
      "SELECT diet_preference, food_restrictions FROM users WHERE email = $1";
    const userPreferencesValues = [email];

    const preferencesResult = await pool.query(
      userPreferencesQuery,
      userPreferencesValues
    );

    const userPreferences = preferencesResult.rows[0];
    const dietPreference = userPreferences.diet_preference;
    const foodRestrictions = userPreferences.food_restrictions;

    // Fetch meals data based on the user's preferences and restrictions
    let fetchMealsQuery;
    let fetchMealsValues;

    if (
      dietPreference === "None" &&
      (!foodRestrictions || foodRestrictions.includes("None"))
    ) {
      // If the user has selected "None" for both diet preference and food restrictions,
      // fetch all meals available in the 'meals' table
      fetchMealsQuery = "SELECT meal_id, meal_name FROM meals";
      fetchMealsValues = [];
    } else if (dietPreference === "None") {
      // If the user has selected "None" for diet preference but has specific food restrictions,
      // fetch meals that do not have any of the food restrictions
      fetchMealsQuery =
        "SELECT meal_id, meal_name FROM meals WHERE NOT EXISTS (SELECT 1 FROM unnest($1::text[]) r(food) WHERE meals.food_restrictions @> ARRAY[r.food]) OR (food_restrictions IS NULL OR 'None' = ANY(food_restrictions))";
      fetchMealsValues = [foodRestrictions];
    } else if (foodRestrictions && foodRestrictions.includes("None")) {
      // If "None" is included in foodRestrictions, fetch all meals with the specified diet_preference
      fetchMealsQuery =
        "SELECT meal_id, meal_name FROM meals WHERE diet_preference = $1";
      fetchMealsValues = [dietPreference];
    } else {
      // If the user has selected specific diet preference and specific food restrictions,
      // fetch meals that match the diet preference and do not have any of the food restrictions
      fetchMealsQuery =
        "SELECT meal_id, meal_name FROM meals WHERE diet_preference = $1 AND NOT EXISTS (SELECT 1 FROM unnest($2::text[]) r(food) WHERE meals.food_restrictions @> ARRAY[r.food])";
      fetchMealsValues = [dietPreference, foodRestrictions];
    }

    const mealsResult = await pool.query(fetchMealsQuery, fetchMealsValues);
    const weeklyMeals = mealsResult.rows;

    console.log("Generated Query:", fetchMealsQuery);
    console.log("Query Parameters:", fetchMealsValues);

    console.log("Fetched weekly meals for user:", email, weeklyMeals); // Log the fetched meals

    // Return the weekly meals as a response
    return res.status(200).json(weeklyMeals);
  } catch (error) {
    console.error("Error fetching weekly meals:", error);
    return res.status(500).json({ error: "Error fetching weekly meals" });
  }
});

// Endpoint for adding the meal's ingredients to the grocery list
/*app.post("/add-to-grocery-list", async (req, res) => {
  const { user_id, meal_id, ingredient_ids } = req.body;

  // Check if user_id, meal_id, and ingredient_ids are provided
  if (!user_id || !meal_id || !ingredient_ids || !Array.isArray(ingredient_ids)) {
    return res.status(400).json({
      error:
        "user_id, meal_id, and ingredient_ids (as an array) must be provided in the request body",
    });
  }

  try {
    // Fetch the ingredients of the specified meal from the ingredients table
    const fetchIngredientsQuery =
      "SELECT ingredient_id FROM ingredients WHERE meal_id = $1 AND ingredient_id = ANY($2)";
    const fetchIngredientsValues = [meal_id, ingredient_ids];

    const ingredientsResult = await pool.query(
      fetchIngredientsQuery,
      fetchIngredientsValues
    );

    const ingredients = ingredientsResult.rows;

    // Insert the fetched ingredients into the grocery table along with the user_id
    const insertGroceryQuery =
      "INSERT INTO grocery (user_id, meal_id, ingredient_id) VALUES ($1, $2, $3) RETURNING *";

    const groceryItems = await Promise.all(
      ingredients.map(async (ingredient) => {
        const insertGroceryValues = [user_id, meal_id, ingredient.ingredient_id];
        const insertedItem = await pool.query(
          insertGroceryQuery,
          insertGroceryValues
        );
        return insertedItem.rows[0];
      })
    );

    // Return the inserted grocery items as the response
    res.json({ groceryItems });
  } catch (error) {
    console.error("Error adding meal ingredients to grocery list:", error);
    res.status(500).json({
      error: "An error occurred while adding ingredients to grocery list",
    });
  }
});*/

//Second endpoint where it verifies if the meal is present but doesn't insert records of new meals
/*app.post("/add-to-grocery-list", async (req, res) => {
  const { user_id, meal_id, ingredient_ids } = req.body;

  // Check if user_id, meal_id, and ingredient_ids are provided
  if (
    !user_id ||
    !meal_id ||
    !ingredient_ids ||
    !Array.isArray(ingredient_ids)
  ) {
    return res.status(400).json({
      error:
        "user_id, meal_id, and ingredient_ids (as an array) must be provided in the request body",
    });
  }

  try {
    // Check if the meal_id is already present in the grocery table for the user
    const fetchGroceryItemQuery =
      "SELECT * FROM grocery WHERE user_id = $1 AND meal_id = $2";
    const fetchGroceryItemValues = [user_id, meal_id];

    const existingGroceryItemResult = await pool.query(
      fetchGroceryItemQuery,
      fetchGroceryItemValues
    );

    const existingGroceryItem = existingGroceryItemResult.rows[0];

    if (existingGroceryItem) {
      // If the meal_id is already in the grocery table, return an error
      return res.status(409).json({
        error: "Meal already in Grocery List",
      });
    }

    // Fetch the ingredients of the specified meal from the ingredients table
    const fetchIngredientsQuery =
      "SELECT ingredient_id FROM ingredients WHERE meal_id = $1 AND ingredient_id = ANY($2)";
    const fetchIngredientsValues = [meal_id, ingredient_ids];

    const ingredientsResult = await pool.query(
      fetchIngredientsQuery,
      fetchIngredientsValues
    );

    const ingredients = ingredientsResult.rows;

    // Insert the fetched ingredients into the grocery table along with the user_id
    const insertGroceryQuery =
      "INSERT INTO grocery (user_id, meal_id, ingredient_id) VALUES ($1, $2, $3) RETURNING *";

    const groceryItems = await Promise.all(
      ingredients.map(async (ingredient) => {
        const insertGroceryValues = [
          user_id,
          meal_id,
          ingredient.ingredient_id,
        ];
        const insertedItem = await pool.query(
          insertGroceryQuery,
          insertGroceryValues
        );
        return insertedItem.rows[0];
      })
    );

    // Return the inserted grocery items as the response
    res.json({ groceryItems });
  } catch (error) {
    console.error("Error adding meal ingredients to grocery list:", error);
    res.status(500).json({
      error: "An error occurred while adding ingredients to grocery list",
    });
  }
});*/

app.post("/add-to-grocery-list", async (req, res) => {
  const { user_id, meal_id, ingredient_ids, quantities, units_of_measurement } =
    req.body;

  //Log to check if user_id, meal_id and ingredients_ids are passing from the frontend
  /*console.log("Received request to add ingredients to grocery list:");
  console.log("user_id:", user_id);
  console.log("meal_id:", meal_id);
  console.log("ingredient_ids:", ingredient_ids);*/

  // Check if user_id, meal_id, ingredient_ids, quantities, and units_of_measurement are provided
  if (
    !user_id ||
    !meal_id ||
    !ingredient_ids ||
    !quantities ||
    !units_of_measurement ||
    !Array.isArray(ingredient_ids) ||
    !Array.isArray(quantities) ||
    !Array.isArray(units_of_measurement) ||
    ingredient_ids.length !== quantities.length ||
    ingredient_ids.length !== units_of_measurement.length
  ) {
    return res.status(400).json({
      error:
        "user_id, meal_id, ingredient_ids (as an array), quantities (as an array), and units_of_measurement (as an array) must be provided in the request body",
    });
  }

  try {
    // Check if the meal_id is already present in the grocery table for the user
    const fetchGroceryItemQuery =
      "SELECT * FROM grocery WHERE user_id = $1 AND meal_id = $2";
    const fetchGroceryItemValues = [user_id, meal_id];

    const existingGroceryItemResult = await pool.query(
      fetchGroceryItemQuery,
      fetchGroceryItemValues
    );

    const existingGroceryItem = existingGroceryItemResult.rows[0];

    if (existingGroceryItem) {
      // If the meal_id is already in the grocery table, return an error
      return res.status(409).json({
        error: "Meal already in Grocery List",
      });
    }

    // Fetch the ingredients of the specified meal from the ingredients table
    const fetchIngredientsQuery =
      "SELECT ingredient_id, ingredient_name FROM ingredients WHERE meal_id = $1 AND ingredient_id = ANY($2)";
    const fetchIngredientsValues = [meal_id, ingredient_ids];

    const ingredientsResult = await pool.query(
      fetchIngredientsQuery,
      fetchIngredientsValues
    );

    const ingredients = ingredientsResult.rows;

    // Insert the fetched ingredients into the grocery table along with the user_id, quantities, and units_of_measurement
    const insertGroceryQuery =
      "INSERT INTO grocery (user_id, meal_id, ingredient_id, ingredient_name, quantity, unit_of_measurement) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *";

    const groceryItems = await Promise.all(
      ingredients.map(async (ingredient, index) => {
        const insertGroceryValues = [
          user_id,
          meal_id,
          ingredient.ingredient_id,
          ingredient.ingredient_name,
          quantities[index],
          units_of_measurement[index],
        ];
        const insertedItem = await pool.query(
          insertGroceryQuery,
          insertGroceryValues
        );
        return insertedItem.rows[0];
      })
    );

    // Return the inserted grocery items as the response
    res.json({ groceryItems });
  } catch (error) {
    console.error("Error adding meal ingredients to grocery list:", error);
    res.status(500).json({
      error: "An error occurred while adding ingredients to grocery list",
    });
  }
});

// Endpoint for fetching grocery list data
app.get("/grocery-list/:email/:password", async (req, res) => {
  const { email, password } = req.params;

  try {
    // First, authenticate the user using their email and password
    const authenticateUserQuery =
      "SELECT user_id FROM users WHERE email = $1 AND password = $2";
    const authenticateUserValues = [email, password];

    const userResult = await pool.query(
      authenticateUserQuery,
      authenticateUserValues
    );

    if (userResult.rows.length === 0) {
      return res
        .status(401)
        .json({ error: "Authentication failed. Invalid email or password." });
    }

    const user_id = userResult.rows[0].user_id;

    // Fetch the ingredient_id values of the user from the grocery table
    const fetchGroceryItemsQuery =
      "SELECT ingredient_id FROM grocery WHERE user_id = $1";
    const fetchGroceryItemsValues = [user_id];

    const groceryItemsResult = await pool.query(
      fetchGroceryItemsQuery,
      fetchGroceryItemsValues
    );

    const ingredientIds = groceryItemsResult.rows.map(
      (item) => item.ingredient_id
    );

    // Fetch the ingredient details from the ingredients table based on the ingredient_ids
    const fetchIngredientsQuery =
      "SELECT ingredient_id, ingredient_name, quantity, unit_of_measurement FROM ingredients WHERE ingredient_id = ANY($1)";
    const fetchIngredientsValues = [ingredientIds];

    const ingredientsResult = await pool.query(
      fetchIngredientsQuery,
      fetchIngredientsValues
    );

    const groceryListData = ingredientsResult.rows;

    // Return the grocery list data as a JSON response
    return res.status(200).json({ groceryListData });
  } catch (error) {
    console.error("Error fetching grocery list data:", error);
    return res.status(500).json({ error: "Error fetching grocery list data" });
  }
});

// Endpoint for adding ingredients to the pantry table and removing them from the grocery table
/*app.post("/add-to-pantry/:user_id", async (req, res) => {
  const { user_id } = req.params;
  const { ingredient_names } = req.body;

  console.log("Ingredient names received in request:", ingredient_names);

  try {
    // Fetch all the same-name ingredients from the grocery table for the given user_id
    const selectGroceryIngredientsQuery =
      "SELECT meal_id, ingredient_id FROM grocery WHERE user_id = $1 AND ingredient_name = ANY($2::TEXT[])";
    const selectGroceryIngredientsValues = [user_id, ingredient_names];

    const groceryIngredientsResult = await pool.query(
      selectGroceryIngredientsQuery,
      selectGroceryIngredientsValues
    );

    const selectedIngredientsData = groceryIngredientsResult.rows;

    if (selectedIngredientsData.length === 0) {
      return res
        .status(404)
        .json({ error: "No ingredients found in the grocery list" });
    }

    // Add the selected ingredients to the pantry table
    const addToPantryQuery =
      "INSERT INTO pantry (user_id, ingredient_id) VALUES ($1, $2) ON CONFLICT DO NOTHING";

    for (const selectedIngredient of selectedIngredientsData) {
      await pool.query(addToPantryQuery, [
        user_id,
        selectedIngredient.ingredient_id,
      ]);
    }

    // Remove the selected ingredients from the grocery table for the given user_id
    const removeFromGroceryQuery =
      "DELETE FROM grocery WHERE user_id = $1 AND ingredient_name = ANY($2::TEXT[])";

    await pool.query(removeFromGroceryQuery, [user_id, ingredient_names]);

    // Return a success message or appropriate response
    return res.json({
      message: "Ingredients added to pantry successfully",
    });
  } catch (error) {
    console.error("Error adding ingredients to pantry:", error);
    return res
      .status(500)
      .json({ error: "Error adding ingredients to pantry" });
  }
});*/

app.post("/add-to-pantry/:user_id", async (req, res) => {
  const { user_id } = req.params;
  const { ingredient_names } = req.body;

  console.log("Ingredient names received in request:", ingredient_names);

  try {
    // Fetch selected ingredients from the grocery table for the given user_id
    const selectGroceryIngredientsQuery =
      "SELECT * FROM grocery WHERE user_id = $1 AND ingredient_name = ANY($2::TEXT[])";
    const selectGroceryIngredientsValues = [user_id, ingredient_names];

    const groceryIngredientsResult = await pool.query(
      selectGroceryIngredientsQuery,
      selectGroceryIngredientsValues
    );

    const selectedIngredientsData = groceryIngredientsResult.rows;

    if (selectedIngredientsData.length === 0) {
      return res
        .status(404)
        .json({ error: "No ingredients found in the grocery list" });
    }

    // Add the selected ingredients to the pantry table
    const addToPantryQuery =
      "INSERT INTO pantry (user_id, ingredient_id, ingredient_name, quantity, unit_of_measurement) VALUES ($1, $2, $3, $4, $5) ON CONFLICT DO NOTHING";

    for (const selectedIngredient of selectedIngredientsData) {
      const { ingredient_id, ingredient_name, quantity, unit_of_measurement } =
        selectedIngredient;

      await pool.query(addToPantryQuery, [
        user_id,
        ingredient_id,
        ingredient_name,
        quantity,
        unit_of_measurement,
      ]);
    }

    // Remove the selected ingredients from the grocery table for the given user_id
    const removeFromGroceryQuery =
      "DELETE FROM grocery WHERE user_id = $1 AND ingredient_name = ANY($2::TEXT[])";

    await pool.query(removeFromGroceryQuery, [user_id, ingredient_names]);

    // Return a success message or appropriate response
    return res.json({
      message: "Ingredients added to pantry successfully",
    });
  } catch (error) {
    console.error("Error adding ingredients to pantry:", error);
    return res
      .status(500)
      .json({ error: "Error adding ingredients to pantry" });
  }
});

app.get("/pantry/:user_id", async (req, res) => {
  const { user_id } = req.params;

  try {
    // Fetch pantry data for the given user_id from the pantry table
    const fetchPantryDataQuery = "SELECT * FROM pantry WHERE user_id = $1";
    const fetchPantryDataValues = [user_id];

    const pantryDataResult = await pool.query(
      fetchPantryDataQuery,
      fetchPantryDataValues
    );

    const pantryData = pantryDataResult.rows;

    // Return the pantry data as the response
    res.json({ pantryData });
  } catch (error) {
    console.error("Error fetching pantry data:", error);
    res.status(500).json({
      error: "An error occurred while fetching pantry data",
    });
  }
});

// Endpoint to delete selected ingredients from the pantry table
app.post("/delete-pantry-ingredients", async (req, res) => {
  const { user_id, ingredient_names } = req.body;

  try {
    // Delete all occurrences of the selected ingredient names from the pantry table
    const deletePantryIngredientsQuery = `
      DELETE FROM pantry
      WHERE user_id = $1 AND ingredient_name = ANY($2)
    `;
    const deletePantryIngredientsValues = [user_id, ingredient_names];

    await pool.query(
      deletePantryIngredientsQuery,
      deletePantryIngredientsValues
    );

    res.json({ success: true });
  } catch (error) {
    console.error("Error deleting pantry ingredients:", error);
    res.status(500).json({
      success: false,
      error: "An error occurred while deleting pantry ingredients",
    });
  }
});

// POST /add-pantry-ingredient
app.post("/add-pantry-ingredient", async (req, res) => {
  const { user_id, ingredient_name, quantity, unit_of_measurement } = req.body;

  try {
    // Step 1: Insert the new ingredient into the "ingredients" table
    const insertIngredientQuery = `
      INSERT INTO ingredients (ingredient_name, quantity, unit_of_measurement)
      VALUES ($1, $2, $3)
      RETURNING ingredient_id
    `;
    const insertIngredientValues = [
      ingredient_name,
      quantity,
      unit_of_measurement,
    ];

    const insertedIngredient = await pool.query(
      insertIngredientQuery,
      insertIngredientValues
    );

    // Get the generated ingredient_id from the inserted ingredient
    const ingredient_id = insertedIngredient.rows[0].ingredient_id;

    // Step 2: Insert the new ingredient into the "pantry" table
    const insertPantryIngredientQuery = `
      INSERT INTO pantry (ingredient_id, user_id, ingredient_name, quantity, unit_of_measurement)
      VALUES ($1, $2, $3, $4, $5)
    `;
    const insertPantryIngredientValues = [
      ingredient_id,
      user_id,
      ingredient_name,
      quantity,
      unit_of_measurement,
    ];

    await pool.query(insertPantryIngredientQuery, insertPantryIngredientValues);

    res.json({ success: true });
  } catch (error) {
    console.error("Error adding pantry ingredient:", error);
    res.status(500).json({
      success: false,
      error: "An error occurred while adding pantry ingredient",
    });
  }
});

// Endpoint to create a new meal
/*app.post("/add-meal", async (req, res) => {
  const { user_id, mealName, dietPreference, foodRestrictions, calories } =
    req.body;

  try {
    // Step 1: Insert the new meal into the "meals" table
    const insertMealQuery = `
      INSERT INTO meals (meal_name, diet_preference, food_restrictions, calories, user_id)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING meal_id;
    `;
    const insertMealValues = [
      mealName,
      dietPreference,
      foodRestrictions,
      calories,
      user_id,
    ];

    const insertedMeal = await pool.query(insertMealQuery, insertMealValues);

    const meal_id = insertedMeal.rows[0].meal_id;

    res.status(201).json({ meal_id });
  } catch (error) {
    console.error("Error creating meal:", error);
    res
      .status(500)
      .json({ error: "An error occurred while creating the meal." });
  }
});*/

//Add new meal
/*app.post("/add-meal", upload.single('photo'), async (req, res) => {
  const { user_id, mealName, calories, dietPreference, foodRestrictions } =
    req.body;

  // Get the uploaded file information from req.file
  const photoFilePath = req.file ? req.file.path : null;

  // If you want to move the file to a specific directory (e.g., images) after saving it to the database, you can use fs-extra's move function:
  if (photoFilePath) {
    const targetDirectory = path.join(__dirname, "images"); // Replace 'images' with the directory where you want to store images
    const targetFilePath = path.join(targetDirectory, req.file.originalname);
    await fs.move(photoFilePath, targetFilePath);
  }

  try {
    // Check if a meal with the same name already exists
    const existingMealQuery = `
      SELECT * FROM meals WHERE meal_name = $1;
    `;
    const existingMealValues = [mealName];
    const existingMeal = await pool.query(
      existingMealQuery,
      existingMealValues
    );

    if (existingMeal.rows.length > 0) {
      // Meal with the same name already exists, return a 409 status
      return res
        .status(409)
        .json({ conflict: "Meal with the same name already exists." });
    }

    // Meal with the same name does not exist, proceed with creating a new meal
    const insertMealQuery = `
      INSERT INTO meals (user_id, meal_name, calories, diet_preference, food_restrictions)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING meal_id;
    `;
    const insertMealValues = [
      user_id,
      mealName,
      calories,
      dietPreference,
      foodRestrictions,
    ];

    const result = await pool.query(insertMealQuery, insertMealValues);

    res.status(201).json({ meal_id: result.rows[0].meal_id });
  } catch (error) {
    console.error("Error creating meal:", error);
    res
      .status(500)
      .json({ error: "An error occurred while creating the meal." });
  }
});*/

//Add new meal
/*app.post("/add-meal", upload.single('photo'), async (req, res) => {
  const { user_id, mealName, calories, dietPreference, foodRestrictions } =
    req.body;

  // Get the uploaded file information from req.file
  const photoFilePath = req.file ? req.file.path : null;

  try {
    // Check if a meal with the same name already exists
    const existingMealQuery = `
      SELECT * FROM meals WHERE meal_name = $1;
    `;
    const existingMealValues = [mealName];
    const existingMeal = await pool.query(
      existingMealQuery,
      existingMealValues
    );

    if (existingMeal.rows.length > 0) {
      // Meal with the same name already exists, return a 409 status
      return res
        .status(409)
        .json({ conflict: "Meal with the same name already exists." });
    }

    // Meal with the same name does not exist, proceed with creating a new meal
    const insertMealQuery = `
      INSERT INTO meals (user_id, meal_name, calories, diet_preference, food_restrictions, photo_filepath)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING meal_id;
    `;
    const insertMealValues = [
      user_id,
      mealName,
      calories,
      dietPreference,
      foodRestrictions,
      photoFilePath, // Add the photo file path to the query values
    ];

    const result = await pool.query(insertMealQuery, insertMealValues);

    res.status(201).json({ meal_id: result.rows[0].meal_id });
  } catch (error) {
    console.error("Error creating meal:", error);
    res
      .status(500)
      .json({ error: "An error occurred while creating the meal." });
  }
});*/

app.post("/add-meal", async (req, res) => {
  const { user_id, mealName, calories, dietPreference, foodRestrictions } =
    req.body;

  // Check if all required fields are present
  if (
    !mealName ||
    !calories ||
    !dietPreference ||
    !foodRestrictions ||
    !user_id
  ) {
    return res
      .status(400)
      .json({ error: "Please provide all required fields." });
  }

  try {
    // Check if a meal with the same name already exists
    const existingMealQuery = `
      SELECT * FROM meals WHERE meal_name = $1;
    `;
    const existingMealValues = [mealName];
    const existingMeal = await pool.query(
      existingMealQuery,
      existingMealValues
    );

    if (existingMeal.rows.length > 0) {
      // Meal with the same name already exists, return a 409 status
      return res
        .status(409)
        .json({ conflict: "Meal with the same name already exists." });
    }

    // Meal with the same name does not exist, proceed with creating a new meal
    const insertMealQuery = `
      INSERT INTO meals (user_id, meal_name, calories, diet_preference, food_restrictions)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING meal_id;
    `;
    const insertMealValues = [
      user_id,
      mealName,
      calories,
      dietPreference,
      foodRestrictions,
    ];

    const result = await pool.query(insertMealQuery, insertMealValues);

    res.status(201).json({ meal_id: result.rows[0].meal_id });
  } catch (error) {
    console.error("Error creating meal:", error);
    res
      .status(500)
      .json({ error: "An error occurred while creating the meal." });
  }
});

// Endpoint to add ingredients to a meal
app.post("/add-ingredient", async (req, res) => {
  const { mealId, ingredientName, quantity, unit } = req.body;

  try {
    // Step 1: Insert the new ingredient into the "ingredients" table
    const insertIngredientQuery = `
      INSERT INTO ingredients (meal_id, ingredient_name, quantity, unit_of_measurement)
      VALUES ($1, $2, $3, $4)
    `;
    const insertIngredientValues = [mealId, ingredientName, quantity, unit];

    await pool.query(insertIngredientQuery, insertIngredientValues);

    res.sendStatus(201);
  } catch (error) {
    console.error("Error adding ingredient:", error);
    res
      .status(500)
      .json({ error: "An error occurred while adding the ingredient." });
  }
});

// Endpoint to add recipe steps to a meal
app.post("/add-recipe-step", async (req, res) => {
  const { mealId, stepOrder, description } = req.body;

  try {
    const insertRecipeStepQuery = `
      INSERT INTO recipe_steps (meal_id, step_order, step_description)
      VALUES ($1, $2, $3);
    `;
    const insertRecipeStepValues = [mealId, stepOrder, description];

    await pool.query(insertRecipeStepQuery, insertRecipeStepValues);

    res.sendStatus(201);
  } catch (error) {
    console.error("Error adding recipe step:", error);
    res
      .status(500)
      .json({ error: "An error occurred while adding the recipe step." });
  }
});

//Your Meals fetch
app.get("/your-meals", (req, res) => {
  const user_id = req.query.user_id; // Assuming the user_id is provided as a query parameter

  // Fetch meals added by the logged-in user from the 'meals' table
  const fetchUserMealsQuery = `
    SELECT meal_id, meal_name, diet_preference, food_restrictions, calories
    FROM meals
    WHERE user_id = $1
  `;

  pool.query(fetchUserMealsQuery, [user_id], (err, mealsResult) => {
    if (err) {
      console.error("Error fetching user meals:", err);
      return res.status(500).json({ error: "Error fetching user meals" });
    }

    const meals = mealsResult.rows.map((meal) => ({
      meal_id: meal.meal_id,
      meal_name: meal.meal_name,
      diet_preference: meal.diet_preference,
      food_restrictions: meal.food_restrictions,
      calories: meal.calories,
    }));

    return res.json(meals);
  });
});

//Fetch user information
/*app.get("/user/:user_id", async (req, res) => {
  const { user_id } = req.params;

  try {
    // Fetch user information from the database based on user_id
    const result = await pool.query("SELECT * FROM users WHERE user_id = $1", [
      user_id,
    ]);

    if (result.rowCount === 0) {
      // User not found
      return res.status(404).json({ error: "User not found" });
    }

    const user = result.rows[0];
    // Return the user information as JSON response
    return res.json({
      name: user.name,
      email: user.email,
      password: user.password,
      dietPreference: user.diet_preference, // Use correct column name
      foodRestrictions: user.food_restrictions, // Use correct column name
    });
  } catch (error) {
    console.error("Error fetching user information:", error);
    return res
      .status(500)
      .json({ error: "An error occurred while fetching user information" });
  }
});*/

app.get("/user/:user_id", async (req, res) => {
  const { user_id } = req.params;

  try {
    // Fetch user information from the database based on user_id
    const result = await pool.query("SELECT * FROM users WHERE user_id = $1", [
      user_id,
    ]);

    if (result.rowCount === 0) {
      // User not found
      return res.status(404).json({ error: "User not found" });
    }

    const user = result.rows[0];
    // Return the user information as JSON response
    return res.json({
      name: user.name,
      email: user.email,
      password: user.password,
      dietPreference: user.diet_preference,
      foodRestrictions: user.food_restrictions,
    });
  } catch (error) {
    console.error("Error fetching user information:", error);
    return res
      .status(500)
      .json({ error: "An error occurred while fetching user information" });
  }
});

// Endpoint to update a user's profile
app.put("/update-user-profile", async (req, res) => {
  const { user_id, name, email, password, dietPreference, foodRestrictions } =
    req.body;

  try {
    // Update the user's profile data in the database
    const updateQuery = `
      UPDATE users
      SET name = $1, email = $2, password = $3, diet_preference = $4, food_restrictions = $5
      WHERE user_id = $6
    `;
    const values = [
      name,
      email,
      password,
      dietPreference,
      foodRestrictions,
      user_id,
    ];

    await pool.query(updateQuery, values);

    // Return a success response
    res.json({ success: true, message: "User profile updated successfully" });
  } catch (error) {
    console.error("Error updating user profile:", error);
    // Return an error response
    res
      .status(500)
      .json({
        success: false,
        message: "An error occurred while updating user profile",
      });
  }
});

// Endpoint for uploading images
app.post("/upload-image", upload.single("photo"), async (req, res) => {
  try {
    // Get the uploaded file information from req.file
    const photoFilePath = req.file ? req.file.path : null;

    if (!photoFilePath) {
      return res.status(400).json({ error: "No photo uploaded." });
    }

    // Move the file to the desired directory
    const targetDirectory = path.join(__dirname, "images"); // Replace 'images' with the directory where you want to store images
    const targetFilePath = path.join(targetDirectory, req.file.originalname);
    await fs.move(photoFilePath, targetFilePath);

    // Assuming you have the meal_id available in the request body
    const mealId = req.body.mealId;

    // Update the meal entry in the database with the file path
    const updateMealQuery = `
      UPDATE meals
      SET photo_filepath = $1
      WHERE meal_id = $2;
    `;
    const updateMealValues = [targetFilePath, mealId];
    await pool.query(updateMealQuery, updateMealValues);

    // Send a success response
    res.status(200).json({ success: true });
  } catch (error) {
    console.error("Error uploading image:", error);
    res.status(500).json({ error: "Failed to upload the image." });
  }
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
