# Dialed Recipes API

A small JSON API for adding pour-over recipes and reading tasting results —
built so an external agent (e.g. a Claude pour-over skill) can manage recipes
programmatically.

It's a Supabase Edge Function; source lives in
[`supabase/functions/recipes/index.ts`](supabase/functions/recipes/index.ts).

## Base URL

```
https://ohbepgrcinhjdvweuwym.supabase.co/functions/v1/recipes
```

## Auth

Every request must send the API key as a header:

```
x-api-key: <YOUR_API_KEY>
```

> The live key is **not** stored in this repo. It was generated when the function
> was deployed and shared privately. To rotate it, set a `RECIPES_API_KEY` secret
> on the Supabase project (Edge Functions → Secrets) and redeploy — the function
> reads the env var first.

## Endpoints

### List recipes
```
GET /functions/v1/recipes
```
→ `{ "recipes": [ { id, name, bean, dripper, grinder, clicks, water_temp, dose_g, water_g, ratio, target_time, notes, pour_schedule }, … ] }`

### Create a recipe
```
POST /functions/v1/recipes
Content-Type: application/json
```
Body (only `name` is required; friendly aliases accepted, `ratio` auto-computed
from `dose` + `water`):
```json
{
  "name": "Tetsu 4:6 — bright",
  "bean": "Geisha Esmeralda",
  "dripper": "V60",
  "grinder": "C40 Nitro Blade+Starwave",
  "clicks": "22 clicks",
  "water_temp": 92,
  "dose": 15,
  "water": 250,
  "target_time": "2:30",
  "notes": "Two bloom pours for acidity.",
  "pour_schedule": [
    { "pour": "Bloom", "cumulative_g": "50",  "time": "0:00", "note": "swirl" },
    { "pour": "2nd",   "cumulative_g": "150", "time": "0:45", "note": "center" },
    { "pour": "3rd",   "cumulative_g": "250", "time": "1:30", "note": "spiral" }
  ]
}
```
→ `201 { "ok": true, "recipe": { … }, "view_url": "https://dialedcoff.bar/r/<id>" }`

### Get one recipe + tasting results
```
GET /functions/v1/recipes?id=<uuid>
```
→
```json
{
  "recipe": { … },
  "view_url": "https://dialedcoff.bar/r/<id>",
  "summary": {
    "rounds": 2,
    "total_tastings": 7,
    "avg_overall": 4.3,
    "flavor": { "acidity": 4.1, "body": 3.4, "sweetness": 4.2, "bitterness": 1.8, "clarity": 4.0 }
  },
  "rounds": [
    { "id": "…", "date": "2026-06-18", "tasters": 4, "avg_overall": 4.5,
      "flavor": { "acidity": 5, "body": 3, "sweetness": 4, "bitterness": 1, "clarity": 5 } }
  ]
}
```

## curl examples

```bash
KEY=<YOUR_API_KEY>
BASE=https://ohbepgrcinhjdvweuwym.supabase.co/functions/v1/recipes

# list
curl -s "$BASE" -H "x-api-key: $KEY"

# create
curl -s -X POST "$BASE" -H "x-api-key: $KEY" -H "content-type: application/json" \
  -d '{"name":"Kalita sweet","bean":"Kayon Mountain","dripper":"Kalita Tsubame","dose":20,"water":320,"water_temp":90,"clicks":"4.2","target_time":"3:00"}'

# results for one recipe
curl -s "$BASE?id=<uuid>" -H "x-api-key: $KEY"
```

## Notes

- The function uses the service role internally, so it works regardless of RLS.
- Errors return `{ "error": "…" }` with a 4xx/5xx status.
- CORS is open (`*`) so it can be called from anywhere.
