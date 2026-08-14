import { StenosisCriterionRow } from './asum2021';

export const UK_JOINT_META = {
  id: 'UK_JOINT',
  name: 'UK Joint Recommendations for Extracranial Carotid Stenosis',
  shortName: 'UK Joint Recommendations',
  organisation: 'British Society of Echocardiography & Vascular Society of Great Britain and Ireland',
  publicationYear: 2009,
  status: 'ALTERNATIVE' as const,
  statusLabel: 'Alternative / international reference',
  description: 'Grading framework utilising stratification of ICA PSV and ICA/CCA ratio with specific velocity brackets for UK vascular services.',
  disclaimer: 'Alternative international reference framework for comparative review.',
  sourceCitation: 'Oates CP et al. Joint recommendations for reporting carotid ultrasound investigations in the United Kingdom. Eur J Vasc Endovasc Surg. 2009;37(3):251-261.',
  primaryParameters: ['ICA PSV', 'ICA/CCA Ratio', 'ICA EDV'],
  referenceSegment: 'Distal CCA',
};

export const UK_JOINT_TABLE: StenosisCriterionRow[] = [
  {
    category: 'Normal (<50%)',
    nascetEquivalent: '< 50%',
    psvRange: '< 125 cm/s',
    edvRange: '< 40 cm/s',
    icaCcaRatioRange: '< 2.0',
    plaqueGrayscale: 'None or minor plaque',
    spectralFeatures: 'Normal spectral profile',
    clinicalSignificance: 'Sub-hemodynamic'
  },
  {
    category: 'Moderate (50-69%)',
    nascetEquivalent: '50–69%',
    psvRange: '125 – 230 cm/s',
    edvRange: '40 – 100 cm/s',
    icaCcaRatioRange: '2.0 – 4.0',
    plaqueGrayscale: 'Definite luminal plaque narrowing',
    spectralFeatures: 'Elevated velocities with spectral filling',
    clinicalSignificance: 'Hemodynamically significant'
  },
  {
    category: 'Severe (≥70%)',
    nascetEquivalent: '≥ 70%',
    psvRange: '> 230 cm/s',
    edvRange: '> 100 cm/s',
    icaCcaRatioRange: '> 4.0',
    plaqueGrayscale: 'Severe luminal restriction',
    spectralFeatures: 'Marked turbulence and high frequency shift',
    clinicalSignificance: 'Surgical candidate threshold'
  },
  {
    category: 'Near Occlusion / Occlusion',
    nascetEquivalent: '95–100%',
    psvRange: 'Variable / No flow',
    edvRange: 'Variable / 0 cm/s',
    icaCcaRatioRange: 'N/A',
    plaqueGrayscale: 'Pinpoint lumen or thrombosed vessel',
    spectralFeatures: 'Trickle flow or absent Doppler signal',
    clinicalSignificance: 'Specialized management'
  }
];
