/**
 * ============================================================
 * EVENT PAGE — SCHOOLS AND KINDERGARTENS
 * ============================================================
 * Target search: "games for school fun day Lebanon", "school
 * fair games rental", "kindergarten party games Lebanon".
 * ============================================================
 */

import React from 'react';
import { LandingPage } from '../../components/LandingPage';

const SITE_URL = 'https://nlgarcadesforevents.vercel.app';

const serviceSchema = {
  '@context': 'https://schema.org',
  '@type': 'Service',
  name: 'Arcade and Carnival Games for Schools',
  serviceType: 'School event entertainment',
  description:
    'Arcade, carnival and inflatable games for school fun days, fairs and kindergarten parties across Lebanon, with delivery, installation and supervised on-site staff.',
  provider: {
    '@type': 'LocalBusiness',
    name: 'Next Level Game',
    telephone: '+961-3-919-876',
    address: { '@type': 'PostalAddress', addressLocality: 'Tripoli', addressCountry: 'LB' },
  },
  areaServed: { '@type': 'Country', name: 'Lebanon' },
  url: `${SITE_URL}/events/schools`,
};

export function SchoolEvents() {
  return (
    <LandingPage
      kicker="Schools & Kindergartens"
      h1="Games for School Fun Days and Fairs in Lebanon"
      lead="Next Level Game supplies arcade, carnival and inflatable games for school fun days, fairs and kindergarten parties anywhere in Lebanon. Our staff run the games and supervise the queue, so teachers are not left managing machines."
      title="School Fun Day Games in Lebanon | Next Level Game"
      description="Arcade, carnival and inflatable games for school fun days, fairs and kindergarten parties across Lebanon. Staff supervise the games. WhatsApp 03 919 876."
      canonical="/events/schools"
      breadcrumb={[
        { label: 'Events', to: '/events/schools' },
        { label: 'Schools', to: '/events/schools' },
      ]}
      sections={[
        {
          heading: 'Games matched to the age group',
          body: 'A school day usually spans several age groups at once, and a machine that thrills a fifteen-year-old is wrong for a five-year-old. We split the area accordingly:',
          bullets: [
            'Kindergarten and early years — inflatables and carnival stands',
            'Primary — Hit Mickey Mouse, basketball, air hockey, Pop Win',
            'Intermediate and secondary — boxing, King of the Hammer, shooting, drift car, Reflex',
            'All ages — the Human Claw Machine, which parents queue for as well',
          ],
        },
        {
          heading: 'Supervision is part of the service',
          body: 'Our staff stay with the machines and manage the turns. That matters more at a school than anywhere else: the queue stays orderly, younger children are not pushed aside by older ones, and no teacher gets pulled away to referee a machine. Installation is checked and tested before the children are let in, not while they are waiting.',
        },
        {
          heading: 'Fairs, end-of-year days and fundraising events',
          body: 'For a school fair or a fundraising day, a games area gives families a reason to stay on the grounds rather than leaving after half an hour — which is usually the difference between a quiet fair and a busy one. The same setup works for end-of-year celebrations, sports days and open days.',
        },
        {
          heading: 'Anywhere in Lebanon, including village schools',
          body: 'We deliver to schools across the whole country, not only in Beirut and Tripoli. Village and mountain schools are part of our normal range — we have set up in mountain areas including Bikaakafra and Hadath El Jebbeh — and we plan the access and the power supply with you before the date.',
        },
      ]}
      faqs={[
        {
          question: 'Do you rent games for school fun days in Lebanon?',
          answer: 'Yes. Next Level Game supplies arcade, carnival and inflatable games for school fun days, fairs, kindergarten parties and end-of-year events anywhere in Lebanon, including delivery, installation and staff who supervise the games.',
        },
        {
          question: 'Are the games suitable for young children?',
          answer: 'We match the machines to the age groups attending. Inflatables and carnival stands suit kindergarten and early years, while boxing, King of the Hammer and the simulators suit older students. Tell us the age range and we build the mix around it.',
        },
        {
          question: 'Do teachers have to supervise the machines?',
          answer: 'No. Our own staff stay with the machines, manage the turns and keep the queue orderly for the whole event.',
        },
        {
          question: 'Can you come to a school outside the main cities?',
          answer: 'Yes. We cover the whole of Lebanon, including village and mountain schools. We plan the access road and the power supply with you in advance.',
        },
        {
          question: 'How much space does a school setup need?',
          answer: 'It depends on how many machines you want and which ones. Send us the area you can give the games — a playground, a hall or a yard — and we will tell you what fits in it.',
        },
      ]}
      whatsappMessage="Hi, we are organising a school event. School: , Town: , Date: , Age groups: "
      ctaHeading="Planning a school day?"
      ctaBody="Send the school, the town, the date and the age groups attending. We will propose a mix of games that fits the space and the ages."
      related={[
        { label: 'University events', to: '/events/universities' },
        { label: 'NGO and association events', to: '/events/ngo' },
        { label: 'Birthday parties', to: '/events/birthdays' },
        { label: 'See all the games', to: '/catalog' },
      ]}
      jsonLd={[serviceSchema]}
    />
  );
}
