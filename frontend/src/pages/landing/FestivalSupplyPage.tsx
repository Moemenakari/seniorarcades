/**
 * ============================================================
 * SERVICE PAGE — COMPLETE FESTIVAL SUPPLY
 * ============================================================
 * Target search: "festival games Lebanon", "carnival games for
 * festival Lebanon", "games supplier for event Lebanon".
 *
 * This is the differentiator page: not one machine, but the
 * whole games section of a festival — machines, delivery,
 * installation, power planning and staff.
 * ============================================================
 */

import React from 'react';
import { LandingPage } from '../../components/LandingPage';

const SITE_URL = 'https://nlgarcadesforevents.vercel.app';

const serviceSchema = {
  '@context': 'https://schema.org',
  '@type': 'Service',
  name: 'Complete Festival Game Supply',
  serviceType: 'Event game supply',
  description:
    'Supply of the entire games section of a festival in Lebanon: multiple arcade and carnival machines, delivery, installation, power planning and on-site staff for the duration of the event.',
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
  url: `${SITE_URL}/services/festival-supply`,
  availableChannel: {
    '@type': 'ServiceChannel',
    servicePhone: '+961-3-919-876',
    serviceUrl: 'https://wa.me/96103919876',
  },
};

export function FestivalSupply() {
  return (
    <LandingPage
      kicker="Festival Supply"
      h1="Festival Games in Lebanon — Complete Supply"
      lead="Next Level Game can supply the entire games section of a festival: multiple machines, delivery, installation, power planning and on-site staff for the whole run of the event. You book one supplier instead of coordinating several."
      title="Festival Games Supplier in Lebanon | Next Level Game"
      description="We supply the whole games section of a festival in Lebanon — multiple machines, delivery, installation, power planning and staff. WhatsApp 03 919 876."
      canonical="/services/festival-supply"
      breadcrumb={[
        { label: 'Services', to: '/services' },
        { label: 'Festival Supply', to: '/services/festival-supply' },
      ]}
      sections={[
        {
          heading: 'One supplier for the whole games area',
          body: 'Organising a festival usually means chasing a different supplier for every part of it. For the games area you do not need to: we bring the machines, the logistics and the people who run them. What that covers:',
          bullets: [
            'A mix of machines chosen for the space and the expected crowd',
            'Delivery to the site, including sites off the main roads',
            'Installation, testing and a safety check before opening',
            'Power planning — what each machine draws and how to distribute the load',
            'On-site staff running the games for the full duration',
            'Takedown and collection once the festival closes',
          ],
        },
        {
          heading: 'Choosing a mix, not a list',
          body: 'A games area works when the machines do different jobs. Fast machines with short rounds keep a queue moving. A strength tester such as King of the Hammer draws a crowd and creates the noise that pulls people towards your area. A prize or claw machine gives people a reason to come back a second and third time. Inflatables and carnival stands hold the younger children while the older ones queue for the arcade units. We build the mix around your crowd rather than sending whatever is free that weekend.',
        },
        {
          heading: 'Power and access are planned before the day',
          body: 'This is where outdoor events in Lebanon go wrong. Machines need a power supply that holds for hours, and mountain and village sites often need the load distributed differently from a city venue. We ask about the power source, the ground and the access road in advance, then tell you exactly what is needed. We have set up in Tripoli, Beirut, Koura, Chekka and Akkar — including Aandqet — and in the mountain village of Bqaakafra.',
        },
        {
          heading: 'Festivals, fairs and multi-day events',
          body: 'The same setup works for a municipal festival, a university activity week, a school fair, a Christmas market, an NGO family day or a mall activation that runs across several days. For multi-day events our staff stay with the machines for the whole run, so the games open and close on schedule every day without anyone from your team managing them.',
        },
        {
          heading: 'What we need from you to plan it',
          body: 'Four things: the dates, the exact location, the expected number of visitors, and the space you can give the games area in square metres. With those we come back with a proposed mix of machines, the layout and the price for the complete setup. The earlier you send them, the more of the fleet is still open for your dates.',
        },
      ]}
      faqs={[
        {
          question: 'Can one company supply all the games for a festival in Lebanon?',
          answer: 'Yes. Next Level Game supplies the complete games section — multiple arcade and carnival machines, delivery, installation, power planning and on-site staff for the duration of the festival. You deal with one supplier instead of several.',
        },
        {
          question: 'How many machines do I need for my festival?',
          answer: 'It depends on the expected number of visitors and on the space available for the games area. Send us the visitor estimate and the area in square metres and we propose a mix that keeps queues moving instead of one that leaves machines idle.',
        },
        {
          question: 'Can you set up at an outdoor or mountain site?',
          answer: 'Yes. We have set up at sites across Lebanon, including the mountain village of Bqaakafra and Aandqet in Akkar. We plan the access road and the power supply with you before the event date rather than discovering the problem on the day.',
        },
        {
          question: 'Who operates the machines during the festival?',
          answer: 'Our own trained staff. They run the games, manage the queue and stay for the whole duration of the event, including across multiple days.',
        },
        {
          question: 'What happens if a machine breaks down mid-event?',
          answer: 'Our staff are on site for the whole event, so a fault gets handled immediately — either fixed on the spot or the unit is swapped out. You are not left with a dead machine in the middle of your games area.',
        },
        {
          question: 'How far in advance should a festival be booked?',
          answer: 'As early as possible. A festival uses several machines at once, so the constraint is fleet availability on your dates — especially in the festival season and at the end of the school year, when events cluster on the same weekends.',
        },
      ]}
      whatsappMessage="Hi, I am organising a festival and need games. Dates: , Location: , Expected visitors: , Space for the games area: "
      ctaHeading="Planning a festival? Send us four things"
      ctaBody="The dates, the exact location, the expected number of visitors and the space you can give the games area. We come back with a proposed mix and a price for the complete setup."
      related={[
        { label: 'Arcade game rental', to: '/services/arcade-rental' },
        { label: 'University events', to: '/events/universities' },
        { label: 'Human Claw Machine', to: '/sponsorship' },
        { label: 'Build your event', to: '/build-your-event' },
      ]}
      jsonLd={[serviceSchema]}
    />
  );
}
