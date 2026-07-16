import Event, { IEvent } from "@/database/event.model";
import { connectToDatabase } from "@/lib/mongodb";

export async function getEventBySlug(slug: string): Promise<IEvent | null> {
  try {
    if (!slug || typeof slug !== "string" || slug.trim().length === 0) {
      return null;
    }

    await connectToDatabase();

    const event = await Event.findOne({ slug: slug.trim() }).lean<IEvent>();

    return event ?? null;
  } catch (error) {
    console.error("[getEventBySlug] Error:", error);
    return null;
  }
}
