import { StudyData } from '../../types';
import { createNormalStudyDemo } from './normalStudy';
import { createRightIcaStenosisDemo } from './rightIcaStenosis';
import { createSubclavianStealDemo } from './subclavianSteal';
import { createNearOcclusionDemo } from './nearOcclusion';
import { createPlaqueExampleDemo } from './plaqueExample';

export interface DemoCaseMeta {
  id: string;
  title: string;
  badge: string;
  category: 'Normal' | 'Hemodynamics' | 'Steal / Protocol' | 'Plaque' | 'Extreme';
  description: string;
  clinicalHighlights: string[];
  load: () => StudyData;
}

export const DEMO_CASES: DemoCaseMeta[] = [
  {
    id: 'normal_study',
    title: 'Normal Carotid Study',
    badge: 'Baseline',
    category: 'Normal',
    description: 'Bilateral routine normal examination with standard velocities and antegrade vertebral flow.',
    clinicalHighlights: [
      'Normal reference velocities across all segments',
      'No significant plaque or intimal thickening',
      'Normal triphasic subclavian & low-resistance vertebral flow'
    ],
    load: createNormalStudyDemo,
  },
  {
    id: 'right_ica_stenosis',
    title: 'Right ICA Stenosis (70-79%)',
    badge: 'Severe Stenosis',
    category: 'Hemodynamics',
    description: 'Elevated right ICA velocity (PSV 285 cm/s, EDV 115 cm/s) with bifurcation atheroma and NASCET calculation.',
    clinicalHighlights: [
      'Right proximal ICA focal velocity acceleration (PSV 285 cm/s)',
      'Calculated ICA/CCA ratio 4.38 and NASCET diameter reduction (71%)',
      'ASUM 2021 Severe Stenosis (70-79%) auto-classification'
    ],
    load: createRightIcaStenosisDemo,
  },
  {
    id: 'subclavian_steal',
    title: 'Subclavian / Vertebral Steal',
    badge: 'Dynamic Protocol',
    category: 'Steal / Protocol',
    description: 'Left proximal subclavian occlusion causing left vertebral retrograde flow. Demonstrates dynamic protocol expansion.',
    clinicalHighlights: [
      'Left vertebral retrograde flow across all segments',
      'Dynamic protocol engine triggers mandatory subclavian workup',
      'Left subclavian proximal occlusion with distal monophasic dampening'
    ],
    load: createSubclavianStealDemo,
  },
  {
    id: 'near_occlusion',
    title: 'Left ICA Near Occlusion',
    badge: 'Critical Stenosis',
    category: 'Extreme',
    description: 'Severe left ICA disease with thread-like residual string flow (<1.0 mm) where standard velocity criteria collapse.',
    clinicalHighlights: [
      'Markedly attenuated lumen with string sign on colour Doppler',
      'Dampened velocity and collapsed post-stenotic distal caliber',
      'Near Occlusion (95-99%) classification & safety warnings'
    ],
    load: createNearOcclusionDemo,
  },
  {
    id: 'plaque_progression',
    title: 'Multi-Segment Plaque & Progression',
    badge: 'Longitudinal',
    category: 'Plaque',
    description: 'Extensive atheroma spanning Distal CCA → Bulb → ICA origin, with prior study comparison tracking disease progression.',
    clinicalHighlights: [
      'Multi-segment plaque spanning 3 contiguous vessel stations',
      'Focal ulceration / surface irregularity',
      'Longitudinal comparison showing plaque thickness progression (2.2mm → 3.8mm)'
    ],
    load: createPlaqueExampleDemo,
  },
];

export function getDemoCaseById(id: string): DemoCaseMeta | undefined {
  return DEMO_CASES.find(c => c.id === id);
}
