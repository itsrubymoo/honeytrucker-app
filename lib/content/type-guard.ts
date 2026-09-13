import type { ContentType } from "@/lib/types/database";

const VALID_TYPES: ContentType[] = ["resource", "audio", "video"];

export function parseContentType(value: string): ContentType | null {
  return (VALID_TYPES as string[]).includes(value) ? (value as ContentType) : null;
}

export const CONTENT_TYPE_LABELS: Record<ContentType, string> = {
  resource: "Resources",
  audio: "Audio",
  video: "Video",
};
