import mongoose, { Schema, Document, Model } from "mongoose";

export interface IEvent extends Document {
  title: string;
  slug: string;
  description: string;
  overview: string;
  image: string;
  venue: string;
  location: string;
  date: string;
  time: string;
  mode: string;
  audience: string;
  agenda: string[];
  organizer: string;
  tags: string[];
  createdAt: Date;
  updatedAt: Date;
}

const EventSchema = new Schema<IEvent>(
  {
    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: [100, 'Title cannot exceed 100 characters'],
    },

    slug: {
      type: String,
      unique: true,
      lowercase: true,
      trim: true,
    },

    description: {
      type: String,
      required: true,
      trim: true,
      maxlength: [1000, 'Description cannot exceed 1000 character'],
    },

    overview: {
      type: String,
      required: true,
      trim: true,
      maxlength: [500, 'Overview cannot exceed 500 characters']
    },

    image: {
      type: String,
      required: true,
      trim: true,
    },

    venue: {
      type: String,
      required: true,
      trim: true,
    },

    location: {
      type: String,
      required: true,
      trim: true,
    },

    date: {
      type: String,
      required: true,
      trim: true,
    },

    time: {
      type: String,
      required: true,
      trim: true,
    },

    mode: {
      type: String,
      required: true,
      trim: true,
    },

    audience: {
      type: String,
      required: true,
      trim: true,
    },

    agenda: {
      type: [String],
      required: true,
    },

    organizer: {
      type: String,
      required: true,
      trim: true,
    },

    tags: {
      type: [String],
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

// Generate slug, normalize date/time, and validate fields before saving.
EventSchema.pre("save", function (next) {
  // Generate slug only when creating or title has changed.
  if (this.isNew || this.isModified("title")) {
    this.slug = this.title
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");
  }

  // Normalize date into ISO format.
  const parsedDate = new Date(this.date);

  if (Number.isNaN(parsedDate.getTime())) {
    throw new Error("Invalid event date format");
  }

  this.date = parsedDate.toISOString();

  // Normalize time into a consistent HH:MM format.
  const timeMatch = this.time.match(/^(\d{1,2}):(\d{2})/);

  if (!timeMatch) {
    throw new Error("Invalid event time format");
  }

  const hours = Number(timeMatch[1]);
  const minutes = Number(timeMatch[2]);

  if (hours > 23 || minutes > 59) {
    throw new Error("Invalid event time value");
  }

  this.time = `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}`;

  // Ensure required string fields are not empty.
  const requiredFields: Array<keyof IEvent> = [
    "title",
    "description",
    "overview",
    "image",
    "venue",
    "location",
    "date",
    "time",
    "mode",
    "audience",
    "organizer",
  ];

  for (const field of requiredFields) {
    const value = this[field];

    if (typeof value === "string" && value.trim().length === 0) {
      throw new Error(`${field} cannot be empty`);
    }
  }

  next?.();
});

EventSchema.index({ slug: 1 }, { unique: true });

const Event: Model<IEvent> =
  mongoose.models.Event || mongoose.model<IEvent>("Event", EventSchema);

export default Event;