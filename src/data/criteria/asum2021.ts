export interface StenosisCriterionRow {
  category: string;
  nascetEquivalent: string;
  psvRange: string;
  edvRange: string;
  icaCcaRatioRange: string;
  plaqueGrayscale: string;
  spectralFeatures: string;
  clinicalSignificance: string;
}

export const ASUM_2021_CRITERIA_META = {
  id: 'ASUM_2021',
  name: 'ASUM 2021 Extracranial Carotid Guideline',
  shortName: 'ASUM 2021',
  organisation: 'Australasian Society for Ultrasound in Medicine (ASUM)',
  publicationYear: 2021,
  status: 'CURRENT' as const,
  statusLabel: 'Current ASUM extracranial carotid reporting guideline',
  description: 'Evidence-based consensus standard for hemodynamic grading of internal carotid artery stenosis across Australia and New Zealand.',
  disclaimer: 'ASUM threshold values are recommendations and should not be interpreted in isolation from imaging findings, technical factors or local validation.',
  sourceCitation: 'ASUM Standards of Practice: Duplex Doppler Ultrasound Assessment of Extracranial Carotid Artery Disease (2021).',
  primaryParameters: ['ICA PSV', 'ICA EDV', 'ICA/CCA PSV Ratio'],
  referenceSegment: 'Distal CCA (flow-normalised)',
};

export const ASUM_2021_META = ASUM_2021_CRITERIA_META;

export const ASUM_2021_TABLE: StenosisCriterionRow[] = [
  {
    category: 'Normal (0% Stenosis)',
    nascetEquivalent: '0%',
    psvRange: '< 125 cm/s',
    edvRange: '< 40 cm/s',
    icaCcaRatioRange: '< 2.0',
    plaqueGrayscale: 'No visible plaque or intimal thickening',
    spectralFeatures: 'Normal smooth spectral envelope, clear spectral window',
    clinicalSignificance: 'Normal reference velocity profile.'
  },
  {
    category: 'Mild Stenosis (<50%)',
    nascetEquivalent: '< 50%',
    psvRange: '< 125 cm/s',
    edvRange: '< 40 cm/s',
    icaCcaRatioRange: '< 2.0',
    plaqueGrayscale: 'Visible plaque causing <50% luminal diameter reduction',
    spectralFeatures: 'Normal or mild focal velocity disturbance without significant post-stenotic turbulence',
    clinicalSignificance: 'Sub-hemodynamic atherosclerotic disease. Standard medical risk factor modification.'
  },
  {
    category: 'Moderate Stenosis (50-69%)',
    nascetEquivalent: '50–69%',
    psvRange: '125 – 270 cm/s',
    edvRange: '< 110 cm/s',
    icaCcaRatioRange: '2.0 – 4.0',
    plaqueGrayscale: 'Plaque causing significant luminal narrowing (typically >50% diameter reduction)',
    spectralFeatures: 'Focal velocity acceleration, mild to moderate spectral broadening',
    clinicalSignificance: 'Hemodynamically significant stenosis. Serial ultrasound surveillance recommended.'
  },
  {
    category: 'Severe Stenosis (70-79%)',
    nascetEquivalent: '70–79%',
    psvRange: '> 270 cm/s',
    edvRange: '110 – 140 cm/s',
    icaCcaRatioRange: '> 4.0',
    plaqueGrayscale: 'Marked luminal narrowing with evident acoustic plaque burden',
    spectralFeatures: 'Marked focal velocity elevation with definite post-stenotic flow disturbance',
    clinicalSignificance: 'High-grade stenosis. Correlate with symptoms for possible revascularisation evaluation.'
  },
  {
    category: 'Critical Stenosis (80-94%)',
    nascetEquivalent: '80–94%',
    psvRange: '> 270 cm/s',
    edvRange: '> 140 cm/s',
    icaCcaRatioRange: '> 4.0',
    plaqueGrayscale: 'Very tight residual lumen',
    spectralFeatures: 'Extremely high velocities with prominent post-stenotic turbulence and broad spectral filling',
    clinicalSignificance: 'Critical high-grade stenosis. Urgent clinical and surgical review indicated if symptomatic.'
  },
  {
    category: 'Near Occlusion (95-99%)',
    nascetEquivalent: '95–99%',
    psvRange: 'Variable (High, Low or Undetectable)',
    edvRange: 'Variable',
    icaCcaRatioRange: 'Variable / Not applicable',
    plaqueGrayscale: 'Pinpoint residual lumen, string sign or collapsed distal ICA',
    spectralFeatures: 'Low-velocity blunted trickle flow or very high focal velocity jet with distal collapse',
    clinicalSignificance: 'Near occlusion. NASCET diameter calculation unsuitable due to distal collapse. Urgent escalation.'
  },
  {
    category: 'Total Occlusion (100%)',
    nascetEquivalent: '100%',
    psvRange: 'No detectable flow (0 cm/s)',
    edvRange: '0 cm/s',
    icaCcaRatioRange: 'Not applicable',
    plaqueGrayscale: 'Vessel completely filled with thrombus/plaque, no colour filling',
    spectralFeatures: 'Absence of spectral Doppler signal; high-resistance thumping/reverberating signal at stump',
    clinicalSignificance: 'Complete occlusion. Revascularisation typically contraindicated. Assess collateral pathways.'
  }
];
