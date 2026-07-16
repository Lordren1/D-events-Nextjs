// app/api/events/[slug]/route.ts

import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import Event, { IEvent } from "@/database/event.model";

// Shape of the route's dynamic params
interface RouteParams {
  params: Promise<{ slug: string }>;
}

// Standard error response shape for consistency across the API
interface ApiErrorResponse {
  success: false;
  message: string;
}

interface ApiSuccessResponse {
  success: true;
  data: IEvent;
}

export async function GET(
  _req: NextRequest,
  { params }: RouteParams
): Promise<NextResponse<ApiSuccessResponse | ApiErrorResponse>> {
  try {
    const { slug } = await params;

    // Validate slug: must exist and be a non-empty string
    if (!slug || typeof slug !== "string" || slug.trim().length === 0) {
      return NextResponse.json(
        { success: false, message: "A valid event slug is required." },
        { status: 400 }
      );
    }

    // Ensure DB connection is established (mongoose caches this internally
    // if lib/mongodb.ts implements connection reuse, which it should)
    await connectToDatabase();

    // Query by slug, .lean() for a plain JS object (faster, no Mongoose doc overhead)
    const event = await Event.findOne({ slug: slug.trim() }).lean<IEvent>();

    if (!event) {
      return NextResponse.json(
        { success: false, message: `No event found for slug "${slug}".` },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { success: true, data: event },
      { status: 200 }
    );
  } catch (error) {
    // Log full error server-side for debugging; never leak internals to the client
    console.error("[GET /api/events/[slug]] Error:", error);

    return NextResponse.json(
      { success: false, message: "An unexpected error occurred while fetching the event." },
      { status: 500 }
    );
  }
}