import { RequirementLevel } from '../../types';

export interface ProtocolSectionItem {
  id: string;
  letter: string;
  title: string;
  summary: string;
  content: string[];
  keyRules?: string[];
  clinicalNotes?: string;
  configurableFields?: {
    label: string;
    key: string;
    defaultValue: string;
    options?: string[];
  }[];
}

export const UNIVERSAL_CORE_DEFAULT_DATASET: Record<string, RequirementLevel> = {
  // Right side
  'r_cca_prox': 'required',
  'r_cca_mid': 'recommended',
  'r_cca_dist': 'required',
  'r_bulb': 'required',
  'r_ica_prox': 'required',
  'r_ica_mid': 'required',
  'r_ica_dist': 'recommended',
  'r_eca_prox': 'required',
  'r_vert_prox': 'recommended',
  'r_vert_mid': 'required',
  'r_vert_dist': 'optional',
  'r_subcl_prox': 'conditional',
  'r_subcl_dist': 'conditional',
  'r_bct_prox': 'optional',
  'r_bct_dist': 'optional',

  // Left side
  'l_cca_prox': 'required',
  'l_cca_mid': 'recommended',
  'l_cca_dist': 'required',
  'l_bulb': 'required',
  'l_ica_prox': 'required',
  'l_ica_mid': 'required',
  'l_ica_dist': 'recommended',
  'l_eca_prox': 'required',
  'l_vert_prox': 'recommended',
  'l_vert_mid': 'required',
  'l_vert_dist': 'optional',
  'l_subcl_prox': 'conditional',
  'l_subcl_dist': 'conditional',
};

export const UNIVERSAL_CORE_SECTIONS: ProtocolSectionItem[] = [
  {
    id: 'section_a_purpose',
    letter: 'A',
    title: 'Purpose & Diagnostic Framework',
    summary: 'Evidence-based framework for comprehensive duplex assessment of extracranial cerebrovascular circulation.',
    content: [
      'To provide a comprehensive, reproducible framework for duplex ultrasound assessment of the extracranial carotid and vertebral circulation, including evaluation of arterial anatomy, atherosclerotic plaque, hemodynamic stenosis, occlusion, and relevant flow abnormalities.',
      'This protocol serves as a baseline clinical examination framework. Sound clinical judgement remains paramount at all times.',
      'The examination extent may be extended according to presenting clinical symptoms, previous imaging findings, detected pathology, or approved local departmental policy.'
    ],
    keyRules: [
      'Universal baseline examination standard applicable across multiple health jurisdictions.',
      'Clinical judgement supercedes rigid procedural rules when patient safety or urgent pathology dictates.'
    ]
  },
  {
    id: 'section_b_scope',
    letter: 'B',
    title: 'Examination Scope & Vessel Coverage',
    summary: 'Standard bilateral anatomical coverage of accessible extracranial carotid, vertebral, and subclavian arteries.',
    content: [
      'The routine bilateral carotid examination should evaluate accessible portions of:',
      '• Common Carotid Artery (CCA): proximal, mid, and distal segments bilaterally.',
      '• Carotid Bifurcation / Bulb: origin and geometry.',
      '• Internal Carotid Artery (ICA): proximal, mid, and as distal as technically possible.',
      '• External Carotid Artery (ECA): proximal segment routinely; additional branches/segments where clinically indicated.',
      '• Vertebral Artery: at least one representative spectral and colour Doppler assessment on each side; proximal/mid/distal assessment when indicated by local policy.',
      '• Subclavian Artery: default setting is Conditional Assessment (extend when vertebral flow is abnormal, steal physiology suspected, or arm symptoms present).'
    ],
    keyRules: [
      'Bilateral examination is standard even if symptoms are unilateral.',
      'Subclavian assessment can be configured by site as either "Conditional" or "Routine".'
    ]
  },
  {
    id: 'section_c_patient_prep',
    letter: 'C',
    title: 'Patient Preparation & Positioning',
    summary: 'Patient verification, ergonomics, clinical indication review, and posture adaptation.',
    content: [
      '1. Verify patient identity using two primary identifiers (e.g. Full Name and MRN / Date of Birth).',
      '2. Confirm clinical indication, presenting neurological symptoms (TIA, stroke, amaurosis fugax, bruit), and symptomatic side.',
      '3. Review relevant prior vascular imaging (ultrasound, CTA, MRA, catheter angiography) where available.',
      '4. Position patient supine or near-supine with slight neck extension if tolerated by the patient.',
      '5. Gently rotate the patient head away from the side being examined (typically 30–45 degrees). Avoid excessive or forced neck rotation which can distort hemodynamics or cause discomfort.',
      '6. Adapt examination posture for patients with limited neck mobility, severe respiratory distress, torticollis, or cervical spine restrictions.'
    ]
  },
  {
    id: 'section_d_equipment',
    letter: 'D',
    title: 'Equipment & Transducer Selection',
    summary: 'High-frequency broadband linear array transducers with versatile low-frequency backup.',
    content: [
      '• Duplex-capable ultrasound system with synchronized high-resolution B-mode, Colour Doppler, and Spectral Doppler capabilities.',
      '• Primary transducer: High-frequency linear array (e.g. 5–12 MHz or 4–9 MHz broadband) optimized for superficial vascular imaging.',
      '• Secondary / Alternative transducer: Lower frequency linear (3–9 MHz) or curved array (2–6 MHz) available for deep vessel paths, thick neck habitus, or high carotid bifurcations.',
      '• Power Doppler or microvascular high-definition flow imaging should be readily available as adjunctive technology for low-flow and trickle-flow detection.'
    ],
    keyRules: [
      'Vendor-neutral equipment standards without proprietary lock-in.'
    ]
  },
  {
    id: 'section_e_bmode',
    letter: 'E',
    title: 'B-Mode / Grayscale Assessment',
    summary: 'Systematic greyscale evaluation of arterial walls, bifurcation anatomy, and plaque burden.',
    content: [
      'Assess all accessible carotid and vertebral vessels in both longitudinal and transverse planes.',
      'Document vessel caliber, bifurcation level, course tortuosity (kinking/coiling), wall thickness, and presence of intimal thickening.',
      'Identify and characterize atherosclerotic plaque, luminal narrowing, and calcification acoustic shadowing.',
      'Screen for significant non-carotid cervical pathology (carotid body tumor, dissection flap, pseudoaneurysm, aneurysm, thyroid pathology, cervical lymphadenopathy).'
    ]
  },
  {
    id: 'section_f_colour_doppler',
    letter: 'F',
    title: 'Colour Doppler Optimisation',
    summary: 'Flow mapping, focal aliasing detection, residual lumen identification, and sample volume guidance.',
    content: [
      'Use colour Doppler to confirm vessel patency, identify flow disturbances, demonstrate focal aliasing jets, and define the residual flowing lumen.',
      'Colour Doppler guides precise spectral sample volume placement within the highest-velocity streamline.',
      'Optimise colour gain, velocity scale (PRF), wall filter, colour box width, and steering angle to prevent artificial artifact.'
    ]
  },
  {
    id: 'section_g_spectral_technique',
    letter: 'G',
    title: 'Spectral Doppler Technique & Angle Correction',
    summary: 'Rigorous sample placement, flow alignment, insonation angle ≤60°, and arrhythmia management.',
    content: [
      '• Sample Volume Placement: Position sample volume within the center stream or the accelerated flow jet parallel to vessel walls / jet trajectory.',
      '• Angle Correction: Doppler insonation angle MUST be ≤ 60 degrees. Maintain angle cursor strictly parallel to the direction of blood flow.',
      '• Consistency: Maintain consistent Doppler angles throughout serial studies where feasible.',
      '• Cardiac Arrhythmia / Atrial Fibrillation: Average 3–5 representative cardiac cycles. Avoid selecting isolated extreme post-ectopic pause beats; document cardiac rhythm variations.'
    ],
    keyRules: [
      'Insonation angle must NEVER exceed 60 degrees.',
      'Do not rely on single highest post-PVC velocity beat.'
    ]
  },
  {
    id: 'section_h_dataset',
    letter: 'H',
    title: 'Minimum Spectral Dataset',
    summary: 'Configurable bilateral segment acquisition checklist with customisable requirement levels.',
    content: [
      'Recommended Universal Core Bilateral Spectral Sampling:',
      '• CCA: Proximal, Mid, Distal (with Distal CCA serving as standard reference for ICA/CCA ratio).',
      '• Bulb / Bifurcation: Grayscale, colour, and spectral sampling.',
      '• ICA: Proximal (highest velocity zone), Mid, and Distal accessible segments.',
      '• ECA: Proximal spectral waveform with temporal tap confirmation where needed.',
      '• Vertebral Artery: Representative mid-segment waveform and direction assessment.',
      '• Subclavian Artery: Waveform ± PSV according to conditional or routine site requirements.'
    ],
    keyRules: [
      'Each segment can be assigned: REQUIRED, RECOMMENDED, CONDITIONAL, or OPTIONAL.'
    ]
  },
  {
    id: 'section_i_plaque',
    letter: 'I',
    title: 'Atherosclerotic Plaque Assessment',
    summary: 'Multi-segment plaque tracking: location, composition, surface ulceration, and calcification.',
    content: [
      '• Location: Document origin and extent across CCA, bulb, ICA, and ECA.',
      '• Composition: Hypoechoic, isoechoic, echogenic, heterogeneous, mixed, calcific, or indeterminate.',
      '• Surface: Smooth, irregular, ulcerated (defect ≥2 mm with focal flow reversal), or indeterminate.',
      '• Calcification & Acoustic Shadowing: None, minor, partial, or dense acoustic shadowing.',
      '• Extent: Focal (<1 cm), multifocal, or diffuse (>2 cm).'
    ],
    keyRules: [
      'Plaque echogenicity alone must NOT determine hemodynamic stenosis classification.'
    ]
  },
  {
    id: 'section_j_ica_stenosis',
    letter: 'J',
    title: 'ICA Stenosis Assessment & Multi-Parameter Integration',
    summary: 'Integrated diagnosis combining B-mode, colour, highest PSV, EDV, ICA/CCA ratio, and post-stenotic turbulence.',
    content: [
      'Internal carotid stenosis grading must integrate multiple concordant diagnostic parameters:',
      '1. Highest representative ICA PSV at the point of maximum luminal restriction.',
      '2. Corresponding ICA End-Diastolic Velocity (EDV).',
      '3. ICA/CCA PSV Ratio (using representative distal CCA denominator).',
      '4. B-mode and colour Doppler visualization of residual patent lumen and plaque burden.',
      '5. Presence of post-stenotic spectral broadening, turbulence, and downstream dampening.',
      '6. Evaluation for near-occlusion morphology.'
    ],
    keyRules: [
      'Strictly use ONE chosen classification system at a time.',
      'Do NOT create hybrid criteria from different systems.'
    ]
  },
  {
    id: 'section_k_ratio',
    letter: 'K',
    title: 'ICA/CCA PSV Ratio & CCA Reference Segment',
    summary: 'Distal CCA standard denominator, unsuitability detection, and transparent manual override.',
    content: [
      '• Numerator: Highest representative ICA Peak Systolic Velocity.',
      '• Denominator: Distal CCA PSV in a normal, non-turbulent segment approximately 2–3 cm below the bifurcation.',
      '• Suitability Rules: Distal CCA is unsuitable if plaque, stenosis, absent flow, retrograde flow, or dampened waveform is present.',
      '• Manual Override: If distal CCA is unsuitable, an upstream normal CCA segment (mid or proximal) may be designated. The report must clearly state the reference segment used.'
    ],
    keyRules: [
      'Default reference is Distal CCA.',
      'Always document and identify any alternative reference segment.'
    ]
  },
  {
    id: 'section_l_focal_stenosis',
    letter: 'L',
    title: 'Focal Stenosis Assessment (3-Point Assessment)',
    summary: 'Pre-stenotic, at-stenosis, and post-stenotic velocities with local ratio quantification.',
    content: [
      'When assessing focal non-ICA lesions (e.g. CCA, ECA, Subclavian, Vertebral) or complex tandem lesions:',
      '• Record pre-stenotic velocity, intrastenotic peak velocity, and post-stenotic velocity.',
      '• Calculate Local PSV Ratio = Intrastenotic PSV / Pre-stenotic normal PSV.',
      '• A local ratio ≥ 2.0 indicates ≥50% focal diameter reduction.',
      '• A local ratio ≥ 4.0 indicates ≥70% focal diameter reduction.'
    ],
    keyRules: [
      'Do NOT confuse a local lesion ratio with the diagnostic ICA/CCA stenosis ratio.'
    ]
  },
  {
    id: 'section_m_near_occlusion',
    letter: 'M',
    title: 'Near-Occlusion Diagnostic Rules',
    summary: 'String sign recognition, distal ICA collapse, velocity paradox, and NASCET calculation restrictions.',
    content: [
      'Near-occlusion is characterized by marked luminal narrowing with distal internal carotid artery caliber reduction ("string sign" / slim sign).',
      'Velocities in near-occlusion may be paradoxically high, normal, low, or trickle-flow due to extreme distal resistance.',
      'Standard NASCET percentage calculation is INVALID because the distal reference denominator B is collapsed/subnormal.',
      'Recommendation: Urgent clinical notification and consideration of confirmatory cross-sectional angiography (CTA/MRA).'
    ]
  },
  {
    id: 'section_n_total_occlusion',
    letter: 'N',
    title: 'Total Occlusion Criteria',
    summary: 'Combined multi-modal absence of detectable lumen and flow with optimized low-flow parameters.',
    content: [
      'Total occlusion requires multi-modal confirmation:',
      '1. Complete absence of color Doppler filling within the lumen on optimized low-velocity settings (low PRF, high color gain).',
      '2. Complete absence of spectral Doppler signals throughout the vessel.',
      '3. High-resistance "thump" or reverberating flow signal at the ICA stump.',
      '4. Visible intraluminal echogenic thrombus or chronic fibrous plug on B-mode.',
      '5. Power Doppler or high-definition microvascular flow verification.'
    ],
    keyRules: [
      'Do NOT diagnose occlusion from a single absent spectral sample without low-flow optimization.'
    ]
  },
  {
    id: 'section_o_vertebral',
    letter: 'O',
    title: 'Vertebral Artery Evaluation',
    summary: 'Flow direction classification, waveform morphology, and subclavian steal screening.',
    content: [
      '• Flow Direction Options: Antegrade, Retrograde, Bidirectional (to-and-fro / alternating), Absent, or Not Assessed.',
      '• Waveform Morphology: Normal low-resistance forward flow, midsystolic deceleration notch (pre-steal), high-resistance resistance profile, or parvus-tardus.',
      '• If retrograde or bidirectional flow is detected: Promptly inspect the ipsilateral subclavian artery and brachiocephalic trunk for proximal stenosis/occlusion (Subclavian Steal Syndrome).'
    ]
  },
  {
    id: 'section_p_subclavian',
    letter: 'P',
    title: 'Subclavian Artery Assessment',
    summary: 'Configurable conditional vs routine evaluation and proximal steal interrogation.',
    content: [
      '• Default: Conditional Assessment.',
      '• Extended examination triggers: abnormal vertebral flow, inter-arm blood pressure differential >15-20 mmHg, upper extremity symptoms, or suspected proximal arch disease.',
      '• Parameters: Triphasic/biphasic waveform, peak systolic velocity, focal turbulence, and pre/post-stenotic flow changes.'
    ]
  },
  {
    id: 'section_q_variants',
    letter: 'Q',
    title: 'Anatomical Variants & Arch Geometry',
    summary: 'Bovine arch variants, aberrant subclavian, high/low bifurcation tracking.',
    content: [
      'Document clinically relevant anatomical variants:',
      '• Bovine Arch Variant / Common BCT & Left CCA origin.',
      '• Left CCA arising directly from the Brachiocephalic Trunk.',
      '• Left Vertebral Artery arising directly from the Aortic Arch.',
      '• Aberrant Right Subclavian Artery (Arteria Lusoria).',
      '• Separate Right CCA and Right Subclavian Origins.',
      '• High Carotid Bifurcation (mandibular angle / C2-C3) vs Low Bifurcation (clavicular / C6-T1).'
    ]
  },
  {
    id: 'section_r_limitations',
    letter: 'R',
    title: 'Technical Limitations & QA Flags',
    summary: 'Standardized acoustic, anatomical, and patient factors impacting exam confidence.',
    content: [
      'Standardized options: High bifurcation, heavy calcific acoustic shadowing, deep vessel course, extreme tortuosity (coiling/kinking), patient body habitus, limited neck mobility, surgical dressing/wound, patient movement/tremor, poor acoustic window, mobile/bedside examination.',
      'All documented technical limitations must automatically appear in the structured report QA section.'
    ]
  },
  {
    id: 'section_s_special_studies',
    letter: 'S',
    title: 'Special Examination Types & Post-Intervention Protocols',
    summary: 'Targeted workflows for Native, Post CEA, Post Stent, Subclavian Steal, and Known Occlusion.',
    content: [
      '1. Routine Native Carotid Examination: Full bilateral comprehensive study.',
      '2. Post Carotid Endarterectomy (CEA): Assess patch geometry, suture lines, intimal flaps, residual/recurrent stenosis, and hematoma.',
      '3. Post Carotid Artery Stent (CAS): Assess stent deployment, full stent length, stent proximal/mid/distal velocities, in-stent restenosis (note: stents alter compliance and require stent-specific velocity criteria; native criteria do NOT directly apply).',
      '4. Suspected Subclavian Steal: Targeted subclavian, vertebral, and bilateral brachial pressure assessment.',
      '5. Known Carotid Occlusion: Focused collateral, ECA externalization, and contralateral compensatory flow evaluation.',
      '6. Limited / Targeted Examination: Clinically focused follow-up.'
    ]
  },
  {
    id: 'section_t_documentation',
    letter: 'T',
    title: 'Documentation & Image Archive Standard',
    summary: 'Minimum permanent digital image and waveform archive requirements.',
    content: [
      'Permanent image documentation must include:',
      '• Transverse B-mode sweeps of CCA, bifurcation, and proximal ICA/ECA.',
      '• Longitudinal B-mode and Colour Doppler images of all accessible segments.',
      '• Spectral Doppler waveforms with angle correction cursor visible for all required dataset points.',
      '• Specialized cine clips and caliper measurements for any identified plaque, stenosis, or abnormal flow.'
    ]
  }
];
