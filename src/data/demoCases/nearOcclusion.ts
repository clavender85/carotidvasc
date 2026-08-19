import { StudyData } from '../../types';
import { getInitialStudyData } from '../../constants';

/**
 * Near Occlusion Demo Case
 * Left ICA near occlusion with thread-like residual string flow.
 * Demonstrates collapse of velocity criteria in critical luminal attenuation.
 */
export function createNearOcclusionDemo(): StudyData {
  const data = getInitialStudyData();

  // Demo Patient Demographics
  data.isDemoMode = true;
  data.demoCaseTitle = 'Left ICA Near Occlusion';
  data.patientName = 'Demo Patient (Near Occlusion)';
  data.patientDob = '1955-03-08';
  data.patientId = 'DEMO-004';
  data.location = 'Demo Imaging Site';
  data.company = 'Demo Health Service';
  data.sonographer = 'Demo User';
  data.examDate = new Date().toISOString().split('T')[0];
  data.clinicalIndications = ['Stroke symptoms', 'TIA symptoms', 'Amaurosis fugax'];
  data.symptomatic = true;
  data.symptomSide = 'left';
  data.vascularHistory = 'Previous stroke, Diabetes mellitus, Hypertension';

  // Populated Clinical Details & Referral Context
  data.clinicalContext = {
    referral: {
      rawText: 'Acute right hemiparesis and expressive dysphasia resolving over 2 hours. Urgent carotid duplex to assess left ICA critical stenosis vs near occlusion.',
      source: 'electronic_referral',
      importedAt: new Date().toISOString().split('T')[0],
      sourceId: 'E-REF-93510',
    },
    indications: [
      { id: 'ind_demo_1', category: 'indication', label: 'Stroke symptoms', source: 'referral_import' },
      { id: 'ind_demo_2', category: 'indication', label: 'TIA symptoms', source: 'referral_import' },
      { id: 'ind_demo_3', category: 'indication', label: 'Amaurosis fugax', source: 'referral_import' },
    ],
    history: [
      { id: 'hist_demo_1', category: 'history', label: 'Previous stroke', source: 'referral_import' },
      { id: 'hist_demo_2', category: 'history', label: 'Diabetes mellitus', source: 'referral_import' },
      { id: 'hist_demo_3', category: 'history', label: 'Hypertension', source: 'referral_import' },
    ],
    priorImaging: [
      { id: 'prior_demo_1', category: 'prior_imaging', label: 'CT Angiography (CTA) Neck / Brain', date: '2026-08-17', detail: 'Critically attenuated string flow left ICA', source: 'manual' },
    ],
    procedures: [],
    additionalNotes: 'Urgent vascular surgery referral initiated.',
    conditionalAnswers: {
      symptomSide: 'left',
      symptomOnset: '<24 hours ago'
    }
  };

  // Mark baseline
  for (const id of Object.keys(data.segments)) {
    if (id === 'arch') continue;
    const s = data.segments[id];
    s.flowDirection = 'antegrade';
    s.waveform = 'Normal';
    if (id.includes('cca')) { s.psv = 70; s.edv = 18; }
    else if (id.includes('ica')) { s.psv = 65; s.edv = 20; }
    else if (id.includes('eca')) { s.psv = 75; s.edv = 15; }
    else if (id.includes('vert')) { s.psv = 45; s.edv = 12; }
    else if (id.includes('subcl')) { s.psv = 95; s.edv = 10; }
  }

  // Left ICA Proximal: String sign / dampened flow velocity
  const lIcaProx = data.segments['l_ica_prox'];
  lIcaProx.psv = 45;
  lIcaProx.edv = 12;
  lIcaProx.stenosisPresent = true;
  lIcaProx.plaquePresent = true;
  lIcaProx.waveform = 'String flow / Trickle flow (Near Occlusion)';
  lIcaProx.comments = 'Markedly attenuated lumen with string sign on colour Doppler. Peak velocity diminished due to high downstream resistance.';

  const lIcaMid = data.segments['l_ica_mid'];
  lIcaMid.psv = 30;
  lIcaMid.edv = 8;
  lIcaMid.waveform = 'Dampened Flow';
  lIcaMid.comments = 'Post-stenotic caliber reduction / collapsed distal ICA lumen.';

  const lBulb = data.segments['l_bulb'];
  lBulb.plaquePresent = true;

  // Add Plaque profile
  data.plaques.push({
    id: 'plaque_l_near_occ',
    segments: ['l_bulb', 'l_ica_prox'],
    locationDescription: 'Left Bulb and Proximal ICA',
    maxPlaqueSite: 'l_ica_prox',
    maxThicknessMm: 4.2,
    composition: 'calcified',
    surface: 'irregular',
    calcificShadowing: 'dense',
    luminalNarrowingVisible: 'yes',
    freeTextDescription: 'Heavy circumferential calcified plaque with severe luminal narrowing (<1.0mm residual lumen) demonstrating string sign.'
  });

  // NASCET measurement
  data.nascet.left.longitudinal = {
    plane: 'longitudinal',
    minLumenA: 0.8,
    normalLumenB: 5.0,
    calculatedStenosis: 84.0
  };

  data.imt.right = 0.80;
  data.imt.left = 1.35;

  data.classifications.right = {
    suggested: 'Normal (0% Stenosis)',
    confirmed: 'Normal (0% Stenosis)'
  };
  data.classifications.left = {
    suggested: 'Near Occlusion (95-99%)',
    confirmed: 'Near Occlusion (95-99%)'
  };

  return data;
}
