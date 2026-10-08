import { z } from "zod";

// The demo is a replayer: it plays a validated list of these events and knows nothing about
// the drawing itself. Geometry params are in drawing units (mm, y up).
const t = z.number().nonnegative();

export const geometryOps = ["polyline", "rect", "circle", "line", "dim", "centerline"] as const;

export const sessionEventSchema = z.discriminatedUnion("kind", [
  z.object({ t, kind: z.literal("prompt"), text: z.string().min(1) }),
  z.object({ t, kind: z.literal("thinking"), text: z.string().min(1) }),
  z.object({ t, kind: z.literal("tool_call"), tool: z.string().min(1), args: z.string() }),
  z.object({ t, kind: z.literal("tool_result"), text: z.string().min(1) }),
  z.object({ t, kind: z.literal("command_echo"), text: z.string().min(1) }),
  z.object({
    t,
    kind: z.literal("geometry"),
    op: z.enum(geometryOps),
    layer: z.string().min(1),
    params: z.array(z.array(z.number())),
    drawMs: z.number().nonnegative(),
    label: z.string().optional(),
    dimStyle: z.enum(["linear", "leader", "ordinate"]).optional(),
  }),
  z.object({ t, kind: z.literal("done"), text: z.string().min(1) }),
]);

export const sessionScriptSchema = z
  .array(sessionEventSchema)
  .min(1)
  .superRefine((events, ctx) => {
    for (let i = 1; i < events.length; i++) {
      if (events[i].t < events[i - 1].t) {
        ctx.addIssue({ code: "custom", path: [i, "t"], message: "t must be non-decreasing" });
      }
    }
    const dones = events.filter((e) => e.kind === "done").length;
    if (dones !== 1 || events.at(-1)?.kind !== "done") {
      ctx.addIssue({ code: "custom", message: "script must end with a single done event" });
    }
  });

export type SessionEvent = z.infer<typeof sessionEventSchema>;
export type GeometryEvent = Extract<SessionEvent, { kind: "geometry" }>;
