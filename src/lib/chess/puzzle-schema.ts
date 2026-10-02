import { z } from "zod";

// The shape of content/chess/puzzles.json. Checked in tests (tests/puzzles.test.ts) rather than at
// runtime, so zod stays out of the home page's JavaScript.
const uci = z.string().regex(/^[a-h][1-8][a-h][1-8][qrbn]?$/);

export const puzzleSchema = z.object({
  id: z.string().min(1),
  rating: z.number().int(),
  fen: z.string().min(1),
  lastMove: uci,
  solution: z.array(uci).min(1),
  themes: z.array(z.string()),
  goal: z.enum(["mate", "material"]),
  mateIn: z.number().int().positive().optional(),
});
