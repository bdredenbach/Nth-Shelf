# Test68 — occluded dark overlay inset recovery

Test68 adds one late, empty-map-only proof for a large framed inset drawn over
continuous page artwork. The border must form three complete dark rails plus one
partly foreground-occluded rail. The weak rail is not inferred from a title,
page number, tap, saved coordinate, filename, or hash: its remaining dark samples
must still line up with the other three sides and both sides of the rail need
measured image contrast.

The runtime proof is deliberately narrow:

- analysis is capped at a 480-pixel maximum dimension;
- the proposed inset occupies 14–66% of the analyzed page;
- exactly three rail supports must be at least 94%;
- the fourth rail must retain at least 74% support and be the unique weak side;
- all four rails need exterior contrast, while at least three also need strong
  two-sided contrast;
- the enclosed scene must have substantial luminance variance;
- complete proof geometry is authoritative during rendering and cannot receive
  unrelated edge-spill expansion.

Direct proof-25 scanning across all 91 supplied Rise of Apocalypse page images
returned exactly one owner: issue 4 page 15, the large black-framed upper inset.
It abstained on the other 90 pages. The full Test68 detector pipeline likewise
returns that one owner on issue 4 page 15, while the two proof-24 blue insets on
issue 4 page 11 remain unchanged.

`dark-overlay-contract.cjs` covers the positive occluded-rail case plus four
negative families: four fully complete rails (earlier routes own those), an open
fourth side, a flat interior, and a dark exterior without border contrast. It also
tampers with every proof family and checks geometry/reader authority for proof 25.
The retained Test66 and Test67 contracts remain in the Test68 CI gate.
