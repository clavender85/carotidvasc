import { StenosisCriterionRow } from './asum2021';

export const IAC_MODIFIED_SRU_2023_META = {
  id: 'IAC_MODIFIED_SRU_2023',
  name: 'IAC Recommended Modified SRU Carotid Criteria (2023)',
  shortName: 'IAC Modified SRU 2023',
  organisation: 'Intersocietal Accreditation Commission (IAC) / SRU Update',
  publicationYear: 2023,
  status: 'CURRENT' as const,
  statusLabel: 'Current IAC recommended modified SRU interpretation criteria',
  description: 'Contemporary US national standard combining revised velocity cutoffs (PSV 180 cm/s for 50% stenosis threshold) with comprehensive multi-parameter hemodynamic grading.',
  disclaimer: 'Do not classify stenosis from PSV alone. Diagnostic grading requires multi-parameter integration including plaque burden, EDV, and ICA/CCA ratio.',
  sourceCitation: 'IAC Vascular Testing: Updated Recommendations for Carotid Stenosis Interpretation Criteria (2023).',
  primaryParameters: ['ICA PSV (180 cm/s threshold)', 'Plaque estimate', 'ICA/CCA Ratio', 'ICA EDV'],
  referenceSegment: 'Distal CCA',
};

export const IAC_MODIFIED_SRU_2023_TABLE: StenosisCriterionRow[] = [
  {
    category: 'Normal (0% Stenosis)',
    nascetEquivalent: '0%',
    psvRange: '< 180 cm/s',
    edvRange: '< 40 cm/s',
    icaCcaRatioRange: '< 2.0',
    plaqueGrayscale: 'No visible plaque',
    spectralFeatures: 'Normal smooth spectral waveform with clear acoustic window',
    clinicalSignificance: 'Normal native internal carotid artery examination.'
  },
  {
    category: 'Mild Stenosis (<50%)',
    nascetEquivalent: '< 50%',
    psvRange: '< 180 cm/s',
    edvRange: '< 40 cm/s',
    icaCcaRatioRange: '< 2.0',
    plaqueGrayscale: 'Visible plaque causing <50% luminal diameter reduction',
    spectralFeatures: 'Normal or mild localized velocity alteration; no post-stenotic turbulence',
    clinicalSignificance: 'Non-hemodynamically significant plaque burden. Medical risk management.'
  },
  {
    category: 'Moderate Stenosis (50-69%)',
    nascetEquivalent: '50–69%',
    psvRange: '180 – 230 cm/s (or 125–180 with Ratio ≥ 2.0 & Plaque)',
    edvRange: '40 – 100 cm/s',
    icaCcaRatioRange: '2.0 – 4.0',
    plaqueGrayscale: 'Plaque causing ≥50% luminal diameter reduction',
    spectralFeatures: 'Focal velocity acceleration, spectral broadening. Note: PSV 125–180 cm/s with ratio ≥2.0 and significant plaque qualifies.',
    clinicalSignificance: 'Hemodynamically significant stenosis. Serial imaging surveillance indicated.'
  },
  {
    category: 'Severe Stenosis (≥70% but less than near occlusion)',
    nascetEquivalent: '≥70% to 94%',
    psvRange: '> 230 cm/s',
    edvRange: '> 100 cm/s',
    icaCcaRatioRange: '> 4.0',
    plaqueGrayscale: 'Plaque causing >50% diameter reduction with narrow residual lumen',
    spectralFeatures: 'Marked focal velocity elevation, marked spectral broadening, post-stenotic turbulence',
    clinicalSignificance: 'High-grade surgical-threshold stenosis. Vascular specialist consultation recommended.'
  },
  {
    category: 'Near Occlusion',
    nascetEquivalent: 'High grade (String sign)',
    psvRange: 'Variable (High, Low or Undetectable)',
    edvRange: 'Variable',
    icaCcaRatioRange: 'Variable / Not applicable',
    plaqueGrayscale: 'Markedly narrowed residual lumen; string-like residual channel',
    spectralFeatures: 'Low-velocity blunted flow or focal extreme jet with downstream flow collapse',
    clinicalSignificance: 'Near occlusion. NASCET measurement invalid due to distal vessel collapse. Urgent review.'
  },
  {
    category: 'Total Occlusion (100%)',
    nascetEquivalent: '100%',
    psvRange: 'No detectable flow (0 cm/s)',
    edvRange: '0 cm/s',
    icaCcaRatioRange: 'Not applicable',
    plaqueGrayscale: 'Lumen completely occluded by echogenic material/thrombus',
    spectralFeatures: 'Absence of spectral and colour Doppler flow; high-resistance "thump" at origin',
    clinicalSignificance: 'Complete internal carotid occlusion. Evaluate collateral supply.'
  }
];
