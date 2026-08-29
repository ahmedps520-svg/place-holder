# Water charity — design mockup

A design mockup for a charity that distributes clean drinking water. **The
organisation does not have a name yet**, and nothing on this page takes
money yet. Read this before showing it to anyone who might mistake it for
a live site.

**Preview:** https://ahmedps520-svg.github.io/place-holder/

## Before this becomes a real site

### 1. The name

Every slot for the organisation's name is `class="ph"` and reads
`اسم الجمعية`. They render with a dashed amber underline so an unfilled
slot is impossible to miss. Replace them, then delete the `.ph` rule from
the stylesheet.

### 2. The numbers

Everything in `class="ph-num"` is invented for the mockup:

| Where | Placeholder | Must become |
|---|---|---|
| Campaign goal bar | 31,400 of 50,000 SAR (`GOAL_RAISED` / `GOAL_TARGET` in `main.js`) | Real campaign totals, or delete the bar |
| Cost per bottle | 0.44 SAR (`SAR_PER_BOTTLE` in `main.js`) | The price the charity's supplier actually charges |
| Licence no. (footer) | ٠٠٠٠٠٠ | Real number from the licensing authority |

**On the cost figure.** The earlier version of this page claimed 1 SAR
buys 10 litres. It doesn't, anywhere. A 48-bottle carton of 200 ml
bottles (Berain, Arwa) retails around 21 SAR in Saudi, which is roughly
0.44 SAR per bottle — about 0.46 litres per riyal, not ten. The page now
counts **bottles**, because a bottle is a thing you can picture and a
litre of donated water is not.

A charity publishing invented impact figures is not a cosmetic problem —
it is the kind of thing that ends an organisation. Replace or delete
every one before launch.

### 3. Payment — Moyasar

The donation panel currently shows a **"Payment not connected yet"**
notice instead of a live form. That is deliberate: a donate button that
looks live and takes nothing is worse than no button.

To connect it, set one line at the top of `assets/js/main.js`:

```js
var MOYASAR_KEY = 'pk_live_xxxxxxxxxxxxxxxxxxxx';
```

The moment that key is non-empty, `main.js` loads the Moyasar Form
library, mounts the real card + Apple Pay form into `#moyasarForm`, and
hides the notice. Nothing else needs editing.

**Publishable keys (`pk_…`) are safe in frontend code. Secret keys
(`sk_…`) are not — a secret key in a public GitHub repo can be used to
issue refunds and read every transaction. Never paste one here.**

What has to happen on Moyasar's side first:

1. **Merchant account.** Register the charity on Moyasar. This needs the
   commercial registration or charity licence and a Saudi bank account,
   so the licence in §2 has to exist first.
2. **Apple Pay domain.** Moyasar Dashboard → Settings → Apple Pay Domains
   → add the live domain. Moyasar hands back a verification file to serve
   at `/.well-known/apple-developer-merchantid-domain-association`.
   GitHub Pages can serve it, but the folder starts with a dot, so add an
   empty `.nojekyll` file at the repo root or Pages will skip it.
3. **Test first.** Use `pk_test_…` and Moyasar's test cards, confirm a
   payment lands in the dashboard, then swap in the live key.

**Note on servers:** Apple Pay needs a server-to-server merchant
validation call during the payment sheet handshake — but **Moyasar
performs it for you** at `https://api.moyasar.com/v1/applepay/initiate`.
So the payment sheet itself works from static hosting; you do not need
your own backend for it. You *would* want one later for server-side
verification of each payment and for emailing receipts, but that is a
second phase, not a blocker.

Apple Pay only appears on Safari/iOS with a card in Wallet. Everyone else
sees the card form — that is Moyasar's behaviour, not a bug.

### 4. The mockup banner

The striped bar at the top (`#mockbar`) says the page is a mockup. Delete
that element and its CSS when the site goes live.

The `noindex` meta tag has been removed, so **search engines can index
this page now, placeholders and all**. That is fine for a page about to
launch; it is not fine for one that will sit unfinished for months, since
Google may cache `اسم الجمعية` and the invented campaign totals. Either
finish §1 and §2 soon or put the tag back:

```html
<meta name="robots" content="noindex, nofollow">
```

## What already works

- Arabic ships in the markup, English is a toggle, both fully RTL/LTR
- Donation panel sits directly under the hero, not buried at the bottom
- Preset amounts, custom amount, and a live readout that turns riyals
  into a visible grid of bottles (capped at 120, with a `+N more` label)
- Numerals switch script with the language (٥٠ / 50)
- Campaign goal bar with an animated, time-based counter
- Scroll reveals, hero parallax, a water level that rises as you read,
  hide-on-scroll nav, sticky donate bar on mobile
- No framework, no build step, no dependencies

## Gap to close

The transparency section was removed, and it held the only contact address
on the page. **There is now no way for anyone to reach the charity from
this site** — no email, no phone, no form. Add one before launch.

## Notes for whoever edits this

- Moyasar takes amounts in **halalas**, not riyals — `main.js` multiplies
  by 100. 50 SAR is `5000`.
- The tick marks use **physical** `border-left`/`border-bottom`, not
  logical properties. A checkmark is not a directional glyph — logical
  borders flip it into a chevron in RTL.
- The headline is split into **words**, never characters. Arabic is
  cursive; a span per letter breaks the joining.
- Arabic sets much wider than the `ch` unit predicts, so `.pull` carries a
  separate `max-width` under `html[lang="ar"]`.
- The nav offsets itself by `--bar`, measured from the mockup banner at
  runtime, so removing the banner needs no other change.
- `hero.jpg` and `handoff.jpg` are both images Ahmed supplied. Neither
  shows an identifiable face. They should still become real photographs of
  the charity's own work, with consent from anyone recognisable in them —
  and a child in a real photo needs a guardian's consent, not the child's.
- The hero photo is taller in ratio than a phone viewport, so it crops
  sideways there and `object-position` has no vertical travel. The scrim
  does the work instead; see the comment on `.hero__scrim`.
