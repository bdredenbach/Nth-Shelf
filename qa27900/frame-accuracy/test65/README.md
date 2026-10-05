# Test65 enclosed white-body repair

The compressed fixture contains20 repaired contour descriptors and one independently recovered native-raster cell. It includes geometry and detector evidence only, no comic images. Decode with Node core gzip/base64 support as shown in white-body-contract.cjs.

Decoded SHA256: `3fc29dcd50687149f119ddaee7087b601629476e6458d3899e1ec93bf5e97e1f`.

Run `node qa27900/frame-accuracy/test65/white-body-contract.cjs`. It checks exact additive unions, retained original pixels, restored ink holes, proof corruption rejection, geometry routing, ambiguous-owner and blank-white rejection, idempotence, and arbitrary native frame recovery at two sizes. These establish crop preservation and ownership; they do not certify every panel on a page.
