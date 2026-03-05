export const AttributeType = {
  1:"Text",
  2:"Number",
  3:"Long Text",
  4:"Select",
  5:"Confirmation",
  7:"Location",
} as const;

export type AttributeType = typeof AttributeType[keyof typeof AttributeType];