// Shared by the server-rendered preview (ChessStatic) and the live board (ChessPuzzles): they must
// line up exactly so swapping one for the other never moves the page.
export const BOARD_LAYOUT = "grid gap-6 sm:grid-cols-[auto_1fr] sm:items-start sm:gap-8";
export const BOARD =
  "chess-board relative grid aspect-square w-[min(320px,calc(100vw-40px))] grid-cols-8 overflow-hidden rounded-[6px] border border-rule";
/** Square shade by screen position, counted from the top-left. */
export const squareShade = (x: number, y: number) => ((x + y) % 2 ? "chess-dark" : "chess-light");
