import { StudyData } from '../../types';
import { getInitialStudyData } from '../../constants';

/**
 * Normal Carotid Study Demo Case
 * Bilateral normal velocities, antegrade flow, no significant plaque.
 */
export function createNormalStudyDemo(): StudyData {
  const data = getInitialStudyData();

  // Demo Patient Demographics
  data.isDemoMode = true;
  data.demoCaseTitle = 'Normal Carotid Study';
  data.patientName = 'Demo Patient (Normal)';
  data.patientDob = '1960-01-01';
  data.patientId = 'DEMO-001';
  data.location = 'Demo Imaging Site';
  data.company = 'Demo Health Service';
  data.sonographer = 'Demo User';
  data.examDate = new Date().toISOString().split('T')[0];
  data.clinicalIndications = ['Vascular screening / check'];
  data.symptomatic = false;
  data.symptomSide = 'none';

  // Populated Clinical Details & Referral Context
  data.clinicalContext = {
    referral: {
      rawText: 'Routine cardiovascular risk assessment. No focal neurological symptoms.',
      source: 'electronic_referral',
      importedAt: new Date().toISOString().split('T')[0],
      sourceId: 'E-REF-77291',
    },
    indications: [
      { id: 'ind_demo_1', category: 'indication', label: 'Vascular screening / check', source: 'referral_import' }
    ],
    history: [
      { id: 'hist_demo_1', category: 'history', label: 'Hypertension', source: 'referral_import' },
      { id: 'hist_demo_2', category: 'history', label: 'Hyperlipidaemia', source: 'referral_import' }
    ],
    priorImaging: [],
    procedures: [],
    additionalNotes: 'Patient cooperative with optimal acoustic access bilaterally.'
  };

  // Populate representative normal velocities & waveforms
  for (const id of Object.keys(data.segments)) {
    if (id === 'arch') continue;
    if (id.startsWith('l_bct_') && !data.variantLeftBct) continue;

    const s = data.segments[id];
    s.flowDirection = 'antegrade';
    s.plaquePresent = false;
    s.intimalThickening = false;
    s.stenosisPresent = false;

    if (id.includes('cca')) {
      s.psv = 75;
      s.edv = 18;
      s.waveform = 'Normal Low Resistance';
    } else if (id.includes('ica')) {
      s.psv = 68;
      s.edv = 22;
      s.waveform = 'Normal Low Resistance';
    } else if (id.includes('eca')) {
      s.psv = 70;
      s.edv = 12;
      s.waveform = 'Normal High Resistance';
    } else if (id.includes('bulb')) {
      s.psv = 60;
      s.edv = 15;
      s.waveform = 'Normal Flow Separation';
    } else if (id.includes('vert')) {
      s.psv = 45;
      s.edv = 12;
      s.waveform = 'Normal Low Resistance';
    } else if (id.includes('subcl') || id.includes('bct')) {
      s.psv = 95;
      s.edv = 10;
      s.waveform = 'Normal Triphasic';
    }
  }

  data.imt.right = 0.65;
  data.imt.left = 0.62;
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
