/**
 * ============================================================
 * EVENT PAGE — STORE OPENINGS AND BRAND ACTIVATIONS
 * ============================================================
 * Target search: "store opening games Lebanon", "attract crowd
 * to shop opening", "brand activation games Beirut / Tripoli".
 * ============================================================
 */

import React from 'react';
import { LandingPage } from '../../components/LandingPage';

const SITE_URL = 'https://nlgarcadesforevents.vercel.app';

const serviceSchema = {
  '@context': 'https://schema.org',
  '@type': 'Service',
  name: 'Games for Store Openings and Brand Activations',
  serviceType: 'Store opening entertainment',
  description:
    'Arcade and carnival games for store openings and brand activations in Lebanon, used to draw and hold a crowd in front of a new shop. Delivery, installation and on-site staff included.',
  provider: {
    '@type': 'LocalBusiness',
    name: 'Next Level Game',
    telephone: '+961-3-919-876',
    address: { '@type': 'PostalAddress', addressLocality: 'Tripoli', addressCountry: 'LB' },
  },
  areaServed: { '@type': 'Country', name: 'Lebanon' },
  url: `${SITE_URL}/events/store-openings`,
};

export function StoreOpenings() {
  return (
    <LandingPage
      kicker="Store Openings"
      h1="Games for Store Openings in Lebanon"
      lead="An opening only works if people stop. Next Level Game has supplied games for store openings in Beirut and Tripoli and for many shops elsewhere in Lebanon, using machines that pull a crowd off the street and keep it in front of your door."
      title="Store Opening Games in Lebanon | Next Level Game"
      description="Draw a crowd to your store opening in Lebanon with arcade and carnival games. Used at openings in Beirut and Tripoli. Delivery, setup and staff. WhatsApp 03 919 876."
      canonical="/events/store-openings"
      breadcrumb={[
        { label: 'Events', to: '/events/store-openings' },
        { label: 'Store Openings', to: '/events/store-openings' },
      ]}
      sections={[
        {
          heading: 'The problem an opening actually has',
          body: 'Balloons and a banner tell people that something opened. They do not make anyone stop walking. A machine does: it makes noise, it has a score, and there are already people standing around it — which is the signal a passer-by responds to. Once someone has stopped and played, they are inside your frontage long enough to look at what you sell.',
        },
        {
          heading: 'Machines that hold a pavement crowd',
          body: 'For an opening we pick for attention and for repeat plays rather than for long games:',
          bullets: [
            'King of the Hammer — the loudest draw we have, visible from down the street',
            'Boxing machine — a public score, so strangers start competing',
            'Human Claw Machine — the one people film and post, which carries your opening online',
            'Pop Win and prize games — a reason to come back and try again',
            'Inflatables — so families with children stay instead of walking on',
          ],
        },
        {
          heading: 'Openings in Beirut, Tripoli and beyond',
          body: 'We have supplied openings in Beirut and Tripoli and for shops in other parts of the country. Street frontage is tight and often shared, so the setup has to be planned: how much pavement you can actually use, where the power comes from, and how the queue forms without blocking the entrance. We work that out with you before the day.',
        },
        {
          heading: 'Branding and giveaways',
          body: 'If you are running a giveaway or a promotion, the games can be the mechanism for it — a score to beat, or a prize machine handing out your own items. Tell us what you want to give away and we will tell you which machine fits that idea.',
        },
      ]}
      faqs={[
        {
          question: 'How can I attract a crowd to my store opening in Lebanon?',
          answer: 'Give people a reason to stop. Arcade and carnival machines make noise, show a public score and gather a small crowd that passers-by join. Next Level Game has supplied games for openings in Beirut and Tripoli, including delivery, setup and on-site staff.',
        },
        {
          question: 'Which games work best in front of a shop?',
          answer: 'King of the Hammer is the strongest draw because it is loud and visible from down the street. A boxing machine creates public competition, prize games such as Pop Win bring people back for another try, and the Human Claw Machine is the one people film and share.',
        },
        {
          question: 'I only have a narrow pavement. Is that enough?',
          answer: 'Often yes, with the right machines. Tell us how much frontage you can use and where the power point is, and we will tell you what fits and how to position it so the queue does not block your entrance.',
        },
        {
          question: 'Can the games be branded for my shop or promotion?',
          answer: 'The games can carry your giveaway — a score to beat or a prize machine handing out your own items. Tell us what you want to give away and we will match it to a machine.',
        },
        {
          question: 'Can you do openings outside Beirut and Tripoli?',
          answer: 'Yes. We operate across the whole of Lebanon from our base in Tripoli, including smaller towns and mountain areas.',
        },
      ]}
      whatsappMessage="Hi, I am opening a store and want games. Town: , Date: , Available frontage: "
      ctaHeading="Opening a shop?"
      ctaBody="Send the town, the date and how much frontage you can use. We will tell you which machines will stop people on the street."
      related={[
        { label: 'Human Claw Machine', to: '/sponsorship' },
        { label: 'Arcade game rental', to: '/services/arcade-rental' },
        { label: 'Machines for your venue', to: '/services/revenue-share' },
        { label: 'See all the games', to: '/catalog' },
      ]}
      jsonLd={[serviceSchema]}
    />
  );
}
