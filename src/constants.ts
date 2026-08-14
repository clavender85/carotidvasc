import { SegmentData, CustomThresholds, StudyData, ArchVariant } from './types';

export interface SegmentMeta {
  id: string;
  name: string;
  shortName: string;
  side: 'right' | 'left' | 'common';
  type: 'arch' | 'bct' | 'subclavian' | 'vertebral' | 'cca' | 'bulb' | 'ica' | 'eca';
  level?: 'prox' | 'mid' | 'dist' | 'none';
  upstreamPath: string[]; // Ordered list of segment IDs starting with the immediate parent
}

export const SEGMENTS_META: Record<string, SegmentMeta> = {
  // Common / Arch
  'arch': {
    id: 'arch',
    name: 'Aortic Arch',
    shortName: 'Arch',
    side: 'common',
    type: 'arch',
    upstreamPath: [],
  },

  // Right Side
  'r_bct_prox': {
    id: 'r_bct_prox',
    name: 'Right Brachiocephalic Trunk Proximal',
    shortName: 'BCT P',
    side: 'right',
    type: 'bct',
    level: 'prox',
    upstreamPath: ['arch'],
  },
  'r_bct_dist': {
    id: 'r_bct_dist',
    name: 'Right Brachiocephalic Trunk Distal',
    shortName: 'BCT D',
    side: 'right',
    type: 'bct',
    level: 'dist',
    upstreamPath: ['r_bct_prox', 'arch'],
  },
  'r_subcl_prox': {
    id: 'r_subcl_prox',
    name: 'Right Subclavian Artery Proximal',
    shortName: 'Sub P',
    side: 'right',
    type: 'subclavian',
    level: 'prox',
    upstreamPath: ['r_bct_dist', 'r_bct_prox', 'arch'],
  },
  'r_subcl_dist': {
    id: 'r_subcl_dist',
    name: 'Right Subclavian Artery Distal',
    shortName: 'Sub D',
    side: 'right',
    type: 'subclavian',
    level: 'dist',
    upstreamPath: ['r_subcl_prox', 'r_bct_dist', 'r_bct_prox', 'arch'],
  },
  'r_vert_prox': {
    id: 'r_vert_prox',
    name: 'Right Vertebral Artery Proximal',
    shortName: 'Vert P',
    side: 'right',
    type: 'vertebral',
    level: 'prox',
    upstreamPath: ['r_subcl_prox', 'r_bct_dist', 'r_bct_prox', 'arch'],
  },
  'r_vert_mid': {
    id: 'r_vert_mid',
    name: 'Right Vertebral Artery Mid',
    shortName: 'Vert M',
    side: 'right',
    type: 'vertebral',
    level: 'mid',
    upstreamPath: ['r_vert_prox', 'r_subcl_prox', 'r_bct_dist', 'r_bct_prox', 'arch'],
  },
  'r_vert_dist': {
    id: 'r_vert_dist',
    name: 'Right Vertebral Artery Distal',
    shortName: 'Vert D',
    side: 'right',
    type: 'vertebral',
    level: 'dist',
    upstreamPath: ['r_vert_mid', 'r_vert_prox', 'r_subcl_prox', 'r_bct_dist', 'r_bct_prox', 'arch'],
  },
  'r_cca_prox': {
    id: 'r_cca_prox',
    name: 'Right CCA Proximal',
    shortName: 'CCA P',
    side: 'right',
    type: 'cca',
    level: 'prox',
    upstreamPath: ['r_bct_dist', 'r_bct_prox', 'arch'],
  },
  'r_cca_mid': {
    id: 'r_cca_mid',
    name: 'Right CCA Mid',
    shortName: 'CCA M',
    side: 'right',
    type: 'cca',
    level: 'mid',
    upstreamPath: ['r_cca_prox', 'r_bct_dist', 'r_bct_prox', 'arch'],
  },
  'r_cca_dist': {
    id: 'r_cca_dist',
    name: 'Right CCA Distal',
    shortName: 'CCA D',
    side: 'right',
    type: 'cca',
    level: 'dist',
    upstreamPath: ['r_cca_mid', 'r_cca_prox', 'r_bct_dist', 'r_bct_prox', 'arch'],
  },
  'r_bulb': {
    id: 'r_bulb',
    name: 'Right Carotid Bulb',
    shortName: 'Bulb',
    side: 'right',
    type: 'bulb',
    upstreamPath: ['r_cca_dist', 'r_cca_mid', 'r_cca_prox', 'r_bct_dist', 'r_bct_prox', 'arch'],
  },
  'r_ica_prox': {
    id: 'r_ica_prox',
    name: 'Right ICA Proximal',
    shortName: 'ICA P',
    side: 'right',
    type: 'ica',
    level: 'prox',
    upstreamPath: ['r_bulb', 'r_cca_dist', 'r_cca_mid', 'r_cca_prox', 'r_bct_dist', 'r_bct_prox', 'arch'],
  },
  'r_ica_mid': {
    id: 'r_ica_mid',
    name: 'Right ICA Mid',
    shortName: 'ICA M',
    side: 'right',
    type: 'ica',
    level: 'mid',
    upstreamPath: ['r_ica_prox', 'r_bulb', 'r_cca_dist', 'r_cca_mid', 'r_cca_prox', 'r_bct_dist', 'r_bct_prox', 'arch'],
  },
  'r_ica_dist': {
    id: 'r_ica_dist',
    name: 'Right ICA Distal',
    shortName: 'ICA D',
    side: 'right',
    type: 'ica',
    level: 'dist',
    upstreamPath: ['r_ica_mid', 'r_ica_prox', 'r_bulb', 'r_cca_dist', 'r_cca_mid', 'r_cca_prox', 'r_bct_dist', 'r_bct_prox', 'arch'],
  },
  'r_eca_prox': {
    id: 'r_eca_prox',
    name: 'Right ECA Proximal',
    shortName: 'ECA P',
    side: 'right',
    type: 'eca',
    level: 'prox',
    upstreamPath: ['r_bulb', 'r_cca_dist', 'r_cca_mid', 'r_cca_prox', 'r_bct_dist', 'r_bct_prox', 'arch'],
  },
  'r_eca_mid': {
    id: 'r_eca_mid',
    name: 'Right ECA Mid',
    shortName: 'ECA M',
    side: 'right',
    type: 'eca',
    level: 'mid',
    upstreamPath: ['r_eca_prox', 'r_bulb', 'r_cca_dist', 'r_cca_mid', 'r_cca_prox', 'r_bct_dist', 'r_bct_prox', 'arch'],
  },
  'r_eca_dist': {
    id: 'r_eca_dist',
    name: 'Right ECA Distal',
    shortName: 'ECA D',
    side: 'right',
    type: 'eca',
    level: 'dist',
    upstreamPath: ['r_eca_mid', 'r_eca_prox', 'r_bulb', 'r_cca_dist', 'r_cca_mid', 'r_cca_prox', 'r_bct_dist', 'r_bct_prox', 'arch'],
  },

  // Left Side (Standard)
  'l_cca_prox': {
    id: 'l_cca_prox',
    name: 'Left CCA Proximal',
    shortName: 'CCA P',
    side: 'left',
    type: 'cca',
    level: 'prox',
    upstreamPath: ['arch'], // Will override dynamically if variant Left BCT is present
  },
  'l_cca_mid': {
    id: 'l_cca_mid',
    name: 'Left CCA Mid',
    shortName: 'CCA M',
    side: 'left',
    type: 'cca',
    level: 'mid',
    upstreamPath: ['l_cca_prox', 'arch'],
  },
  'l_cca_dist': {
    id: 'l_cca_dist',
    name: 'Left CCA Distal',
    shortName: 'CCA D',
    side: 'left',
    type: 'cca',
    level: 'dist',
    upstreamPath: ['l_cca_mid', 'l_cca_prox', 'arch'],
  },
  'l_bulb': {
    id: 'l_bulb',
    name: 'Left Carotid Bulb',
    shortName: 'Bulb',
    side: 'left',
    type: 'bulb',
    upstreamPath: ['l_cca_dist', 'l_cca_mid', 'l_cca_prox', 'arch'],
  },
  'l_ica_prox': {
    id: 'l_ica_prox',
    name: 'Left ICA Proximal',
    shortName: 'ICA P',
    side: 'left',
    type: 'ica',
    level: 'prox',
    upstreamPath: ['l_bulb', 'l_cca_dist', 'l_cca_mid', 'l_cca_prox', 'arch'],
  },
  'l_ica_mid': {
    id: 'l_ica_mid',
    name: 'Left ICA Mid',
    shortName: 'ICA M',
    side: 'left',
    type: 'ica',
    level: 'mid',
    upstreamPath: ['l_ica_prox', 'l_bulb', 'l_cca_dist', 'l_cca_mid', 'l_cca_prox', 'arch'],
  },
  'l_ica_dist': {
    id: 'l_ica_dist',
    name: 'Left ICA Distal',
    shortName: 'ICA D',
    side: 'left',
    type: 'ica',
    level: 'dist',
    upstreamPath: ['l_ica_mid', 'l_ica_prox', 'l_bulb', 'l_cca_dist', 'l_cca_mid', 'l_cca_prox', 'arch'],
  },
  'l_eca_prox': {
    id: 'l_eca_prox',
    name: 'Left ECA Proximal',
    shortName: 'ECA P',
    side: 'left',
    type: 'eca',
    level: 'prox',
    upstreamPath: ['l_bulb', 'l_cca_dist', 'l_cca_mid', 'l_cca_prox', 'arch'],
  },
  'l_eca_mid': {
    id: 'l_eca_mid',
    name: 'Left ECA Mid',
    shortName: 'ECA M',
    side: 'left',
    type: 'eca',
    level: 'mid',
    upstreamPath: ['l_eca_prox', 'l_bulb', 'l_cca_dist', 'l_cca_mid', 'l_cca_prox', 'arch'],
  },
  'l_eca_dist': {
    id: 'l_eca_dist',
    name: 'Left ECA Distal',
    shortName: 'ECA D',
    side: 'left',
    type: 'eca',
    level: 'dist',
    upstreamPath: ['l_eca_mid', 'l_eca_prox', 'l_bulb', 'l_cca_dist', 'l_cca_mid', 'l_cca_prox', 'arch'],
  },
  'l_subcl_prox': {
    id: 'l_subcl_prox',
    name: 'Left Subclavian Artery Proximal',
    shortName: 'Sub P',
    side: 'left',
    type: 'subclavian',
    level: 'prox',
    upstreamPath: ['arch'],
  },
  'l_subcl_dist': {
    id: 'l_subcl_dist',
    name: 'Left Subclavian Artery Distal',
    shortName: 'Sub D',
    side: 'left',
    type: 'subclavian',
    level: 'dist',
    upstreamPath: ['l_subcl_prox', 'arch'],
  },
  'l_vert_prox': {
    id: 'l_vert_prox',
    name: 'Left Vertebral Artery Proximal',
    shortName: 'Vert P',
    side: 'left',
    type: 'vertebral',
    level: 'prox',
    upstreamPath: ['l_subcl_prox', 'arch'],
  },
  'l_vert_mid': {
    id: 'l_vert_mid',
    name: 'Left Vertebral Artery Mid',
    shortName: 'Vert M',
    side: 'left',
    type: 'vertebral',
    level: 'mid',
    upstreamPath: ['l_vert_prox', 'l_subcl_prox', 'arch'],
  },
  'l_vert_dist': {
    id: 'l_vert_dist',
    name: 'Left Vertebral Artery Distal',
    shortName: 'Vert D',
    side: 'left',
    type: 'vertebral',
    level: 'dist',
    upstreamPath: ['l_vert_mid', 'l_vert_prox', 'l_subcl_prox', 'arch'],
  },

  // Left Side Variant Extra Nodes
  'l_bct_prox': {
    id: 'l_bct_prox',
    name: 'Left Brachiocephalic Trunk Proximal (Variant)',
    shortName: 'BCT P',
    side: 'left',
    type: 'bct',
    level: 'prox',
    upstreamPath: ['arch'],
  },
  'l_bct_dist': {
    id: 'l_bct_dist',
    name: 'Left Brachiocephalic Trunk Distal (Variant)',
    shortName: 'BCT D',
    side: 'left',
    type: 'bct',
    level: 'dist',
    upstreamPath: ['l_bct_prox', 'arch'],
  }
};

export const DEFAULT_CUSTOM_THRESHOLDS: CustomThresholds = {
  normalMaxPsv: 125,
  stenosis50MaxPsv: 180,
  stenosis70MaxPsv: 230,
  normalMaxRatio: 2.0,
  stenosis50MaxRatio: 3.0,
  stenosis70MaxRatio: 4.0,
};

export function getUpstreamPath(segmentId: string, variantLeftBctOrArchVariant?: boolean | ArchVariant): string[] {
  const meta = SEGMENTS_META[segmentId];
  if (!meta) return [];

  const archVariant: ArchVariant = typeof variantLeftBctOrArchVariant === 'string'
    ? variantLeftBctOrArchVariant
    : (variantLeftBctOrArchVariant ? 'bovine_common_origin' : 'standard');

  // Left Vertebral direct from Arch variant
  if (archVariant === 'left_vertebral_from_arch' && segmentId.startsWith('l_vert_')) {
    if (segmentId === 'l_vert_prox') return ['arch'];
    if (segmentId === 'l_vert_mid') return ['l_vert_prox', 'arch'];
    if (segmentId === 'l_vert_dist') return ['l_vert_mid', 'l_vert_prox', 'arch'];
  }

  // Aberrant Right Subclavian or Separate RCCA/RSA: RCCA directly from arch (no BCT)
  if ((archVariant === 'aberrant_right_subclavian' || archVariant === 'separate_rcca_and_rsa') && segmentId.startsWith('r_')) {
    if (segmentId === 'r_cca_prox') return ['arch'];
    if (segmentId === 'r_subcl_prox') return ['arch'];
    if (segmentId === 'r_bct_prox' || segmentId === 'r_bct_dist') return ['arch'];
    if (meta.type === 'cca' || meta.type === 'bulb' || meta.type === 'ica' || meta.type === 'eca') {
      return meta.upstreamPath.filter(stop => stop !== 'r_bct_dist' && stop !== 'r_bct_prox');
    }
  }

  // If left side and bovine/variant BCT is active
  if (segmentId.startsWith('l_')) {
    const isBovine = archVariant === 'bovine_common_origin';
    if (isBovine) {
      if (segmentId === 'l_cca_prox') {
        return ['l_bct_dist', 'l_bct_prox', 'arch'];
      }
    } else {
      if (segmentId === 'l_cca_prox' || segmentId === 'l_subcl_prox') {
        return ['arch'];
      }
    }

    // Dynamic reconstruction for rest of left-side segments when bovine is active
    const standardPath = meta.upstreamPath;
    const pathWithBct: string[] = [];
    for (const stop of standardPath) {
      if (stop === 'arch' && isBovine) {
        if (meta.type === 'cca' || meta.type === 'bulb' || meta.type === 'ica' || meta.type === 'eca') {
          pathWithBct.push('l_cca_prox', 'l_bct_dist', 'l_bct_prox', 'arch');
          break;
        }
      }
      pathWithBct.push(stop);
    }
    return pathWithBct;
  }

  return meta.upstreamPath;
}

export function createInitialSegment(id: string): SegmentData {
  const meta = SEGMENTS_META[id];
  return {
    id,
    name: meta?.name || id,
    side: (meta?.side || 'common') as 'right' | 'left' | 'common',
    psv: null,
    edv: null,
    flowDirection: 'not_assessed',
    waveform: 'Not assessed',
    plaquePresent: false,
    intimalThickening: false,
    stenosisPresent: false,
    localPsvRatio: null,
    comments: '',
    technicalLimitations: '',
  };
}

export const SEGMENT_IDS = Object.keys(SEGMENTS_META);

export function getInitialStudyData(): StudyData {
  const segments: Record<string, SegmentData> = {};
  for (const id of SEGMENT_IDS) {
    segments[id] = createInitialSegment(id);
  }

  return {
    segments,
    plaques: [],
    nascet: {
      right: {
        longitudinal: { plane: 'longitudinal', minLumenA: null, normalLumenB: null, calculatedStenosis: null },
        transverse: { plane: 'transverse', minLumenA: null, normalLumenB: null, calculatedStenosis: null },
      },
      left: {
        longitudinal: { plane: 'longitudinal', minLumenA: null, normalLumenB: null, calculatedStenosis: null },
        transverse: { plane: 'transverse', minLumenA: null, normalLumenB: null, calculatedStenosis: null },
      },
    },
    imt: {
      right: null,
      left: null,
    },
    classifications: {
      right: { suggested: 'Not Classified', confirmed: 'Not Classified' },
      left: { suggested: 'Not Classified', confirmed: 'Not Classified' },
    },
    variantLeftBct: false,
    anatomyVariants: {
      archVariant: 'standard',
      bifurcationVariant: 'normal',
      otherDescription: '',
      variantNotes: '',
    },
    classificationSystem: 'ASUM_2021',
    imtThresholdMm: 1.1,
    customThresholds: { ...DEFAULT_CUSTOM_THRESHOLDS },
    patientName: '',
    patientId: '',
    examDate: new Date().toISOString().split('T')[0],
    sonographer: '',
    interpretingPhysician: '',
    studyComments: '',
    clinicalIndications: [],
    symptomSide: 'none',
    symptomatic: false,
    vascularHistory: '',
    nonCarotidFindings: [],
    keyImpressions: {
      right: '',
      left: '',
      general: '',
    },
  };
}

export const CAROTID_INDICATIONS = [
  'TIA symptoms',
  'Stroke symptoms',
  'Amaurosis fugax',
  'Transient visual disturbance',
  'Dizziness',
  'Vertigo',
  'Syncope / presyncope',
  'Carotid bruit',
  'Abnormal CT / CTA',
  'Abnormal MRI / MRA',
  'Follow-up known carotid stenosis',
  'Post carotid endarterectomy',
  'Post carotid stent',
  'Suspected subclavian steal',
  'Other neurological symptoms',
  'Other'
];

export const NON_CAROTID_FINDING_TYPES = [
  'Enlarged lymph node',
  'Cervical mass',
  'Lesion',
  'Thyroid nodule / thyroid lesion',
  'Salivary gland lesion',
  'Jugular vein thrombosis / DVT',
  'Jugular vein dilatation / ectasia',
  'Venous abnormality',
  'Collection',
  'Haematoma',
  'Other'
];

export const SAMPLE_CASES = [
  {
    name: "Normal Study Template",
    description: "Populates normal findings with standard reference velocities across all segments",
    action: (data: StudyData): StudyData => {
      const newData = JSON.parse(JSON.stringify(data)) as StudyData;
      for (const id of Object.keys(newData.segments)) {
        if (id === 'arch') continue;
        if (id.startsWith('l_bct_') && !newData.variantLeftBct) continue;
        
        const s = newData.segments[id];
        s.flowDirection = 'antegrade';
        s.plaquePresent = false;
        s.intimalThickening = false;
        s.stenosisPresent = false;
        
        // Populate representative normal velocities
        if (id.includes('cca')) {
          s.psv = 75;
          s.edv = 18;
          s.waveform = "Normal Low Resistance";
        } else if (id.includes('ica')) {
          s.psv = 68;
          s.edv = 22;
          s.waveform = "Normal Low Resistance";
        } else if (id.includes('eca')) {
          s.psv = 70;
          s.edv = 12;
          s.waveform = "Normal High Resistance";
        } else if (id.includes('bulb')) {
          s.psv = 60;
          s.edv = 15;
          s.waveform = "Normal Flow Separation";
        } else if (id.includes('vert')) {
          s.psv = 45;
          s.edv = 12;
          s.waveform = "Normal Low Resistance";
        } else if (id.includes('subcl') || id.includes('bct')) {
          s.psv = 95;
          s.edv = 10;
          s.waveform = "Normal Triphasic";
        }
      }
      newData.imt.right = 0.65;
      newData.imt.left = 0.62;
      return newData;
    }
  },
  {
    name: "Severe Right ICA Stenosis (70-79% ASUM)",
    description: "Right ICA stenosis with pre-stenotic reference and calcified plaque",
    action: (data: StudyData): StudyData => {
      const newData = JSON.parse(JSON.stringify(data)) as StudyData;
      // Mark everything normal first
      for (const id of Object.keys(newData.segments)) {
        if (id === 'arch') continue;
        if (id.startsWith('l_bct_')) continue;
        const s = newData.segments[id];
        s.flowDirection = 'antegrade';
        s.waveform = id.includes('vert') ? "Normal Low Resistance" : "Normal";
        if (id.includes('cca')) { s.psv = 80; s.edv = 20; }
        else if (id.includes('ica')) { s.psv = 70; s.edv = 22; }
        else if (id.includes('eca')) { s.psv = 75; s.edv = 15; }
        else if (id.includes('vert')) { s.psv = 50; s.edv = 14; }
        else if (id.includes('subcl')) { s.psv = 100; s.edv = 12; }
      }
      
      // Now apply right side severe stenosis
      const rIcaProx = newData.segments['r_ica_prox'];
      rIcaProx.psv = 285;
      rIcaProx.edv = 115;
      rIcaProx.stenosisPresent = true;
      rIcaProx.plaquePresent = true;
      rIcaProx.waveform = "Turbulent Stenotic Flow";
      rIcaProx.comments = "Significant focal velocity acceleration at proximal segment";

      const rBulb = newData.segments['r_bulb'];
      rBulb.plaquePresent = true;

      const rCcaDist = newData.segments['r_cca_dist'];
      rCcaDist.psv = 65; // standard CCA distal
      rCcaDist.edv = 15;

      // Add actual Plaque object
      newData.plaques.push({
        id: 'plaque_r_1',
        segments: ['r_bulb', 'r_ica_prox'],
        locationDescription: 'Right Bulb and Proximal ICA',
        maxPlaqueSite: 'r_ica_prox',
        maxThicknessMm: 3.4,
        composition: 'mixed',
        surface: 'irregular',
        calcificShadowing: 'partial',
        luminalNarrowingVisible: 'yes',
        freeTextDescription: 'Mixed calcified and soft plaque at bulb extending into ICA origin causing severe narrowing.'
      });

      // Add NASCET measurements
      newData.nascet.right.longitudinal = {
        plane: 'longitudinal',
        minLumenA: 1.5,
        normalLumenB: 5.2,
        calculatedStenosis: 71.2
      };

      newData.imt.right = 1.25; // increased IMT
      newData.imt.left = 0.75;
      
      return newData;
    }
  },
  {
    name: "Subclavian Steal Syndrome (Left Retrograde Vertebral Flow)",
    description: "Left proximal subclavian artery occlusion, resulting in left vertebral retrograde flow",
    action: (data: StudyData): StudyData => {
      const newData = JSON.parse(JSON.stringify(data)) as StudyData;
      // Mark everything normal first
      for (const id of Object.keys(newData.segments)) {
        if (id === 'arch') continue;
        const s = newData.segments[id];
        s.flowDirection = 'antegrade';
        s.waveform = "Normal";
        if (id.includes('cca')) { s.psv = 75; s.edv = 18; }
        else if (id.includes('ica')) { s.psv = 70; s.edv = 24; }
        else if (id.includes('eca')) { s.psv = 72; s.edv = 14; }
        else if (id.includes('vert')) { s.psv = 45; s.edv = 12; }
        else if (id.includes('subcl')) { s.psv = 95; s.edv = 10; }
      }

      // Occlude Left Subclavian Proximal
      const lSubclProx = newData.segments['l_subcl_prox'];
      lSubclProx.psv = 0;
      lSubclProx.edv = 0;
      lSubclProx.flowDirection = 'absent';
      lSubclProx.waveform = "No flow detected / Occluded";
      lSubclProx.stenosisPresent = true;
      lSubclProx.comments = "Occluded proximal segment with dampening distally.";

      // Dampen distal Left Subclavian
      const lSubclDist = newData.segments['l_subcl_dist'];
      lSubclDist.psv = 25;
      lSubclDist.edv = 5;
      lSubclDist.waveform = "Monophasic Tardus-Parvus";

      // Left vertebral retrograde flow
      const lVertProx = newData.segments['l_vert_prox'];
      lVertProx.psv = 35;
      lVertProx.edv = 8;
      lVertProx.flowDirection = 'retrograde';
      lVertProx.waveform = "Fully Retrograde Flow";

      const lVertMid = newData.segments['l_vert_mid'];
      lVertMid.psv = 38;
      lVertMid.edv = 9;
      lVertMid.flowDirection = 'retrograde';
      lVertMid.waveform = "Fully Retrograde Flow";

      const lVertDist = newData.segments['l_vert_dist'];
      lVertDist.psv = 33;
      lVertDist.edv = 7;
      lVertDist.flowDirection = 'retrograde';
      lVertDist.waveform = "Fully Retrograde Flow";

      return newData;
    }
  }
];
