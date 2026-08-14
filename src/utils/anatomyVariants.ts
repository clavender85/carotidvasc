import { ArchVariant, BifurcationVariant, AnatomyVariantState, StudyData } from '../types';

export interface ArchVariantMeta {
  id: ArchVariant;
  label: string;
  shortLabel: string;
  badge: string;
  description: string;
  reportText: string;
  clinicalImplications: string;
}

export interface BifurcationVariantMeta {
  id: BifurcationVariant;
  label: string;
  shortLabel: string;
  description: string;
  reportText: string;
  clinicalImplications: string;
}

export const ARCH_VARIANTS_META: Record<ArchVariant, ArchVariantMeta> = {
  standard: {
    id: 'standard',
    label: 'Standard Arch Anatomy',
    shortLabel: 'Standard',
    badge: 'Standard 3-Branch Arch',
    description: 'Normal 3-branch aortic arch: Brachiocephalic Trunk (giving rise to RCCA & RSA), Left CCA, and Left Subclavian Artery.',
    reportText: '',
    clinicalImplications: 'Standard anatomical branching without structural variants.',
  },
  bovine_common_origin: {
    id: 'bovine_common_origin',
    label: 'Bovine / Common Origin',
    shortLabel: 'Bovine',
    badge: 'Bovine / Shared Origin',
    description: 'Common origin or direct branching of the Left Common Carotid Artery (LCCA) with the Brachiocephalic Trunk (BCT).',
    reportText: 'Common origin of the brachiocephalic trunk and left common carotid artery (bovine arch configuration).',
    clinicalImplications: 'Common anatomical variant (~15-20% population). Standard hemodynamic criteria apply; note origin relationship for endovascular access.',
  },
  left_vertebral_from_arch: {
    id: 'left_vertebral_from_arch',
    label: 'L Vertebral from Arch',
    shortLabel: 'L Vert Arch',
    badge: 'Direct Arch Origin LVA',
    description: 'Direct origin of the Left Vertebral Artery from the aortic arch, positioned between the Left CCA and Left Subclavian origins.',
    reportText: 'Left vertebral artery arises directly from the aortic arch.',
    clinicalImplications: 'Vertebral origin arises directly from aortic arch (~5% incidence). Proximal LVA V0/V1 segment evaluated at arch origin rather than subclavian.',
  },
  aberrant_right_subclavian: {
    id: 'aberrant_right_subclavian',
    label: 'Aberrant R Subclavian (ARSA)',
    shortLabel: 'Aberrant RSA',
    badge: 'Aberrant RSA (Arteria Lusoria)',
    description: 'Aberrant right subclavian artery (ARSA) arising as the distal-most branch of the aortic arch, with independent direct RCCA origin.',
    reportText: 'Aberrant right subclavian artery with direct aortic arch origin (arteria lusoria).',
    clinicalImplications: 'Distal arch origin with retroesophageal course. Right CCA originates independently from arch with absence of typical BCT bifurcation.',
  },
  separate_rcca_and_rsa: {
    id: 'separate_rcca_and_rsa',
    label: 'Separate RCCA + RSA Origins',
    shortLabel: 'Separate RCCA/RSA',
    badge: '4-Branch Arch (No BCT)',
    description: 'Separate independent direct origins of the Right Common Carotid and Right Subclavian arteries from the aortic arch (absence of BCT).',
    reportText: 'Separate origins of the right common carotid artery and right subclavian artery from the aortic arch (absence of normal brachiocephalic trunk).',
    clinicalImplications: 'Four-vessel aortic arch without brachiocephalic trunk.',
  },
  other: {
    id: 'other',
    label: 'Other / Custom Variant',
    shortLabel: 'Other Variant',
    badge: 'Custom Variant',
    description: 'Other non-standard arch branching pattern or vascular anomaly.',
    reportText: 'Anatomical variant noted.',
    clinicalImplications: 'Document custom anatomical configuration in study comments.',
  },
};

export const BIFURCATION_VARIANTS_META: Record<BifurcationVariant, BifurcationVariantMeta> = {
  normal: {
    id: 'normal',
    label: 'Standard Bifurcation Level (C3-C4)',
    shortLabel: 'Standard Level',
    description: 'Carotid bifurcation at standard anatomical level (superior margin of thyroid cartilage / C3-C4).',
    reportText: '',
    clinicalImplications: 'Standard acoustic window for proximal and mid ICA imaging.',
  },
  high: {
    id: 'high',
    label: 'High Carotid Bifurcation (C2-C3)',
    shortLabel: 'High Bifurcation',
    description: 'High cervical carotid bifurcation located at or above C2-C3 / angle of the mandible.',
    reportText: 'High carotid bifurcation noted, situated near the angle of the mandible.',
    clinicalImplications: 'Distal ICA acoustic window may be technically constrained beneath the mandibular shadow.',
  },
  low: {
    id: 'low',
    label: 'Low Carotid Bifurcation (C5-C6 / Supraclavicular)',
    shortLabel: 'Low Bifurcation',
    description: 'Low cervical carotid bifurcation located at C5-C6 or near supraclavicular fossa with elongated ICA/ECA segments.',
    reportText: 'Low carotid bifurcation noted in the lower cervical region.',
    clinicalImplications: 'Early division of CCA with elongated extracranial course of ICA and ECA.',
  },
};

/**
 * Returns structured clinical sentences for the Anatomical Variation section of reports.
 */
export function getAnatomicalVariationReportSentences(study: StudyData): string[] {
  const sentences: string[] = [];
  const archVariant = study.anatomyVariants?.archVariant || (study.variantLeftBct ? 'bovine_common_origin' : 'standard');
  const bifurcationVariant = study.anatomyVariants?.bifurcationVariant || 'normal';
  const otherNotes = study.anatomyVariants?.otherDescription || study.anatomyVariants?.variantNotes || '';

  // Arch variant text
  if (archVariant !== 'standard') {
    const meta = ARCH_VARIANTS_META[archVariant];
    if (archVariant === 'other' && otherNotes.trim()) {
      sentences.push(`Anatomical variation: ${otherNotes.trim()}`);
    } else if (meta && meta.reportText) {
      sentences.push(meta.reportText);
    }
  }

  // Bifurcation variant text
  if (bifurcationVariant !== 'normal') {
    const meta = BIFURCATION_VARIANTS_META[bifurcationVariant];
    if (meta && meta.reportText) {
      sentences.push(meta.reportText);
    }
  }

  // Additional custom variant notes
  if (otherNotes.trim() && archVariant !== 'other') {
    sentences.push(`Anatomy notes: ${otherNotes.trim()}`);
  }

  return sentences;
}

/**
 * Returns the parent origin of the vertebral artery based on configured anatomical variant.
 */
export function getVertebralParent(
  side: 'right' | 'left',
  anatomy?: AnatomyVariantState
): 'subclavian' | 'aortic_arch' | 'other' {
  const archVariant = anatomy?.archVariant || 'standard';
  if (side === 'left') {
    if (archVariant === 'left_vertebral_from_arch') {
      return 'aortic_arch';
    }
    return 'subclavian';
  } else {
    return 'subclavian';
  }
}

/**
 * Returns the immediate parent vessel segment ID for any vessel in the carotid tree,
 * properly respecting anatomical variants (e.g. left vertebral from arch, bovine origin, aberrant subclavian).
 */
export function getVesselParent(
  vesselId: string,
  anatomy?: AnatomyVariantState
): string {
  const archVariant = anatomy?.archVariant || 'standard';

  if (vesselId.startsWith('l_vert_')) {
    if (archVariant === 'left_vertebral_from_arch') {
      return 'arch';
    }
    return 'l_subcl_prox';
  }

  if (vesselId.startsWith('r_vert_')) {
    return 'r_subcl_prox';
  }

  if (vesselId === 'l_cca_prox') {
    if (archVariant === 'bovine_common_origin') {
      return 'l_bct_dist';
    }
    return 'arch';
  }

  if (vesselId === 'r_cca_prox') {
    if (archVariant === 'aberrant_right_subclavian' || archVariant === 'separate_rcca_and_rsa') {
      return 'arch';
    }
    return 'r_bct_dist';
  }

  if (vesselId === 'l_subcl_prox') {
    return 'arch';
  }

  if (vesselId === 'r_subcl_prox') {
    if (archVariant === 'aberrant_right_subclavian' || archVariant === 'separate_rcca_and_rsa') {
      return 'arch';
    }
    return 'r_bct_dist';
  }

  // Common carotid to bulb
  if (vesselId === 'r_bulb') return 'r_cca_dist';
  if (vesselId === 'l_bulb') return 'l_cca_dist';

  // Bulb to ICA/ECA
  if (vesselId === 'r_ica_prox' || vesselId === 'r_eca_prox') return 'r_bulb';
  if (vesselId === 'l_ica_prox' || vesselId === 'l_eca_prox') return 'l_bulb';

  return 'arch';
}
