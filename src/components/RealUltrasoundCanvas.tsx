import React, { useEffect, useRef } from 'react';

export interface UltrasoundCanvasProps {
  type: 'stenosis' | 'plaque' | 'normal' | 'vertebral';
  psv?: number;
  edv?: number;
  caliperD1?: number;
  caliperD2?: number;
  nascetPct?: number;
  filterMode?: 'standard' | 'sepia' | 'inverted';
  patientName?: string;
  examDate?: string;
  className?: string;
  width?: number;
  height?: number;
}

export const RealUltrasoundCanvas: React.FC<UltrasoundCanvasProps> = ({
  type,
  psv = 290,
  edv = 92,
  caliperD1 = 2.1,
  caliperD2 = 6.8,
  nascetPct = 69,
  filterMode = 'standard',
  patientName = 'PATIENT, SAMPLE',
  examDate = '2026-08-19',
  className = 'w-full h-full',
  width = 640,
  height = 480,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas dimensions
    canvas.width = width;
    canvas.height = height;

    // Clear background to deep ultrasound monitor black
    ctx.fillStyle = '#020408';
    ctx.fillRect(0, 0, width, height);

    // ==========================================
    // 1. GENERATE PROCEDURAL B-MODE ACOUSTIC SPECKLE & TISSUE
    // ==========================================
    const isDualDisplay = type !== 'plaque'; // Plaque is full B-mode image, others have PW spectral split
    const bmodeHeight = isDualDisplay ? height * 0.52 : height * 0.88;
    const pwTop = bmodeHeight;
    const pwHeight = height - pwTop;

    // Create offscreen buffer for tissue speckle
    const imgData = ctx.createImageData(width, Math.floor(bmodeHeight));
    const data = imgData.data;

    // Pseudo-random seeded noise for consistent high-quality ultrasound texture
    const randomNoise = (x: number, y: number, seed: number = 42) => {
      const n = Math.sin(x * 12.9898 + y * 78.233 + seed) * 43758.5453;
      return n - Math.floor(n);
    };

    // Vessel geometry parameters in B-mode space
    const lumenCenterY = bmodeHeight * 0.48;
    const normalLumenRadius = bmodeHeight * 0.22;

    for (let y = 0; y < Math.floor(bmodeHeight); y++) {
      const depthRatio = y / bmodeHeight; // 0 (skin) to 1 (deep)
      const tgcGain = 0.8 + depthRatio * 0.4; // Time gain compensation

      for (let x = 0; x < width; x++) {
        const idx = (y * width + x) * 4;

        // Skip lateral margins for ultrasound beam boundaries
        if (x < 35 || x > width - 45) {
          data[idx] = 2;
          data[idx + 1] = 4;
          data[idx + 2] = 8;
          data[idx + 3] = 255;
          continue;
        }

        // Calculate distance from vessel center line
        let vesselY = lumenCenterY + Math.sin(x * 0.008) * (bmodeHeight * 0.04);
        let curRadius = normalLumenRadius;
        let isInsideLumen = false;
        let isVesselWall = false;
        let isPlaque = false;
        let isAcousticShadow = false;

        if (type === 'vertebral') {
          // Vertebral artery passes between bony transverse processes at x = 120-220 and x = 400-500
          const inBone1 = x >= 90 && x <= 210;
          const inBone2 = x >= 420 && x <= 540;
          const boneTopY = bmodeHeight * 0.35;

          if ((inBone1 || inBone2) && y > boneTopY) {
            isAcousticShadow = true;
          }

          vesselY = bmodeHeight * 0.46;
          curRadius = bmodeHeight * 0.12;
          const distToVessel = Math.abs(y - vesselY);

          if (!isAcousticShadow) {
            if (distToVessel < curRadius) {
              isInsideLumen = true;
            } else if (distToVessel >= curRadius && distToVessel < curRadius + 6) {
              isVesselWall = true;
            }
          }
        } else if (type === 'plaque' || type === 'stenosis') {
          // Carotid Bulb / ICA with focal calcified plaque on posterior wall
          const plaqueCenterX = width * 0.52;
          const plaqueWidth = width * 0.28;
          const plaqueDistX = Math.abs(x - plaqueCenterX);

          let plaqueProtrusion = 0;
          if (plaqueDistX < plaqueWidth) {
            const bell = Math.cos((plaqueDistX / plaqueWidth) * (Math.PI / 2));
            plaqueProtrusion = bell * (normalLumenRadius * (type === 'stenosis' ? 1.4 : 1.3));
          }

          const distToCenter = y - vesselY;
          // Anterior wall is upper, posterior wall is lower
          const topWallY = vesselY - normalLumenRadius;
          const bottomWallY = vesselY + normalLumenRadius - plaqueProtrusion;

          // Acoustic shadow beneath dense calcified plaque core
          if (plaqueDistX < plaqueWidth * 0.65 && y > bottomWallY + 8 && plaqueProtrusion > 12) {
            isAcousticShadow = true;
          }

          if (y >= topWallY && y <= bottomWallY) {
            isInsideLumen = true;
          } else if (
            (Math.abs(y - topWallY) < 5) ||
            (y > bottomWallY && y <= bottomWallY + plaqueProtrusion + 6)
          ) {
            if (y > bottomWallY && plaqueProtrusion > 4) {
              isPlaque = true;
            } else {
              isVesselWall = true;
            }
          }
        } else {
          // Normal Carotid Bifurcation (CCA to ICA/ECA)
          const bifurcX = width * 0.6;
          if (x > bifurcX) {
            // Bifurcation widening
            const expand = (x - bifurcX) * 0.08;
            curRadius = normalLumenRadius + expand;
          }
          const distToVessel = Math.abs(y - vesselY);
          if (distToVessel < curRadius) {
            isInsideLumen = true;
          } else if (distToVessel >= curRadius && distToVessel < curRadius + 6) {
            isVesselWall = true;
          }
        }

        // Base Speckle generation
        const fineNoise = randomNoise(x, y, 11);
        const coarseNoise = randomNoise(Math.floor(x / 2), Math.floor(y / 2), 77);
        const speckle = (fineNoise * 0.6 + coarseNoise * 0.4);

        let intensity = 0;

        if (isAcousticShadow) {
          // Acoustic drop-out shadow (dark, minimal noise)
          intensity = speckle * 12;
        } else if (isInsideLumen) {
          // Anechoic blood pool (very dark with faint particulate blood scatter)
          intensity = speckle * 10 + 4;
        } else if (isPlaque) {
          // Hyperechoic calcified plaque with bright fibrous cap
          const capIntensity = 190 + speckle * 65;
          intensity = capIntensity * tgcGain;
        } else if (isVesselWall) {
          // Specular intima-media complex reflections
          intensity = (150 + speckle * 80) * tgcGain;
        } else if (y < bmodeHeight * 0.2) {
          // Subcutaneous tissue (striated fat & muscle)
          const muscleStriae = Math.sin(y * 0.4 + x * 0.05) > 0.4 ? 40 : 0;
          intensity = (45 + muscleStriae + speckle * 55) * tgcGain;
        } else {
          // Surrounding soft tissue / muscle
          const striae = Math.sin(y * 0.25 + x * 0.08) > 0.3 ? 30 : 0;
          intensity = (55 + striae + speckle * 65) * tgcGain;
        }

        intensity = Math.max(0, Math.min(255, intensity));

        // Color mapping according to active filter
        if (filterMode === 'sepia') {
          data[idx] = Math.min(255, intensity * 1.08); // R
          data[idx + 1] = Math.min(255, intensity * 0.88); // G
          data[idx + 2] = Math.min(255, intensity * 0.55); // B
        } else if (filterMode === 'inverted') {
          // Inverted grayscale
          const inv = 255 - intensity;
          data[idx] = inv;
          data[idx + 1] = inv;
          data[idx + 2] = inv;
        } else {
          // Medical Ultrasound Cool Grayscale / Cyan Tint
          data[idx] = intensity * 0.92;
          data[idx + 1] = intensity * 0.96;
          data[idx + 2] = intensity * 1.02;
        }
        data[idx + 3] = 255;
      }
    }

    ctx.putImageData(imgData, 0, 0);

    // ==========================================
    // 2. RENDER COLOR DOPPLER BOX & TURBULENT VELOCITY JETS
    // ==========================================
    if (type === 'stenosis' || type === 'normal' || type === 'vertebral') {
      ctx.save();

      // Steered Doppler box coordinates (Steered 20° to match insonation angle)
      const boxLeft = width * 0.28;
      const boxRight = width * 0.76;
      const boxTop = bmodeHeight * 0.18;
      const boxBottom = bmodeHeight * 0.82;
      const steerOffset = 38; // Steer parallelogram

      // Draw Doppler Box Outline
      ctx.strokeStyle = '#facc15'; // Sonography yellow box
      ctx.lineWidth = 1.2;
      ctx.beginPath();
      ctx.moveTo(boxLeft + steerOffset, boxTop);
      ctx.lineTo(boxRight + steerOffset, boxTop);
      ctx.lineTo(boxRight - steerOffset, boxBottom);
      ctx.lineTo(boxLeft - steerOffset, boxBottom);
      ctx.closePath();
      ctx.stroke();

      // Clip inside Doppler box for color overlay
      ctx.clip();

      if (type === 'stenosis') {
        // High-velocity stenosis jet with chaotic color aliasing (mosaic pattern)
        const jetX = width * 0.52;
        const jetY = bmodeHeight * 0.40;

        // Base forward flow (Red)
        const flowGrad = ctx.createRadialGradient(jetX, jetY, 8, jetX, jetY, 110);
        flowGrad.addColorStop(0, '#fef08a'); // Aliased yellow core
        flowGrad.addColorStop(0.2, '#06b6d4'); // Aliased cyan reversal
        flowGrad.addColorStop(0.4, '#ef4444'); // High speed red
        flowGrad.addColorStop(0.7, '#b91c1c'); // Dark red
        flowGrad.addColorStop(1, 'transparent');

        ctx.globalAlpha = 0.85;
        ctx.fillStyle = flowGrad;
        ctx.beginPath();
        ctx.ellipse(jetX, jetY, 130, 24, -0.05, 0, Math.PI * 2);
        ctx.fill();

        // Turbulent swirling eddies (Mosaic aliasing pattern)
        for (let i = 0; i < 35; i++) {
          const px = jetX + (Math.random() - 0.3) * 120;
          const py = jetY + (Math.random() - 0.5) * 26;
          const rad = 4 + Math.random() * 8;
          ctx.fillStyle = i % 3 === 0 ? '#38bdf8' : i % 3 === 1 ? '#facc15' : '#fb7185';
          ctx.beginPath();
          ctx.arc(px, py, rad, 0, Math.PI * 2);
          ctx.fill();
        }
      } else if (type === 'normal') {
        // Smooth laminar red-to-orange parabolic flow
        const flowCenterX = width * 0.52;
        const flowCenterY = bmodeHeight * 0.48;

        const laminarGrad = ctx.createRadialGradient(flowCenterX, flowCenterY, 5, flowCenterX, flowCenterY, 90);
        laminarGrad.addColorStop(0, '#f59e0b'); // Fast center orange
        laminarGrad.addColorStop(0.4, '#ef4444'); // Normal red
        laminarGrad.addColorStop(0.85, '#991b1b'); // Dark red at boundary
        laminarGrad.addColorStop(1, 'transparent');

        ctx.globalAlpha = 0.82;
        ctx.fillStyle = laminarGrad;
        ctx.beginPath();
        ctx.ellipse(flowCenterX, flowCenterY, 140, 32, 0.02, 0, Math.PI * 2);
        ctx.fill();
      } else if (type === 'vertebral') {
        // Intertransverse forward vertebral flow
        const flowCenterX = width * 0.50;
        const flowCenterY = bmodeHeight * 0.46;

        const vertGrad = ctx.createRadialGradient(flowCenterX, flowCenterY, 4, flowCenterX, flowCenterY, 75);
        vertGrad.addColorStop(0, '#f97316');
        vertGrad.addColorStop(0.5, '#dc2626');
        vertGrad.addColorStop(1, 'transparent');

        ctx.globalAlpha = 0.8;
        ctx.fillStyle = vertGrad;
        ctx.beginPath();
        ctx.ellipse(flowCenterX, flowCenterY, 160, 18, 0, 0, Math.PI * 2);
        ctx.fill();
      }

      ctx.restore();

      // Sample Volume Gate & Angle Cursor Line
      ctx.save();
      const sampleX = width * 0.52;
      const sampleY = bmodeHeight * 0.42;
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 1;

      // Insonation Beam line (dotted)
      ctx.setLineDash([4, 4]);
      ctx.beginPath();
      ctx.moveTo(sampleX - 45, sampleY - 60);
      ctx.lineTo(sampleX + 45, sampleY + 60);
      ctx.stroke();

      // Angle Cursor (60° parallel to vessel)
      ctx.setLineDash([]);
      ctx.strokeStyle = '#38bdf8';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(sampleX - 14, sampleY);
      ctx.lineTo(sampleX + 14, sampleY);
      ctx.stroke();

      // Sample gate bars [ = ]
      ctx.strokeStyle = '#facc15';
      ctx.lineWidth = 1.2;
      ctx.beginPath();
      ctx.moveTo(sampleX - 8, sampleY - 5);
      ctx.lineTo(sampleX + 8, sampleY - 5);
      ctx.moveTo(sampleX - 8, sampleY + 5);
      ctx.lineTo(sampleX + 8, sampleY + 5);
      ctx.stroke();

      ctx.restore();
    }

    // ==========================================
    // 3. RENDER NASCET CALIPERS (For Plaque Mode)
    // ==========================================
    if (type === 'plaque') {
      ctx.save();
      const calX1 = width * 0.48;
      const calX2 = width * 0.72;
      const topY = bmodeHeight * 0.28;
      const lumenBottomY = bmodeHeight * 0.42; // Residual lumen
      const normBottomY = bmodeHeight * 0.72; // Distal reference

      // D1 Caliper (Cyan): Residual Lumen
      ctx.strokeStyle = '#38bdf8';
      ctx.lineWidth = 1.2;
      ctx.setLineDash([3, 3]);
      ctx.beginPath();
      ctx.moveTo(calX1, topY);
      ctx.lineTo(calX1, lumenBottomY);
      ctx.stroke();

      // Crosshairs (+)
      ctx.setLineDash([]);
      ctx.lineWidth = 1.5;
      const drawCross = (cx: number, cy: number, color: string) => {
        ctx.strokeStyle = color;
        ctx.beginPath();
        ctx.moveTo(cx - 5, cy);
        ctx.lineTo(cx + 5, cy);
        ctx.moveTo(cx, cy - 5);
        ctx.lineTo(cx, cy + 5);
        ctx.stroke();
      };
      drawCross(calX1, topY, '#38bdf8');
      drawCross(calX1, lumenBottomY, '#38bdf8');

      // D2 Caliper (Yellow): Distal Reference Lumen
      ctx.strokeStyle = '#facc15';
      ctx.lineWidth = 1.2;
      ctx.setLineDash([3, 3]);
      ctx.beginPath();
      ctx.moveTo(calX2, topY);
      ctx.lineTo(calX2, normBottomY);
      ctx.stroke();

      // Crosshairs (X)
      const drawXCross = (cx: number, cy: number, color: string) => {
        ctx.strokeStyle = color;
        ctx.beginPath();
        ctx.moveTo(cx - 4, cy - 4);
        ctx.lineTo(cx + 4, cy + 4);
        ctx.moveTo(cx - 4, cy + 4);
        ctx.lineTo(cx + 4, cy - 4);
        ctx.stroke();
      };
      drawXCross(calX2, topY, '#facc15');
      drawXCross(calX2, normBottomY, '#facc15');

      // Measurement Readout HUD Overlay in lower right
      ctx.fillStyle = 'rgba(2, 6, 23, 0.88)';
      ctx.strokeStyle = '#334155';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.roundRect(width - 240, bmodeHeight - 110, 220, 95, 6);
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = '#94a3b8';
      ctx.font = '10px monospace';
      ctx.fillText('NASCET CAROTID CALIPERS', width - 225, bmodeHeight - 92);

      ctx.fillStyle = '#38bdf8';
      ctx.font = 'bold 12px monospace';
      ctx.fillText(`+ Dist 1 (Min Lumen):  ${caliperD1.toFixed(1)} mm`, width - 225, bmodeHeight - 74);

      ctx.fillStyle = '#facc15';
      ctx.fillText(`x Dist 2 (Ref Lumen):  ${caliperD2.toFixed(1)} mm`, width - 225, bmodeHeight - 56);

      ctx.fillStyle = '#f43f5e';
      ctx.font = 'bold 13px monospace';
      ctx.fillText(`% NASCET Stenosis:     ${nascetPct}%`, width - 225, bmodeHeight - 34);

      ctx.restore();
    }

    // ==========================================
    // 4. RENDER PULSED WAVE (PW) SPECTRAL DOPPLER (Lower Screen)
    // ==========================================
    if (isDualDisplay) {
      ctx.save();

      // Background for Doppler window
      ctx.fillStyle = '#010306';
      ctx.fillRect(0, pwTop, width, pwHeight);

      // Dividing Separator Line
      ctx.strokeStyle = '#1e293b';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(0, pwTop);
      ctx.lineTo(width, pwTop);
      ctx.stroke();

      // Velocity Grid & Baseline
      const pwBaselineY = pwTop + pwHeight * 0.72;
      const pwMaxY = pwTop + pwHeight * 0.15;
      const pwScaleMax = type === 'stenosis' ? 350 : 120;

      // Draw horizontal velocity gridlines
      ctx.strokeStyle = '#1e293b';
      ctx.lineWidth = 0.8;
      ctx.setLineDash([2, 4]);

      const numGrid = 4;
      for (let g = 0; g <= numGrid; g++) {
        const gy = pwBaselineY - (g / numGrid) * (pwBaselineY - pwMaxY);
        const velVal = Math.round((g / numGrid) * pwScaleMax);

        ctx.beginPath();
        ctx.moveTo(40, gy);
        ctx.lineTo(width - 50, gy);
        ctx.stroke();

        ctx.fillStyle = '#64748b';
        ctx.font = '9px monospace';
        ctx.textAlign = 'right';
        ctx.fillText(`${velVal}`, 36, gy + 3);
      }

      // Zero baseline
      ctx.setLineDash([]);
      ctx.strokeStyle = '#94a3b8';
      ctx.lineWidth = 1.2;
      ctx.beginPath();
      ctx.moveTo(40, pwBaselineY);
      ctx.lineTo(width - 50, pwBaselineY);
      ctx.stroke();

      // Velocity units label
      ctx.fillStyle = '#94a3b8';
      ctx.font = '9px monospace';
      ctx.fillText('cm/s', 36, pwTop + 14);

      // Generate realistic Doppler velocity trace across 5 cardiac cycles
      const cycleWidth = (width - 100) / 4.2;
      const startX = 45;

      for (let c = 0; c < 5; c++) {
        const cx = startX + c * cycleWidth;

        // Map velocity values to Y coordinates
        const psvY = pwBaselineY - (psv / pwScaleMax) * (pwBaselineY - pwMaxY);
        const edvY = pwBaselineY - (edv / pwScaleMax) * (pwBaselineY - pwMaxY);

        if (type === 'stenosis') {
          // Severe Stenosis: High PSV, intense spectral broadening (window completely filled with scatter)
          const grad = ctx.createLinearGradient(cx, psvY, cx, pwBaselineY);
          grad.addColorStop(0, 'rgba(254, 240, 138, 0.95)'); // Yellow peak
          grad.addColorStop(0.25, 'rgba(56, 189, 248, 0.85)'); // Blue core
          grad.addColorStop(0.7, 'rgba(226, 232, 240, 0.7)'); // Dense spectral fill-in
          grad.addColorStop(1, 'rgba(100, 116, 139, 0.3)');

          ctx.fillStyle = grad;
          ctx.beginPath();
          ctx.moveTo(cx, pwBaselineY);
          ctx.lineTo(cx + cycleWidth * 0.12, psvY); // Fast systolic upstroke
          ctx.lineTo(cx + cycleWidth * 0.28, psvY + (pwBaselineY - psvY) * 0.35); // Dicrotic slope
          ctx.lineTo(cx + cycleWidth * 0.75, edvY); // Diastolic plateau
          ctx.lineTo(cx + cycleWidth * 0.92, pwBaselineY);
          ctx.closePath();
          ctx.fill();

          // Add speckle noise inside the spectral envelope to simulate red blood cell scattering
          for (let s = 0; s < 45; s++) {
            const sx = cx + Math.random() * cycleWidth * 0.85;
            const sy = psvY + Math.random() * (pwBaselineY - psvY);
            ctx.fillStyle = Math.random() > 0.4 ? 'rgba(255,255,255,0.7)' : 'rgba(56,189,248,0.5)';
            ctx.fillRect(sx, sy, 1.5, 1.5);
          }

          // Top envelope trace line
          ctx.strokeStyle = '#38bdf8';
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.moveTo(cx, pwBaselineY);
          ctx.lineTo(cx + cycleWidth * 0.12, psvY);
          ctx.lineTo(cx + cycleWidth * 0.28, psvY + (pwBaselineY - psvY) * 0.35);
          ctx.lineTo(cx + cycleWidth * 0.75, edvY);
          ctx.lineTo(cx + cycleWidth * 0.92, pwBaselineY);
          ctx.stroke();
        } else if (type === 'normal') {
          // Normal ICA: Clean open acoustic window beneath peak (no spectral broadening)
          const grad = ctx.createLinearGradient(cx, psvY, cx, psvY + 25);
          grad.addColorStop(0, 'rgba(56, 189, 248, 0.95)');
          grad.addColorStop(1, 'rgba(56, 189, 248, 0.15)');

          // Thin outer envelope band
          ctx.strokeStyle = '#38bdf8';
          ctx.lineWidth = 2.5;
          ctx.beginPath();
          ctx.moveTo(cx, pwBaselineY);
          ctx.lineTo(cx + cycleWidth * 0.15, psvY); // Sharp systolic upstroke
          ctx.lineTo(cx + cycleWidth * 0.32, psvY + (pwBaselineY - psvY) * 0.45); // Dicrotic notch
          ctx.lineTo(cx + cycleWidth * 0.40, psvY + (pwBaselineY - psvY) * 0.38);
          ctx.lineTo(cx + cycleWidth * 0.80, edvY); // Forward diastolic runoff
          ctx.lineTo(cx + cycleWidth * 0.95, pwBaselineY);
          ctx.stroke();

          // Subtle shaded envelope
          ctx.fillStyle = 'rgba(56, 189, 248, 0.25)';
          ctx.beginPath();
          ctx.moveTo(cx, pwBaselineY);
          ctx.lineTo(cx + cycleWidth * 0.15, psvY);
          ctx.lineTo(cx + cycleWidth * 0.32, psvY + (pwBaselineY - psvY) * 0.45);
          ctx.lineTo(cx + cycleWidth * 0.40, psvY + (pwBaselineY - psvY) * 0.38);
          ctx.lineTo(cx + cycleWidth * 0.80, edvY);
          ctx.lineTo(cx + cycleWidth * 0.95, pwBaselineY);
          ctx.closePath();
          ctx.fill();
        } else if (type === 'vertebral') {
          // Vertebral Artery: Normal low-resistance continuous forward diastolic flow
          ctx.strokeStyle = '#22c55e'; // Green Doppler trace
          ctx.lineWidth = 2.2;
          ctx.beginPath();
          ctx.moveTo(cx, edvY + 4);
          ctx.lineTo(cx + cycleWidth * 0.18, psvY); // Systolic peak
          ctx.lineTo(cx + cycleWidth * 0.35, psvY + (edvY - psvY) * 0.6);
          ctx.lineTo(cx + cycleWidth * 0.85, edvY); // Continuous forward flow in diastole
          ctx.lineTo(cx + cycleWidth, edvY + 4);
          ctx.stroke();

          ctx.fillStyle = 'rgba(34, 197, 94, 0.25)';
          ctx.beginPath();
          ctx.moveTo(cx, pwBaselineY);
          ctx.lineTo(cx, edvY + 4);
          ctx.lineTo(cx + cycleWidth * 0.18, psvY);
          ctx.lineTo(cx + cycleWidth * 0.35, psvY + (edvY - psvY) * 0.6);
          ctx.lineTo(cx + cycleWidth * 0.85, edvY);
          ctx.lineTo(cx + cycleWidth, edvY + 4);
          ctx.lineTo(cx + cycleWidth, pwBaselineY);
          ctx.closePath();
          ctx.fill();
        }
      }

      // Synchronized Bright Green ECG Rhythm Strip along the very bottom
      const ecgY = height - 16;
      ctx.strokeStyle = '#22c55e';
      ctx.lineWidth = 1.4;
      ctx.beginPath();
      for (let c = 0; c < 5; c++) {
        const cx = startX + c * cycleWidth;
        ctx.moveTo(cx, ecgY);
        ctx.lineTo(cx + cycleWidth * 0.05, ecgY);
        ctx.lineTo(cx + cycleWidth * 0.08, ecgY - 4); // P wave
        ctx.lineTo(cx + cycleWidth * 0.11, ecgY);
        ctx.lineTo(cx + cycleWidth * 0.13, ecgY + 3); // Q
        ctx.lineTo(cx + cycleWidth * 0.15, ecgY - 14); // R peak
        ctx.lineTo(cx + cycleWidth * 0.17, ecgY + 5); // S
        ctx.lineTo(cx + cycleWidth * 0.19, ecgY);
        ctx.lineTo(cx + cycleWidth * 0.28, ecgY);
        ctx.lineTo(cx + cycleWidth * 0.35, ecgY - 5); // T wave
        ctx.lineTo(cx + cycleWidth * 0.42, ecgY);
        ctx.lineTo(cx + cycleWidth, ecgY);
      }
      ctx.stroke();

      // ECG Heart Rate label
      ctx.fillStyle = '#22c55e';
      ctx.font = 'bold 9px monospace';
      ctx.fillText('ECG: 72 bpm', width - 110, height - 12);

      // PSV / EDV Caliper Markers
      const markerX = startX + cycleWidth * 1.12;
      const markerPsvY = pwBaselineY - (psv / pwScaleMax) * (pwBaselineY - pwMaxY);
      const markerEdvY = pwBaselineY - (edv / pwScaleMax) * (pwBaselineY - pwMaxY);

      // Red caliper mark at peak
      ctx.strokeStyle = '#f43f5e';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(markerX - 6, markerPsvY);
      ctx.lineTo(markerX + 6, markerPsvY);
      ctx.stroke();

      // Numeric Measurement Text Box in top-right of spectral window
      ctx.fillStyle = 'rgba(2, 6, 23, 0.90)';
      ctx.strokeStyle = '#334155';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.roundRect(width - 180, pwTop + 8, 170, 58, 4);
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = '#38bdf8';
      ctx.font = 'bold 11px monospace';
      ctx.textAlign = 'left';
      ctx.fillText(`PSV: ${psv} cm/s`, width - 170, pwTop + 24);

      ctx.fillStyle = '#e2e8f0';
      ctx.font = '10px monospace';
      ctx.fillText(`EDV: ${edv} cm/s`, width - 170, pwTop + 40);

      const ri = psv > 0 ? ((psv - edv) / psv).toFixed(2) : '0.70';
      ctx.fillStyle = '#94a3b8';
      ctx.font = '10px monospace';
      ctx.fillText(`RI: ${ri}  S/D: ${(psv / (edv || 1)).toFixed(2)}`, width - 170, pwTop + 56);

      ctx.restore();
    }

    // ==========================================
    // 5. RENDER COMMERCIAL ULTRASOUND HUD OVERLAYS (GE / PHILIPS TELEMETRY)
    // ==========================================
    ctx.save();

    // Depth Centimeter Tick Marks on the Right Margin
    ctx.strokeStyle = '#94a3b8';
    ctx.fillStyle = '#94a3b8';
    ctx.lineWidth = 1;
    ctx.font = '9px monospace';
    ctx.textAlign = 'left';

    const maxDepthCm = 4.0;
    for (let d = 1; d <= maxDepthCm; d++) {
      const dy = (d / maxDepthCm) * bmodeHeight;
      // Main cm tick
      ctx.beginPath();
      ctx.moveTo(width - 24, dy);
      ctx.lineTo(width - 14, dy);
      ctx.stroke();
      ctx.fillText(`${d}`, width - 12, dy + 3);

      // Half cm tick
      if (d < maxDepthCm) {
        const halfY = dy + (1 / maxDepthCm) * bmodeHeight * 0.5;
        ctx.beginPath();
        ctx.moveTo(width - 20, halfY);
        ctx.lineTo(width - 14, halfY);
        ctx.stroke();
      }
    }

    // Left Transducer Orientation Dot (Yellow dot at 10 o'clock)
    ctx.fillStyle = '#facc15';
    ctx.beginPath();
    ctx.arc(48, 22, 3.5, 0, Math.PI * 2);
    ctx.fill();

    // Top Machine Telemetry Bar
    ctx.fillStyle = '#38bdf8';
    ctx.font = 'bold 10px monospace';
    ctx.fillText('GE LOGIQ E10', 58, 24);

    ctx.fillStyle = '#94a3b8';
    ctx.font = '9px monospace';
    ctx.fillText('9L-D Linear Matrix', 150, 24);

    ctx.fillStyle = '#e2e8f0';
    ctx.fillText(`${patientName}`, 310, 24);

    ctx.fillStyle = '#94a3b8';
    ctx.fillText(`${examDate}`, width - 170, 24);

    // Left Telemetry Block (B-Mode & Color Doppler Parameters)
    ctx.font = '8.5px monospace';
    ctx.fillStyle = '#64748b';
    ctx.fillText('FR: 34 Hz', 48, 40);
    ctx.fillText('B: 9.0 MHz', 48, 52);
    ctx.fillText('Gn: 54 dB', 48, 64);
    ctx.fillText('DR: 65 dB', 48, 76);

    if (type === 'stenosis' || type === 'normal' || type === 'vertebral') {
      ctx.fillStyle = '#38bdf8';
      ctx.fillText('CF: 4.8 MHz', 48, 92);
      ctx.fillText('PRF: 6.5 kHz', 48, 104);
      ctx.fillText('WF: 100 Hz', 48, 116);
      ctx.fillText('Angle: 60°', 48, 128);

      // Color Bar Scale (Top Left)
      ctx.fillStyle = '#0f172a';
      ctx.fillRect(48, 140, 12, 50);
      const cbarGrad = ctx.createLinearGradient(48, 140, 48, 190);
      cbarGrad.addColorStop(0, '#facc15'); // Yellow top
      cbarGrad.addColorStop(0.3, '#ef4444'); // Red forward
      cbarGrad.addColorStop(0.5, '#020617'); // Black baseline
      cbarGrad.addColorStop(0.7, '#0284c7'); // Blue reverse
      cbarGrad.addColorStop(1, '#38bdf8'); // Cyan
      ctx.fillStyle = cbarGrad;
      ctx.fillRect(49, 141, 10, 48);

      ctx.fillStyle = '#facc15';
      ctx.fillText('+64.0', 63, 146);
      ctx.fillStyle = '#38bdf8';
      ctx.fillText('-64.0', 63, 188);
    }

    // Top Right Acoustic Safety Indices
    ctx.fillStyle = '#94a3b8';
    ctx.font = '9px monospace';
    ctx.fillText('MI: 1.1  TIS: 0.3', width - 150, 40);

    // Amber [FREEZE] Indicator
    ctx.fillStyle = '#f59e0b';
    ctx.font = 'bold 9px monospace';
    ctx.fillText('[FREEZE]', width - 85, 54);

    ctx.restore();
  }, [type, psv, edv, caliperD1, caliperD2, nascetPct, filterMode, patientName, examDate, width, height]);

  return (
    <canvas
      ref={canvasRef}
      className={`block select-none ${className}`}
      style={{ imageRendering: 'auto' }}
    />
  );
};
