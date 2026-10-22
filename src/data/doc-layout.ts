// Shared canonical layout for rendered synthetic documents (640x820 virtual page).
// Both the data generator (evidence box coordinates) and the SVG renderer use these.

export const PAGE_W = 640;
export const PAGE_H = 820;

export const HEADER = { y: 56, subY: 78 };
export const FIELD_START_Y = 132;
export const FIELD_ROW_H = 34;
export const FIELD_LABEL_X = 56;
export const FIELD_VALUE_X = 300;
export const TABLE_Y = 392;
export const DECL_Y = 596;
export const STAMP = { x: 426, y: 548, w: 154, h: 154 };
export const QR = { x: 54, y: 612, w: 92, h: 92 };
export const SIGN = { x: 348, y: 688, w: 210, h: 44 };
export const PHOTO = { x: 54, y: 128, w: 252, h: 312 };

export function fieldRowY(index: number): number {
  return FIELD_START_Y + index * FIELD_ROW_H;
}
