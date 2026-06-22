---
name: pour-over-recipe
description: >
  Design, dial in, and iterate pour-over coffee recipes, and push them into the
  Dialed app via its API. Use when the user wants a pour-over recipe, says
  "design a recipe", "dial in this coffee", "give me a V60/Kalita/Origami
  recipe", asks how to brew a specific bean, wants to fix a sour/bitter/weak/
  hollow cup, or wants to add a recipe to Dialed or read its tasting results.
license: MIT
---

# Pour-Over Recipe

Design specialty pour-over recipes like a thoughtful brewer, then (optionally)
create them in the **Dialed** app and read back the table's tasting results to
iterate.

## 1. Gather what matters

Ask only for what you can't infer; otherwise pick sensible defaults and say so.

- **Bean**: origin, process (washed = clean/bright, natural = fruity/heavy,
  honey/anaerobic = funky/sweet), roast level, days off roast.
- **Gear**: dripper (V60, Origami, Kalita Tsubame, Pegasus, Switch, OREA),
  grinder, kettle (gooseneck?), filter.
- **Goal**: clarity & acidity, or body & sweetness; batch size / cups.

## 2. Design the recipe

Defaults that work, then adjust by intent:

- **Ratio** 1:15 (stronger/syrupy) → 1:17 (lighter/tea-like). Start **1:16.7**
  (e.g. 15 g : 250 g).
- **Water temp** by roast: light **94–96°C**, medium **90–93°C**, dark **84–88°C**.
- **Grind**: medium-fine for V60/Origami; medium for Kalita/flat-bottom. Finer =
  more extraction (more body/bitterness), coarser = less (more acidity/clarity).
- **Pour schedule** (cumulative grams):
  - **Bloom** 2–3× dose (e.g. 45–50 g), 30–45 s, gentle swirl.
  - Then 2–4 even pours to target; finish by ~**2:30–3:00** for V60.
  - More, smaller pours = higher extraction & body; fewer, larger = cleaner.
- **Dripper character**: V60 = fast, clean, forgiving of fine grind; Kalita =
  flat bed, even, more forgiving of pour; Origami = flexible (V60-like on cone
  filter); Switch/Clever = immersion control; OREA = flat, high flow.

## 3. Dial in by taste

The brewer/table tastes it; adjust **one variable at a time**:

| Cup tastes… | Likely cause | Fix |
| --- | --- | --- |
| Sour, sharp, thin | under-extracted | grind **finer**, water **hotter**, slow the pours / extend time |
| Bitter, dry, harsh | over-extracted | grind **coarser**, water **cooler**, fewer pours / shorter time |
| Weak, watery | too low strength | lower ratio (more coffee), e.g. 1:16 |
| Muddy, flat | too high / uneven | coarser, gentler agitation, cleaner pours |
| Hollow mid | uneven extraction | even pours, keep the bed flat |

State the change and *why* in one line; don't change three things at once.

## 4. Output

Give a complete, brewable recipe: bean, dripper, grinder + clicks, temp, dose,
water, ratio, and the pour schedule as steps. Keep it tight.

## 5. Push to Dialed (optional)

When the user wants it in the app, use the **Dialed Recipes API**
(see `API.md` / `openapi.yaml` in this repo). Auth is a header `x-api-key`; the
user provides the key (don't hardcode it).

```bash
BASE=https://ohbepgrcinhjdvweuwym.supabase.co/functions/v1/recipes
KEY="$DIALED_API_KEY"   # ask the user / read from env; never commit it

# Create the recipe (ratio is computed from dose + water)
curl -s -X POST "$BASE" -H "x-api-key: $KEY" -H "content-type: application/json" -d '{
  "name": "Geisha — bright V60",
  "bean": "Esmeralda Geisha (Washed, Light)",
  "dripper": "V60",
  "grinder": "C40 Nitro Blade+Starwave",
  "clicks": "22 clicks",
  "water_temp": 94,
  "dose": 15,
  "water": 250,
  "target_time": "2:45",
  "notes": "Two-stage bloom for acidity; gentle agitation.",
  "pour_schedule": [
    { "pour": "Bloom", "cumulative_g": "45",  "time": "0:00", "note": "swirl" },
    { "pour": "2nd",   "cumulative_g": "150", "time": "0:45", "note": "center, slow" },
    { "pour": "3rd",   "cumulative_g": "250", "time": "1:30", "note": "spiral" }
  ]
}'
# → { ok, recipe, view_url }  — share view_url so the table can taste & rate
```

## 6. Read results & iterate

After a tasting round, pull the scores and adjust the recipe:

```bash
curl -s "$BASE?id=<recipe-id>" -H "x-api-key: $KEY"
# summary.flavor: { acidity, body, sweetness, bitterness, clarity }
# rounds[].brewer_note / finish_time tell you what was done
```

- Low **sweetness** + high **acidity** → grind finer or raise temp; re-create or
  `PATCH` the recipe.
- High **bitterness** → grind coarser or lower temp.
- When a bean is used up, `PATCH {"finished": true}`.

Close the loop: design → create → share → read tasting results → adjust.
