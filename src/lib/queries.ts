import { supabase } from "./supabase";
import type {
  Bean,
  BeanInsert,
  BrewComment,
  BrewCommentInsert,
  BrewLog,
  BrewLogInsert,
  BrewLogWithRecipe,
  Recipe,
  RecipeInsert,
  RecipeWithBean,
} from "./types";

function unwrap<T>(res: { data: T | null; error: { message: string } | null }): T {
  if (res.error) throw new Error(res.error.message);
  return res.data as T;
}

/* ----------------------------- Beans ----------------------------- */

export async function fetchBeans(): Promise<Bean[]> {
  return unwrap(
    await supabase.from("beans").select("*").order("created_at", { ascending: false }),
  );
}

export async function fetchBean(id: string): Promise<Bean> {
  return unwrap(await supabase.from("beans").select("*").eq("id", id).single());
}

export async function createBean(payload: BeanInsert): Promise<Bean> {
  return unwrap(await supabase.from("beans").insert(payload).select().single());
}

export async function updateBean(id: string, payload: Partial<BeanInsert>): Promise<Bean> {
  return unwrap(
    await supabase.from("beans").update(payload).eq("id", id).select().single(),
  );
}

export async function deleteBean(id: string): Promise<void> {
  const { error } = await supabase.from("beans").delete().eq("id", id);
  if (error) throw new Error(error.message);
}

/* ---------------------------- Recipes ---------------------------- */

export async function fetchRecipes(): Promise<RecipeWithBean[]> {
  return unwrap(
    await supabase
      .from("recipes")
      .select("*, bean:beans(*)")
      .order("created_at", { ascending: false }),
  ) as RecipeWithBean[];
}

export async function fetchFavoriteRecipes(): Promise<RecipeWithBean[]> {
  return unwrap(
    await supabase
      .from("recipes")
      .select("*, bean:beans(*)")
      .eq("is_favorite", true)
      .order("created_at", { ascending: false }),
  ) as RecipeWithBean[];
}

export async function fetchRecipe(id: string): Promise<Recipe> {
  return unwrap(await supabase.from("recipes").select("*").eq("id", id).single());
}

export async function createRecipe(payload: RecipeInsert): Promise<Recipe> {
  return unwrap(await supabase.from("recipes").insert(payload).select().single());
}

export async function updateRecipe(
  id: string,
  payload: Partial<RecipeInsert>,
): Promise<Recipe> {
  return unwrap(
    await supabase.from("recipes").update(payload).eq("id", id).select().single(),
  );
}

export async function toggleRecipeFavorite(
  id: string,
  isFavorite: boolean,
): Promise<void> {
  const { error } = await supabase
    .from("recipes")
    .update({ is_favorite: isFavorite })
    .eq("id", id);
  if (error) throw new Error(error.message);
}

export async function deleteRecipe(id: string): Promise<void> {
  const { error } = await supabase.from("recipes").delete().eq("id", id);
  if (error) throw new Error(error.message);
}

/* --------------------------- Brew logs --------------------------- */

export async function fetchBrewLogs(): Promise<BrewLogWithRecipe[]> {
  return unwrap(
    await supabase
      .from("brew_logs")
      .select("*, recipe:recipes(*, bean:beans(*))")
      .order("brew_date", { ascending: false })
      .order("created_at", { ascending: false }),
  ) as BrewLogWithRecipe[];
}

export async function fetchBrewLog(id: string): Promise<BrewLogWithRecipe> {
  return unwrap(
    await supabase
      .from("brew_logs")
      .select("*, recipe:recipes(*, bean:beans(*))")
      .eq("id", id)
      .single(),
  ) as BrewLogWithRecipe;
}

export async function createBrewLog(payload: BrewLogInsert): Promise<BrewLog> {
  return unwrap(await supabase.from("brew_logs").insert(payload).select().single());
}

export async function updateBrewLog(
  id: string,
  payload: Partial<BrewLogInsert>,
): Promise<BrewLog> {
  return unwrap(
    await supabase.from("brew_logs").update(payload).eq("id", id).select().single(),
  );
}

export async function deleteBrewLog(id: string): Promise<void> {
  const { error } = await supabase.from("brew_logs").delete().eq("id", id);
  if (error) throw new Error(error.message);
}

/* ------------------------- Brew comments ------------------------- */

export async function fetchBrewComments(brewLogId: string): Promise<BrewComment[]> {
  return unwrap(
    await supabase
      .from("brew_comments")
      .select("*")
      .eq("brew_log_id", brewLogId)
      .order("created_at", { ascending: true }),
  );
}

export async function createBrewComment(
  payload: BrewCommentInsert,
): Promise<BrewComment> {
  return unwrap(
    await supabase.from("brew_comments").insert(payload).select().single(),
  );
}

export async function deleteBrewComment(id: string): Promise<void> {
  const { error } = await supabase.from("brew_comments").delete().eq("id", id);
  if (error) throw new Error(error.message);
}

/** Every tasting comment tagged with the bean it belongs to — powers the dashboard radar. */
export type TastingRow = {
  bean_id: string | null;
  acidity: number | null;
  body: number | null;
  sweetness: number | null;
  bitterness: number | null;
  clarity: number | null;
  overall: number | null;
};

export async function fetchTastingByBean(): Promise<TastingRow[]> {
  const rows = unwrap(
    await supabase
      .from("brew_comments")
      .select(
        "acidity, body, sweetness, bitterness, clarity, overall, brew_logs(recipes(bean_id))",
      ),
  ) as Array<Record<string, unknown>>;

  return rows.map((r) => {
    const log = r.brew_logs as { recipes?: { bean_id?: string } } | null;
    return {
      bean_id: log?.recipes?.bean_id ?? null,
      acidity: r.acidity as number | null,
      body: r.body as number | null,
      sweetness: r.sweetness as number | null,
      bitterness: r.bitterness as number | null,
      clarity: r.clarity as number | null,
      overall: r.overall as number | null,
    };
  });
}
