export function normalizePosition(position: string) {
  if (position === "GK" || position === "BR") {
    return "BR";
  }

  if (["CB", "RB", "LB", "OBR"].includes(position)) {
    return "OBR";
  }

  if (["CM", "CDM", "CAM", "POM"].includes(position)) {
    return "POM";
  }

  return "NAP";
}
