# Test36 — page13 owned edge spill

Target: first stop in 180928_2.mp4, Reader page13. All four frames select, but Test35 clips the final BA of the lower-right BADOOOM where it projects below the printed frame.

Private source check at 585×900: the bottom-right frame yields exactly two bottom-margin components; the other three page13 panels yield zero. Exterior matte RGB is [78,106,107] with 0.952 match. Nine small x/y frame perturbations retained the same two components. A render check alpha-masks the matte so the BA remains visible without turning the whole lower margin into panel art.

Runtime contains no comic title, page number, image hash, tap coordinate or stored crop. Synthetic contract accepts a crossing outlined glyph, rejects a disconnected exterior mark, rejects a tampered proof, and checks runtime fixture keys are absent.

Android build and phone acceptance are pending. Retest page13 bottom-right first, then the other three page13 panels. Do not advance to the page14 marker until page13 is accepted or returned for another focused iteration.
