import { OG_SIZE, ogImage } from "@/lib/og";
import { SITE } from "@/lib/site";

export const dynamic = "force-static";
export const size = OG_SIZE;
export const contentType = "image/png";
export const alt = "Bader Aljabri";

export default function OgImage() {
  return ogImage({
    kicker: "baderjabri.ca",
    title: SITE.name,
    subtitle: "I build software that turns prompts into parts, tiles into patterns, and speech into text.",
  });
}
