import type { Database } from "./database.types";

export type Bean = Database["public"]["Tables"]["beans"]["Row"];
export type BeanInsert = Database["public"]["Tables"]["beans"]["Insert"];

export type Recipe = Database["public"]["Tables"]["recipes"]["Row"];
export type RecipeInsert = Database["public"]["Tables"]["recipes"]["Insert"];

export type BrewLog = Database["public"]["Tables"]["brew_logs"]["Row"];
export type BrewLogInsert = Database["public"]["Tables"]["brew_logs"]["Insert"];

export type BrewComment = Database["public"]["Tables"]["brew_comments"]["Row"];
export type BrewCommentInsert =
  Database["public"]["Tables"]["brew_comments"]["Insert"];

// One row of a recipe's pour schedule table.
export type PourStep = {
  pour: string; // label, e.g. "Bloom" or "2nd pour"
  cumulative_g: string; // cumulative water in grams
  time: string; // mm:ss target for this pour
  note: string;
};

// A tasting session joined with its recipe.
export type BrewLogWithRecipe = BrewLog & { recipe: Recipe | null };
