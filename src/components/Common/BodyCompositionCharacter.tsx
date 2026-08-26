import React from 'react';
import { generateCustomBodyIllustrationSvg } from '../../data/silhouettes';

interface BodyCompositionCharacterProps {
  fatPercent: number;
  gender?: 'femenino' | 'masculino' | string;
  heightCm?: number;
  weightKg?: number | string;
  muscleMassKg?: number | string;
  className?: string;
  isCompact?: boolean;
}

export const BodyCompositionCharacter: React.FC<BodyCompositionCharacterProps> = ({
  fatPercent,
  gender = 'femenino',
  heightCm = 165,
  weightKg = 68,
  muscleMassKg = 42,
  className = 'w-full max-w-sm mx-auto aspect-[240/230]',
}) => {
  const normalizedGender: 'femenino' | 'masculino' =
    gender === 'masculino' ? 'masculino' : 'femenino';

  const numWeight = typeof weightKg === 'string' ? parseFloat(weightKg) || 68 : weightKg;
  const numMuscle = typeof muscleMassKg === 'string' ? parseFloat(muscleMassKg) || 42 : muscleMassKg;

  const svgMarkup = generateCustomBodyIllustrationSvg({
    fatPercent,
    gender: normalizedGender,
    heightCm,
    weightKg: numWeight,
    muscleMassKg: numMuscle,
  });

  return (
    <div
      className={`relative flex items-center justify-center ${className}`}
      dangerouslySetInnerHTML={{ __html: svgMarkup }}
    />
  );
};
