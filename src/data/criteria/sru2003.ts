import { StenosisCriterionRow } from './asum2021';

export const SRU_2003_META = {
  id: 'SRU_2003',
  name: 'Society of Radiologists in Ultrasound (SRU) 2003 Consensus',
  shortName: 'SRU 2003 (Legacy)',
  organisation: 'Society of Radiologists in Ultrasound Consensus Conference',
  publicationYear: 2003,
  status: 'LEGACY' as const,
  statusLabel: 'Legacy / historical reference',
  description: 'Historical landmark consensus criteria that introduced the classical 125 cm/s (50%) and 230 cm/s (70%) velocity stratification thresholds.',
  disclaimer: 'Legacy reference — verify local laboratory criteria before clinical use. Many accredited labs have transitioned to modified criteria such as IAC 2023 or ASUM 2021.',
  sourceCitation: 'Grant EG et al. Carotid artery stenosis: gray-scale and Doppler US diagnosis—Society of Radiologists in Ultrasound Consensus Conference. Radiology. 2003;229(2):340-346.',
  primaryParameters: ['ICA PSV (125 cm/s for 50%)', 'Plaque estimate', 'ICA/CCA Ratio', 'ICA EDV'],
  referenceSegment: 'Distal CCA',
};

export const SRU_2003_TABLE: StenosisCriterionRow[] = [
  {
    category: 'Normal (0% Stenosis)',
    nascetEquivalent: '0%',
    psvRange: '< 125 cm/s',
    edvRange: '< 40 cm/s',
    icaCcaRatioRange: '< 2.0',
    plaqueGrayscale: 'None visible',
    spectralFeatures: 'Normal smooth spectral contour',
    clinicalSignificance: 'Normal reference study.'
  },
  {
    category: 'Mild Stenosis (<50%)',
    nascetEquivalent: '< 50%',
    psvRange: '< 125 cm/s',
    edvRange: '< 40 cm/s',
    icaCcaRatioRange: '< 2.0',
    plaqueGrayscale: '< 50% diameter reduction on B-mode/colour',
    spectralFeatures: 'Normal or minimally altered flow profile',
    clinicalSignificance: 'Mild sub-hemodynamic disease.'
  },
  {
    category: 'Moderate Stenosis (50-69%)',
    nascetEquivalent: '50–69%',
    psvRange: '125 – 230 cm/s',
    edvRange: '40 – 100 cm/s',
    icaCcaRatioRange: '2.0 – 4.0',
    plaqueGrayscale: '≥ 50% diameter reduction',
    spectralFeatures: 'Focal velocity elevation with spectral broadening',
    clinicalSignificance: 'Moderate hemodynamic stenosis.'
  },
  {
    category: 'Severe Stenosis (≥70% to near occlusion)',
    nascetEquivalent: '≥ 70%',
    psvRange: '> 230 cm/s',
    edvRange: '> 100 cm/s',
    icaCcaRatioRange: '> 4.0',
    plaqueGrayscale: '≥ 50% diameter reduction with visible marked luminal narrowing',
    spectralFeatures: 'Marked velocity elevation and prominent post-stenotic flow disturbance',
    clinicalSignificance: 'Surgical threshold candidate.'
  },
  {
    category: 'Near Occlusion',
    nascetEquivalent: 'Near Occlusion',
    psvRange: 'Variable (High, Low, Undetectable)',
    edvRange: 'Variable',
    icaCcaRatioRange: 'Variable',
    plaqueGrayscale: 'Markedly narrowed lumen (string sign)',
    spectralFeatures: 'Blunted or variable trickle flow',
    clinicalSignificance: 'Near occlusion.'
  },
  {
    category: 'Total Occlusion (100%)',
    nascetEquivalent: '100%',
    psvRange: '0 cm/s',
    edvRange: '0 cm/s',
    icaCcaRatioRange: 'N/A',
    plaqueGrayscale: 'Complete vessel occlusion',
    spectralFeatures: 'No detectable Doppler signal',
    clinicalSignificance: 'Complete occlusion.'
  }
];
