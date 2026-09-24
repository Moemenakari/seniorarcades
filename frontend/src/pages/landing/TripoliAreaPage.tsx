/**
 * ============================================================
 * AREA PAGE — TRIPOLI & NORTH LEBANON
 * ============================================================
 * Target search: "arcade rental Tripoli", "carnival games
 * Tripoli Lebanon", "arcade rental Akkar", "games for events
 * north Lebanon".
 *
 * Every event named here is in the business's own events records
 * and in the list of places the owner confirmed. Akkar, Chekka
 * and Bqaakafra are sections of this page rather than pages of
 * their own: one event each is proof of reach, not enough to
 * carry a page, and a thin page per village is the doorway-page
 * pattern search engines penalise.
 *
 * Exact figures appear only for events marked completed. Client
 * and venue names are left out on purpose.
 * ============================================================
 */

import React from 'react';
import { LandingPage } from '../../components/LandingPage';

const SITE_URL = 'https://nlgarcadesforevents.vercel.app';

const serviceSchema = {
  '@context': 'https://schema.org',
  '@type': 'Service',
  name: 'Arcade Game Rental in Tripoli and North Lebanon',
  serviceType: 'Arcade game rental',
  description:
    'Arcade and carnival game rental from Tripoli across North Lebanon, including Kalamoun, Akkar, Chekka and mountain villages such as Bqaakafra.',
  provider: {
    '@type': 'LocalBusiness',
    name: 'Next Level Game',
    telephone: '+961-3-919-876',
    address: { '@type': 'PostalAddress', addressLocality: 'Tripoli', addressCountry: 'LB' },
  },
  areaServed: [
    { '@type': 'City', name: 'Tripoli' },
    { '@type': 'Place', name: 'Kalamoun' },
    { '@type': 'AdministrativeArea', name: 'Akkar' },
    { '@type': 'Place', name: 'Chekka' },
    { '@type': 'Place', name: 'Bqaakafra' },
  ],
  url: `${SITE_URL}/areas/tripoli`,
};

export function TripoliArea() {
  return (
    <LandingPage
      kicker="Tripoli & North Lebanon"
      h1="Arcade Game Rental in Tripoli & North Lebanon"
      lead="Next Level Game is based in Tripoli, so the city and the north around it are home ground for us. From here we take arcade and carnival games to schools in Kalamoun, to Akkar, to Chekka on the coast, and up to Bqaakafra in the mountains."
      title="Arcade Game Rental in Tripoli & North Lebanon"
      description="Arcade and carnival game rental from our base in Tripoli, covering Kalamoun, Akkar, Chekka and the northern mountain villages. WhatsApp 03 919 876."
      canonical="/areas/tripoli"
      breadcrumb={[
        { label: 'Areas', to: '/areas/tripoli' },
        { label: 'Tripoli & North Lebanon', to: '/areas/tripoli' },
      ]}
      sections={[
        {
          heading: 'Based in Tripoli',
          body: 'Our machines, our team and our transport all start from Tripoli. For an event in the city that means the shortest trip we make and less time on the road before setup. From the same base we cover the rest of the north and the whole of Lebanon.',
        },
        {
          heading: 'School days around Tripoli',
          body: 'Schools are a large part of our work in the area. In June and July 2026 we ran school days in Kalamoun, just south of Tripoli, bringing five machines and our own staff, so the teachers could run the day instead of the games. The same setup works for fun days, fairs and end-of-year celebrations anywhere in the city.',
        },
        {
          heading: 'Akkar',
          body: 'Akkar is large, spread out and a long way from the suppliers who stay on the coast, which is exactly why we go. We have placed machines in Aandqet, in Akkar, working with a local partner who hosted them. If you are organising something in Akkar, tell us the village and we will plan the road and the power supply before the date.',
        },
        {
          heading: 'Chekka',
          body: 'Down the coast in Chekka we have supplied a church celebration, where a games area gives families a reason to stay after the service. Community and parish events like this work best with machines that take many players quickly, such as Hit Mickey Mouse, Pop Win and air hockey.',
        },
        {
          heading: 'Up in the mountains: Bqaakafra',
          body: 'We have also taken machines up to Bqaakafra, often described as the highest village in Lebanon. A mountain event needs more planning than a city one — the road up, the weather, and a power supply that holds for the whole event — and we work that out with you before we load the truck. If we can reach Bqaakafra, your village is within reach too.',
        },
      ]}
      faqs={[
        {
          question: 'Where can I rent arcade games in Tripoli, Lebanon?',
          answer: 'Next Level Game is based in Tripoli and rents arcade and carnival games for events in the city and across North Lebanon, with delivery, installation and on-site staff. Contact us on WhatsApp at 03 919 876.',
        },
        {
          question: 'Do you deliver to Akkar?',
          answer: 'Yes. We have placed machines in Aandqet, in Akkar, and we plan the road and the power supply for any Akkar village before the event date.',
        },
        {
          question: 'Can you set up in a mountain village in North Lebanon?',
          answer: 'Yes. We have taken machines up to Bqaakafra, often described as the highest village in Lebanon. Tell us the location and we plan the access and the power with you in advance.',
        },
        {
          question: 'Do you do school events around Tripoli?',
          answer: 'Yes. In June and July 2026 we ran school days in Kalamoun, just south of Tripoli, with five machines and our own staff supervising the games.',
        },
        {
          question: 'Do you only work in North Lebanon?',
          answer: 'No. Tripoli is our base, but we cover the whole of Lebanon, including Koura and Beirut. Send the location on WhatsApp at 03 919 876 and we will plan the trip.',
        },
      ]}
      whatsappMessage="Hi, I would like to rent arcade games in North Lebanon. Town: , Date: , Expected guests: "
      ctaHeading="Organising something in the north?"
      ctaBody="Send the town, the date and roughly how many guests. From Tripoli to Akkar to the mountains, we will tell you what fits and what it costs."
      related={[
        { label: 'Arcade game rental in Koura', to: '/areas/koura' },
        { label: 'Arcade game rental in Beirut', to: '/areas/beirut' },
        { label: 'School fun days & fairs', to: '/events/schools' },
        { label: 'Complete festival supply', to: '/services/festival-supply' },
      ]}
      jsonLd={[serviceSchema]}
    />
  );
}
