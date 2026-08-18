export type VesselCategory = 'cca' | 'ica' | 'eca' | 'bulb' | 'vertebral' | 'subclavian' | 'bct';

export interface WaveformDescriptor {
  id: string;
  label: string;
  appliesTo: VesselCategory | VesselCategory[];
  shortDefinition: string;
  appearance: string[];
  interpretation: string;
  nextStep?: string;
  protocolConsequence?: string;
  referenceGraphicId: string;
  dynamicRuleId?: string;
  severity?: 'normal' | 'advisory' | 'warning' | 'alert';
  vesselNotes?: Partial<Record<VesselCategory, {
    label?: string;
    description: string;
    physiology: string;
  }>>;
}

export const WAVEFORM_DESCRIPTORS: Record<string, WaveformDescriptor> = {
  normal: {
    id: 'normal',
    label: 'Normal',
    appliesTo: ['cca', 'ica', 'eca', 'bulb', 'vertebral', 'subclavian', 'bct'],
    shortDefinition: 'Standard expected hemodynamic waveform pattern appropriate for the sampled vascular bed.',
    appearance: [
      'Clean spectral envelope with distinct systolic peak',
      'Bed-appropriate diastolic flow (low-resistance for brain/ICA/vertebral; high-resistance for ECA/subclavian)',
      'Sharp or brisk systolic upstroke (acceleration time < 70 ms)'
    ],
    interpretation: 'Preserved native physiology without hemodynamic obstruction, damping, or upstream/downstream stenosis.',
    nextStep: 'Continue standard protocol sweep.',
    protocolConsequence: 'Standard baseline satisfied for this segment.',
    referenceGraphicId: 'waveform_normal',
    severity: 'normal',
    vesselNotes: {
      ica: {
        label: 'Normal (Low Resistance)',
        description: 'Continuous antegrade flow with the low-resistance characteristics appropriate for the cerebral circulation.',
        physiology: 'Continuous forward diastolic flow throughout the cardiac cycle supplying the low-resistance intracranial cerebral capillary bed. PSV typically < 125 cm/s with broad spectral profile.'
      },
      cca: {
        label: 'Normal (Intermediate Resistance)',
        description: 'Composite waveform combining low-resistance ICA and high-resistance ECA components with brisk systolic acceleration.',
        physiology: 'Brisk systolic upstroke with continuous forward diastolic flow (intermediate resistance). Dicrotic notch is well-defined.'
      },
      eca: {
        label: 'Normal (High Resistance)',
        description: 'Multiphasic or high-resistance pattern with sharp systolic upstroke, minimal early diastolic flow, and response to temporal tap.',
        physiology: 'Supplies the facial/scalp high-resistance vascular bed. Sharp peak, rapid deceleration, minimal end-diastolic flow, and visible temporal oscillation ripples during superficial temporal artery percussion.'
      },
      bulb: {
        label: 'Normal (Flow Separation Zone)',
        description: 'Normal boundary layer flow separation in the posterolateral sinus with transient helical/recirculating flow.',
        physiology: 'Normal anatomical widening creates a physiological boundary layer separation zone with localized bidirectional spectral components adjacent to laminar central flow.'
      },
      vertebral: {
        label: 'Normal (Low Resistance Antegrade)',
        description: 'Continuous forward antegrade flow supplying posterior intracranial circulation (basilar artery/circle of Willis).',
        physiology: 'Low-resistance antegrade flow throughout systole and diastole without early systolic deceleration notches.'
      },
      subclavian: {
        label: 'Normal (Multiphasic / Triphasic)',
        description: 'High-resistance triphasic/biphasic peripheral upper limb waveform with sharp systolic forward flow, early diastolic reversal, and late forward diastolic bounce.',
        physiology: 'Upper extremity muscular bed requires high resting resistance with prominent early diastolic flow reversal.'
      }
    }
  },

  damped: {
    id: 'damped',
    label: 'Damped',
    appliesTo: ['cca', 'ica', 'eca', 'bulb', 'vertebral', 'subclavian', 'bct'],
    shortDefinition: 'General reduction or blunting of the normal waveform contour/amplitude.',
    appearance: [
      'Reduced overall velocity amplitude and blunted spectral contour',
      'Less distinct systolic peak without sharp dicrotic notch',
      'Preserved systolic acceleration time (unlike tardus-parvus)'
    ],
    interpretation: 'A broad descriptive finding indicating an attenuated or blunted waveform. Damping alone does not necessarily demonstrate the characteristic delayed systolic acceleration of tardus-parvus.',
    nextStep: 'Correlate with the remainder of the examination and assess proximal inflow when clinically appropriate.',
    protocolConsequence: 'Generates a non-blocking clinical recommendation to review proximal inflow and contralateral hemodynamics.',
    referenceGraphicId: 'waveform_damped',
    dynamicRuleId: 'damped_waveform_review',
    severity: 'advisory',
    vesselNotes: {
      cca: {
        description: 'Blunted systolic peak and attenuated contour in the common carotid artery.',
        physiology: 'May reflect low cardiac output, systemic hypotension, aortic valve stenosis, or non-critical proximal vessel narrowing.'
      },
      ica: {
        description: 'Attenuated amplitude throughout the internal carotid artery.',
        physiology: 'May occur with distal intracranial occlusion, generalized cerebral edema, or generalized perfusion reduction.'
      }
    }
  },

  tardus_parvus: {
    id: 'tardus_parvus',
    label: 'Tardus-parvus',
    appliesTo: ['cca', 'ica', 'eca', 'bulb', 'vertebral', 'subclavian', 'bct'],
    shortDefinition: 'Delayed systolic upstroke with reduced systolic amplitude.',
    appearance: [
      'Delayed systolic acceleration time (prolonged acceleration time > 70–80 ms)',
      'Sluggish, rounded systolic rise ("tardus" = late/slow)',
      'Reduced peak systolic velocity and amplitude ("parvus" = small/weak)',
      'Loss of distinct spectral peak and rounded systolic apex'
    ],
    interpretation: 'A more specific haemodynamic pattern characterised by delayed systolic acceleration (tardus) and reduced waveform amplitude (parvus), which should prompt consideration of haemodynamically significant disease proximal to the sampling location.',
    nextStep: 'Assess for haemodynamically significant disease proximal to this sampling location according to active anatomy and protocol.',
    protocolConsequence: 'Triggers targeted proximal inflow review (e.g. RCCA -> BCT/arch; LCCA -> arch origin; ICA -> ipsilateral proximal carotid).',
    referenceGraphicId: 'waveform_tardus_parvus',
    dynamicRuleId: 'tardus_parvus_proximal_inflow_review',
    severity: 'warning',
    vesselNotes: {
      cca: {
        description: 'Tardus-parvus in CCA indicates severe inflow obstruction proximal to the carotid bifurcation.',
        physiology: 'Strongly suggests severe stenosis or occlusion of the brachiocephalic trunk (right) or common carotid origin from aortic arch (left).'
      },
      ica: {
        description: 'Tardus-parvus in mid/distal ICA reflects upstream focal high-grade ICA or CCA obstruction.',
        physiology: 'Downstream consequence of critical proximal stenosis dampening the pulse pressure wave.'
      }
    }
  },

  high_resistance: {
    id: 'high_resistance',
    label: 'High resistance',
    appliesTo: ['cca', 'ica', 'vertebral'],
    shortDefinition: 'Increased pulsatility with diminished or absent diastolic forward flow relative to normal bed physiology.',
    appearance: [
      'Sharp, tall systolic peak with rapid deceleration',
      'Markedly reduced, absent, or transiently reversed end-diastolic flow (diastolic velocity approaching zero)',
      'Elevated Resistive Index (RI > 0.75–0.85 in low-resistance vessels)'
    ],
    interpretation: 'In an ICA or vertebral artery, high resistance indicates elevated downstream peripheral vascular resistance, distal severe stenosis, intracranial spasm/thrombosis, or elevated intracranial pressure. In CCA, suggests severe bifurcation/distal obstruction.',
    nextStep: 'Interrogate distal segments and evaluate intracranial/distal outflow resistance or severe downstream stenosis.',
    protocolConsequence: 'Prompts distal vessel assessment and alerts to potential downstream outflow obstruction.',
    referenceGraphicId: 'waveform_high_resistance',
    dynamicRuleId: 'high_resistance_outflow_review',
    severity: 'warning',
    vesselNotes: {
      ica: {
        description: 'Abnormal high-resistance pattern in ICA indicating downstream outflow resistance.',
        physiology: 'Loss of normal low-resistance cerebral forward diastolic flow. Strongly correlates with distal intracranial ICA stenosis/occlusion, carotid siphon stenosis, or elevated ICP.'
      },
      cca: {
        description: 'High-resistance CCA (ECA-like) pattern with absent or minimal end-diastolic flow.',
        physiology: 'Occurs when the low-resistance ICA branch is totally occluded, leaving the CCA to supply only the high-resistance external carotid bed.'
      },
      vertebral: {
        description: 'High-resistance vertebral flow with loss of continuous diastolic flow.',
        physiology: 'Suggests distal intracranial vertebral (V4 segment) or basilar artery high-grade stenosis or occlusion.'
      }
    }
  },

  low_resistance: {
    id: 'low_resistance',
    label: 'Low resistance',
    appliesTo: ['eca'],
    shortDefinition: 'Atypical continuous forward diastolic flow in an external carotid artery branch.',
    appearance: [
      'Broadened systolic envelope with continuous antegrade end-diastolic flow',
      'Reduced Resistive Index (RI < 0.65 in ECA)',
      'Loss of normal triphasic/biphasic external peripheral resistance profile'
    ],
    interpretation: 'A low-resistance pattern in the ECA may represent ECA collateralization serving as an intracranial pathway (via ophthalmic artery collateralization to the circle of Willis in ipsilateral ICA occlusion), or an arteriovenous malformation / dural fistula.',
    nextStep: 'Check for ipsilateral ICA high-grade stenosis or occlusion and look for retrograde ophthalmic collateral flow.',
    protocolConsequence: 'Generates advisory to evaluate collateralization and verify ipsilateral ICA patency.',
    referenceGraphicId: 'waveform_low_resistance',
    dynamicRuleId: 'eca_internalisation_review',
    severity: 'advisory',
    vesselNotes: {
      eca: {
        description: 'ECA "internalisation" waveform demonstrating persistent diastolic forward flow.',
        physiology: 'External carotid branches recruit to bypass an occluded or critically stenosed internal carotid artery.'
      }
    }
  },

  turbulent: {
    id: 'turbulent',
    label: 'Turbulent',
    appliesTo: ['cca', 'ica', 'eca', 'bulb', 'subclavian', 'bct'],
    shortDefinition: 'Disturbed, multi-directional flow with marked spectral broadening and loss of clear spectral window.',
    appearance: [
      'Extensive spectral broadening with filling of the clear systolic window',
      'Simultaneous bidirectional frequencies / chaotic Doppler shift vectors',
      'Irregular, jagged envelope contour and high-frequency acoustic flutter'
    ],
    interpretation: 'Disturbed flow pattern that may occur at or downstream from a focal stenosis, at regions of complex anatomical tortuosity, post-endarterectomy patches, or bifurcations. Does not automatically equate to a specific stenosis grade without velocity correlation.',
    nextStep: 'Perform step-by-step 3-point hemodynamic velocity sweep (pre-stenotic, peak intrastenotic, post-stenotic) and B-mode plaque correlation.',
    protocolConsequence: 'Recommends 3-point hemodynamic documentation and focal velocity ratio calculation.',
    referenceGraphicId: 'waveform_turbulent',
    dynamicRuleId: 'turbulent_flow_stenosis_check',
    severity: 'warning',
    vesselNotes: {
      ica: {
        description: 'Post-stenotic flow disturbance in the internal carotid artery.',
        physiology: 'High kinetic energy jet dissipating into chaotic vortices downstream from a focal luminal narrowing.'
      }
    }
  },

  pre_occlusive: {
    id: 'pre_occlusive',
    label: 'Pre-occlusive / severely reduced flow',
    appliesTo: ['ica'],
    shortDefinition: 'Markedly reduced, string-like velocity profile with blunted or trickle flow in critical near-occlusion.',
    appearance: [
      'Low velocity "trickle" or "string" flow signal (PSV may be paradoxically low, e.g. < 40 cm/s)',
      'Loss of normal low-resistance diastolic profile with high-resistance or dampened blunted wave',
      'Narrow color Doppler thread/stream ("string sign") with collapsed distal ICA caliber'
    ],
    interpretation: 'Markedly reduced flow in severe disease requires correlation with B-mode, colour flow, distal ICA calibre, and the complete haemodynamic picture. Does not automatically diagnose near occlusion on spectral wave alone, but warrants low-flow protocol execution.',
    nextStep: 'Activate the Near-Occlusion Low-Flow Assessment Pathway. Optimize colour Doppler scale (low PRF), power Doppler, and document distal ICA lumen caliber.',
    protocolConsequence: 'Triggers dynamic near-occlusion low-flow protocol and cautions against misleading NASCET diameter ratio.',
    referenceGraphicId: 'waveform_pre_occlusive',
    dynamicRuleId: 'rule_suspected_near_occlusion',
    severity: 'alert',
    vesselNotes: {
      ica: {
        description: 'Pre-occlusive "trickle flow" or "string sign" pattern in critical internal carotid narrowing (95–99%).',
        physiology: 'Extreme vascular resistance through a sub-millimeter lumen causes severe pressure drop, marked velocity reduction, and distal arterial collapse.'
      }
    }
  },

  absent: {
    id: 'absent',
    label: 'Absent',
    appliesTo: ['cca', 'ica', 'eca', 'bulb', 'vertebral', 'subclavian', 'bct'],
    shortDefinition: 'No detectable spectral Doppler flow signal at the sampled anatomical location.',
    appearance: [
      'Flat spectral Doppler baseline with absence of flow velocity signals',
      'No detectable colour or power Doppler lumen filling',
      'Adjacent "stump thump" or high-resistance terminal thumping waveform may be observed immediately proximal to occlusion'
    ],
    interpretation: 'No detectable spectral flow at the sampled location. Absent spectral signal alone does not establish complete arterial occlusion without multi-modality verification.',
    nextStep: 'Optimize color Doppler gain/PRF, utilize power Doppler, check for distal collateral reconstitution, and document B-mode echogenic intraluminal thrombus/plaque.',
    protocolConsequence: 'Enforces Multi-Modality Total Occlusion Confirmation pathway (low PRF colour, power Doppler, proximal stump interrogation).',
    referenceGraphicId: 'waveform_absent',
    dynamicRuleId: 'rule_suspected_total_occlusion',
    severity: 'alert',
    vesselNotes: {
      ica: {
        description: 'Complete absence of spectral and color Doppler flow in the internal carotid artery.',
        physiology: 'Suggests total carotid occlusion (100%), which precludes carotid endarterectomy or stenting.'
      },
      vertebral: {
        description: 'No flow detected in the vertebral artery intertransverse or origin segments.',
        physiology: 'May indicate vertebral artery hypoplasia, aplasia, origin occlusion, or severe dissection.'
      }
    }
  },

  // Peripheral/Subclavian Specific
  biphasic: {
    id: 'biphasic',
    label: 'Biphasic',
    appliesTo: ['subclavian', 'bct'],
    shortDefinition: 'Two-phase arterial waveform with forward systolic flow and early diastolic reversal, but loss of late diastolic forward component.',
    appearance: [
      'Sharp systolic upstroke',
      'Brief early diastolic flow reversal',
      'Absent late forward diastolic flow (diminished compliance or mild upstream/downstream disease)'
    ],
    interpretation: 'Moderate attenuation of peripheral triphasic character. May be normal in warm dilated extremities or represent mild proximal inflow/distal outflow disease.',
    nextStep: 'Correlate with contralateral upper extremity waveforms and brachial blood pressure comparison.',
    protocolConsequence: 'Subclavian waveform recorded; review for hemodynamic symmetry.',
    referenceGraphicId: 'waveform_biphasic',
    severity: 'advisory'
  },

  monophasic: {
    id: 'monophasic',
    label: 'Monophasic',
    appliesTo: ['subclavian', 'bct'],
    shortDefinition: 'Single forward phase throughout cardiac cycle with loss of normal early diastolic flow reversal.',
    appearance: [
      'Blunted or broadened systolic peak',
      'Loss of early diastolic flow reversal with continuous low-resistance forward flow',
      'Indicates distal vasodilation or proximal haemodynamic obstruction'
    ],
    interpretation: 'Abnormal in resting subclavian artery. Continuous low-resistance monophasic flow indicates post-stenotic distal ischemia / compensatory peripheral vasodilation or upstream high-grade stenosis.',
    nextStep: 'Evaluate proximal subclavian origin, brachiocephalic trunk, and bilateral arm blood pressures.',
    protocolConsequence: 'Flags potential subclavian inflow disease and recommends bilateral brachial pressure comparison.',
    referenceGraphicId: 'waveform_monophasic',
    dynamicRuleId: 'subclavian_stenosis_review',
    severity: 'warning'
  },

  // Vertebral Specific Progression
  early_systolic_deceleration: {
    id: 'early_systolic_deceleration',
    label: 'Early systolic deceleration',
    appliesTo: ['vertebral'],
    shortDefinition: 'Transient mid-systolic velocity notch/deceleration with preserved forward flow.',
    appearance: [
      'Sharp initial systolic peak followed immediately by a distinct transient mid-systolic deceleration notch',
      'Second systolic peak followed by normal forward diastolic flow',
      'Flow remains entirely antegrade throughout all phases'
    ],
    interpretation: 'Stage 1 Subclavian Steal physiology (occult / pre-steal). Transient pressure drop in the ipsilateral subclavian artery during peak arm systole siphons early systolic blood.',
    nextStep: 'Examine ipsilateral proximal subclavian artery and brachiocephalic trunk; consider reactive hyperemia test if indicated.',
    protocolConsequence: 'Dynamically mandates ipsilateral Subclavian artery waveform and PSV assessment.',
    referenceGraphicId: 'waveform_vert_early_decel',
    dynamicRuleId: 'rule_vertebral_steal_subclavian_workup',
    severity: 'warning',
    vesselNotes: {
      vertebral: {
        description: 'Stage 1 Steal / "Pre-steal" waveform showing transient mid-systolic dip without reversal.',
        physiology: 'Mild ipsilateral subclavian artery stenosis (typically 50–70%) causes a transient systolic pressure gradient, dampening the early vertebral wave.'
      }
    }
  },

  bunny_pre_steal: {
    id: 'bunny_pre_steal',
    label: 'Bunny / pre-steal',
    appliesTo: ['vertebral'],
    shortDefinition: 'Prominent mid-systolic deceleration with characteristic "bunny-ear" waveform contour.',
    appearance: [
      'Two distinct systolic peaks separated by a deep mid-systolic notch ("bunny ears" morphology)',
      'Notch approaches or touches the zero baseline, but without substantial below-baseline reversal',
      'Continuous forward antegrade diastolic flow'
    ],
    interpretation: 'Stage 2 Subclavian Steal / Pre-Steal Pattern. Represents advancing ipsilateral subclavian or brachiocephalic stenosis with pronounced mid-systolic siphon effect.',
    nextStep: 'Mandatory ipsilateral subclavian artery duplex evaluation, bilateral brachial pressure measurement, and check for upper limb claudication.',
    protocolConsequence: 'Enforces ipsilateral Subclavian Artery workup rule; prompts anatomy check (verifies subclavian vs direct arch origin).',
    referenceGraphicId: 'waveform_vert_bunny',
    dynamicRuleId: 'rule_vertebral_steal_subclavian_workup',
    severity: 'warning',
    vesselNotes: {
      vertebral: {
        description: 'Classic "Bunny Ear" morphology with deep mid-systolic notch touching baseline.',
        physiology: 'Hemodynamically significant proximal subclavian stenosis siphons peak systolic pressure away from the posterior circulation.'
      }
    }
  },

  bidirectional_partial_steal: {
    id: 'bidirectional_partial_steal',
    label: 'Bidirectional / partial steal',
    appliesTo: ['vertebral'],
    shortDefinition: 'Alternating flow direction: retrograde in systole and antegrade in diastole (to-and-fro pattern).',
    appearance: [
      'Systolic flow reverses below baseline (retrograde direction during systole)',
      'Diastolic flow returns above baseline (antegrade forward direction during diastole)',
      'Classic "to-and-fro" or biphasic bidirectional spectral envelope'
    ],
    interpretation: 'Stage 3 Subclavian Steal (Partial / Intermediate Steal). High-grade proximal subclavian stenosis or near-occlusion where systolic pressure gradient reverses flow, but diastolic resting pressure maintains forward flow.',
    nextStep: 'Mandatory proximal subclavian artery examination, bilateral arm blood pressures (>20 mmHg differential expected), and neurologic review for vertebrobasilar symptoms.',
    protocolConsequence: 'Mandatory Subclavian workup; automatically updates vertebral flow direction to bidirectional.',
    referenceGraphicId: 'waveform_vert_bidirectional',
    dynamicRuleId: 'rule_vertebral_steal_subclavian_workup',
    severity: 'alert',
    vesselNotes: {
      vertebral: {
        description: 'Intermediate/partial steal with systolic flow reversal and diastolic forward flow.',
        physiology: 'Pressure in the ipsilateral subclavian bed drops below basilar pressure during systole, pulling flow backward down the vertebral artery.'
      }
    }
  },

  complete_reversal: {
    id: 'complete_reversal',
    label: 'Complete reversal',
    appliesTo: ['vertebral'],
    shortDefinition: 'Continuous retrograde flow throughout both systole and diastole (100% reversed flow).',
    appearance: [
      'Entire spectral envelope is below baseline throughout the cardiac cycle (retrograde flow)',
      'Continuous retrograde flow during systole AND diastole',
      'Velocity contour is often dampened and rounded'
    ],
    interpretation: 'Stage 4 Subclavian Steal (Complete / Fully Reversed Steal). Severe high-grade proximal subclavian occlusion or critical pre-vertebral stenosis with permanent pressure gradient driving retrograde flow to supply the arm.',
    nextStep: 'Evaluate ipsilateral subclavian artery origin/occlusion, document bilateral arm pressures, and review for subclavian steal syndrome symptoms with arm exertion.',
    protocolConsequence: 'Mandatory Subclavian workup; automatically syncs flow direction to retrograde and flags subclavian steal physiology.',
    referenceGraphicId: 'waveform_vert_retrograde',
    dynamicRuleId: 'rule_vertebral_steal_subclavian_workup',
    severity: 'alert',
    vesselNotes: {
      vertebral: {
        description: 'Fully retrograde flow feeding the ipsilateral upper extremity from the circle of Willis.',
        physiology: 'Complete occlusion or critical stenosis of the subclavian artery proximal to the vertebral origin.'
      }
    }
  },

  other: {
    id: 'other',
    label: 'Other',
    appliesTo: ['cca', 'ica', 'eca', 'bulb', 'vertebral', 'subclavian', 'bct'],
    shortDefinition: 'Non-standard, mixed, or atypical waveform characteristics documented in free text.',
    appearance: [
      'Atypical or combined spectral features not captured by standard categories',
      'Arrhythmic/post-extrasystolic potentiation waveforms',
      'Stent-related flutter or unusual vascular pathology'
    ],
    interpretation: 'Custom finding requiring sonographer commentary.',
    nextStep: 'Document descriptive comments in the segment notes.',
    referenceGraphicId: 'waveform_normal',
    severity: 'advisory'
  },

  not_assessed: {
    id: 'not_assessed',
    label: 'Not assessed',
    appliesTo: ['cca', 'ica', 'eca', 'bulb', 'vertebral', 'subclavian', 'bct'],
    shortDefinition: 'Waveform morphology has not yet been acquired or evaluated.',
    appearance: ['No spectral acquisition recorded'],
    interpretation: 'Pending clinical assessment.',
    nextStep: 'Sample vessel with pulsed Doppler aligned with flow (<60° angle).',
    referenceGraphicId: 'waveform_normal',
    severity: 'advisory'
  }
};

// Helper to get allowed waveform options for a specific vessel category
export function getWaveformOptionsForVessel(category?: VesselCategory | string): WaveformDescriptor[] {
  switch (category) {
    case 'cca':
      return [
        WAVEFORM_DESCRIPTORS.normal,
        WAVEFORM_DESCRIPTORS.damped,
        WAVEFORM_DESCRIPTORS.tardus_parvus,
        WAVEFORM_DESCRIPTORS.high_resistance,
        WAVEFORM_DESCRIPTORS.low_resistance,
        WAVEFORM_DESCRIPTORS.turbulent,
        WAVEFORM_DESCRIPTORS.absent,
        WAVEFORM_DESCRIPTORS.other,
        WAVEFORM_DESCRIPTORS.not_assessed,
      ];
    case 'ica':
      return [
        WAVEFORM_DESCRIPTORS.normal,
        WAVEFORM_DESCRIPTORS.damped,
        WAVEFORM_DESCRIPTORS.tardus_parvus,
        WAVEFORM_DESCRIPTORS.high_resistance,
        WAVEFORM_DESCRIPTORS.turbulent,
        WAVEFORM_DESCRIPTORS.pre_occlusive,
        WAVEFORM_DESCRIPTORS.absent,
        WAVEFORM_DESCRIPTORS.other,
        WAVEFORM_DESCRIPTORS.not_assessed,
      ];
    case 'eca':
      return [
        WAVEFORM_DESCRIPTORS.normal,
        WAVEFORM_DESCRIPTORS.damped,
        WAVEFORM_DESCRIPTORS.tardus_parvus,
        WAVEFORM_DESCRIPTORS.low_resistance,
        WAVEFORM_DESCRIPTORS.turbulent,
        WAVEFORM_DESCRIPTORS.absent,
        WAVEFORM_DESCRIPTORS.other,
        WAVEFORM_DESCRIPTORS.not_assessed,
      ];
    case 'bulb':
      return [
        WAVEFORM_DESCRIPTORS.normal,
        WAVEFORM_DESCRIPTORS.damped,
        WAVEFORM_DESCRIPTORS.tardus_parvus,
        WAVEFORM_DESCRIPTORS.turbulent,
        WAVEFORM_DESCRIPTORS.absent,
        WAVEFORM_DESCRIPTORS.other,
        WAVEFORM_DESCRIPTORS.not_assessed,
      ];
    case 'vertebral':
      return [
        WAVEFORM_DESCRIPTORS.normal,
        WAVEFORM_DESCRIPTORS.early_systolic_deceleration,
        WAVEFORM_DESCRIPTORS.bunny_pre_steal,
        WAVEFORM_DESCRIPTORS.bidirectional_partial_steal,
        WAVEFORM_DESCRIPTORS.complete_reversal,
        WAVEFORM_DESCRIPTORS.damped,
        WAVEFORM_DESCRIPTORS.high_resistance,
        WAVEFORM_DESCRIPTORS.absent,
        WAVEFORM_DESCRIPTORS.other,
        WAVEFORM_DESCRIPTORS.not_assessed,
      ];
    case 'subclavian':
    case 'bct':
      return [
        WAVEFORM_DESCRIPTORS.normal,
        WAVEFORM_DESCRIPTORS.biphasic,
        WAVEFORM_DESCRIPTORS.monophasic,
        WAVEFORM_DESCRIPTORS.damped,
        WAVEFORM_DESCRIPTORS.turbulent,
        WAVEFORM_DESCRIPTORS.absent,
        WAVEFORM_DESCRIPTORS.other,
        WAVEFORM_DESCRIPTORS.not_assessed,
      ];
    default:
      return Object.values(WAVEFORM_DESCRIPTORS);
  }
}

// Find descriptor by string value (handles normalized comparison or legacy values)
export function findWaveformDescriptor(value: string | undefined | null, category?: VesselCategory | string): WaveformDescriptor {
  if (!value || value === 'Not assessed' || value === 'Unassessed') {
    return WAVEFORM_DESCRIPTORS.not_assessed;
  }

  const v = value.toLowerCase().trim();

  if (v === 'normal' || v.startsWith('normal') || v.includes('expected')) {
    return WAVEFORM_DESCRIPTORS.normal;
  }
  if (v.includes('tardus')) {
    return WAVEFORM_DESCRIPTORS.tardus_parvus;
  }
  if (v.includes('damped') || v.includes('dampened')) {
    return WAVEFORM_DESCRIPTORS.damped;
  }
  if (v.includes('high resistance') || v.includes('high_resistance')) {
    return WAVEFORM_DESCRIPTORS.high_resistance;
  }
  if (v.includes('low resistance') || v.includes('low_resistance')) {
    return WAVEFORM_DESCRIPTORS.low_resistance;
  }
  if (v.includes('turbulent') || v.includes('stenotic') || v.includes('turbulence')) {
    return WAVEFORM_DESCRIPTORS.turbulent;
  }
  if (v.includes('pre-occlusive') || v.includes('preocclusive') || v.includes('string sign') || v.includes('thump')) {
    return WAVEFORM_DESCRIPTORS.pre_occlusive;
  }
  if (v.includes('absent') || v.includes('no flow') || v.includes('occluded')) {
    return WAVEFORM_DESCRIPTORS.absent;
  }
  if (v.includes('early systolic') || v.includes('early_systolic')) {
    return WAVEFORM_DESCRIPTORS.early_systolic_deceleration;
  }
  if (v.includes('bunny') || v.includes('pre-steal') || v.includes('pre_steal')) {
    return WAVEFORM_DESCRIPTORS.bunny_pre_steal;
  }
  if (v.includes('bidirectional') || v.includes('partial steal')) {
    return WAVEFORM_DESCRIPTORS.bidirectional_partial_steal;
  }
  if (v.includes('reversal') || v.includes('retrograde') || v.includes('complete reversal')) {
    return WAVEFORM_DESCRIPTORS.complete_reversal;
  }
  if (v.includes('triphasic')) {
    return WAVEFORM_DESCRIPTORS.normal;
  }
  if (v.includes('biphasic')) {
    return WAVEFORM_DESCRIPTORS.biphasic;
  }
  if (v.includes('monophasic')) {
    return WAVEFORM_DESCRIPTORS.monophasic;
  }

  return WAVEFORM_DESCRIPTORS.other;
}
