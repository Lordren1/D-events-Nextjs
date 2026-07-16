"use client";

import { useState, type FormEvent } from "react";

type BookEventProps = {
	eventId?: string;
	eventSlug?: string;
};

const BookEvent = ({ eventId, eventSlug }: BookEventProps) => {
	const [email, setEmail] = useState("");
	const [submitted, setSubmitted] = useState(false);
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [error, setError] = useState("");

	const handleSubmit = async (e: FormEvent) => {
		e.preventDefault();

		if (isSubmitting || submitted) {
			return;
		}

		const trimmedEmail = email.trim();

		if (!trimmedEmail || (!eventId && !eventSlug)) {
			setError("Please provide a valid email and event reference.");
			return;
		}

		setIsSubmitting(true);
		setError("");

		try {
			const response = await fetch("/api/bookings", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({
					email: trimmedEmail,
					eventId,
					eventSlug,
				}),
			});

			const data = await response.json();

			if (!response.ok || !data.success) {
				throw new Error(data.message || "Unable to submit booking.");
			}

			setSubmitted(true);
		} catch (err) {
			setError(err instanceof Error ? err.message : "Unable to submit booking.");
		} finally {
			setIsSubmitting(false);
		}
	};

	return (
		<div id="book-event">
			{submitted ? (
				<p className="text-sm">Thank you for signing up</p>
			) : (
				<form onSubmit={handleSubmit}>
					<div>
						<label htmlFor="email">Email Address</label>
						<input
							type="email"
							required
							value={email}
							onChange={(e) => setEmail(e.target.value)}
							id="email"
							placeholder="Enter your email address"
						/>
					</div>
					{error ? <p className="text-sm text-red-600">{error}</p> : null}
					<button type="submit" className="button-submit" disabled={isSubmitting || submitted}>
						{isSubmitting ? "Submitting..." : "Submit"}
					</button>
				</form>
			)}
		</div>
	);
};

export default BookEvent