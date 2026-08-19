import { StudyData } from '../../types';
import { getInitialStudyData } from '../../constants';

/**
 * Subclavian / Vertebral Steal Syndrome Demo Case
 * Left proximal subclavian artery occlusion/stenosis with retrograde left vertebral flow.
 * Triggers the dynamic protocol engine to mandate ipsilateral subclavian assessment.
 */
export function createSubclavianStealDemo(): StudyData {
  const data = getInitialStudyData();

  // Demo Patient Demographics
  data.isDemoMode = true;
  data.demoCaseTitle = 'Subclavian Steal Syndrome';
  data.patientName = 'Demo Patient (Subclavian Steal)';
  data.patientDob = '1962-11-20';
  data.patientId = 'DEMO-003';
  data.location = 'Demo Imaging Site';
  data.company = 'Demo Health Service';
  data.sonographer = 'Demo User';
  data.examDate = new Date().toISOString().split('T')[0];
  data.clinicalIndications = ['Suspected subclavian steal', 'Dizziness', 'Syncope / presyncope'];
  data.symptomatic = true;
  data.symptomSide = 'left';
  data.vascularHistory = 'Peripheral arterial disease, Smoking history';

  // Populated Clinical Details & Referral Context
  data.clinicalContext = {
    referral: {
      rawText: '68yo female with left upper limb fatigue and episodic exertional lightheadedness. Inter-arm BP differential of 35 mmHg (L < R). Suspected subclavian steal syndrome.',
      source: 'electronic_referral',
      importedAt: new Date().toISOString().split('T')[0],
      sourceId: 'E-REF-91024',
    },
    indications: [
      { id: 'ind_demo_1', category: 'indication', label: 'Suspected subclavian steal', source: 'referral_import' },
      { id: 'ind_demo_2', category: 'indication', label: 'Dizziness', source: 'referral_import' },
      { id: 'ind_demo_3', category: 'indication', label: 'Syncope / presyncope', source: 'referral_import' },
    ],
    history: [
      { id: 'hist_demo_1', category: 'history', label: 'Peripheral arterial disease', source: 'referral_import' },
      { id: 'hist_demo_2', category: 'history', label: 'Smoking history', source: 'referral_import' },
    ],
    priorImaging: [],
    procedures: [],
    additionalNotes: 'Left brachial BP: 105/70 mmHg; Right brachial BP: 140/85 mmHg.',
    conditionalAnswers: {
      symptomSide: 'left',
    }
  };

  // Mark standard normal baseline
  for (const id of Object.keys(data.segments)) {
    if (id === 'arch') continue;
    const s = data.segments[id];
    s.flowDirection = 'antegrade';
    s.waveform = 'Normal';
    if (id.includes('cca')) { s.psv = 75; s.edv = 18; }
    else if (id.includes('ica')) { s.psv = 70; s.edv = 24; }
    else if (id.includes('eca')) { s.psv = 72; s.edv = 14; }
    else if (id.includes('vert')) { s.psv = 45; s.edv = 12; }
    else if (id.includes('subcl')) { s.psv = 95; s.edv = 10; }
  }

  // Occlude / high grade Left Subclavian Proximal
  const lSubclProx = data.segments['l_subcl_prox'];
  lSubclProx.psv = 0;
  lSubclProx.edv = 0;
  lSubclProx.flowDirection = 'absent';
  lSubclProx.waveform = 'No flow detected / Occluded';
  lSubclProx.stenosisPresent = true;
  lSubclProx.comments = 'High-grade proximal occlusion / severe stenosis.';

  // Dampen distal Left Subclavian
  const lSubclDist = data.segments['l_subcl_dist'];
  lSubclDist.psv = 25;
  lSubclDist.edv = 5;
  lSubclDist.flowDirection = 'antegrade';
  lSubclDist.waveform = 'Monophasic Tardus-Parvus';

  // Left Vertebral Retrograde Flow across proximal, mid, distal
  const lVertProx = data.segments['l_vert_prox'];
  lVertProx.psv = 35;
  lVertProx.edv = 8;
  lVertProx.flowDirection = 'retrograde';
  lVertProx.waveform = 'Fully Retrograde Flow';

  const lVertMid = data.segments['l_vert_mid'];
  lVertMid.psv = 38;
  lVertMid.edv = 9;
  lVertMid.flowDirection = 'retrograde';
  lVertMid.waveform = 'Fully Retrograde Flow';

  const lVertDist = data.segments['l_vert_dist'];
  lVertDist.psv = 33;
  lVertDist.edv = 7;
  lVertDist.flowDirection = 'retrograde';
  lVertDist.waveform = 'Fully Retrograde Flow';

  data.imt.right = 0.70;
  data.imt.left = 0.72;

  data.classifications.right = {
    suggested: 'Normal (0% Stenosis)',
    confirmed: 'Normal (0% Stenosis)'
  };
  data.classifications.left = {
    suggested: 'Normal (0% Stenosis)',
    confirmed: 'Normal (0% Stenosis)'
  };

  return data;
}
