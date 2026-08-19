import { StudyData } from '../../types';
import { getInitialStudyData } from '../../constants';

/**
 * Multi-Segment Plaque & Progression Demo Case
 * Complex multi-segment atheroma spanning Distal CCA -> Bulb -> Proximal ICA
 * Includes prior examination comparison data to demonstrate progression.
 */
export function createPlaqueExampleDemo(): StudyData {
  const data = getInitialStudyData();

  // Demo Patient Demographics
  data.isDemoMode = true;
  data.demoCaseTitle = 'Multi-Segment Plaque with Prior Comparison';
  data.patientName = 'Demo Patient (Plaque & Progression)';
  data.patientDob = '1965-08-25';
  data.patientId = 'DEMO-005';
  data.location = 'Demo Imaging Site';
  data.company = 'Demo Health Service';
  data.sonographer = 'Demo User';
  data.examDate = new Date().toISOString().split('T')[0];
  data.clinicalIndications = ['Follow-up known carotid stenosis', 'Carotid bruit'];
  data.symptomatic = false;
  data.symptomSide = 'none';
  data.vascularHistory = 'Previous carotid stenosis, Hyperlipidaemia, Hypertension';

  // Populated Clinical Details & Referral Context
  data.clinicalContext = {
    referral: {
      rawText: 'Known bilateral carotid atherosclerosis. Asymptomatic follow-up duplex to assess interval progression of right bifurcation plaque.',
      source: 'electronic_referral',
      importedAt: new Date().toISOString().split('T')[0],
      sourceId: 'E-REF-95180',
    },
    indications: [
      { id: 'ind_demo_1', category: 'indication', label: 'Follow-up known carotid stenosis', source: 'referral_import' },
      { id: 'ind_demo_2', category: 'indication', label: 'Carotid bruit', source: 'referral_import' },
    ],
    history: [
      { id: 'hist_demo_1', category: 'history', label: 'Previous carotid stenosis', source: 'referral_import' },
      { id: 'hist_demo_2', category: 'history', label: 'Hyperlipidaemia', source: 'referral_import' },
      { id: 'hist_demo_3', category: 'history', label: 'Hypertension', source: 'referral_import' },
    ],
    priorImaging: [
      { id: 'prior_demo_1', category: 'prior_imaging', label: 'Carotid Duplex Ultrasound', date: '2025-08-10', detail: 'Prior R ICA PSV 140 cm/s, L ICA PSV 105 cm/s', source: 'manual' },
    ],
    procedures: [],
    additionalNotes: 'Prior comparison examination loaded in worksheet.',
  };

  // Mark baseline
  for (const id of Object.keys(data.segments)) {
    if (id === 'arch') continue;
    const s = data.segments[id];
    s.flowDirection = 'antegrade';
    s.waveform = 'Normal';
    if (id.includes('cca')) { s.psv = 75; s.edv = 18; }
    else if (id.includes('ica')) { s.psv = 68; s.edv = 20; }
    else if (id.includes('eca')) { s.psv = 70; s.edv = 15; }
    else if (id.includes('vert')) { s.psv = 45; s.edv = 12; }
    else if (id.includes('subcl')) { s.psv = 95; s.edv = 10; }
  }

  // Right Side Multi-Segment Atheroma
  const rCcaDist = data.segments['r_cca_dist'];
  rCcaDist.plaquePresent = true;
  rCcaDist.intimalThickening = true;
  rCcaDist.psv = 85;
  rCcaDist.edv = 20;

  const rBulb = data.segments['r_bulb'];
  rBulb.plaquePresent = true;
  rBulb.psv = 75;
  rBulb.edv = 22;

  const rIcaProx = data.segments['r_ica_prox'];
  rIcaProx.plaquePresent = true;
  rIcaProx.stenosisPresent = true;
  rIcaProx.psv = 195;
  rIcaProx.edv = 65;
  rIcaProx.waveform = 'Turbulent Stenotic Flow';
  rIcaProx.comments = 'Focal elevation across proximal ICA segment with irregular surface.';

  // Add Multi-Segment Plaque Profile
  data.plaques.push({
    id: 'plaque_r_multiseg',
    segments: ['r_cca_dist', 'r_bulb', 'r_ica_prox'],
    locationDescription: 'Right Distal CCA, Bulb, and Proximal ICA',
    maxPlaqueSite: 'r_bulb',
    maxThicknessMm: 3.8,
    composition: 'mixed',
    surface: 'ulcerated',
    calcificShadowing: 'partial',
    luminalNarrowingVisible: 'yes',
    freeTextDescription: 'Extensive multi-segment heterogeneous plaque spanning distal CCA into bulb and proximal ICA with focal surface irregularity / ulceration cavity.'
  });

  // Prior Study Comparison Data (Demonstrating Longitudinal Tracking)
  data.priorExam = {
    hasPriorExam: true,
    examDate: '2024-04-10',
    facility: 'Demo Prior Vascular Lab',
    sonographer: 'Demo Sonographer',
    interpretingPhysician: 'Demo Vascular Specialist',
    hasPriorReport: true,
    rightIcaPsv: 135,
    rightIcaEdv: 42,
    rightIcaRatio: 1.8,
    rightIcaClassification: 'Moderate Stenosis (50-69%)',
    rightCcaPsv: 75,
    rightPlaqueLocation: 'Bulb',
    rightPlaqueThicknessMm: 2.2,
    rightPlaqueMorphology: 'homogeneous',
    rightPlaqueSurface: 'smooth',
    rightVertFlow: 'antegrade',
    rightSubclavian: 'Normal triphasic',
    rightIntervention: 'None',
    leftIcaPsv: 65,
    leftIcaEdv: 18,
    leftIcaRatio: 0.9,
    leftIcaClassification: 'Normal (0% Stenosis)',
    leftCcaPsv: 70,
    leftPlaqueLocation: 'None',
    leftPlaqueThicknessMm: null,
    leftPlaqueMorphology: '',
    leftPlaqueSurface: '',
    leftVertFlow: 'antegrade',
    leftSubclavian: 'Normal triphasic',
    leftIntervention: 'None',
    priorReportText: 'Mild to moderate non-stenotic plaque at right carotid bifurcation (thickness 2.2mm, PSV 135 cm/s).',
    comparisonNotes: 'Disease progression documented: maximum plaque thickness increased from 2.2mm to 3.8mm with progression in peak systolic velocity from 135 cm/s to 195 cm/s and new focal surface irregularity.'
  };

  data.imt.right = 1.15;
  data.imt.left = 0.68;

  data.classifications.right = {
    suggested: 'Moderate Stenosis (50-69%)',
    confirmed: 'Moderate Stenosis (50-69%)'
  };
  data.classifications.left = {
    suggested: 'Normal (0% Stenosis)',
    confirmed: 'Normal (0% Stenosis)'
  };

  return data;
}
