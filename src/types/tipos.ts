export const AttributeType = {
  1:"Texto",
  2:"Numerico",
  3:"Texto largo",
  4:"Selección",
  5:"Confirmación",
  7:"Ubicación",
} as const;

export type AttributeType = typeof AttributeType[keyof typeof AttributeType];