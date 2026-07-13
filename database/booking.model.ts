import mongoose, { Schema, Document, Model } from "mongoose";
import Event from "./event.model";

export interface IBooking extends Document {
  eventId: mongoose.Types.ObjectId;
  email: string;
  createdAt: Date;
  updatedAt: Date;
}

const BookingSchema = new Schema<IBooking>(
  {
    eventId: {
      type: Schema.Types.ObjectId,
      ref: "Event",
      required: true,
    },

    email: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
    },
  },
  {
    timestamps: true,
  }
);

// Validate event reference and email before creating booking.
BookingSchema.pre("save", async function () {
  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  if (!emailPattern.test(this.email)) {
    throw new Error("Invalid email format");
  }

  // Confirm referenced event exists before saving booking.
  const eventExists = await Event.exists({
    _id: this.eventId,
  });

  if (!eventExists) {
    throw new Error("Referenced event does not exist");
  }
});

BookingSchema.index({ eventId: 1 });

const Booking: Model<IBooking> =
  mongoose.models.Booking ||
  mongoose.model<IBooking>("Booking", BookingSchema);

export default Booking;