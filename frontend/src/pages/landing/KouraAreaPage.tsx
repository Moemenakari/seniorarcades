/**
 * ============================================================
 * AREA PAGE — KOURA
 * ============================================================
 * Target search: "arcade rental Koura", "games for event Amioun",
 * "carnival games Koura Lebanon".
 *
 * Built from the events records: the completed Amioun event (with
 * the machines listed in its notes) and the Kousba scouts event,
 * plus the University of Balamand, which the owner confirmed and
 * whose campus is in Koura. Client names are left out.
 * ============================================================
 */

import React from 'react';
import { LandingPage } from '../../components/LandingPage';

const SITE_URL = 'https://nlgarcadesforevents.vercel.app';

const serviceSchema = {
  '@context': 'https://schema.org',
  '@type': 'Service',
  name: 'Arcade Game Rental in Koura',
  serviceType: 'Arcade game rental',
  description:
    'Arcade and carnival game rental in Koura, North Lebanon, including Amioun, Kousba and the University of Balamand, delivered from Tripoli with setup and staff.',
  provider: {
    '@type': 'LocalBusiness',
    name: 'Next Level Game',
    telephone: '+961-3-919-876',
    address: { '@type': 'PostalAddress', addressLocality: 'Tripoli', addressCountry: 'LB' },
  },
  areaServed: [
    { '@type': 'AdministrativeArea', name: 'Koura' },
    { '@type': 'Place', name: 'Amioun' },
    { '@type': 'Place', name: 'Kousba' },
  ],
  url: `${SITE_URL}/areas/koura`,
};

export function KouraArea() {
  return (
    <LandingPage
      kicker="Koura"
      h1="Arcade Game Rental in Koura"
      lead="Koura is a short drive from our base in Tripoli, and we have worked across it: private events in Amioun, youth and scout activities in Kousba, and campus events at the University of Balamand."
      title="Arcade Game Rental in Koura | Next Level Game"
      description="Arcade and carnival games for events in Koura — Amioun, Kousba, Balamand and the villages around them. Delivered from Tripoli with setup and staff."
      canonical="/areas/koura"
      breadcrumb={[
        { label: 'Areas', to: '/areas/koura' },
        { label: 'Koura', to: '/areas/koura' },
      ]}
      sections={[
        {
          heading: 'Amioun',
          body: 'In July 2026 we supplied a private event in Amioun, Koura\'s main town, with a mix chosen to keep every age busy at once:',
          bullets: [
            'Pop Win — the prize game people come back to for another try',
            'Catch Stick — a reflex game played in a few seconds',
            'A claw machine',
            'Hit Mickey Mouse — the favourite with young children',
            'A boxing machine — the one that gets the adults competing',
          ],
        },
        {
          heading: 'Scouts and youth groups in Kousba',
          body: 'We have supplied games for a scouts event in Kousba. Youth groups need machines that move a large group through quickly and that work outdoors, and they usually run across a whole day or a weekend. We plan the mix around the number of children and the time you have.',
        },
        {
          heading: 'University of Balamand',
          body: 'The University of Balamand, whose campus sits in Koura, is one of the universities we have worked with. Campus events have their own rules — a delivery window, security at the gate, a power point agreed with facilities — and we plan them with the student committee in advance.',
        },
        {
          heading: 'Anywhere in Koura',
          body: 'Koura\'s villages sit close together, which makes it easy for us to reach any of them from Tripoli. Send us the village, the date and the kind of event — a family celebration, a church or municipal festival, a school day — and we will tell you which machines fit and what the setup costs.',
        },
      ]}
      faqs={[
        {
          question: 'Do you rent arcade games in Koura?',
          answer: 'Yes. Next Level Game works across Koura from its base in Tripoli, and has supplied events in Amioun and Kousba and at the University of Balamand. Delivery, installation and staff are included.',
        },
        {
          question: 'What games did you bring to Amioun?',
          answer: 'For a private event in Amioun in July 2026 we supplied Pop Win, Catch Stick, a claw machine, Hit Mickey Mouse and a boxing machine.',
        },
        {
          question: 'Do you work with scouts and youth groups?',
          answer: 'Yes. We have supplied games for a scouts event in Kousba, in Koura, and we choose machines that move a large group of children through quickly.',
        },
        {
          question: 'How do I book for an event in Koura?',
          answer: 'Send the village, the date and the expected number of guests on WhatsApp to 03 919 876. We reply with the machines that fit and a price for the full setup.',
        },
      ]}
      whatsappMessage="Hi, I would like to rent arcade games in Koura. Village: , Date: , Expected guests: "
      ctaHeading="Planning an event in Koura?"
      ctaBody="Send the village, the date and roughly how many guests. We will tell you which machines fit and what the whole setup costs."
      related={[
        { label: 'Tripoli & North Lebanon', to: '/areas/tripoli' },
        { label: 'Arcade game rental in Beirut', to: '/areas/beirut' },
        { label: 'University events', to: '/events/universities' },
        { label: 'See all the games', to: '/catalog' },
      ]}
      jsonLd={[serviceSchema]}
    />
  );
}
