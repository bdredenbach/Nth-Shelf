# Test76 — chromatic/shared-border inset separation

Run `bash qa27900/frame-accuracy/test76/run-retained.sh` at the repository root.
The suite keeps every Test75 detector contract and adds a generated two-lobe
chromatic-frame fixture. The positive fixture has a connected red perimeter and
a black/white shared rail; it must resolve as exactly two owners. Weak shared
edges, open rims, flat interiors, broad bridges and prior-owner overlap are
rejected. Twenty serialized-proof mutations are also rejected.

Original artwork is not committed. The private 91-page Rise of Apocalypse scan
found exactly one qualifying page: issue 4 image index 13 (reader 14/21), with two
new owners. Test75 records zero owners on that page, so the saved total moves from
161 to 163 while every prior descriptor remains unchanged. The target also passed
0.67x, 1.25x and horizontal-mirror source transforms.

Proof32 is `two-core-stable-chromatic-shared-border`. Two independently eroded
cores must yield the same minimum-barrier watershed within a microscopic
scale-stability tolerance, and their shared cut must be witnessed by a strong
source-image edge. Existing owners are a hard veto. No filename, page, hash, tap
or fixed-layout lookup is used.
