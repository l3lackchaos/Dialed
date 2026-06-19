import { supabase } from "./supabase";
import type {
  BrewComment,
  BrewCommentInsert,
  BrewLog,
  BrewLogWithRecipe,
  Recipe,
  RecipeInsert,
} from "./types";

function unwrap<T>(res: { data: T | null; error: { message: string } | null }): T {
  if (res.error) throw new Error(res.error.message);
  return res.data as T;
}

/* ----------------------------- Recipes ----------------------------- */

export async function fetchRecipes(): Promise<Recipe[]> {
  return unwrap(
    await supabase.from("recipes").select("*").order("created_at", { ascending: false }),
  );
}

export async function fetchRecipe(id: string): Promise<Recipe> {
  return unwrap(await supabase.from("recipes").select("*").eq("id", id).single());
}

export async function createRecipe(payload: RecipeInsert): Promise<Recipe> {
  return unwrap(await supabase.from("recipes").insert(payload).select().single());
}

export async function updateRecipe(id: string, payload: Partial<RecipeInsert>): Promise<Recipe> {
  return unwrap(await supabase.from("recipes").update(payload).eq("id", id).select().single());
}

export async function setRecipeFinished(id: string, finished: boolean): Promise<void> {
  const { error } = await supabase.from("recipes").update({ finished }).eq("id", id);
  if (error) throw new Error(error.message);
}

export async function deleteRecipe(id: string): Promise<void> {
  const { error } = await supabase.from("recipes").delete().eq("id", id);
  if (error) throw new Error(error.message);
}

export async function deleteRecipes(ids: string[]): Promise<void> {
  if (!ids.length) return;
  const { error } = await supabase.from("recipes").delete().in("id", ids);
  if (error) throw new Error(error.message);
}

/* ----------------------- Tasting sessions (brew_logs) ----------------------- */

export type SessionSummary = BrewLog & { tasting_count: number; avg_overall: number | null };

export async function createSession(recipeId: string): Promise<BrewLog> {
  return unwrap(
    await supabase.from("brew_logs").insert({ recipe_id: recipeId }).select().single(),
  );
}

export async function fetchSession(id: string): Promise<BrewLogWithRecipe> {
  return unwrap(
    await supabase.from("brew_logs").select("*, recipe:recipes(*)").eq("id", id).single(),
  ) as BrewLogWithRecipe;
}

export async function deleteSession(id: string): Promise<void> {
  const { error } = await supabase.from("brew_logs").delete().eq("id", id);
  if (error) throw new Error(error.message);
}

/** Sessions for one recipe, each with how many people tasted + the average score. */
export async function fetchSessionsForRecipe(recipeId: string): Promise<SessionSummary[]> {
  const logs = unwrap(
    await supabase
      .from("brew_logs")
      .select("*, brew_comments(overall)")
      .eq("recipe_id", recipeId)
      .order("brew_date", { ascending: false })
      .order("created_at", { ascending: false }),
  ) as Array<BrewLog & { brew_comments: { overall: number | null }[] }>;
  return logs.map(summarize);
}

/** All sessions across recipes, newest first (the Tastings tab). */
export async function fetchRecentSessions(): Promise<(SessionSummary & { recipe: Recipe | null })[]> {
  const logs = unwrap(
    await supabase
      .from("brew_logs")
      .select("*, recipe:recipes(*), brew_comments(overall)")
      .order("brew_date", { ascending: false })
      .order("created_at", { ascending: false }),
  ) as Array<BrewLog & { recipe: Recipe | null; brew_comments: { overall: number | null }[] }>;
  return logs.map((l) => ({ ...summarize(l), recipe: l.recipe }));
}

function summarize<T extends BrewLog & { brew_comments: { overall: number | null }[] }>(
  l: T,
): SessionSummary {
  const scores = (l.brew_comments ?? []).map((c) => c.overall).filter((n): n is number => n != null);
  const avg = scores.length ? scores.reduce((a, b) => a + b, 0) / scores.length : null;
  return { ...l, tasting_count: (l.brew_comments ?? []).length, avg_overall: avg };
}

/* ----------------------- Tastings (brew_comments) ----------------------- */

export async function fetchTastings(sessionId: string): Promise<BrewComment[]> {
  return unwrap(
    await supabase
      .from("brew_comments")
      .select("*")
      .eq("brew_log_id", sessionId)
      .order("created_at", { ascending: true }),
  );
}

export async function createTasting(payload: BrewCommentInsert): Promise<BrewComment> {
  return unwrap(await supabase.from("brew_comments").insert(payload).select().single());
}

export async function deleteTasting(id: string): Promise<void> {
  const { error } = await supabase.from("brew_comments").delete().eq("id", id);
  if (error) throw new Error(error.message);
}
