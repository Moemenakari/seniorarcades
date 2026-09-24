/**
 * ============================================================
 * SERVICE PAGE — ARCADE GAME RENTAL
 * ============================================================
 * Target search: "arcade game rental Lebanon", "rent carnival
 * games Lebanon", "arcade machine rental Beirut / Tripoli".
 *
 * Every claim on this page is one the business has confirmed.
 * No prices appear here: they depend on the game count, the
 * number of days and the distance, so the page asks for contact
 * instead of quoting a number nobody promised.
 * ============================================================
 */

import React from 'react';
import { LandingPage } from '../../components/LandingPage';

const SITE_URL = 'https://nlgarcadesforevents.vercel.app';

const serviceSchema = {
  '@context': 'https://schema.org',
  '@type': 'Service',
  name: 'Arcade and Carnival Game Rental',
  serviceType: 'Arcade game rental',
  description:
    'Rental of arcade and carnival game machines for events anywhere in Lebanon, including delivery, installation, power planning and on-site staff.',
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
  url: `${SITE_URL}/services/arcade-rental`,
  availableChannel: {
    '@type': 'ServiceChannel',
    servicePhone: '+961-3-919-876',
    serviceUrl: 'https://wa.me/96103919876',
  },
};

export function ArcadeRental() {
  return (
    <LandingPage
      kicker="Rental Service"
      h1="Arcade Game Rental in Lebanon"
      lead="Next Level Game rents arcade and carnival game machines for events anywhere in Lebanon. Our fleet covers 15 games and we have delivered more than 1,000 events over four years. We deliver, install, plan the power supply and staff the games, then take everything away when the event ends."
      title="Arcade Game Rental in Lebanon | Next Level Game"
      description="Rent arcade and carnival games anywhere in Lebanon. Delivery, installation, power planning and on-site staff included. WhatsApp 03 919 876 for a quote."
      canonical="/services/arcade-rental"
      breadcrumb={[
        { label: 'Services', to: '/services' },
        { label: 'Arcade Rental', to: '/services/arcade-rental' },
      ]}
      sections={[
        {
          heading: 'What you can rent',
          body: 'The fleet covers both arcade machines and classic carnival games, so a single event can mix skill games, sports games and prize games. The most requested units are:',
          bullets: [
            'Human Claw Machine — the crane game played with a real person instead of a toy',
            'King of the Hammer — the strength tester with the climbing light tower',
            'Boxing machine and Hit Mickey Mouse',
            'Air hockey, basketball, shooting and drift car simulators',
            'Reflex, Stopwatch and Pop Win prize games',
            'Inflatables and carnival stands for open-air events',
          ],
        },
        {
          heading: 'We cover the whole of Lebanon, not just the cities',
          body: 'Most rental companies in Lebanon stop at Beirut and the coast. We do not. Our team has run events in Tripoli, Beirut, Koura, Akkar and Chekka, and in mountain villages such as Bqaakafra, where the road and the power supply need planning in advance. If your venue is far from a main road, tell us where it is and we will tell you exactly what we need to get the machines there.',
        },
        {
          heading: 'What is included in a rental',
          body: 'A rental is not a drop-off. The price you agree on covers the whole operation, so nobody on your side has to think about the games on the day:',
          bullets: [
            'Delivery to the venue and collection afterwards',
            'Installation, testing and calibration before the first guest arrives',
            'Power planning — we tell you what each machine draws and how to distribute the load',
            'Trained on-site staff who run the games and manage the queue',
            'A replacement or a fix if a machine stops working during the event',
          ],
        },
        {
          heading: 'Who rents from us',
          body: 'Universities and schools are our most frequent clients — we have run days at Balamand, BAU, AUB, LIU and USJ — alongside NGOs and associations, kindergartens, store openings in Beirut and Tripoli, festivals, and private birthdays. Each of those needs a different mix: a birthday wants two or three machines a child can play alone, while a festival needs machines that keep a long queue moving.',
        },
        {
          heading: 'How to book',
          body: 'Send a WhatsApp message to 03 919 876 with three things: the date, the town or venue, and roughly how many people you expect. We answer with the machines that fit the space and a price for the whole setup. Booking earlier matters most in the festival season and at the end of the school year, when several events fall on the same weekend.',
        },
      ]}
      faqs={[
        {
          question: 'Do you deliver outside Beirut and Tripoli?',
          answer: 'Yes. We cover the whole of Lebanon, including mountain and remote villages. We have delivered to Akkar, Chekka, Koura — including Amioun and Kousba — and the mountain village of Bqaakafra. Tell us the exact location and we plan the access and the power supply before the event date.',
        },
        {
          question: 'How much does it cost to rent an arcade game in Lebanon?',
          answer: 'The price depends on how many machines you need, how many days you keep them, and how far the venue is from Tripoli. Send the date, the location and the expected number of guests on WhatsApp to 03 919 876 and you get a price for the full setup, including delivery and staff.',
        },
        {
          question: 'Can you supply the games for a whole festival, not just one machine?',
          answer: 'Yes. We supply complete festivals with multiple machines, delivery, installation, power planning and on-site staff for the duration of the event. That is one of the services we are set up for specifically.',
        },
        {
          question: 'Do the machines need electricity at the venue?',
          answer: 'Most arcade machines do. Carnival stands and inflatables vary. We tell you what each machine you pick draws and how to distribute it, and we plan this with you before the event rather than on the day.',
        },
        {
          question: 'Do you provide staff to run the games?',
          answer: 'Yes. Trained staff come with the machines, run the games and manage the queue. You do not need to assign anyone from your own team.',
        },
        {
          question: 'How far in advance should I book?',
          answer: 'As early as you can, especially in the festival season and at the end of the school year, when several events fall on the same weekend. Contact us as soon as you have a date, even if the details are not final.',
        },
      ]}
      whatsappMessage="Hi, I would like to rent arcade games. Date: , Location: , Expected guests: "
      ctaHeading="Tell us the date and the town"
      ctaBody="Send the date, the venue and roughly how many guests you expect, and we will tell you which machines fit and what the whole setup costs."
      related={[
        { label: 'Complete festival supply', to: '/services/festival-supply' },
        { label: 'Buy an arcade machine', to: '/services/buy-arcade-machines' },
        { label: 'Human Claw Machine', to: '/sponsorship' },
        { label: 'See all the games', to: '/catalog' },
      ]}
      jsonLd={[serviceSchema]}
    />
  );
}
