/**
 * ============================================================
 * SERVICE PAGE — REVENUE SHARE PARTNERSHIP
 * ============================================================
 * Target search: "arcade machines for my venue Lebanon",
 * "revenue share arcade machines", "put games in my shop".
 *
 * No split percentages, no income figures: the terms are agreed
 * per venue and the business has not given fixed numbers, so the
 * page explains the model and asks for the venue details.
 * ============================================================
 */

import React from 'react';
import { LandingPage } from '../../components/LandingPage';

const SITE_URL = 'https://nlgarcadesforevents.vercel.app';

const serviceSchema = {
  '@context': 'https://schema.org',
  '@type': 'Service',
  name: 'Arcade Machine Revenue Share Partnership',
  serviceType: 'Revenue share machine placement',
  description:
    'Placement of arcade and carnival machines in venues across Lebanon on a revenue-share basis. Next Level Game owns, installs and maintains the machines and the venue shares the income they generate.',
  provider: {
    '@type': 'LocalBusiness',
    name: 'Next Level Game',
    telephone: '+961-3-919-876',
    address: {
      '@type': 'PostalAddress',
      addressLocality: 'Tripoli',
      addressCountry: 'LB',
    },
  },
  areaServed: {
    '@type': 'Country',
    name: 'Lebanon',
  },
  url: `${SITE_URL}/services/revenue-share`,
  availableChannel: {
    '@type': 'ServiceChannel',
    servicePhone: '+961-3-919-876',
    serviceUrl: 'https://wa.me/96103919876',
  },
};

export function RevenueShare() {
  return (
    <LandingPage
      kicker="Partnership"
      h1="Arcade Machines for Your Venue in Lebanon — Revenue Share"
      lead="If you have floor space that is not earning, we can place arcade machines in it and share the income they generate. You do not buy the machines and you do not maintain them: we own them, install them and service them, and you take a share of what they make."
      title="Arcade Machines for Your Venue in Lebanon | Revenue Share"
      description="Turn unused floor space into income. We place and maintain arcade machines in venues across Lebanon on a revenue-share basis. WhatsApp 03 919 876."
      canonical="/services/revenue-share"
      breadcrumb={[
        { label: 'Services', to: '/services' },
        { label: 'Revenue Share', to: '/services/revenue-share' },
      ]}
      sections={[
        {
          heading: 'How the partnership works',
          body: 'The model is simple and it costs the venue nothing up front:',
          bullets: [
            'You provide the floor space and the power supply',
            'We choose machines that suit your customers and your space',
            'We deliver and install them at our own cost',
            'We service and maintain them for as long as they are there',
            'You take an agreed share of the income the machines generate',
          ],
        },
        {
          heading: 'Which venues this suits',
          body: 'It works best where people already spend time and there is space that is currently doing nothing. Cafés and restaurants where people wait for a table. Malls and shopping centres with an empty corner. Resorts, pools and chalets with families on site for the day. Sports clubs. Hotel lobbies and kids areas. If your customers are already in the building, machines give them a reason to stay longer — and that is usually worth more to the venue than the machine income itself.',
        },
        {
          heading: 'Why a venue would choose this over buying',
          body: 'Buying a machine means paying for it up front, learning to maintain it, and carrying the loss if your customers turn out not to use it. A revenue share moves all of that to us. If a machine performs badly in your venue we swap it for a different one, because a machine that nobody plays earns us nothing either — our interests and yours point the same way. If you would rather own the machines outright, we sell them too.',
        },
        {
          heading: 'Anywhere in Lebanon',
          body: 'Placement is not limited to Beirut. We operate across the whole country from our base in Tripoli, and we service machines where we place them — including in areas most operators will not travel to. A venue in Koura, Akkar, Chekka or a mountain town is as workable for us as one in the city.',
        },
        {
          heading: 'The terms are agreed per venue',
          body: 'There is no single fixed split published here, because it depends on the venue: how much space, how much foot traffic, which machines, and who supplies the power. Send us the type of venue, the town, the available space in square metres and a sense of how busy it is, and we will come back with a concrete proposal for your case.',
        },
      ]}
      faqs={[
        {
          question: 'Can I get arcade machines in my venue without buying them?',
          answer: 'Yes. Next Level Game places machines in venues across Lebanon on a revenue-share basis. We own, install and maintain the machines and you take an agreed share of the income, with no purchase cost to the venue.',
        },
        {
          question: 'What does the venue have to provide?',
          answer: 'Floor space and a power supply. We handle the machines, the delivery, the installation and the maintenance.',
        },
        {
          question: 'Who pays for repairs and maintenance?',
          answer: 'We do. The machines remain ours, so servicing them is our responsibility for as long as they are in your venue.',
        },
        {
          question: 'What is the revenue split?',
          answer: 'It is agreed per venue rather than fixed, because it depends on the space, the foot traffic, the machines involved and who supplies the power. Send us those details on WhatsApp at 03 919 876 and we will give you a concrete proposal.',
        },
        {
          question: 'What if the machines do not perform in my venue?',
          answer: 'We swap them for different machines. A machine nobody plays earns us nothing either, so it is in our own interest to find the mix that works for your customers.',
        },
        {
          question: 'Do you place machines outside Beirut?',
          answer: 'Yes. We work across the whole of Lebanon from our base in Tripoli, including Koura, Akkar, Chekka and mountain areas, and we service the machines wherever we place them.',
        },
      ]}
      whatsappMessage="Hi, I have a venue and I am interested in a revenue-share partnership. Venue type: , Town: , Available space: "
      ctaHeading="Have space that is not earning?"
      ctaBody="Send us the venue type, the town, the available space and how busy it gets. We will come back with a proposal for your specific case."
      related={[
        { label: 'Buy machines outright', to: '/services/buy-arcade-machines' },
        { label: 'Arcade game rental', to: '/services/arcade-rental' },
        { label: 'See the machines', to: '/catalog' },
        { label: 'About Next Level Game', to: '/about' },
      ]}
      jsonLd={[serviceSchema]}
    />
  );
}
