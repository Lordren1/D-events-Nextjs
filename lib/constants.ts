export type EventItem = {
  image: string;
  title: string;
  slug: string;
  location: string;
  date: string;
  time: string;
};

export const events: EventItem[] = [
  {
    image: "/images/event1.png",
    title: "Google I/O 2026",
    slug: "google-io-2026",
    location: "Mountain View, California, USA",
    date: "May 12, 2026",
    time: "10:00 AM",
  },
  {
    image: "/images/event2.png",
    title: "AWS re:Invent 2026",
    slug: "aws-reinvent-2026",
    location: "Las Vegas, Nevada, USA",
    date: "December 1, 2026",
    time: "9:00 AM",
  },
  {
    image: "/images/event3.png",
    title: "Microsoft Build Developer Conference",
    slug: "microsoft-build-2026",
    location: "Seattle, Washington, USA",
    date: "May 19, 2026",
    time: "9:30 AM",
  },
  {
    image: "/images/event4.png",
    title: "GitHub Universe 2026",
    slug: "github-universe-2026",
    location: "San Francisco, California, USA",
    date: "October 28, 2026",
    time: "10:00 AM",
  },
  {
    image: "/images/event5.png",
    title: "React Conf 2026",
    slug: "react-conf-2026",
    location: "Las Vegas, Nevada, USA",
    date: "November 14, 2026",
    time: "11:00 AM",
  },
  {
    image: "/images/event6.png",
    title: "Lagos Tech Fest 2026",
    slug: "lagos-tech-fest-2026",
    location: "Lagos, Nigeria",
    date: "August 22, 2026",
    time: "10:00 AM",
  },
  /* {
    image: "/images/africa-hackathon.jpg",
    title: "Africa Developer Hackathon 2026",
    slug: "africa-developer-hackathon-2026",
    location: "Nairobi, Kenya",
    date: "September 5, 2026",
    time: "8:00 AM",
  },
  {
    image: "/images/nextjs-conf.jpg",
    title: "Next.js Conf 2026",
    slug: "nextjs-conf-2026",
    location: "Online",
    date: "October 15, 2026",
    time: "12:00 PM",
  }, */
];