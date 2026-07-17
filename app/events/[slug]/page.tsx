import { notFound } from "next/navigation";
import Image from "next/image";
import BookEvent from "@/components/BookEvent";
import { getEventBySlug } from "@/lib/events";
import { IEvent } from "@/database/event.model";
import { getSimilarEventsBySlug } from "@/lib/actions/event.actions";
import EventCard from "@/components/EventCard";
import Booking from "@/database/booking.model";
import { connectToDatabase } from "@/lib/mongodb";

const EventDetailItem = ({ icon, alt, label }: { icon: string; alt: string; label: string }) => (
	<div className="flex-row-gap-2 items-center">
		<Image src={icon} alt={alt} width={17} height={17} />
		<span>{label}</span>
	</div>
)

const normalizeStringArray = (value: unknown): string[] => {
	if (Array.isArray(value)) {
		const directStrings = value.filter((item): item is string => typeof item === "string");
		if (directStrings.length > 0) {
			return directStrings;
		}
	}

	if (typeof value === "string") {
		const trimmedValue = value.trim();
		if (!trimmedValue) {
			return [];
		}

		try {
			const parsedValue = JSON.parse(trimmedValue);
			if (Array.isArray(parsedValue)) {
				return parsedValue.filter((item): item is string => typeof item === "string");
			}
		} catch {
			return [trimmedValue];
		}
	}

	return [];
};

const EventAgenda = ({ agendaItems }: { agendaItems: string[] }) => (
	<div className="agenda">
		<h2>Agenda</h2>
		<ul>
			{agendaItems.map((item) => (
				<li key={item}>{item}</li>
			))}
		</ul>
	</div>
)

const EventTags = ({ tags }: { tags: string[] }) => (
	<div className="flex flex-row gap-1.5 flex-wrap">
		{tags.map((tag) => (
			<div className="pill" key={tag}>{tag}</div>
		))}
	</div>
)


const EventDetailsPage = async ({ params }: { params: Promise<{ slug: string }>}) => {
	'use cache';
	cacheLife('munites');

	const { slug } = await params;
	const event = await getEventBySlug(slug);

	if (!event || typeof event !== "object" || Array.isArray(event)) {
		notFound();
	}

	type EventPageData = {
		description: string;
		image: string;
		overview: string;
		date: string;
		time: string;
		location: string;
		mode: string;
		agenda: string[];
		audience: string;
		tags: string[];
		organizer: string;
	};

	const eventData = event as unknown as Record<string, unknown>;
	const requiredStringFields = ["description", "image", "overview", "date", "time", "location", "mode", "audience", "organizer"] as const;
	const requiredArrayFields = ["agenda", "tags"] as const;

	const hasValidStringValue = (value: unknown) => typeof value === "string" && value.trim().length > 0;
	const hasValidStringArrayValue = (value: unknown) => {
		if (Array.isArray(value)) {
			return value.every((item) => typeof item === "string" && item.trim().length > 0);
		}

		if (typeof value === "string") {
			const trimmedValue = value.trim();
			if (!trimmedValue) {
				return false;
			}

			try {
				const parsedValue = JSON.parse(trimmedValue);
				return Array.isArray(parsedValue) && parsedValue.every((item) => typeof item === "string" && item.trim().length > 0);
			} catch {
				return false;
			}
		}

		return false;
	};

	for (const field of requiredStringFields) {
		if (!hasValidStringValue(eventData[field])) {
			notFound();
		}
	}

	for (const field of requiredArrayFields) {
		if (!hasValidStringArrayValue(eventData[field])) {
			notFound();
		}
	}

	const {
		description,
		image,
		overview,
		date,
		time,
		location,
		mode,
		agenda,
		audience,
		tags,
		organizer,
	} = eventData as EventPageData;

	const formattedDate = new Date(date).toLocaleDateString("en-US", {
		weekday: "long",
		year: "numeric",
		month: "long",
		day: "numeric",
	});

	const eventIdentifier = (event as IEvent & { _id?: string })._id?.toString() ?? event.id?.toString() ?? undefined;

	await connectToDatabase();
	const bookings = eventIdentifier ? await Booking.countDocuments({ eventId: eventIdentifier }) : 0;

	const similarEvents: IEvent[] = await getSimilarEventsBySlug(slug);

	return (
		<section id = "event">
			<div className="header">
				<h1>Event Description</h1>
				<p>{description}</p>    
			</div> 

			<div className="details">
				{/*  Left Side - Event Content */}
				<div className="content">
					<Image src={image} alt="Event Banner" width={800} height={450} className="banner" />

					<section className="flex-col-gap-2">
						<h2>Overview</h2>
						<p>{overview}</p>
					</section>

					<section className="flex-col-gap-2">
						<h2>Event Details</h2>

						<EventDetailItem icon="/icons/calendar.svg" alt="calender" label={formattedDate} />
						<EventDetailItem icon="/icons/clock.svg" alt="clock" label={time} />
						<EventDetailItem icon="/icons/pin.svg" alt="pin" label={location} />
						<EventDetailItem icon="/icons/mode.svg" alt="mode" label={mode} />
						<EventDetailItem icon="/icons/audience.svg" alt="audience" label={audience} />
					</section>

					<EventAgenda agendaItems={normalizeStringArray(agenda)} />

					<section className="flex-col-gap-2">
					<h2>About the Organizer</h2>
					<p>{organizer}</p>
				</section>

				<EventTags tags={normalizeStringArray(tags)} />

				</div>

				

				{/*  Right Side - Booking Form */}
				<aside className="booking">
						<div className="signup-card">
							<h2>Book Your Spot</h2>
							{ bookings > 0 ? (
								<p className="text-sm">
									Join {bookings} people who have already booked their spot!
								</p>
							): (
								<p className="text-sm">Be the first to book your spot!</p>
							)}

							<BookEvent eventId={eventIdentifier} eventSlug={slug} />
						</div>
				</aside>
			</div>

			<div className="flex w-full flex-col gap-4 pt-20">
				<h2>Similar Events</h2>
				<div className="events">
					{similarEvents.length > 0 && similarEvents.map((similarEvent: IEvent) => (
						<EventCard key={similarEvent.title} { ...similarEvent} />
					))}
				</div>
			</div>
		</section>
	)
}

export default EventDetailsPage;

function cacheLife(arg0: string) {
	throw new Error("Function not implemented.");
}
