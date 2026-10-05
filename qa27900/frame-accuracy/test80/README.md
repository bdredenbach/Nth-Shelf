# Test80: stable full-width torn-paper tiers

This route is append-only. It runs only when the established detector has exactly one owner, measures two or three internal neutral-white horizontal paper separators, and uses those rows only as temporary seed barriers. Final geometry is always re-grown from source pixels by `PanelRaggedGutters`.

Acceptance requires a complete three- or four-tier set that survives barrier half-widths 0, 1 and 2, moves no more than three analysis pixels, spans at least 90% of the page width per tier, covers the vertical page extent, and contains exactly one tier matching the pre-existing owner. The matching owner remains byte-for-byte authoritative; only the other tiers are appended.

On the private 91-page Rise of Apocalypse corpus, issue 2 reader 15 gains three owners and issue 4 reader 3 gains two owners. Issue 2 reader 14 exposes separator evidence but fails the complete stable-set proof and is deliberately withheld. Original comic artwork is not committed.
