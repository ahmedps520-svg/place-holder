# Water charity — design mockup

A design mockup for a charity that distributes clean water. **The
organisation does not have a name yet**, and nothing on this page takes
money. Read this before showing it to anyone who might mistake it for a
live site.

**Preview:** https://ahmedps520-svg.github.io/place-holder/

## Before this becomes a real site

### 1. The name

Every slot for the organisation's name is `class="ph"` and reads
`اسم الجمعية`. They render with a dashed amber underline so an unfilled
slot is impossible to miss. Replace them, then delete the `.ph` rule from
the stylesheet.

### 2. The numbers — the important one

Everything in `class="ph-num"` is invented for the mockup:

| Where | Placeholder | Must become |
|---|---|---|
| Counters | 1,250,000 litres / 38 communities / 100% | Real audited figures, or delete the section |
| Impact rate | 10 litres per 1 SAR (`LITRES_PER_RIYAL` in `main.js`) | Actual cost per litre |
| Registration no. | ٠٠٠٠٠٠ | Real number from the licensing authority |
| Contact email | hello@example.org | Real address |

A charity publishing invented impact figures is not a cosmetic problem —
it is the kind of thing that ends an organisation. Replace or delete
every one.

### 3. Apple Pay

The button is styled to Apple's spec but **deliberately disabled**:
`disabled`, `aria-disabled="true"`, 45% opacity and a `not-allowed`
cursor, with a note under it. A donate button that looks live and takes
nothing is worse than no button.

Apple Pay cannot run from static hosting. You need all three of:

1. **A payment provider.** In Saudi: Moyasar, Tap, or Checkout.com are
   the usual choices; Stripe also supports Apple Pay. The charity needs a
   merchant account, which needs the registration/licence.
2. **Domain verification.** Apple gives you a file to serve from
   `/.well-known/apple-developer-merchantid-domain-association`. GitHub
   Pages can serve it, but the domain must be the real one, on HTTPS.
3. **A server endpoint** to validate the merchant session. This is the
   part static hosting cannot do — Apple requires a server-to-server call
   during the payment sheet handshake. A small serverless function is
   enough.

Most providers give you a drop-in SDK that handles 2 and 3. Once it is
wired, remove the `disabled` attribute and the note in `index.html`, and
the guard block in `main.js`.

### 4. The mockup banner

The striped bar at the top (`#mockbar`) says the page is a mockup. Delete
that element and its CSS when the site goes live.

### 5. `noindex`

`<meta name="robots" content="noindex, nofollow">` keeps the mockup out of
search results. Remove it on launch.

## What already works

- Arabic ships in the markup, English is a toggle, both fully RTL/LTR
- Donation panel: preset amounts, custom amount, live impact readout,
  numerals switch script with the language
- Scroll reveals, animated counters, hero parallax, hide-on-scroll nav
- Sticky donate bar on mobile
- No framework, no build step, no dependencies

## Notes for whoever edits this

- The tick marks use **physical** `border-left`/`border-bottom`, not
  logical properties. A checkmark is not a directional glyph — logical
  borders flip it into a chevron in RTL.
- The nav offsets itself by `--bar`, measured from the mockup banner at
  runtime, so removing the banner needs no other change.
- Images are AI-generated placeholders showing hands and supplies, with
  no identifiable faces. Replace with real photographs of the charity's
  own work, and get consent from anyone recognisable in them.
