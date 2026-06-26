export function classifyFire(fire) {
  const frp = Number(fire.frp) || 0;
  const conf = String(fire.confianza || '').toLowerCase();
  const brillo = Number(fire.brillo_k) || 0;
  const señales = [];
  let probFalso = 0;

  if (frp < 2) {
    probFalso += 40;
    señales.push('FRP muy bajo (<2 MW): típico de quema agrícola pequeña o ruido del sensor');
  } else if (frp < 8) {
    probFalso += 15;
    señales.push('FRP bajo (<8 MW)');
  } else if (frp >= 30) {
    probFalso -= 20;
    señales.push(`FRP alto (${frp} MW): fuego intenso`);
  }

  if (conf === 'baja') {
    probFalso += 30;
    señales.push('Confianza baja del satélite');
  } else if (conf === 'alta') {
    probFalso -= 20;
    señales.push('Confianza alta del satélite');
  }

  if (brillo >= 350) {
    probFalso -= 15;
    señales.push('Brillo térmico ≥350K: consistente con fuego real');
  } else if (brillo > 0 && brillo < 320) {
    probFalso += 10;
    señales.push('Brillo térmico bajo (<320K)');
  }

  if (fire.dia_noche === 'dia' && frp < 5) {
    probFalso += 10;
    señales.push('Detección diurna de baja intensidad (posible chaqueo o reflejo solar)');
  }

  probFalso = Math.max(0, Math.min(100, probFalso));

  let clasificacion;
  if (probFalso >= 55) clasificacion = 'FALSO_POSITIVO_PROBABLE';
  else if (probFalso >= 30) clasificacion = 'REQUIERE_VERIFICACION';
  else clasificacion = 'INCENDIO_PROBABLE';

  return {
    clasificacion,
    prob_falso_positivo: probFalso,
    confianza_deteccion: 100 - probFalso,
    señales,
    metodo: 'heuristica-offline',
  };
}
