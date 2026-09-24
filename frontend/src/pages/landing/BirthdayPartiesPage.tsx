/**
 * ============================================================
 * EVENT PAGE — BIRTHDAY PARTIES
 * ============================================================
 * Target search: "birthday party games rental Lebanon",
 * "arcade machine for birthday at home", "kids party games".
 * ============================================================
 */

import React from 'react';
import { LandingPage } from '../../components/LandingPage';

const SITE_URL = 'https://nlgarcadesforevents.vercel.app';

const serviceSchema = {
  '@context': 'https://schema.org',
  '@type': 'Service',
  name: 'Birthday Party Game Rental',
  serviceType: 'Birthday party entertainment',
  description:
    'Rental of arcade, carnival and inflatable games for birthday parties at homes, chalets, halls and gardens anywhere in Lebanon, with delivery, setup and collection.',
  provider: {
    '@type': 'LocalBusiness',
    name: 'Next Level Game',
    telephone: '+961-3-919-876',
    address: { '@type': 'PostalAddress', addressLocality: 'Tripoli', addressCountry: 'LB' },
  },
  areaServed: { '@type': 'Country', name: 'Lebanon' },
  url: `${SITE_URL}/events/birthdays`,
};

export function BirthdayParties() {
  return (
    <LandingPage
      kicker="Birthdays"
      h1="Birthday Party Game Rental in Lebanon"
      lead="We bring arcade and carnival machines to birthday parties anywhere in Lebanon — at home, in a chalet, in a hall or in a garden. We deliver, set up, and collect everything afterwards, so the party is not your logistics problem."
      title="Birthday Party Game Rental in Lebanon | Next Level Game"
      description="Rent arcade, carnival and inflatable games for a birthday party anywhere in Lebanon. Delivered, set up and collected. WhatsApp 03 919 876 for a quote."
      canonical="/events/birthdays"
      breadcrumb={[
        { label: 'Events', to: '/events/birthdays' },
        { label: 'Birthdays', to: '/events/birthdays' },
      ]}
      sections={[
        {
          heading: 'A birthday needs fewer machines than people expect',
          body: 'A party is not a festival. With twenty or thirty guests, two or three well-chosen machines hold the whole party for hours, and a fourth usually sits unused. We would rather tell you that than rent you machines that stand idle in your living room.',
        },
        {
          heading: 'What to pick by age',
          body: 'The right machine depends almost entirely on the age of the birthday child and their guests:',
          bullets: [
            'Young children — inflatables, Hit Mickey Mouse, carnival stands',
            'Primary age — basketball, air hockey, Pop Win, Stopwatch',
            'Teenagers — boxing, King of the Hammer, drift car, shooting, Reflex',
            'Mixed ages or adults too — the Human Claw Machine, which everyone queues for',
          ],
        },
        {
          heading: 'Homes, chalets, halls and gardens',
          body: 'Before we confirm the machines we check three practical things: how the machine gets in — a door, a staircase, a lift — how much space it needs once inside, and whether the power point can carry it. A machine that cannot be carried up your stairs is not a machine we will promise you. Send a photo of the space if you are not sure.',
        },
        {
          heading: 'We come to your town',
          body: 'Parties are not only in Beirut. We deliver across the whole of Lebanon, including Tripoli, Beirut, Koura, Akkar, Chekka and mountain towns. If your chalet or village house is off the main road, tell us and we will plan the access in advance.',
        },
      ]}
      faqs={[
        {
          question: 'Can I rent an arcade machine for a birthday party at home in Lebanon?',
          answer: 'Yes. Next Level Game delivers arcade, carnival and inflatable games to homes, chalets, halls and gardens anywhere in Lebanon, sets them up and collects them after the party.',
        },
        {
          question: 'How many machines do I need for a birthday?',
          answer: 'For a party of twenty or thirty guests, two or three well-chosen machines usually hold everyone for hours. More than that tends to leave machines unused, so we would rather match the mix to the guest count than rent you extras.',
        },
        {
          question: 'Which game suits the age of my child?',
          answer: 'Inflatables, Hit Mickey Mouse and carnival stands suit young children; basketball, air hockey and Pop Win suit primary age; boxing, King of the Hammer, the drift car and Reflex suit teenagers. The Human Claw Machine works across all ages.',
        },
        {
          question: 'Will the machine fit inside my house or apartment?',
          answer: 'That depends on the door, the staircase or the lift, the space in the room and the power point. Send us a photo of the space and the floor you are on, and we will tell you honestly what can be brought in.',
        },
        {
          question: 'Do you deliver to chalets and villages?',
          answer: 'Yes, across the whole of Lebanon including mountain towns. If the location is off the main road, tell us when you book so we can plan the access.',
        },
        {
          question: 'How much does it cost for a birthday?',
          answer: 'It depends on the machines, the number of days and the distance from Tripoli. Send the date, the town and the number of guests on WhatsApp to 03 919 876 and we will give you a price for the setup.',
        },
      ]}
      whatsappMessage="Hi, I would like games for a birthday party. Date: , Town: , Age of the birthday child: , Number of guests: "
      ctaHeading="Planning a birthday?"
      ctaBody="Send the date, the town, the age of the birthday child and roughly how many guests. We will tell you which two or three machines are right for it."
      related={[
        { label: 'School and kindergarten events', to: '/events/schools' },
        { label: 'Human Claw Machine', to: '/sponsorship' },
        { label: 'Arcade game rental', to: '/services/arcade-rental' },
        { label: 'See all the games', to: '/catalog' },
      ]}
      jsonLd={[serviceSchema]}
    />
  );
}
