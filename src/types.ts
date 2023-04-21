export type EligibleShapeNode =
  | RectangleNode
  | EllipseNode
  | VectorNode
  | BooleanOperationNode;

export type EligibleInstanceNode =
  | ComponentNode
  | InstanceNode
  | FrameNode
  | GroupNode;

export type Style = {
  key: string;
  name: string;
};

export type FigmaStyleData = {
  key: string;
  name: string;
  styleType: string;
  remote: boolean;
  description: string;
};

export type FigmaDataStyles = Record<string, FigmaStyleData>;
