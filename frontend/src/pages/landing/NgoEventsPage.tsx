/**
 * ============================================================
 * EVENT PAGE — NGOs AND ASSOCIATIONS
 * ============================================================
 * Target search: "games for NGO family day Lebanon",
 * "activities for children association event Lebanon".
 *
 * No claim about discounts or free work: that is the business
 * owner's decision to make, not something this page promises.
 * ============================================================
 */

import React from 'react';
import { LandingPage } from '../../components/LandingPage';

const SITE_URL = 'https://nlgarcadesforevents.vercel.app';

const serviceSchema = {
  '@context': 'https://schema.org',
  '@type': 'Service',
  name: 'Games for NGO and Association Events',
  serviceType: 'Community event entertainment',
  description:
    'Arcade, carnival and inflatable games for NGO and association family days, community events and children activities across Lebanon, including remote areas.',
  provider: {
    '@type': 'LocalBusiness',
    name: 'Next Level Game',
    telephone: '+961-3-919-876',
    address: { '@type': 'PostalAddress', addressLocality: 'Tripoli', addressCountry: 'LB' },
  },
  areaServed: { '@type': 'Country', name: 'Lebanon' },
  url: `${SITE_URL}/events/ngo`,
};

export function NgoEvents() {
  return (
    <LandingPage
      kicker="NGOs & Associations"
      h1="Games for NGO and Association Events in Lebanon"
      lead="We work with NGOs and associations running family days, community events and children activities across Lebanon. The part that matters most for this work is reach: we travel to villages and remote areas that most rental companies will not serve."
      title="Games for NGO Events in Lebanon | Next Level Game"
      description="Arcade, carnival and inflatable games for NGO family days and children activities anywhere in Lebanon, including remote villages. WhatsApp 03 919 876."
      canonical="/events/ngo"
      breadcrumb={[
        { label: 'Events', to: '/events/ngo' },
        { label: 'NGOs & Associations', to: '/events/ngo' },
      ]}
      sections={[
        {
          heading: 'We go where the activity is, not where it is convenient',
          body: 'Community work usually happens away from the main cities, and that is exactly where suppliers refuse to go. We do not. We have set up in the mountain village of Bqaakafra and in Aandqet in Akkar, as well as in Tripoli, Beirut, Koura and Chekka. If your activity is in a village, tell us where it is and we will plan the road and the power supply for it.',
        },
        {
          heading: 'Machines that work for a large group of children',
          body: 'A community day usually means many children, a wide age range and a fixed number of hours. That points to machines with very short rounds and no learning curve:',
          bullets: [
            'Inflatables and carnival stands — the most children per hour',
            'Hit Mickey Mouse, Pop Win and Stopwatch — a few seconds per turn',
            'Basketball and air hockey — simple, two-player, no explanation needed',
            'King of the Hammer — the one that makes the day feel like an event',
          ],
        },
        {
          heading: 'Power and ground conditions in village locations',
          body: 'Village and outdoor sites are the ones where a setup can fail: the generator cannot carry the load, or the ground will not take a machine. We ask about the power source and the ground when you enquire, not when we arrive, and if a machine will not work at your site we say so before you plan the day around it.',
        },
        {
          heading: 'Telling us your constraints up front helps',
          body: 'NGO budgets are usually fixed and approved in advance. Say the number when you contact us and we will tell you what it covers honestly — including if the answer is fewer machines than you hoped. That is a faster conversation than a quote you cannot approve.',
        },
      ]}
      faqs={[
        {
          question: 'Do you supply games for NGO and association events in Lebanon?',
          answer: 'Yes. Next Level Game supplies arcade, carnival and inflatable games for NGO and association family days, community events and children activities anywhere in Lebanon, including remote villages.',
        },
        {
          question: 'Will you travel to a remote village?',
          answer: 'Yes. We have set up in the mountain village of Bqaakafra and in Aandqet in Akkar, and covering the whole of Lebanon is a deliberate part of how we operate. Tell us the location and we plan the access and the power supply in advance.',
        },
        {
          question: 'Which games handle a large number of children in a few hours?',
          answer: 'Machines with very short rounds and no learning curve: inflatables and carnival stands, Hit Mickey Mouse, Pop Win, Stopwatch, basketball and air hockey. They move the most children through in the least time.',
        },
        {
          question: 'What if the site has no reliable electricity?',
          answer: 'Tell us the power source when you enquire. We will tell you what each machine draws and whether it will run on what you have. If a machine will not work at your site we say so before you plan the day around it.',
        },
        {
          question: 'We have a fixed approved budget. How should we approach you?',
          answer: 'Send the number along with the date and location. We will tell you what it covers, even if that means fewer machines than you hoped, rather than quoting for something you cannot approve.',
        },
      ]}
      whatsappMessage="Hi, we are an association organising an activity. Location: , Date: , Number of children: "
      ctaHeading="Running a community activity?"
      ctaBody="Send the location, the date and roughly how many children. Tell us the power source too if the site is outdoors or in a village."
      related={[
        { label: 'School and kindergarten events', to: '/events/schools' },
        { label: 'Complete festival supply', to: '/services/festival-supply' },
        { label: 'Arcade game rental', to: '/services/arcade-rental' },
        { label: 'See all the games', to: '/catalog' },
      ]}
      jsonLd={[serviceSchema]}
    />
  );
}
