import React from 'react';
import { Helmet } from 'react-helmet-async';

const SITE_URL = 'https://nlgarcadesforevents.vercel.app';
const DEFAULT_IMAGE = `${SITE_URL}/favicon.png`;

interface SeoProps {
  /** Page title, rendered as-is (keep under 60 characters). */
  title: string;
  /** Meta description (keep to 150-160 characters). */
  description: string;
  /** Path of the current page, e.g. "/catalog". */
  canonical: string;
  /** Absolute image URL used for social previews. Defaults to the site favicon. */
  image?: string;
  /** One or more JSON-LD structured data objects to inject as <script type="application/ld+json"> tags. */
  jsonLd?: object | object[];
  /** Set true to keep a thin/error page (e.g. a missing product) out of search results. */
  noindex?: boolean;
}

export function Seo({ title, description, canonical, image = DEFAULT_IMAGE, jsonLd, noindex }: SeoProps) {
  const url = `${SITE_URL}${canonical}`;
  const schemas = jsonLd ? (Array.isArray(jsonLd) ? jsonLd : [jsonLd]) : [];

  return (
    <Helmet>
      <title>{title}</title>
      <meta name="description" content={description} />
      <link rel="canonical" href={url} />
      {noindex && <meta name="robots" content="noindex, follow" />}

      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:url" content={url} />
      <meta property="og:image" content={image} />

      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={image} />

      {schemas.map((schema, index) => (
        <script key={index} type="application/ld+json">
          {JSON.stringify(schema)}
        </script>
      ))}
    </Helmet>
  );
}
