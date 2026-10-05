# Test67 — paired chromatic inset recovery

This iteration adds one conservative fallback for pages whose earlier recovery
paths still return no frame owners. It targets decorative colored inset rims that
can be split into separate color components by highlights, shadows, or interruptions.

The detector bins hue uniformly and accepts either one chromatic perimeter component
or a pair of nearby complementary components. Their union must provide measured
support on all four sides, at least two strongly supported sides, a sparse perimeter
fill, and a textured interior. The route runs only after Test66 chromatic-rim recovery
has returned no owner. It is image-derived: there are no book names, filenames,
page numbers, saved coordinates, hashes, or tap templates in runtime decisions.

On the supplied four-issue Rise of Apocalypse set, the new proof was evaluated
against all 91 page images at its runtime analysis scale. It abstained on 90 pages
and returned two owners on issue 4 page 11: the tall upper-left blue-bordered inset
and the wide lower-right blue-bordered portrait inset. The older Test66 detector
returned no owner on that page.

`paired-chromatic-contract.cjs` exercises connected and split synthetic rims at two
sizes, rejects open and flat false cases, tampers with every proof family, and checks
geometry/reader authority for proof version 24. The retained Test66 contracts also
remain part of the Test67 CI gate. Full prior-comic artwork is not committed to this
repository, so phone acceptance remains a separate step.
