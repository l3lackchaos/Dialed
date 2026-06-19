// Dialed — Recipes API (Supabase Edge Function)
//
// A small JSON API so an external agent (e.g. a Claude pour-over skill) can add
// recipes and read tasting results.
//
//   Auth:   header  x-api-key: <RECIPES_API_KEY>
//   Base:   https://<project>.supabase.co/functions/v1/recipes
//
//   GET    /recipes              -> { recipes: [...] }            list all
//   GET    /recipes?id=<uuid>    -> { recipe, summary, rounds }   one + results
//   POST   /recipes  (JSON body) -> { ok, recipe, view_url }      create
//
// POST body (friendly aliases accepted):
//   { name*, bean, dripper, grinder, clicks, water_temp|temp,
//     dose, water, target_time, notes, pour_schedule:[{pour,cumulative_g,time,note}] }
//   ratio is computed from dose + water automatically.
import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SERVICE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
// The live key is configured on the deployed function. To run your own copy,
// set a RECIPES_API_KEY secret on the Supabase project before deploying.
const API_KEY = Deno.env.get("RECIPES_API_KEY") ?? "set-RECIPES_API_KEY-secret";
const APP_URL = Deno.env.get("APP_URL") ?? "https://dialedcoff.bar";

// CORS — applied to every response (success, errors, and the OPTIONS preflight).
const cors: Record<string, string> = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-api-key, apikey, content-type",
  "Access-Control-Allow-Methods": "GET, POST, PATCH, PUT, DELETE, OPTIONS",
  "Access-Control-Max-Age": "86400",
};

const FLAVOR = ["acidity", "body", "sweetness", "bitterness", "clarity"] as const;

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body, null, 2), {
    status,
    headers: { "Content-Type": "application/json", ...cors },
  });
}

async function db(path: string, init?: RequestInit) {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/${path}`, {
    ...init,
    headers: {
      apikey: SERVICE_KEY,
      Authorization: `Bearer ${SERVICE_KEY}`,
      "Content-Type": "application/json",
      ...(init?.headers ?? {}),
    },
  });
  const text = await res.text();
  const data = text ? JSON.parse(text) : null;
  if (!res.ok) throw new Error(data?.message ?? `DB error ${res.status}`);
  return data;
}

const num = (v: unknown): number | null =>
  v === undefined || v === null || v === "" ? null : Number(v);

function avg(arr: unknown[]): number | null {
  const v = arr.filter((n): n is number => typeof n === "number");
  if (!v.length) return null;
  return Math.round((v.reduce((a, b) => a + b, 0) / v.length) * 10) / 10;
}

// deno-lint-ignore no-explicit-any
function compact(r: any) {
  return {
    id: r.id, name: r.name, bean: r.bean_label, dripper: r.dripper,
    grinder: r.grinder, clicks: r.click_setting, water_temp: r.water_temp,
    dose_g: r.dose_g, water_g: r.water_g, ratio: r.ratio,
    target_time: r.target_time, notes: r.notes, pour_schedule: r.pour_schedule,
    finished: r.finished ?? false,
  };
}

// deno-lint-ignore no-explicit-any
function toRow(b: any) {
  const dose = num(b.dose ?? b.dose_g);
  const water = num(b.water ?? b.water_g);
  const ratio = dose && water ? `1:${(water / dose).toFixed(1)}` : (b.ratio ?? null);
  return {
    name: String(b.name).trim(),
    bean_label: b.bean ?? b.bean_label ?? null,
    dripper: b.dripper ?? null,
    grinder: b.grinder ?? null,
    click_setting: b.clicks ?? b.click_setting ?? null,
    water_temp: num(b.water_temp ?? b.temp),
    dose_g: dose,
    water_g: water,
    ratio,
    target_time: b.target_time ?? b.target ?? null,
    notes: b.notes ?? null,
    pour_schedule: Array.isArray(b.pour_schedule) ? b.pour_schedule : [],
    finished: b.finished === true,
  };
}

// deno-lint-ignore no-explicit-any
function toPatch(b: any) {
  const p: Record<string, unknown> = {};
  if ("name" in b) p.name = String(b.name).trim();
  if ("bean" in b || "bean_label" in b) p.bean_label = b.bean ?? b.bean_label ?? null;
  if ("dripper" in b) p.dripper = b.dripper ?? null;
  if ("grinder" in b) p.grinder = b.grinder ?? null;
  if ("clicks" in b || "click_setting" in b) p.click_setting = b.clicks ?? b.click_setting ?? null;
  if ("water_temp" in b || "temp" in b) p.water_temp = num(b.water_temp ?? b.temp);
  if ("dose" in b || "dose_g" in b) p.dose_g = num(b.dose ?? b.dose_g);
  if ("water" in b || "water_g" in b) p.water_g = num(b.water ?? b.water_g);
  if ("target_time" in b || "target" in b) p.target_time = b.target_time ?? b.target ?? null;
  if ("notes" in b) p.notes = b.notes ?? null;
  if ("pour_schedule" in b) p.pour_schedule = Array.isArray(b.pour_schedule) ? b.pour_schedule : [];
  if ("finished" in b) p.finished = b.finished === true;
  if ("ratio" in b) p.ratio = b.ratio;
  if (typeof p.dose_g === "number" && typeof p.water_g === "number") {
    p.ratio = `1:${((p.water_g as number) / (p.dose_g as number)).toFixed(1)}`;
  }
  return p;
}

async function recipeDetail(id: string) {
  const recipes = await db(`recipes?id=eq.${id}&select=*`);
  if (!recipes.length) throw new Error("Recipe not found");
  const sessions = await db(
    `brew_logs?recipe_id=eq.${id}&select=id,brew_date,actual_time,brewer_note,brew_comments(overall,acidity,body,sweetness,bitterness,clarity)&order=brew_date.desc`,
  );
  // deno-lint-ignore no-explicit-any
  const rounds = sessions.map((s: any) => {
    const cs = s.brew_comments ?? [];
    return {
      id: s.id,
      date: s.brew_date,
      finish_time: s.actual_time ?? null,
      brewer_note: s.brewer_note ?? null,
      tasters: cs.length,
      // deno-lint-ignore no-explicit-any
      avg_overall: avg(cs.map((c: any) => c.overall)),
      // deno-lint-ignore no-explicit-any
      flavor: Object.fromEntries(FLAVOR.map((a) => [a, avg(cs.map((c: any) => c[a]))])),
    };
  });
  // deno-lint-ignore no-explicit-any
  const all = sessions.flatMap((s: any) => s.brew_comments ?? []);
  return {
    recipe: compact(recipes[0]),
    view_url: `${APP_URL}/r/${id}`,
    summary: {
      rounds: rounds.length,
      total_tastings: all.length,
      // deno-lint-ignore no-explicit-any
      avg_overall: avg(all.map((c: any) => c.overall)),
      // deno-lint-ignore no-explicit-any
      flavor: Object.fromEntries(FLAVOR.map((a) => [a, avg(all.map((c: any) => c[a]))])),
    },
    rounds,
  };
}

Deno.serve(async (req) => {
  // Preflight: answer before auth so browsers can complete the CORS handshake.
  if (req.method === "OPTIONS") return new Response(null, { status: 204, headers: cors });
  if ((req.headers.get("x-api-key") ?? "") !== API_KEY) {
    return json({ error: "Unauthorized — set header x-api-key" }, 401);
  }
  try {
    const url = new URL(req.url);
    const id = url.searchParams.get("id");

    if (req.method === "GET") {
      if (id) return json(await recipeDetail(id));
      const recipes = await db(`recipes?select=*&order=created_at.desc`);
      // deno-lint-ignore no-explicit-any
      return json({ recipes: recipes.map((r: any) => compact(r)) });
    }

    if (req.method === "POST") {
      const body = await req.json().catch(() => null);
      if (!body || !body.name) return json({ error: "Field 'name' is required" }, 400);
      const created = await db(`recipes?select=*`, {
        method: "POST",
        headers: { Prefer: "return=representation" },
        body: JSON.stringify(toRow(body)),
      });
      const recipe = compact(created[0]);
      return json({ ok: true, recipe, view_url: `${APP_URL}/r/${created[0].id}` }, 201);
    }

    if (req.method === "PATCH" || req.method === "PUT") {
      if (!id) return json({ error: "Query param 'id' is required" }, 400);
      const body = await req.json().catch(() => null);
      if (!body) return json({ error: "JSON body is required" }, 400);
      const updated = await db(`recipes?id=eq.${id}&select=*`, {
        method: "PATCH",
        headers: { Prefer: "return=representation" },
        body: JSON.stringify(toPatch(body)),
      });
      if (!updated.length) return json({ error: "Recipe not found" }, 404);
      return json({ ok: true, recipe: compact(updated[0]), view_url: `${APP_URL}/r/${id}` });
    }

    if (req.method === "DELETE") {
      if (!id) return json({ error: "Query param 'id' is required" }, 400);
      await db(`recipes?id=eq.${id}`, { method: "DELETE" });
      return json({ ok: true, deleted: id });
    }

    return json({ error: "Method not allowed" }, 405);
  } catch (e) {
    return json({ error: e instanceof Error ? e.message : "Server error" }, 500);
  }
});
