import { Helmet } from 'react-helmet-async';

const SITE_NAME    = 'Tortrose';
const SITE_URL     = 'https://tortrose.com';
const TWITTER_SITE = '@TortroseHQ';
const DEFAULT_DESC = 'Tortrose — A modern marketplace for unique products from trusted independent sellers. Shop securely with multi-currency support and global shipping.';
const DEFAULT_IMG  = `${SITE_URL}/og-image.png`;

export default function SEOHead({
  title,
  description = DEFAULT_DESC,
  canonical,
  ogType    = 'website',
  ogImage   = DEFAULT_IMG,
  ogImageAlt,
  noindex   = false,
  jsonLd,
  children,
}) {
  const fullTitle    = title ? `${title} | ${SITE_NAME}` : `${SITE_NAME} — Modern Marketplace for Independent Sellers`;
  const canonicalUrl = canonical ? `${SITE_URL}${canonical}` : null;
  const imageAlt     = ogImageAlt || fullTitle;

  return (
    <Helmet>
      {/* ── Primary ───────────────────────────── */}
      <title>{fullTitle}</title>
      <meta name="description" content={description} />
      <meta name="robots" content={noindex ? 'noindex, nofollow' : 'index, follow, max-snippet:-1, max-image-preview:large, max-video-preview:-1'} />
      {canonicalUrl && <link rel="canonical" href={canonicalUrl} />}

      {/* ── Open Graph ────────────────────────── */}
      <meta property="og:site_name"   content={SITE_NAME} />
      <meta property="og:locale"      content="en_US" />
      <meta property="og:type"        content={ogType} />
      <meta property="og:title"       content={fullTitle} />
      <meta property="og:description" content={description} />
      {canonicalUrl && <meta property="og:url" content={canonicalUrl} />}
      <meta property="og:image"       content={ogImage} />
      <meta property="og:image:alt"   content={imageAlt} />
      <meta property="og:image:width"  content="1200" />
      <meta property="og:image:height" content="630" />

      {/* ── Twitter Card ──────────────────────── */}
      <meta name="twitter:card"        content="summary_large_image" />
      <meta name="twitter:site"        content={TWITTER_SITE} />
      <meta name="twitter:title"       content={fullTitle} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image"       content={ogImage} />
      <meta name="twitter:image:alt"   content={imageAlt} />

      {/* ── JSON-LD Structured Data ───────────── */}
      {jsonLd && (
        <script type="application/ld+json">{JSON.stringify(jsonLd)}</script>
      )}

      {children}
    </Helmet>
  );
}
