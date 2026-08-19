import { StudyData } from '../../types';
import { getInitialStudyData } from '../../constants';

/**
 * Right ICA Stenosis (Severe 70-79% ASUM) Demo Case
 * Right ICA focal velocity elevation with pre-stenotic reference and calcified plaque.
 */
export function createRightIcaStenosisDemo(): StudyData {
  const data = getInitialStudyData();

  // Demo Patient Demographics
  data.isDemoMode = true;
  data.demoCaseTitle = 'Right ICA Stenosis (70-79%)';
  data.patientName = 'Demo Patient (Right ICA Stenosis)';
  data.patientDob = '1958-06-14';
  data.patientId = 'DEMO-002';
  data.location = 'Demo Imaging Site';
  data.company = 'Demo Health Service';
  data.sonographer = 'Demo User';
  data.examDate = new Date().toISOString().split('T')[0];
  data.clinicalIndications = ['Amaurosis fugax', 'Carotid bruit', 'TIA symptoms'];
  data.symptomatic = true;
  data.symptomSide = 'right';
  data.vascularHistory = 'Previous TIA, Hypertension, Smoking history';

  // Populated Clinical Details & Referral Context
  data.clinicalContext = {
    referral: {
      rawText: '72yo male with transient right eye visual blurring (amaurosis fugax) 3 days ago. Carotid bruit noted on right side. Please evaluate for hemodynamically significant carotid stenosis.',
      source: 'electronic_referral',
      importedAt: new Date().toISOString().split('T')[0],
      sourceId: 'E-REF-88412',
    },
    indications: [
      { id: 'ind_demo_1', category: 'indication', label: 'Amaurosis fugax', source: 'referral_import' },
      { id: 'ind_demo_2', category: 'indication', label: 'Carotid bruit', source: 'referral_import' },
      { id: 'ind_demo_3', category: 'indication', label: 'TIA symptoms', source: 'referral_import' },
    ],
    history: [
      { id: 'hist_demo_1', category: 'history', label: 'Previous TIA', source: 'referral_import' },
      { id: 'hist_demo_2', category: 'history', label: 'Hypertension', source: 'referral_import' },
      { id: 'hist_demo_3', category: 'history', label: 'Smoking history', source: 'referral_import' },
    ],
    priorImaging: [
      { id: 'prior_demo_1', category: 'prior_imaging', label: 'CT Angiography (CTA) Neck / Brain', date: '2026-08-15', detail: 'Reported right proximal ICA narrowing', source: 'manual' },
    ],
    procedures: [],
    additionalNotes: 'Patient describes 4-minute episode of monocular right vision loss ("curtain descending").',
    conditionalAnswers: {
      symptomSide: 'right',
      symptomOnset: '3 days ago'
    }
  };

  // Mark everything normal baseline first
  for (const id of Object.keys(data.segments)) {
    if (id === 'arch') continue;
    if (id.startsWith('l_bct_')) continue;
    const s = data.segments[id];
    s.flowDirection = 'antegrade';
    s.waveform = id.includes('vert') ? 'Normal Low Resistance' : 'Normal';
    if (id.includes('cca')) { s.psv = 80; s.edv = 20; }
    else if (id.includes('ica')) { s.psv = 70; s.edv = 22; }
    else if (id.includes('eca')) { s.psv = 75; s.edv = 15; }
    else if (id.includes('vert')) { s.psv = 50; s.edv = 14; }
    else if (id.includes('subcl')) { s.psv = 100; s.edv = 12; }
  }

  // Right Side Severe Stenosis
  const rIcaProx = data.segments['r_ica_prox'];
  rIcaProx.psv = 285;
  rIcaProx.edv = 115;
  rIcaProx.stenosisPresent = true;
  rIcaProx.plaquePresent = true;
  rIcaProx.waveform = 'Turbulent Stenotic Flow';
  rIcaProx.comments = 'Significant focal velocity acceleration at proximal ICA';

  const rBulb = data.segments['r_bulb'];
  rBulb.plaquePresent = true;

  const rCcaDist = data.segments['r_cca_dist'];
  rCcaDist.psv = 65;
  rCcaDist.edv = 15;

  // Add Plaque profile
  data.plaques.push({
    id: 'plaque_r_1',
    segments: ['r_bulb', 'r_ica_prox'],
    locationDescription: 'Right Bulb and Proximal ICA',
    maxPlaqueSite: 'r_ica_prox',
    maxThicknessMm: 3.4,
    composition: 'mixed',
    surface: 'irregular',
    calcificShadowing: 'partial',
    luminalNarrowingVisible: 'yes',
    freeTextDescription: 'Mixed calcified and soft plaque at bulb extending into proximal ICA causing luminal narrowing.'
  });

  // NASCET Measurements
  data.nascet.right.longitudinal = {
    plane: 'longitudinal',
    minLumenA: 1.5,
    normalLumenB: 5.2,
    calculatedStenosis: 71.2
  };

  data.imt.right = 1.25;
  data.imt.left = 0.75;

  data.classifications.right = {
    suggested: 'Severe Stenosis (70-79%)',
    confirmed: 'Severe Stenosis (70-79%)'
  };
  data.classifications.left = {
    suggested: 'Normal (0% Stenosis)',
    confirmed: 'Normal (0% Stenosis)'
  };

  return data;
}
