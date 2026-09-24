/**
 * ============================================================
 * EVENT PAGE — UNIVERSITY EVENTS
 * ============================================================
 * Target search: "games for university event Lebanon",
 * "activities for university day", "arcade rental AUB / LIU".
 *
 * The named universities are ones the business has actually
 * worked with. Nothing here claims a number of events.
 * ============================================================
 */

import React from 'react';
import { LandingPage } from '../../components/LandingPage';

const SITE_URL = 'https://nlgarcadesforevents.vercel.app';

const serviceSchema = {
  '@context': 'https://schema.org',
  '@type': 'Service',
  name: 'Arcade Games for University Events',
  serviceType: 'University event entertainment',
  description:
    'Arcade and carnival games for university activity days, club fairs and campus events across Lebanon, including delivery, installation and on-site staff.',
  provider: {
    '@type': 'LocalBusiness',
    name: 'Next Level Game',
    telephone: '+961-3-919-876',
    address: { '@type': 'PostalAddress', addressLocality: 'Tripoli', addressCountry: 'LB' },
  },
  areaServed: { '@type': 'Country', name: 'Lebanon' },
  audience: { '@type': 'EducationalAudience', educationalRole: 'student' },
  url: `${SITE_URL}/events/universities`,
};

export function UniversityEvents() {
  return (
    <LandingPage
      kicker="University Events"
      h1="Arcade Games for University Events in Lebanon"
      lead="Universities are among our most frequent clients. Next Level Game has brought games to campuses including Balamand, BAU, AUB, LIU and USJ, and we handle the delivery, the setup and the staff so the student committee can run the rest of the day."
      title="Arcade Games for University Events in Lebanon"
      description="Games for university activity days and club fairs in Lebanon. Delivery, setup and staff included. Campuses we have worked with include AUB, LIU, BAU, Balamand and USJ."
      canonical="/events/universities"
      breadcrumb={[
        { label: 'Events', to: '/events/universities' },
        { label: 'Universities', to: '/events/universities' },
      ]}
      sections={[
        {
          heading: 'Campuses we have worked with',
          body: 'We have run games at the University of Balamand, Beirut Arab University, the American University of Beirut, the Lebanese International University and Université Saint-Joseph. Working on a campus has its own rules — a delivery window, a security gate, a power point that has to be agreed with facilities — and we plan those with your committee in advance instead of arriving and improvising.',
        },
        {
          heading: 'What works on a campus',
          body: 'Student crowds arrive in bursts between classes, so the machines that work are the ones with short rounds and a public score. A leaderboard turns a queue into a competition, which is exactly what an activity day needs. The usual picks:',
          bullets: [
            'King of the Hammer — draws a crowd from across the courtyard',
            'Boxing machine — the score on the screen starts the competition',
            'Basketball and air hockey — fast, two-player, self-explanatory',
            'Reflex and Stopwatch — a few seconds per go, so the queue keeps moving',
            'Human Claw Machine — the one people film and post',
          ],
        },
        {
          heading: 'Club fairs, activity days and orientation weeks',
          body: 'A games stand gives a club something to gather people around, which is the hard part of a fair. For orientation weeks and multi-day activity weeks our staff stay with the machines for the full run, opening and closing them on schedule each day, so nobody from the committee has to be on duty.',
        },
        {
          heading: 'Working with a student committee',
          body: 'Send us the date, the campus and the area you have been allocated, and we will tell you which machines fit it and what the setup costs. If the budget is fixed — which on a student committee it usually is — say the number and we will tell you honestly what it covers, rather than quoting for a setup you cannot approve.',
        },
      ]}
      faqs={[
        {
          question: 'Do you supply games for university events in Lebanon?',
          answer: 'Yes. Next Level Game supplies arcade and carnival games for university activity days, club fairs and campus events, and has worked with campuses including Balamand, BAU, AUB, LIU and USJ. Delivery, installation and on-site staff are included.',
        },
        {
          question: 'Which games are best for a university activity day?',
          answer: 'Machines with short rounds and a visible score, because student crowds arrive in bursts between classes. King of the Hammer, the boxing machine, basketball, air hockey, Reflex and Stopwatch all keep a queue moving, and the Human Claw Machine is the one students tend to film.',
        },
        {
          question: 'Can you set up indoors, in a courtyard or in a hall?',
          answer: 'All three. What matters is the area you have been allocated and where the power point is. Send us both and we will tell you which machines fit.',
        },
        {
          question: 'Can you handle a multi-day activity week?',
          answer: 'Yes. Our staff stay with the machines for the whole run and open and close them on schedule each day, so the student committee does not need to staff the stand.',
        },
        {
          question: 'We have a fixed committee budget. Can you work with it?',
          answer: 'Tell us the number when you contact us. We will tell you what it covers rather than quoting for a setup the committee cannot approve.',
        },
      ]}
      whatsappMessage="Hi, we are organising a university event. Campus: , Date: , Allocated area: "
      ctaHeading="Organising a campus event?"
      ctaBody="Send the campus, the date and the area you have been allocated. We will tell you which machines fit and what the setup costs."
      related={[
        { label: 'School events', to: '/events/schools' },
        { label: 'Complete festival supply', to: '/services/festival-supply' },
        { label: 'Arcade game rental', to: '/services/arcade-rental' },
        { label: 'See all the games', to: '/catalog' },
      ]}
      jsonLd={[serviceSchema]}
    />
  );
}
