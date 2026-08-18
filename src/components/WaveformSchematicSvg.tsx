import React from 'react';
import { VesselCategory } from '../data/waveformDescriptors';

interface WaveformSchematicSvgProps {
  descriptorId: string;
  category?: VesselCategory;
  width?: number | string;
  height?: number | string;
  showAnnotations?: boolean;
  className?: string;
  compact?: boolean;
}

export const WaveformSchematicSvg: React.FC<WaveformSchematicSvgProps> = ({
  descriptorId,
  category = 'ica',
  width = '100%',
  height = 160,
  showAnnotations = true,
  className = '',
  compact = false,
}) => {
  // SVG coordinates: viewBox="0 0 400 200"
  // Baseline is at y = 150 (except for bidirectional/retrograde where baseline is at y = 100 or y = 60)
  
  const renderWaveformContent = () => {
    switch (descriptorId) {
      // 1. NORMAL (Vessel-specific!)
      case 'normal': {
        if (category === 'eca') {
          // High Resistance ECA
          return (
            <g id="svg-wf-normal-eca">
              {/* Grid / Zero Baseline */}
              <line x1="20" y1="150" x2="380" y2="150" stroke="#334155" strokeWidth="1.5" strokeDasharray="3 3" />
              <text x="25" y="145" fill="#64748b" fontSize="9" fontWeight="bold">0 cm/s</text>

              {/* Cycle 1 (High resistance sharp peak with temporal ripples) */}
              <path
                d="M 40 150 L 50 150 L 70 30 L 95 140 L 110 135 L 125 150 L 140 148 L 155 150 L 190 150"
                fill="none"
                stroke="#06b6d4"
                strokeWidth="3"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              {/* Spectral Fill */}
              <path
                d="M 50 150 L 70 30 L 95 140 L 110 135 L 125 150 L 140 148 L 155 150 L 190 150 Z"
                fill="url(#cyanGlow)"
                opacity="0.25"
              />

              {/* Cycle 2 */}
              <path
                d="M 190 150 L 200 150 L 220 30 L 245 140 L 260 135 L 275 150 L 290 148 L 305 150 L 350 150"
                fill="none"
                stroke="#06b6d4"
                strokeWidth="3"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M 200 150 L 220 30 L 245 140 L 260 135 L 275 150 L 290 148 L 305 150 L 350 150 Z"
                fill="url(#cyanGlow)"
                opacity="0.25"
              />

              {showAnnotations && !compact && (
                <>
                  <line x1="70" y1="25" x2="70" y2="15" stroke="#38bdf8" strokeWidth="1" />
                  <text x="70" y="12" fill="#38bdf8" fontSize="10" fontWeight="bold" textAnchor="middle">Sharp Systolic Peak</text>

                  <line x1="135" y1="140" x2="135" y2="115" stroke="#f59e0b" strokeWidth="1" strokeDasharray="2 2" />
                  <text x="135" y="110" fill="#fbbf24" fontSize="9" fontWeight="bold" textAnchor="middle">Minimal Diastolic Flow</text>

                  <text x="310" y="130" fill="#94a3b8" fontSize="9" fontStyle="italic">ECA High Resistance</text>
                </>
              )}
            </g>
          );
        } else if (category === 'cca') {
          // Intermediate Resistance CCA
          return (
            <g id="svg-wf-normal-cca">
              <line x1="20" y1="150" x2="380" y2="150" stroke="#334155" strokeWidth="1.5" strokeDasharray="3 3" />
              <text x="25" y="145" fill="#64748b" fontSize="9" fontWeight="bold">0 cm/s</text>

              {/* Cycle 1 (Brisk upstroke, dicrotic notch, intermediate diastole) */}
              <path
                d="M 40 150 L 50 150 L 72 40 L 95 100 L 105 85 L 125 110 L 155 125 L 190 135 L 200 150"
                fill="none"
                stroke="#10b981"
                strokeWidth="3"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M 50 150 L 72 40 L 95 100 L 105 85 L 125 110 L 155 125 L 190 135 L 200 150 Z"
                fill="url(#emeraldGlow)"
                opacity="0.25"
              />

              {/* Cycle 2 */}
              <path
                d="M 200 150 L 222 40 L 245 100 L 255 85 L 275 110 L 305 125 L 340 135 L 350 150"
                fill="none"
                stroke="#10b981"
                strokeWidth="3"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M 200 150 L 222 40 L 245 100 L 255 85 L 275 110 L 305 125 L 340 135 L 350 150 Z"
                fill="url(#emeraldGlow)"
                opacity="0.25"
              />

              {showAnnotations && !compact && (
                <>
                  <text x="72" y="25" fill="#34d399" fontSize="10" fontWeight="bold" textAnchor="middle">Brisk Upstroke</text>
                  <text x="110" y="75" fill="#a7f3d0" fontSize="8.5" fontWeight="bold">Dicrotic Notch</text>
                  <text x="160" y="115" fill="#34d399" fontSize="9" fontWeight="bold">Forward Diastole</text>
                  <text x="310" y="130" fill="#94a3b8" fontSize="9" fontStyle="italic">CCA Intermediate</text>
                </>
              )}
            </g>
          );
        } else if (category === 'subclavian' || category === 'bct') {
          // Triphasic Subclavian
          return (
            <g id="svg-wf-normal-subclavian">
              <line x1="20" y1="120" x2="380" y2="120" stroke="#334155" strokeWidth="1.5" strokeDasharray="3 3" />
              <text x="25" y="115" fill="#64748b" fontSize="9" fontWeight="bold">0 cm/s</text>

              {/* Cycle 1 (Triphasic: Forward -> Reversal -> Forward bounce) */}
              <path
                d="M 40 120 L 50 120 L 70 25 L 90 120 L 105 165 L 120 120 L 135 105 L 155 120 L 190 120"
                fill="none"
                stroke="#38bdf8"
                strokeWidth="3"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M 50 120 L 70 25 L 90 120 Z"
                fill="url(#cyanGlow)"
                opacity="0.3"
              />
              <path
                d="M 90 120 L 105 165 L 120 120 Z"
                fill="#f43f5e"
                opacity="0.25"
              />
              <path
                d="M 120 120 L 135 105 L 155 120 Z"
                fill="url(#cyanGlow)"
                opacity="0.2"
              />

              {/* Cycle 2 */}
              <path
                d="M 190 120 L 200 120 L 220 25 L 240 120 L 255 165 L 270 120 L 285 105 L 305 120 L 350 120"
                fill="none"
                stroke="#38bdf8"
                strokeWidth="3"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M 200 120 L 220 25 L 240 120 Z"
                fill="url(#cyanGlow)"
                opacity="0.3"
              />
              <path
                d="M 240 120 L 255 165 L 270 120 Z"
                fill="#f43f5e"
                opacity="0.25"
              />

              {showAnnotations && !compact && (
                <>
                  <text x="70" y="15" fill="#38bdf8" fontSize="9.5" fontWeight="bold" textAnchor="middle">1. Forward Systole</text>
                  <text x="105" y="182" fill="#fb7185" fontSize="9" fontWeight="bold" textAnchor="middle">2. Diastolic Reversal</text>
                  <text x="145" y="95" fill="#38bdf8" fontSize="8.5" fontWeight="bold">3. Forward Bounce</text>
                </>
              )}
            </g>
          );
        } else {
          // Low Resistance ICA / Vertebral
          return (
            <g id="svg-wf-normal-ica">
              <line x1="20" y1="150" x2="380" y2="150" stroke="#334155" strokeWidth="1.5" strokeDasharray="3 3" />
              <text x="25" y="145" fill="#64748b" fontSize="9" fontWeight="bold">0 cm/s</text>

              {/* Cycle 1 (Continuous forward low resistance) */}
              <path
                d="M 40 150 L 50 150 L 70 35 L 95 75 L 120 90 L 155 100 L 190 110 L 200 150"
                fill="none"
                stroke="#06b6d4"
                strokeWidth="3"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M 50 150 L 70 35 L 95 75 L 120 90 L 155 100 L 190 110 L 200 150 Z"
                fill="url(#cyanGlow)"
                opacity="0.3"
              />

              {/* Cycle 2 */}
              <path
                d="M 200 150 L 220 35 L 245 75 L 270 90 L 305 100 L 340 110 L 350 150"
                fill="none"
                stroke="#06b6d4"
                strokeWidth="3"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M 200 150 L 220 35 L 245 75 L 270 90 L 305 100 L 340 110 L 350 150 Z"
                fill="url(#cyanGlow)"
                opacity="0.3"
              />

              {showAnnotations && !compact && (
                <>
                  <text x="70" y="20" fill="#38bdf8" fontSize="10" fontWeight="bold" textAnchor="middle">Brisk Peak (&lt;70 ms)</text>
                  <text x="155" y="85" fill="#67e8f9" fontSize="9.5" fontWeight="bold" textAnchor="middle">Continuous Forward Diastole</text>
                  <text x="310" y="130" fill="#94a3b8" fontSize="9" fontStyle="italic">ICA Low Resistance</text>
                </>
              )}
            </g>
          );
        }
      }

      // 2. DAMPED (Reduced amplitude/blunted contour WITHOUT delayed acceleration time)
      case 'damped': {
        return (
          <g id="svg-wf-damped">
            <line x1="20" y1="150" x2="380" y2="150" stroke="#334155" strokeWidth="1.5" strokeDasharray="3 3" />
            <text x="25" y="145" fill="#64748b" fontSize="9" fontWeight="bold">0 cm/s</text>

            {/* Reference ghost normal wave */}
            <path
              d="M 50 150 L 70 35 L 95 75 L 120 90 L 155 100 L 190 110 L 200 150"
              fill="none"
              stroke="#334155"
              strokeWidth="1.5"
              strokeDasharray="4 4"
            />

            {/* Damped Wave (Starts upstroke briskly at standard time, but peaks low and rounded) */}
            <path
              d="M 40 150 L 50 150 L 72 85 Q 85 80 100 95 L 130 115 L 165 125 L 190 130 L 200 150"
              fill="none"
              stroke="#a855f7"
              strokeWidth="3"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M 50 150 L 72 85 Q 85 80 100 95 L 130 115 L 165 125 L 190 130 L 200 150 Z"
              fill="url(#purpleGlow)"
              opacity="0.25"
            />

            {/* Cycle 2 */}
            <path
              d="M 200 150 L 222 85 Q 235 80 250 95 L 280 115 L 315 125 L 340 130 L 350 150"
              fill="none"
              stroke="#a855f7"
              strokeWidth="3"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M 200 150 L 222 85 Q 235 80 250 95 L 280 115 L 315 125 L 340 130 L 350 150 Z"
              fill="url(#purpleGlow)"
              opacity="0.25"
            />

            {showAnnotations && !compact && (
              <>
                {/* Arrow down to blunted peak */}
                <line x1="78" y1="50" x2="78" y2="75" stroke="#c084fc" strokeWidth="1.5" markerEnd="url(#arrowPurple)" />
                <text x="80" y="45" fill="#c084fc" fontSize="9.5" fontWeight="bold">Blunted / Attenuated Peak</text>

                <text x="140" y="108" fill="#e9d5ff" fontSize="9" fontWeight="bold">Reduced Amplitude</text>
                <text x="70" y="170" fill="#94a3b8" fontSize="8.5">Normal acceleration onset</text>
                <text x="310" y="140" fill="#94a3b8" fontSize="8.5" fontStyle="italic">Broad descriptor</text>
              </>
            )}
          </g>
        );
      }

      // 3. TARDUS-PARVUS (Delayed systolic upstroke + reduced amplitude)
      case 'tardus_parvus': {
        return (
          <g id="svg-wf-tardus-parvus">
            <line x1="20" y1="150" x2="380" y2="150" stroke="#334155" strokeWidth="1.5" strokeDasharray="3 3" />
            <text x="25" y="145" fill="#64748b" fontSize="9" fontWeight="bold">0 cm/s</text>

            {/* Ghost normal comparison */}
            <path
              d="M 50 150 L 70 35 L 95 75 L 120 90 L 155 100 L 190 110 L 200 150"
              fill="none"
              stroke="#334155"
              strokeWidth="1.5"
              strokeDasharray="4 4"
            />

            {/* Tardus-Parvus Wave: Prolonged rise time, rounded crest */}
            <path
              d="M 40 150 L 50 150 C 70 145, 95 120, 115 90 C 125 78, 140 82, 150 95 L 175 118 L 195 130 L 200 150"
              fill="none"
              stroke="#f59e0b"
              strokeWidth="3.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M 50 150 C 70 145, 95 120, 115 90 C 125 78, 140 82, 150 95 L 175 118 L 195 130 L 200 150 Z"
              fill="url(#amberGlow)"
              opacity="0.3"
            />

            {/* Cycle 2 */}
            <path
              d="M 200 150 C 220 145, 245 120, 265 90 C 275 78, 290 82, 300 95 L 325 118 L 345 130 L 350 150"
              fill="none"
              stroke="#f59e0b"
              strokeWidth="3.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M 200 150 C 220 145, 245 120, 265 90 C 275 78, 290 82, 300 95 L 325 118 L 345 130 L 350 150 Z"
              fill="url(#amberGlow)"
              opacity="0.3"
            />

            {showAnnotations && !compact && (
              <>
                {/* Visual Arrow 1: Delayed Upstroke (Tardus) */}
                <line x1="50" y1="165" x2="115" y2="165" stroke="#f59e0b" strokeWidth="2" markerEnd="url(#arrowAmber)" />
                <text x="82" y="180" fill="#fcd34d" fontSize="9.5" fontWeight="black" textAnchor="middle">
                  Delayed Upstroke (TARDUS)
                </text>

                {/* Visual Arrow 2: Reduced Amplitude (Parvus) */}
                <line x1="130" y1="35" x2="130" y2="72" stroke="#f59e0b" strokeWidth="2" markerEnd="url(#arrowAmber)" />
                <text x="135" y="30" fill="#fcd34d" fontSize="9.5" fontWeight="black">
                  Reduced Amplitude (PARVUS)
                </text>

                <text x="310" y="55" fill="#f59e0b" fontSize="8.5" fontWeight="bold">Proximal Obstruction Pattern</text>
              </>
            )}
          </g>
        );
      }

      // 4. HIGH RESISTANCE
      case 'high_resistance': {
        return (
          <g id="svg-wf-high-resistance">
            <line x1="20" y1="150" x2="380" y2="150" stroke="#334155" strokeWidth="1.5" strokeDasharray="3 3" />
            <text x="25" y="145" fill="#64748b" fontSize="9" fontWeight="bold">0 cm/s</text>

            {/* Cycle 1 (Tall sharp spike, rapid drop to zero baseline) */}
            <path
              d="M 40 150 L 50 150 L 68 25 L 88 145 L 105 148 L 140 150 L 190 150"
              fill="none"
              stroke="#ef4444"
              strokeWidth="3"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M 50 150 L 68 25 L 88 145 L 105 148 L 140 150 L 190 150 Z"
              fill="url(#roseGlow)"
              opacity="0.3"
            />

            {/* Cycle 2 */}
            <path
              d="M 190 150 L 200 150 L 218 25 L 238 145 L 255 148 L 290 150 L 340 150"
              fill="none"
              stroke="#ef4444"
              strokeWidth="3"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M 200 150 L 218 25 L 238 145 L 255 148 L 290 150 L 340 150 Z"
              fill="url(#roseGlow)"
              opacity="0.3"
            />

            {showAnnotations && !compact && (
              <>
                <text x="68" y="15" fill="#f87171" fontSize="9.5" fontWeight="bold" textAnchor="middle">Sharp Tall Peak</text>
                <text x="130" y="135" fill="#fca5a5" fontSize="9" fontWeight="bold">Zero / Absent Diastolic Flow</text>
                <text x="310" y="135" fill="#94a3b8" fontSize="8.5" fontStyle="italic">Distal Outflow Resistance</text>
              </>
            )}
          </g>
        );
      }

      // 5. LOW RESISTANCE (ECA Internalisation)
      case 'low_resistance': {
        return (
          <g id="svg-wf-low-resistance">
            <line x1="20" y1="150" x2="380" y2="150" stroke="#334155" strokeWidth="1.5" strokeDasharray="3 3" />
            <text x="25" y="145" fill="#64748b" fontSize="9" fontWeight="bold">0 cm/s</text>

            <path
              d="M 40 150 L 50 150 L 72 40 L 95 70 L 125 80 L 160 90 L 190 100 L 200 150"
              fill="none"
              stroke="#10b981"
              strokeWidth="3"
              strokeLinecap="round"
            />
            <path
              d="M 50 150 L 72 40 L 95 70 L 125 80 L 160 90 L 190 100 L 200 150 Z"
              fill="url(#emeraldGlow)"
              opacity="0.3"
            />

            <path
              d="M 200 150 L 222 40 L 245 70 L 275 80 L 310 90 L 340 100 L 350 150"
              fill="none"
              stroke="#10b981"
              strokeWidth="3"
              strokeLinecap="round"
            />
            <path
              d="M 200 150 L 222 40 L 245 70 L 275 80 L 310 90 L 340 100 L 350 150 Z"
              fill="url(#emeraldGlow)"
              opacity="0.3"
            />

            {showAnnotations && !compact && (
              <>
                <text x="72" y="25" fill="#34d399" fontSize="9.5" fontWeight="bold" textAnchor="middle">Continuous Forward Diastole</text>
                <text x="145" y="70" fill="#a7f3d0" fontSize="9" fontWeight="bold">ECA Internalisation / Collateral</text>
              </>
            )}
          </g>
        );
      }

      // 6. TURBULENT / DISTURBED FLOW
      case 'turbulent': {
        return (
          <g id="svg-wf-turbulent">
            <line x1="20" y1="130" x2="380" y2="130" stroke="#334155" strokeWidth="1.5" strokeDasharray="3 3" />
            <text x="25" y="125" fill="#64748b" fontSize="9" fontWeight="bold">0 cm/s</text>

            {/* Jagged outer envelope with filled-in spectral window and bidirectional noise */}
            <path
              d="M 45 130 L 55 110 L 65 20 L 72 35 L 80 15 L 88 45 L 98 70 L 110 55 L 125 90 L 140 80 L 155 105 L 170 95 L 185 130 L 195 145 L 205 130"
              fill="none"
              stroke="#f43f5e"
              strokeWidth="3"
              strokeLinejoin="round"
            />
            {/* Filled spectral window with turbulent texture */}
            <path
              d="M 45 130 L 55 110 L 65 20 L 72 35 L 80 15 L 88 45 L 98 70 L 110 55 L 125 90 L 140 80 L 155 105 L 170 95 L 185 130 L 195 145 L 205 130 Z"
              fill="url(#roseGlow)"
              opacity="0.45"
            />
            {/* Spectral broadening noise lines */}
            <path
              d="M 60 90 Q 75 60 90 85 M 70 110 Q 90 90 120 105 M 95 125 L 115 115 M 130 120 L 150 110"
              stroke="#fb7185"
              strokeWidth="1.5"
              strokeDasharray="2 3"
            />

            {/* Cycle 2 */}
            <path
              d="M 205 130 L 215 110 L 225 20 L 232 35 L 240 15 L 248 45 L 258 70 L 270 55 L 285 90 L 300 80 L 315 105 L 330 95 L 345 130 L 355 145 L 365 130"
              fill="none"
              stroke="#f43f5e"
              strokeWidth="3"
              strokeLinejoin="round"
            />
            <path
              d="M 205 130 L 215 110 L 225 20 L 232 35 L 240 15 L 248 45 L 258 70 L 270 55 L 285 90 L 300 80 L 315 105 L 330 95 L 345 130 L 355 145 L 365 130 Z"
              fill="url(#roseGlow)"
              opacity="0.45"
            />

            {showAnnotations && !compact && (
              <>
                <text x="75" y="10" fill="#f43f5e" fontSize="9.5" fontWeight="black" textAnchor="middle">Spectral Broadening & Window Fill</text>
                <text x="160" y="60" fill="#fda4af" fontSize="9" fontWeight="bold">Post-Stenotic Disturbed Flow</text>
              </>
            )}
          </g>
        );
      }

      // 7. PRE-OCCLUSIVE / STRING SIGN
      case 'pre_occlusive': {
        return (
          <g id="svg-wf-pre-occlusive">
            <line x1="20" y1="150" x2="380" y2="150" stroke="#334155" strokeWidth="1.5" strokeDasharray="3 3" />
            <text x="25" y="145" fill="#64748b" fontSize="9" fontWeight="bold">0 cm/s</text>

            {/* Low velocity thin trickle line */}
            <path
              d="M 40 150 L 55 145 C 65 140, 75 125, 90 120 C 105 115, 120 135, 145 142 L 180 148 L 195 150"
              fill="none"
              stroke="#fbbf24"
              strokeWidth="2"
              strokeDasharray="4 2"
            />
            <path
              d="M 55 145 C 65 140, 75 125, 90 120 C 105 115, 120 135, 145 142 L 180 148 L 195 150 Z"
              fill="url(#amberGlow)"
              opacity="0.2"
            />

            <path
              d="M 195 150 L 210 145 C 220 140, 230 125, 245 120 C 260 115, 275 135, 300 142 L 335 148 L 350 150"
              fill="none"
              stroke="#fbbf24"
              strokeWidth="2"
              strokeDasharray="4 2"
            />
            <path
              d="M 210 145 C 220 140, 230 125, 245 120 C 260 115, 275 135, 300 142 L 335 148 L 350 150 Z"
              fill="url(#amberGlow)"
              opacity="0.2"
            />

            {showAnnotations && !compact && (
              <>
                <text x="90" y="105" fill="#fcd34d" fontSize="9.5" fontWeight="bold" textAnchor="middle">Low-Velocity "Trickle" Flow</text>
                <text x="245" y="105" fill="#fde68a" fontSize="8.5" textAnchor="middle">Near-Occlusion "String Sign" (95–99%)</text>
                <text x="90" y="170" fill="#94a3b8" fontSize="8">Requires low PRF & Power Doppler</text>
              </>
            )}
          </g>
        );
      }

      // 8. ABSENT FLOW
      case 'absent': {
        return (
          <g id="svg-wf-absent">
            <line x1="20" y1="130" x2="380" y2="130" stroke="#f43f5e" strokeWidth="2" strokeDasharray="5 5" />
            <text x="25" y="125" fill="#f43f5e" fontSize="9.5" fontWeight="black">0 cm/s (No Doppler Shift)</text>

            {/* Flat noise baseline only */}
            <path
              d="M 40 130 Q 60 131 80 129 T 120 130 T 160 130 T 200 131 T 240 129 T 280 130 T 320 130 T 360 130"
              fill="none"
              stroke="#64748b"
              strokeWidth="1.5"
              opacity="0.6"
            />

            {showAnnotations && !compact && (
              <>
                <rect x="110" y="45" width="180" height="50" rx="8" fill="#1e1b4b" stroke="#6366f1" strokeWidth="1" />
                <text x="200" y="66" fill="#a5b4fc" fontSize="10.5" fontWeight="black" textAnchor="middle">NO SPECTRAL SIGNAL</text>
                <text x="200" y="82" fill="#cbd5e1" fontSize="8.5" textAnchor="middle">Verify with Color & Power Doppler</text>
              </>
            )}
          </g>
        );
      }

      // 9. VERTEBRAL: EARLY SYSTOLIC DECELERATION (Stage 1 Steal)
      case 'early_systolic_deceleration': {
        return (
          <g id="svg-wf-vert-early-decel">
            <line x1="20" y1="150" x2="380" y2="150" stroke="#334155" strokeWidth="1.5" strokeDasharray="3 3" />
            <text x="25" y="145" fill="#64748b" fontSize="9" fontWeight="bold">0 cm/s</text>

            {/* Cycle 1 (Sharp initial peak, mid-systolic dip, second peak, preserved forward diastole) */}
            <path
              d="M 40 150 L 50 150 L 68 35 L 82 85 L 98 48 L 120 90 L 155 105 L 190 115 L 200 150"
              fill="none"
              stroke="#38bdf8"
              strokeWidth="3"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M 50 150 L 68 35 L 82 85 L 98 48 L 120 90 L 155 105 L 190 115 L 200 150 Z"
              fill="url(#cyanGlow)"
              opacity="0.25"
            />

            {/* Cycle 2 */}
            <path
              d="M 200 150 L 218 35 L 232 85 L 248 48 L 270 90 L 305 105 L 340 115 L 350 150"
              fill="none"
              stroke="#38bdf8"
              strokeWidth="3"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M 200 150 L 218 35 L 232 85 L 248 48 L 270 90 L 305 105 L 340 115 L 350 150 Z"
              fill="url(#cyanGlow)"
              opacity="0.25"
            />

            {showAnnotations && !compact && (
              <>
                <line x1="82" y1="55" x2="82" y2="78" stroke="#38bdf8" strokeWidth="1.5" markerEnd="url(#arrowCyan)" />
                <text x="82" y="20" fill="#38bdf8" fontSize="9.5" fontWeight="bold" textAnchor="middle">Early Systolic Notch</text>
                <text x="82" y="32" fill="#7dd3fc" fontSize="8" textAnchor="middle">(Does not reach 0 baseline)</text>
                <text x="310" y="50" fill="#94a3b8" fontSize="8.5">Stage 1 Pre-Steal</text>
              </>
            )}
          </g>
        );
      }

      // 10. VERTEBRAL: BUNNY / PRE-STEAL (Stage 2 Steal)
      case 'bunny_pre_steal': {
        return (
          <g id="svg-wf-vert-bunny">
            <line x1="20" y1="150" x2="380" y2="150" stroke="#334155" strokeWidth="1.5" strokeDasharray="3 3" />
            <text x="25" y="145" fill="#64748b" fontSize="9" fontWeight="bold">0 cm/s</text>

            {/* Classic Bunny Ears: Notch reaches right to 0 baseline */}
            <path
              d="M 40 150 L 50 150 L 68 35 L 85 145 L 102 42 L 122 95 L 155 110 L 190 120 L 200 150"
              fill="none"
              stroke="#f59e0b"
              strokeWidth="3.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M 50 150 L 68 35 L 85 145 L 102 42 L 122 95 L 155 110 L 190 120 L 200 150 Z"
              fill="url(#amberGlow)"
              opacity="0.3"
            />

            {/* Cycle 2 */}
            <path
              d="M 200 150 L 218 35 L 235 145 L 252 42 L 272 95 L 305 110 L 340 120 L 350 150"
              fill="none"
              stroke="#f59e0b"
              strokeWidth="3.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M 200 150 L 218 35 L 235 145 L 252 42 L 272 95 L 305 110 L 340 120 L 350 150 Z"
              fill="url(#amberGlow)"
              opacity="0.3"
            />

            {showAnnotations && !compact && (
              <>
                <text x="85" y="20" fill="#fbbf24" fontSize="10" fontWeight="black" textAnchor="middle">"Bunny Ear" Contour</text>
                <line x1="85" y1="110" x2="85" y2="140" stroke="#fbbf24" strokeWidth="1.5" markerEnd="url(#arrowAmber)" />
                <text x="85" y="105" fill="#fde68a" fontSize="8.5" fontWeight="bold" textAnchor="middle">Notch Touches Baseline</text>
                <text x="310" y="50" fill="#f59e0b" fontSize="8.5" fontWeight="bold">Stage 2 Subclavian Steal</text>
              </>
            )}
          </g>
        );
      }

      // 11. VERTEBRAL: BIDIRECTIONAL / PARTIAL STEAL (Stage 3 Steal)
      case 'bidirectional_partial_steal': {
        return (
          <g id="svg-wf-vert-bidirectional">
            {/* Midline Zero Baseline */}
            <line x1="20" y1="100" x2="380" y2="100" stroke="#94a3b8" strokeWidth="1.5" strokeDasharray="3 3" />
            <text x="25" y="95" fill="#94a3b8" fontSize="9" fontWeight="bold">0 cm/s</text>

            {/* Cycle 1 (Systole below baseline -> Diastole above baseline) */}
            <path
              d="M 40 100 L 50 100 L 70 170 L 95 100 L 115 50 L 140 65 L 170 80 L 195 95 L 200 100"
              fill="none"
              stroke="#f43f5e"
              strokeWidth="3.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            {/* Below baseline systolic fill */}
            <path
              d="M 50 100 L 70 170 L 95 100 Z"
              fill="#f43f5e"
              opacity="0.35"
            />
            {/* Above baseline diastolic fill */}
            <path
              d="M 95 100 L 115 50 L 140 65 L 170 80 L 195 95 L 200 100 Z"
              fill="#38bdf8"
              opacity="0.3"
            />

            {/* Cycle 2 */}
            <path
              d="M 200 100 L 220 170 L 245 100 L 265 50 L 290 65 L 320 80 L 345 95 L 350 100"
              fill="none"
              stroke="#f43f5e"
              strokeWidth="3.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M 200 100 L 220 170 L 245 100 Z"
              fill="#f43f5e"
              opacity="0.35"
            />
            <path
              d="M 245 100 L 265 50 L 290 65 L 320 80 L 345 95 L 350 100 Z"
              fill="#38bdf8"
              opacity="0.3"
            />

            {showAnnotations && !compact && (
              <>
                <text x="70" y="190" fill="#f43f5e" fontSize="9.5" fontWeight="black" textAnchor="middle">1. Retrograde Systole (↓)</text>
                <text x="130" y="35" fill="#38bdf8" fontSize="9.5" fontWeight="black" textAnchor="middle">2. Antegrade Diastole (↑)</text>
                <text x="310" y="35" fill="#f43f5e" fontSize="8.5" fontWeight="bold">Stage 3 Partial Steal</text>
              </>
            )}
          </g>
        );
      }

      // 12. VERTEBRAL: COMPLETE REVERSAL (Stage 4 Steal)
      case 'complete_reversal': {
        return (
          <g id="svg-wf-vert-retrograde">
            {/* Upper Zero Baseline */}
            <line x1="20" y1="50" x2="380" y2="50" stroke="#94a3b8" strokeWidth="1.5" strokeDasharray="3 3" />
            <text x="25" y="45" fill="#94a3b8" fontSize="9" fontWeight="bold">0 cm/s</text>

            {/* 100% flow below baseline */}
            <path
              d="M 40 50 L 50 50 L 72 165 L 100 115 L 130 95 L 165 80 L 190 70 L 200 50"
              fill="none"
              stroke="#ef4444"
              strokeWidth="3.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M 50 50 L 72 165 L 100 115 L 130 95 L 165 80 L 190 70 L 200 50 Z"
              fill="#ef4444"
              opacity="0.35"
            />

            {/* Cycle 2 */}
            <path
              d="M 200 50 L 222 165 L 250 115 L 280 95 L 315 80 L 340 70 L 350 50"
              fill="none"
              stroke="#ef4444"
              strokeWidth="3.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M 200 50 L 222 165 L 250 115 L 280 95 L 315 80 L 340 70 L 350 50 Z"
              fill="#ef4444"
              opacity="0.35"
            />

            {showAnnotations && !compact && (
              <>
                <text x="72" y="185" fill="#ef4444" fontSize="10" fontWeight="black" textAnchor="middle">100% Retrograde Flow</text>
                <text x="280" y="150" fill="#fca5a5" fontSize="8.5" textAnchor="middle">Continuous Reversed Systole & Diastole</text>
                <text x="310" y="30" fill="#ef4444" fontSize="8.5" fontWeight="bold">Stage 4 Complete Steal</text>
              </>
            )}
          </g>
        );
      }

      // Default fallback
      default: {
        return (
          <g id="svg-wf-generic">
            <line x1="20" y1="150" x2="380" y2="150" stroke="#334155" strokeWidth="1.5" strokeDasharray="3 3" />
            <path
              d="M 40 150 L 50 150 L 70 40 L 95 80 L 120 95 L 155 105 L 190 115 L 200 150"
              fill="none"
              stroke="#06b6d4"
              strokeWidth="3"
            />
          </g>
        );
      }
    }
  };

  return (
    <div className={`relative flex items-center justify-center select-none overflow-hidden rounded-xl bg-[#080d19] border border-slate-800 ${className}`}>
      <svg
        viewBox="0 0 400 200"
        className="w-full h-full"
        style={{ maxHeight: height }}
        preserveAspectRatio="xMidYMid meet"
      >
        <defs>
          <linearGradient id="cyanGlow" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#06b6d4" stopOpacity="0.8" />
            <stop offset="100%" stopColor="#06b6d4" stopOpacity="0.0" />
          </linearGradient>
          <linearGradient id="emeraldGlow" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#10b981" stopOpacity="0.8" />
            <stop offset="100%" stopColor="#10b981" stopOpacity="0.0" />
          </linearGradient>
          <linearGradient id="amberGlow" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#f59e0b" stopOpacity="0.8" />
            <stop offset="100%" stopColor="#f59e0b" stopOpacity="0.0" />
          </linearGradient>
          <linearGradient id="purpleGlow" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#a855f7" stopOpacity="0.8" />
            <stop offset="100%" stopColor="#a855f7" stopOpacity="0.0" />
          </linearGradient>
          <linearGradient id="roseGlow" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#f43f5e" stopOpacity="0.8" />
            <stop offset="100%" stopColor="#f43f5e" stopOpacity="0.0" />
          </linearGradient>

          {/* Arrow markers */}
          <marker id="arrowCyan" viewBox="0 0 10 10" refX="5" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
            <path d="M 0 0 L 10 5 L 0 10 z" fill="#38bdf8" />
          </marker>
          <marker id="arrowAmber" viewBox="0 0 10 10" refX="5" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
            <path d="M 0 0 L 10 5 L 0 10 z" fill="#f59e0b" />
          </marker>
          <marker id="arrowPurple" viewBox="0 0 10 10" refX="5" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
            <path d="M 0 0 L 10 5 L 0 10 z" fill="#a855f7" />
          </marker>
        </defs>

        {renderWaveformContent()}
      </svg>
    </div>
  );
};
