export type Tool = "move" | "sketch" | "seam" | "cut" | "fill" | "eraser";

export type ViewName = "front" | "back";

export interface Layer {
  id: string;
  name: string;
  visible: boolean;
}

export interface Stroke {
  id: string;
  layerId: string;
  color: string;
  size: number;
  opacity: number;
  mode: "draw" | "erase";
  path: string;
}
