/**
 * Lógica de Score de Barrio - Versión Robusta
 */
const calculateMerchantScore = (stats) => {
  if (!stats || stats.length === 0) return 0;

  // 1. Puntaje de Volumen (40%)
  // Sumamos todos los total_amount de los buckets
  const totalVolumeCents = stats.reduce((acc, curr) => acc + Number(curr.total_amount || 0), 0);
  // Meta: 1000 USD (100,000 cents) para obtener los 40 puntos
  const volumeScore = Math.min((totalVolumeCents / 100000) * 40, 40);

  // 2. Puntaje de Consistencia (30%)
  // Premiamos la cantidad de buckets diferentes sincronizados
  const uniqueBuckets = stats.length;
  // Meta: 10 buckets para obtener los 30 puntos
  const consistencyScore = Math.min((uniqueBuckets / 10) * 30, 30);

  // 3. Puntaje de Digitalización (30%)
  // Relación entre digital y cash
  const totalDigital = stats.reduce((acc, curr) => acc + Number(curr.digital_amount || 0), 0);
  const digitalRatio = totalVolumeCents > 0 ? (totalDigital / totalVolumeCents) : 0;
  const digitalScore = digitalRatio * 30;

  // Suma total
  const finalScore = Math.round(volumeScore + consistencyScore + digitalScore);

  return {
    score: finalScore || 0, // Aseguramos que nunca sea null
    breakdown: {
      volume: Math.round(volumeScore),
      consistency: Math.round(consistencyScore),
      digital: Math.round(digitalScore)
    }
  };
};

module.exports = { calculateMerchantScore };