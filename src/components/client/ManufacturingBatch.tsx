import CardMedium from '@/components/ui/CardMedium'

/**
 * Calculates final material requirement for EVE Online industry job.
 *
 * @param baseMaterial - Base quantity of material from the blueprint.
 * @param meLevel - Material Efficiency level of the blueprint (0–10).
 * @param rigBonusPercent - Material reduction from structure rigs (e.g., 2.5 for 2.5%).
 * @param implantBonusPercent - Material reduction from implants (e.g., 1 for 1%).
 * @returns Final rounded-up material requirement.
 */
function calculateFinalMaterial(
  baseMaterial: number,
  meLevel: number,
  rigBonusPercent: number = 0,
  implantBonusPercent: number = 0
): number {
  if (meLevel < 0 || meLevel > 10) {
    throw new Error('ME level must be between 0 and 10.')
  }

  const meReduction: number = 1 - 1 / (1 + meLevel)
  const rigReduction: number = rigBonusPercent / 100
  const implantReduction: number = implantBonusPercent / 100

  const finalMaterial: number =
    baseMaterial *
    (1 - meReduction) *
    (1 - rigReduction) *
    (1 - implantReduction)

  return Math.ceil(finalMaterial)
}

const ManufacturingBatch = () => {
  return (
    <CardMedium cardTitle={'Manufacturing Batch'}>
      <fieldset className="fieldset">
        <legend className="fieldset-legend">Your bio</legend>
        <textarea className="textarea h-24" placeholder="Bio"></textarea>
      </fieldset>
    </CardMedium>
  )
}

export default ManufacturingBatch
