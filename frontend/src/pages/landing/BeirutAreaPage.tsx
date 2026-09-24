/**
 * ============================================================
 * AREA PAGE — BEIRUT
 * ============================================================
 * Target search: "arcade rental Beirut", "arcade machine rental
 * Beirut", "games for store opening Beirut".
 *
 * Built from what the owner confirmed directly — store openings in
 * Beirut, AUB and USJ — and from the Beirut partner placement in
 * the events records. Client names are left out.
 * ============================================================
 */

import React from 'react';
import { LandingPage } from '../../components/LandingPage';

const SITE_URL = 'https://nlgarcadesforevents.vercel.app';

const serviceSchema = {
  '@context': 'https://schema.org',
  '@type': 'Service',
  name: 'Arcade Game Rental in Beirut',
  serviceType: 'Arcade game rental',
  description:
    'Arcade and carnival game rental in Beirut for store openings, university events and venues, with delivery, installation and on-site staff.',
  provider: {
    '@type': 'LocalBusiness',
    name: 'Next Level Game',
    telephone: '+961-3-919-876',
    address: { '@type': 'PostalAddress', addressLocality: 'Tripoli', addressCountry: 'LB' },
  },
  areaServed: { '@type': 'City', name: 'Beirut' },
  url: `${SITE_URL}/areas/beirut`,
};

export function BeirutArea() {
  return (
    <LandingPage
      kicker="Beirut"
      h1="Arcade Game Rental in Beirut"
      lead="We bring arcade and carnival games to Beirut for store openings, university events and venues that want machines on the floor. Our base is in Tripoli, and the trip down is part of the service: delivery, setup, staff and collection are included."
      title="Arcade Game Rental in Beirut | Next Level Game"
      description="Arcade and carnival games in Beirut for store openings, university events and venues. Delivery, setup and staff included. WhatsApp 03 919 876."
      canonical="/areas/beirut"
      breadcrumb={[
        { label: 'Areas', to: '/areas/beirut' },
        { label: 'Beirut', to: '/areas/beirut' },
      ]}
      sections={[
        {
          heading: 'Store openings in Beirut',
          body: 'We have supplied games for store openings in Beirut. An opening on a Beirut street competes with traffic, noise and every other shop front, so the machines have to stop people walking: King of the Hammer is heard from down the street, a boxing machine gets strangers competing, and a claw or prize machine gives people a reason to come back. Street frontage is tight, so we plan with you how much pavement you can use and where the queue goes.',
        },
        {
          heading: 'University events at AUB and USJ',
          body: 'In Beirut we have worked with the American University of Beirut and Université Saint-Joseph. Student crowds arrive in bursts between classes, so we pick machines with short rounds and a visible score — the combination that turns a queue into a competition on an activity day.',
        },
        {
          heading: 'Machines for Beirut venues',
          body: 'Not every Beirut client wants an event. We have also placed a machine at a Beirut venue for a multi-day run with a partner who hosts it. If you run a café, a shop or a venue with space that is not earning, we can place machines there on a revenue-share basis: we own and maintain them, you take a share of what they make.',
        },
        {
          heading: 'Coming down from Tripoli',
          body: 'Our machines and our team are based in Tripoli, and we cover Beirut from there. We handle the transport, arrive in time to install and test before your guests do, and take everything back when the event ends. All you send us is the address, the date and the time.',
        },
      ]}
      faqs={[
        {
          question: 'Can I rent arcade games in Beirut?',
          answer: 'Yes. Next Level Game brings arcade and carnival games to Beirut for store openings, university events and venues, with delivery, installation, on-site staff and collection included. Contact us on WhatsApp at 03 919 876.',
        },
        {
          question: 'Do you supply games for store openings in Beirut?',
          answer: 'Yes, we have supplied store openings in Beirut. We choose machines that stop people on the street, such as King of the Hammer and the boxing machine, and plan the setup around the frontage you have.',
        },
        {
          question: 'Which Beirut universities have you worked with?',
          answer: 'In Beirut we have worked with the American University of Beirut and Université Saint-Joseph. Across Lebanon we have also worked with BAU, LIU, NDU, the Lebanese University and the University of Balamand.',
        },
        {
          question: 'Can you place a machine in my Beirut café or shop?',
          answer: 'Yes. We place machines in venues on a revenue-share basis: we own and maintain the machine, and you take an agreed share of what it earns. Send us the venue type and the space you have.',
        },
      ]}
      whatsappMessage="Hi, I would like arcade games in Beirut. Area: , Date: , Type of event: "
      ctaHeading="Planning something in Beirut?"
      ctaBody="Send the area, the date and the type of event. We will tell you which machines fit and what the whole setup costs, delivery included."
      related={[
        { label: 'Store openings', to: '/events/store-openings' },
        { label: 'Machines for your venue — revenue share', to: '/services/revenue-share' },
        { label: 'Tripoli & North Lebanon', to: '/areas/tripoli' },
        { label: 'Arcade game rental in Koura', to: '/areas/koura' },
      ]}
      jsonLd={[serviceSchema]}
    />
  );
}
