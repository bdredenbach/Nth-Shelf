// NTH SHELF V2.78.11 — GEOMETRY OWNERSHIP ROUTER
//
// V2.78.11 deliberately separates CLASSIFICATION from FULL-FRAME EXTRACTION.
// panels.js still identifies the tapped panel.  The skewed module now uses
// local vertices + interior angles only to decide ownership.  Even when skewed
// ownership is proven, this test build renders the stable orthogonal seed.
// That means classification can be tuned without creating slivers or malformed
// skew polygons.  Full skewed-frame expansion comes only after ownership is
// trustworthy.

const PanelGeometry = {
  async refine(imgUrl, panel, log) {
    if (!panel) return null;
    if (log) log('ROUTER V2.78.11 ownership classification start');

    let ownership=null;
    if (typeof PanelGeometrySkewed !== 'undefined' && PanelGeometrySkewed.classify) {
      ownership = await PanelGeometrySkewed.classify(imgUrl, panel, log);
    }

    const ortho = (typeof PanelGeometryOrthogonal !== 'undefined' && PanelGeometryOrthogonal.refine)
      ? PanelGeometryOrthogonal.refine(panel, log)
      : { ...panel };

    if (ownership && ownership.owns) {
      // IMPORTANT: V2.78.11 proves ownership only.  Do not render the diagnostic
      // polygon yet; preserving the stable rectangle prevents geometry R&D from
      // damaging ordinary panel pop-outs while we tune the classifier.
      ortho._geometryOwner='skewed';
      ortho._geometryType='skewed-owned-pending-frame';
      ortho._skewEvidence={
        confidence:ownership.confidence,
        angles:ownership.angles,
        deviations:ownership.deviations,
        oppositeDivergence:ownership.oppositeDivergence,
        areaRatio:ownership.areaRatio
      };
      if (log) log(`ROUTER OWNERSHIP -> SKEWED confidence=${ownership.confidence.toFixed(2)} (render seed only)`);
      return ortho;
    }

    ortho._geometryOwner='orthogonal';
    if (log) log('ROUTER OWNERSHIP -> ORTHOGONAL');
    return ortho;
  }
};
