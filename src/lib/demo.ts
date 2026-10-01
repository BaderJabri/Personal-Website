import script from "../../content/demo/wing-rib.json";
import { sessionScriptSchema, type SessionEvent } from "./session-script";

/** The wing-rib session, validated at build time: a bad script fails the build. */
export function getRibSession(): SessionEvent[] {
  return sessionScriptSchema.parse(script);
}
