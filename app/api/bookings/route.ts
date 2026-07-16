import { NextRequest, NextResponse } from "next/server";
import Booking from "@/database/booking.model";
import Event from "@/database/event.model";
import { connectToDatabase } from "@/lib/mongodb";

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const RATE_LIMIT_WINDOW_MS = 60_000;
const MAX_BOOKINGS_PER_WINDOW = 5;
const rateLimitBuckets = new Map<string, { count: number; resetAt: number }>();

function getClientKey(request: NextRequest) {
  const forwardedFor = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim();

  return forwardedFor || request.headers.get("x-real-ip") || request.headers.get("cf-connecting-ip") || request.headers.get("user-agent") || "unknown";
}

function applyRateLimit(request: NextRequest, eventKey: string) {
  const now = Date.now();
  const clientKey = getClientKey(request);
  const bucketKey = `${clientKey}:${eventKey}`;
  const existingBucket = rateLimitBuckets.get(bucketKey);

  if (existingBucket && existingBucket.resetAt > now) {
    if (existingBucket.count >= MAX_BOOKINGS_PER_WINDOW) {
      return false;
    }

    existingBucket.count += 1;
    return true;
  }

  rateLimitBuckets.set(bucketKey, { count: 1, resetAt: now + RATE_LIMIT_WINDOW_MS });
  return true;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const email = typeof body?.email === "string" ? body.email.trim().toLowerCase() : "";
    const eventId = typeof body?.eventId === "string" ? body.eventId : "";
    const eventSlug = typeof body?.eventSlug === "string" ? body.eventSlug.trim() : "";

    if (!email || !EMAIL_PATTERN.test(email) || (!eventId && !eventSlug)) {
      return NextResponse.json(
        { success: false, message: "A valid email and event reference are required." },
        { status: 400 }
      );
    }

    await connectToDatabase();

    let event = null;

    if (eventId && eventSlug) {
      const eventById = await Event.findById(eventId).lean();
      const eventBySlug = await Event.findOne({ slug: eventSlug }).lean();

      if (!eventById || !eventBySlug) {
        return NextResponse.json(
          { success: false, message: "The referenced event could not be found." },
          { status: 404 }
        );
      }

      if (eventById._id.toString() !== eventBySlug._id.toString()) {
        return NextResponse.json(
          { success: false, message: "The referenced event could not be found." },
          { status: 404 }
        );
      }

      event = eventById;
    } else if (eventId) {
      event = await Event.findById(eventId).lean();
    } else {
      event = await Event.findOne({ slug: eventSlug }).lean();
    }

    if (!event) {
      return NextResponse.json(
        { success: false, message: "The referenced event could not be found." },
        { status: 404 }
      );
    }

    if (!applyRateLimit(request, eventSlug || eventId || "global")) {
      return NextResponse.json(
        { success: false, message: "Too many booking attempts. Please try again later." },
        { status: 429 }
      );
    }

    const booking = await Booking.create({ eventId: event._id, email });

    return NextResponse.json({ success: true, data: booking }, { status: 201 });
  } catch (error) {
    console.error("[POST /api/bookings] Error:", error);

    return NextResponse.json(
      { success: false, message: "Unable to create booking." },
      { status: 500 }
    );
  }
}
