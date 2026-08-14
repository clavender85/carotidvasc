export const NASCET_METHOD_META = {
  id: 'NASCET',
  name: 'North American Symptomatic Carotid Endarterectomy Trial (NASCET) Diameter Method',
  shortName: 'NASCET Diameter Method',
  type: 'DIAMETER_REDUCTION_METHOD' as const,
  status: 'CURRENT_METHOD' as const,
  statusLabel: 'Diameter reduction method — not a standalone duplex velocity criteria set',
  description: 'Angiographic and ultrasound anatomical caliper method for quantifying luminal diameter stenosis by comparing the residual lumen at the narrowest stenosis point to the normal distal cervical ICA lumen.',
  formula: 'NASCET % Stenosis = (1 - A / B) × 100',
  formulaComponents: {
    residualLumenA: 'A = Minimum residual lumen diameter at the maximal stenosis site (mm)',
    normalDistalLumenB: 'B = Normal distal cervical ICA lumen diameter beyond the bulb where vessel walls become parallel (mm)'
  },
  safetyGuidelines: [
    'Do not perform calculation if either caliper measurement (A or B) is absent.',
    'Do not calculate with B = 0 (mathematical division by zero).',
    'Flag warning if A > B (residual lumen cannot exceed reference lumen in standard anatomy).',
    'Do NOT use a diseased, aneurysmal or collapsed distal ICA as the reference denominator B.',
    'Near-occlusion with collapsed distal ICA invalidates standard NASCET percentage calculations.',
    'Always label results as "NASCET diameter estimate". Never silently replace duplex velocity-based classification with caliper percentage.'
  ],
  sourceCitation: 'North American Symptomatic Carotid Endarterectomy Trial Collaborators. Beneficial effect of carotid endarterectomy in symptomatic patients with high-grade carotid stenosis. N Engl J Med. 1991;325(7):445-453.'
};

export const ECST_METHOD_META = {
  id: 'ECST',
  name: 'European Carotid Surgery Trial (ECST) Method (Historical / Reference)',
  shortName: 'ECST Method',
  type: 'DIAMETER_REDUCTION_METHOD' as const,
  status: 'LEGACY_METHOD' as const,
  statusLabel: 'Historical European surgical trial comparison',
  formula: 'ECST % Stenosis = (1 - A / C) × 100 (where C = estimated original bulb diameter)',
  description: 'Uses the estimated outer boundary of the carotid bulb as the reference denominator. Typically yields numerical percentage values 15-20% higher than NASCET for the same physical stenosis.'
};
