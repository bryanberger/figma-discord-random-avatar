export const ELIGIBLE_SHAPE_TYPES = [
  "RECTANGLE",
  "ELLIPSE",
  "VECTOR",
  "BOOLEAN_OPERATION",
];
export const ELIGIBLE_CONTAINER_TYPES = [
  "COMPONENT",
  "INSTANCE",
  "FRAME",
  "GROUP",
];
export const ELIGIBLE_NODE_TYPES = [
  ...ELIGIBLE_SHAPE_TYPES,
  ...ELIGIBLE_CONTAINER_TYPES,
];
