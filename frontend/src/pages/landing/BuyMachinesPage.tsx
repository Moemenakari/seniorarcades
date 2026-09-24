/**
 * ============================================================
 * SERVICE PAGE — BUY ARCADE MACHINES
 * ============================================================
 * Target search: "buy arcade machine Lebanon", "arcade machines
 * for sale Lebanon", "import arcade machines from China".
 *
 * Deliberately silent on warranty length, lead times, customs
 * handling and prices — those are facts the business has not
 * confirmed, so the page asks instead of promising.
 * ============================================================
 */

import React from 'react';
import { LandingPage } from '../../components/LandingPage';

const SITE_URL = 'https://nlgarcadesforevents.vercel.app';

const serviceSchema = {
  '@context': 'https://schema.org',
  '@type': 'Service',
  name: 'Arcade Machine Sales and Import',
  serviceType: 'Arcade machine sales',
  description:
    'Sale of arcade and carnival game machines in Lebanon, including machines imported to order from China for arcades, malls, resorts and private venues.',
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
  url: `${SITE_URL}/services/buy-arcade-machines`,
  availableChannel: {
    '@type': 'ServiceChannel',
    servicePhone: '+961-3-919-876',
    serviceUrl: 'https://wa.me/96103919876',
  },
};

export function BuyMachines() {
  return (
    <LandingPage
      kicker="Machine Sales"
      h1="Buy Arcade Machines in Lebanon"
      lead="Next Level Game sells arcade and carnival game machines in Lebanon, including units imported to order from China. If you are opening an arcade, a play area or a games corner inside another business, we can source the machines and deliver them anywhere in the country."
      title="Buy Arcade Machines in Lebanon | Next Level Game"
      description="Buy arcade and carnival game machines in Lebanon, including imports from China. Sourcing, delivery and installation anywhere in the country. WhatsApp 03 919 876."
      canonical="/services/buy-arcade-machines"
      breadcrumb={[
        { label: 'Services', to: '/services' },
        { label: 'Buy Arcade Machines', to: '/services/buy-arcade-machines' },
      ]}
      sections={[
        {
          heading: 'Who buys machines from us',
          body: 'Buying makes sense when the games stay in one place and earn every day rather than appearing at a single event. The businesses that ask us for machines are usually:',
          bullets: [
            'New arcades and family entertainment centres',
            'Malls and shopping centres adding a games corner',
            'Resorts, pools and chalets with a kids area',
            'Restaurants and cafés that want people to stay longer',
            'Schools and universities building a permanent activity room',
            'Private buyers putting a machine in a home or a chalet',
          ],
        },
        {
          heading: 'Importing from China',
          body: 'We import machines to order from China, which is how the fleet we rent was built. That means you are not limited to what happens to be in stock in Lebanon: if you have seen a specific machine — a claw machine, a redemption unit, a racing cabinet, a basketball or hockey table — send us a photo or a model name and we tell you whether we can bring it and what it involves.',
        },
        {
          heading: 'Machines we know well',
          body: 'We run the same categories of machines in our own rental fleet, every day, at real events across Lebanon. That is a useful filter when you are choosing: we know which units survive heavy public use, which ones keep a queue moving, and which ones children lose interest in quickly. The ones we run ourselves include the Human Claw Machine, King of the Hammer, boxing, air hockey, basketball, shooting, drift car, Reflex, Stopwatch, Pop Win and Hit Mickey Mouse.',
        },
        {
          heading: 'Not sure yet whether to buy or rent?',
          body: 'Rent first. Take the machine you are considering for one event or one season, watch how your own crowd reacts to it, then decide. Plenty of buyers reach the right machine that way instead of guessing, and a rental costs a fraction of a purchase. If you would rather not buy at all, we also place machines in venues on a revenue-share basis, where we own and maintain the machine and you take a share of what it earns.',
        },
        {
          heading: 'How to ask for a price',
          body: 'Send a WhatsApp message to 03 919 876 with the type of machine you want, how many, and where in Lebanon it is going. If you already have a photo or a model number, send that too — it is the fastest way to a precise answer on availability and price.',
        },
      ]}
      faqs={[
        {
          question: 'Can I buy an arcade machine in Lebanon rather than importing it myself?',
          answer: 'Yes. Next Level Game sells arcade and carnival machines in Lebanon and imports units to order from China, so you deal with a local business in Tripoli instead of arranging a foreign purchase yourself. Contact us on WhatsApp at 03 919 876 with the machine you want.',
        },
        {
          question: 'Which arcade machine should I buy for a café or a shop?',
          answer: 'It depends on the space and on who plays. Machines with short rounds and a visible score, such as air hockey, Reflex or a boxing machine, suit places where people play while they wait. Prize and claw machines suit places where you want people to come back and try again. Tell us the space and the crowd and we will narrow it down.',
        },
        {
          question: 'Can I see a machine working before I buy it?',
          answer: 'The machines we sell are the same categories we rent out across Lebanon. Ask us where the unit you are interested in is running next, or rent it for one event first and decide afterwards.',
        },
        {
          question: 'Do you deliver a purchased machine and set it up?',
          answer: 'Yes, anywhere in Lebanon. We deliver the machine to the venue and install it, the same way we do for event rentals. Confirm the details with us on WhatsApp when you order.',
        },
        {
          question: 'How much does an arcade machine cost?',
          answer: 'It varies a lot by machine type, size and specification, so we quote per request rather than publishing a list. Send the machine type and quantity to 03 919 876 on WhatsApp and we come back with a price and availability.',
        },
      ]}
      whatsappMessage="Hi, I would like to buy an arcade machine. Machine type: , Quantity: , Location in Lebanon: "
      ctaHeading="Tell us which machine you want"
      ctaBody="Send the machine type, the quantity and where it is going. A photo or a model name gets you a precise answer faster."
      related={[
        { label: 'Rent instead of buying', to: '/services/arcade-rental' },
        { label: 'Revenue-share partnership', to: '/services/revenue-share' },
        { label: 'See the machines we run', to: '/catalog' },
        { label: 'About Next Level Game', to: '/about' },
      ]}
      jsonLd={[serviceSchema]}
    />
  );
}
