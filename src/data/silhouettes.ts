import { SilhouetteFatRange } from '../types';

/**
 * Generador de SVG para ilustración plana tipo caricatura de cuerpo completo
 * con 4 badges circulares conectadas por líneas finas (ESTATURA, PESO, %GRASA, %MÚSCULO).
 * Utiliza estrictamente la paleta de marca:
 * - Primario: #6E9E93 (Sage Teal)
 * - Fondo / Piel suave: #FAF6F0 (Warm Cream / Pearl)
 * - Contornos y Tipografía: #2E3A36 (Deep Slate)
 * - Acento Secundario: #8FAFD1 (Soft Slate Blue)
 * - Acento Menta / Líneas: #AEC9C0 (Mint / Pale Sage)
 * SIN tonos rojos/naranjas.
 */
function createCharacterSvg({
  fatPercent,
  gender = 'femenino',
  defaultHeight = 165,
  defaultWeight = 68,
  defaultMuscle = 42,
}: {
  fatPercent: number;
  gender?: 'femenino' | 'masculino';
  defaultHeight?: number;
  defaultWeight?: number;
  defaultMuscle?: number;
}): string {
  // Progresión anatómica paramétrica del contorno según % de grasa (12% a 45%)
  // t va de 0 (a 12%) a 1 (a 45%)
  const t = Math.min(1, Math.max(0, (fatPercent - 12) / 33));

  // Dimensiones del torso según % de grasa
  const isMale = gender === 'masculino';
  const waistWidth = isMale ? 22 + t * 24 : 20 + t * 25; // 20px a 45px
  const hipWidth = isMale ? 24 + t * 20 : 25 + t * 28;   // 25px a 53px
  const chestWidth = isMale ? 30 + t * 14 : 27 + t * 16; // 27px a 43px
  const thighWidth = 10 + t * 11;                         // 10px a 21px
  const armWidth = 7 + t * 6;                             // 7px a 13px

  // Posiciones de conexión de líneas guía
  const headConnectY = 32;
  const chestConnectY = 68;
  const waistConnectY = 96;
  const legConnectY = 145;

  // Cálculo de peso estimado según grasa si no se especifica
  const displayWeight = defaultWeight ? defaultWeight.toFixed(1) : (55 + t * 30).toFixed(1);
  const displayMuscle = defaultMuscle ? `${defaultMuscle.toFixed(1)}kg` : `${(100 - fatPercent).toFixed(0)}%`;

  return `<svg viewBox="0 0 240 230" fill="none" xmlns="http://www.w3.org/2000/svg" class="w-full h-full select-none">
    <!-- Fondo decorativo suave -->
    <circle cx="120" cy="115" r="92" fill="#FAF6F0" stroke="#AEC9C0" stroke-width="1.5" stroke-dasharray="4 4" opacity="0.7"/>

    <!-- LÍNEAS GUÍA FINAS A LOS BADGES -->
    <!-- 1. Estatura (Top-Left) -->
    <line x1="45" y1="36" x2="120" y2="${headConnectY}" stroke="#AEC9C0" stroke-width="1.5" stroke-dasharray="2 2" stroke-linecap="round"/>
    <circle cx="120" cy="${headConnectY}" r="3" fill="#6E9E93"/>

    <!-- 2. Peso (Top-Right) -->
    <line x1="195" y1="36" x2="${120 + chestWidth * 0.4}" y2="${chestConnectY}" stroke="#AEC9C0" stroke-width="1.5" stroke-dasharray="2 2" stroke-linecap="round"/>
    <circle cx="${120 + chestWidth * 0.4}" cy="${chestConnectY}" r="3" fill="#8FAFD1"/>

    <!-- 3. % Grasa (Mid-Left) -->
    <line x1="42" y1="115" x2="${120 - waistWidth * 0.48}" y2="${waistConnectY}" stroke="#6E9E93" stroke-width="1.5" stroke-linecap="round"/>
    <circle cx="${120 - waistWidth * 0.48}" cy="${waistConnectY}" r="3.5" fill="#6E9E93"/>

    <!-- 4. % Músculo (Mid-Right) -->
    <line x1="198" y1="115" x2="${120 + hipWidth * 0.42}" y2="${legConnectY}" stroke="#8FAFD1" stroke-width="1.5" stroke-linecap="round"/>
    <circle cx="${120 + hipWidth * 0.42}" cy="${legConnectY}" r="3.5" fill="#8FAFD1"/>

    <!-- PERSONAJE HUMANO CUERPO COMPLETO (ILUSTRACIÓN PLANA TIPO CARICATURA) -->
    <g transform="translate(120, 115)">
      <!-- Sombra en suelo -->
      <ellipse cx="0" cy="85" rx="${18 + t * 10}" ry="4.5" fill="#2E3A36" opacity="0.12"/>

      <!-- PIERNAS / CALZADO -->
      <!-- Pierna Izquierda -->
      <path d="M-${hipWidth * 0.32} 18 C-${hipWidth * 0.35} 40, -${thighWidth + 4} 60, -9 78 L-5 78 C-3 60, -${hipWidth * 0.15} 40, -${hipWidth * 0.1} 18 Z" fill="#FAF6F0" stroke="#2E3A36" stroke-width="1.8" stroke-linejoin="round"/>
      <!-- Pierna Derecha -->
      <path d="M${hipWidth * 0.1} 18 C${hipWidth * 0.15} 40, 3 60, 5 78 L9 78 C${thighWidth + 4} 60, ${hipWidth * 0.35} 40, ${hipWidth * 0.32} 18 Z" fill="#FAF6F0" stroke="#2E3A36" stroke-width="1.8" stroke-linejoin="round"/>

      <!-- Zapatos / Sneakers -->
      <path d="M-13 78 C-13 75, -5 75, -4 78 L-2 83 C-5 85, -14 85, -15 83 Z" fill="#6E9E93" stroke="#2E3A36" stroke-width="1.5"/>
      <path d="M4 78 C5 75, 13 75, 13 78 L15 83 C14 85, 5 85, 2 83 Z" fill="#6E9E93" stroke="#2E3A36" stroke-width="1.5"/>

      <!-- SHORTS / ROPA INFERIOR -->
      <path d="M-${hipWidth * 0.48} -6 C-${hipWidth * 0.52} 10, -${hipWidth * 0.42} 24, -${hipWidth * 0.1} 24 L0 16 L${hipWidth * 0.1} 24 C${hipWidth * 0.42} 24, ${hipWidth * 0.52} 10, ${hipWidth * 0.48} -6 Z" fill="#8FAFD1" stroke="#2E3A36" stroke-width="1.8" stroke-linejoin="round"/>

      <!-- TORSO Y ABDOMEN (Escalado anatómico continuo) -->
      <path d="M-${chestWidth * 0.5} -52 C-${chestWidth * 0.55} -30, -${waistWidth * 0.52} -18, -${hipWidth * 0.48} -6 L${hipWidth * 0.48} -6 C${waistWidth * 0.52} -18, ${chestWidth * 0.55} -30, ${chestWidth * 0.5} -52 Z" fill="#6E9E93" stroke="#2E3A36" stroke-width="1.8" stroke-linejoin="round"/>

      <!-- Detalle deportivo camiseta -->
      <path d="M-${chestWidth * 0.28} -52 L0 -42 L${chestWidth * 0.28} -52" fill="none" stroke="#FAF6F0" stroke-width="2" stroke-linecap="round"/>

      <!-- BRAZOS -->
      <!-- Brazo Izquierdo -->
      <path d="M-${chestWidth * 0.48} -48 C-${chestWidth * 0.55 + armWidth} -30, -${waistWidth * 0.45 + armWidth} -10, -${hipWidth * 0.45 + 2} 10" fill="none" stroke="#FAF6F0" stroke-width="${armWidth + 3}" stroke-linecap="round"/>
      <path d="M-${chestWidth * 0.48} -48 C-${chestWidth * 0.55 + armWidth} -30, -${waistWidth * 0.45 + armWidth} -10, -${hipWidth * 0.45 + 2} 10" fill="none" stroke="#2E3A36" stroke-width="${armWidth}" stroke-linecap="round"/>
      <!-- Mano Izquierda -->
      <circle cx="-${hipWidth * 0.45 + 3}" cy="12" r="${3.5 + t * 1}" fill="#FAF6F0" stroke="#2E3A36" stroke-width="1.5"/>

      <!-- Brazo Derecho -->
      <path d="M${chestWidth * 0.48} -48 C${chestWidth * 0.55 + armWidth} -30, ${waistWidth * 0.45 + armWidth} -10, ${hipWidth * 0.45 + 2} 10" fill="none" stroke="#FAF6F0" stroke-width="${armWidth + 3}" stroke-linecap="round"/>
      <path d="M${chestWidth * 0.48} -48 C${chestWidth * 0.55 + armWidth} -30, ${waistWidth * 0.45 + armWidth} -10, ${hipWidth * 0.45 + 2} 10" fill="none" stroke="#2E3A36" stroke-width="${armWidth}" stroke-linecap="round"/>
      <!-- Mano Derecha -->
      <circle cx="${hipWidth * 0.45 + 3}" cy="12" r="${3.5 + t * 1}" fill="#FAF6F0" stroke="#2E3A36" stroke-width="1.5"/>

      <!-- CUELLO -->
      <rect x="-4.5" y="-62" width="9" height="12" rx="3" fill="#FAF6F0" stroke="#2E3A36" stroke-width="1.6"/>

      <!-- CABEZA & CARITA AMIGABLE -->
      <ellipse cx="0" cy="-72" rx="13" ry="14" fill="#FAF6F0" stroke="#2E3A36" stroke-width="1.8"/>
      
      <!-- Cabello / Estilo Flat -->
      ${
        isMale
          ? `<path d="M-13 -76 C-12 -88, 12 -88, 13 -76 C13 -80, 5 -85, 0 -84 C-5 -85, -12 -80, -13 -76 Z" fill="#2E3A36"/>`
          : `<path d="M-13 -70 C-14 -88, 14 -88, 13 -70 C10 -75, 4 -80, 0 -80 C-4 -80, -10 -75, -13 -70 Z" fill="#2E3A36"/>
             <!-- Coleta / Moño deportivo -->
             <circle cx="12" cy="-77" r="5" fill="#6E9E93" stroke="#2E3A36" stroke-width="1.2"/>`
      }

      <!-- Ojos y Sonrisa Amigable -->
      <circle cx="-4" cy="-72" r="1.5" fill="#2E3A36"/>
      <circle cx="4" cy="-72" r="1.5" fill="#2E3A36"/>
      <path d="M-3 -67 Q0 -64 3 -67" fill="none" stroke="#2E3A36" stroke-width="1.4" stroke-linecap="round"/>
      <!-- Rubor sutil en mejillas -->
      <circle cx="-7" cy="-69" r="2" fill="#AEC9C0" opacity="0.6"/>
      <circle cx="7" cy="-69" r="2" fill="#AEC9C0" opacity="0.6"/>
    </g>

    <!-- 4 BADGES CIRCULARES CONECTADAS -->
    
    <!-- BADGE 1: ESTATURA (Top-Left) -->
    <g transform="translate(38, 36)">
      <circle cx="0" cy="0" r="22" fill="#FAF6F0" stroke="#AEC9C0" stroke-width="2"/>
      <circle cx="0" cy="0" r="19" fill="#FFFFFF"/>
      <text x="0" y="-4" text-anchor="middle" font-size="7.5" font-family="system-ui, sans-serif" font-weight="700" fill="#6E9E93" letter-spacing="0.5">ESTATURA</text>
      <text x="0" y="8" text-anchor="middle" font-size="9.5" font-family="ui-monospace, monospace" font-weight="800" fill="#2E3A36">${defaultHeight}cm</text>
    </g>

    <!-- BADGE 2: PESO (Top-Right) -->
    <g transform="translate(202, 36)">
      <circle cx="0" cy="0" r="22" fill="#FAF6F0" stroke="#8FAFD1" stroke-width="2"/>
      <circle cx="0" cy="0" r="19" fill="#FFFFFF"/>
      <text x="0" y="-4" text-anchor="middle" font-size="7.5" font-family="system-ui, sans-serif" font-weight="700" fill="#8FAFD1" letter-spacing="0.5">PESO</text>
      <text x="0" y="8" text-anchor="middle" font-size="9.5" font-family="ui-monospace, monospace" font-weight="800" fill="#2E3A36">${displayWeight}kg</text>
    </g>

    <!-- BADGE 3: % GRASA (Mid-Left, Destacado) -->
    <g transform="translate(38, 115)">
      <circle cx="0" cy="0" r="25" fill="#FAF6F0" stroke="#6E9E93" stroke-width="2.5"/>
      <circle cx="0" cy="0" r="21.5" fill="#6E9E93"/>
      <text x="0" y="-3" text-anchor="middle" font-size="7.5" font-family="system-ui, sans-serif" font-weight="800" fill="#FAF6F0" letter-spacing="0.5">% GRASA</text>
      <text x="0" y="10" text-anchor="middle" font-size="12" font-family="ui-monospace, monospace" font-weight="900" fill="#FAF6F0">${fatPercent}%</text>
    </g>

    <!-- BADGE 4: % MÚSCULO / MAGRO (Mid-Right) -->
    <g transform="translate(202, 115)">
      <circle cx="0" cy="0" r="25" fill="#FAF6F0" stroke="#8FAFD1" stroke-width="2"/>
      <circle cx="0" cy="0" r="21.5" fill="#FFFFFF"/>
      <text x="0" y="-3" text-anchor="middle" font-size="7.5" font-family="system-ui, sans-serif" font-weight="800" fill="#8FAFD1" letter-spacing="0.5">% MÚSCULO</text>
      <text x="0" y="10" text-anchor="middle" font-size="10.5" font-family="ui-monospace, monospace" font-weight="800" fill="#2E3A36">${displayMuscle}</text>
    </g>
  </svg>`;
}

export const WOMEN_SILHOUETTES: SilhouetteFatRange[] = [
  {
    id: 1,
    fatPercent: 12,
    label: '12% Atlético Extremo',
    description: 'Definición atlética muy marcada, masa magra predominante.',
    imageSvg: createCharacterSvg({ fatPercent: 12, gender: 'femenino', defaultWeight: 54, defaultMuscle: 47 }),
  },
  {
    id: 2,
    fatPercent: 15,
    label: '15% Atlético Definido',
    description: 'Físico deportivo, contorno muscular visible y abdomen firme.',
    imageSvg: createCharacterSvg({ fatPercent: 15, gender: 'femenino', defaultWeight: 57, defaultMuscle: 48 }),
  },
  {
    id: 3,
    fatPercent: 20,
    label: '20% Tonificado',
    description: 'Figura en forma, contornos suaves y excelente soporte muscular.',
    imageSvg: createCharacterSvg({ fatPercent: 20, gender: 'femenino', defaultWeight: 60, defaultMuscle: 48 }),
  },
  {
    id: 4,
    fatPercent: 25,
    label: '25% Equilibrado',
    description: 'Rango metabólico saludable, curvas naturales sin exceso adiposo.',
    imageSvg: createCharacterSvg({ fatPercent: 25, gender: 'femenino', defaultWeight: 64, defaultMuscle: 48 }),
  },
  {
    id: 5,
    fatPercent: 30,
    label: '30% Moderado',
    description: 'Acumulación suave en zona abdominal y caderas.',
    imageSvg: createCharacterSvg({ fatPercent: 30, gender: 'femenino', defaultWeight: 69, defaultMuscle: 48 }),
  },
  {
    id: 6,
    fatPercent: 35,
    label: '35% Sobrepeso Inicial',
    description: 'Grasa corporal elevada, fatiga vespertina y volumen central.',
    imageSvg: createCharacterSvg({ fatPercent: 35, gender: 'femenino', defaultWeight: 75, defaultMuscle: 48 }),
  },
  {
    id: 7,
    fatPercent: 40,
    label: '40% Grasa Elevada',
    description: 'Retención de líquidos y grasa localizada en cintura y cadera.',
    imageSvg: createCharacterSvg({ fatPercent: 40, gender: 'femenino', defaultWeight: 82, defaultMuscle: 49 }),
  },
  {
    id: 8,
    fatPercent: 45,
    label: '45% Inflamación Metabólica',
    description: 'Volumen central predominante, resistencia a la insulina temprana.',
    imageSvg: createCharacterSvg({ fatPercent: 45, gender: 'femenino', defaultWeight: 90, defaultMuscle: 49 }),
  },
];

export const MEN_SILHOUETTES: SilhouetteFatRange[] = [
  {
    id: 101,
    fatPercent: 12,
    label: '12% Atlético Extremo',
    description: 'Definición atlética muy marcada, abdomen y serratos visibles.',
    imageSvg: createCharacterSvg({ fatPercent: 12, gender: 'masculino', defaultWeight: 68, defaultMuscle: 59 }),
  },
  {
    id: 102,
    fatPercent: 15,
    label: '15% Atlético Definido',
    description: 'Físico deportivo, contorno muscular visible y abdomen plano.',
    imageSvg: createCharacterSvg({ fatPercent: 15, gender: 'masculino', defaultWeight: 72, defaultMuscle: 61 }),
  },
  {
    id: 103,
    fatPercent: 20,
    label: '20% Tonificado',
    description: 'Físico en forma, contornos equilibrados sin grasa excesiva.',
    imageSvg: createCharacterSvg({ fatPercent: 20, gender: 'masculino', defaultWeight: 76, defaultMuscle: 60 }),
  },
  {
    id: 104,
    fatPercent: 25,
    label: '25% Equilibrado',
    description: 'Rango medio, leve acumulación en zona abdominal y flancos.',
    imageSvg: createCharacterSvg({ fatPercent: 25, gender: 'masculino', defaultWeight: 80, defaultMuscle: 60 }),
  },
  {
    id: 105,
    fatPercent: 30,
    label: '30% Moderado',
    description: 'Grasa abdominal moderada y pérdida de tono en cintura.',
    imageSvg: createCharacterSvg({ fatPercent: 30, gender: 'masculino', defaultWeight: 85, defaultMuscle: 59 }),
  },
  {
    id: 106,
    fatPercent: 35,
    label: '35% Sobrepeso Inicial',
    description: 'Grasa abdominal visible, resistencia insulínica temprana.',
    imageSvg: createCharacterSvg({ fatPercent: 35, gender: 'masculino', defaultWeight: 91, defaultMuscle: 59 }),
  },
  {
    id: 107,
    fatPercent: 40,
    label: '40% Grasa Elevada',
    description: 'Volumen abdominal prominente, fatiga y pesadez diurna.',
    imageSvg: createCharacterSvg({ fatPercent: 40, gender: 'masculino', defaultWeight: 98, defaultMuscle: 58 }),
  },
  {
    id: 108,
    fatPercent: 45,
    label: '45% Inflamación Metabólica',
    description: 'Obesidad metabólica, inflamación visceral y fatiga constante.',
    imageSvg: createCharacterSvg({ fatPercent: 45, gender: 'masculino', defaultWeight: 106, defaultMuscle: 58 }),
  },
];

export function getSilhouetteRanges(gender?: 'femenino' | 'masculino'): SilhouetteFatRange[] {
  return gender === 'masculino' ? MEN_SILHOUETTES : WOMEN_SILHOUETTES;
}

export function generateCustomBodyIllustrationSvg({
  fatPercent,
  gender = 'femenino',
  heightCm = 165,
  weightKg = 68,
  muscleMassKg = 42,
}: {
  fatPercent: number;
  gender?: 'femenino' | 'masculino';
  heightCm?: number;
  weightKg?: number;
  muscleMassKg?: number;
}): string {
  return createCharacterSvg({
    fatPercent,
    gender,
    defaultHeight: heightCm,
    defaultWeight: weightKg,
    defaultMuscle: muscleMassKg,
  });
}

// Array base para compatibilidad con código existente
export const SILHOUETTE_RANGES: SilhouetteFatRange[] & {
  women: SilhouetteFatRange[];
  men: SilhouetteFatRange[];
  femenino: SilhouetteFatRange[];
  masculino: SilhouetteFatRange[];
} = Object.assign([...WOMEN_SILHOUETTES], {
  women: WOMEN_SILHOUETTES,
  men: MEN_SILHOUETTES,
  femenino: WOMEN_SILHOUETTES,
  masculino: MEN_SILHOUETTES,
});
