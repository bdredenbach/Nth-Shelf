# Test64 stable matte partition

The compressed fixture contains 13 contour descriptors from six merged parent masks. It contains geometry and detector evidence only, no comic images. Gzip/base64 avoids duplicating large parent proofs in the repository transport. The contract decodes it with Node core libraries.

Decoded SHA256: `b63e35b5457b8ec8b50492422612899e3e3f10629744030afb5bd253ba51831d`.

Run `node qa27900/frame-accuracy/test64/stable-partition-contract.cjs`. It verifies exact disjoint pixel union, retained holes and tips, geometry routing, mutation rejection, idempotence, unchanged neighbors, and synthetic disconnected/narrow/broad connections at two sizes. These checks establish preservation and stable ownership, not semantic completeness.
