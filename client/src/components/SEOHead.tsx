import { useEffect } from "react";

interface SEOHeadProps {
  title: string;
  description: string;
  canonical?: string;
  ogImage?: string;
  ogType?: "website" | "article";
  keywords?: string;
  schema?: object;
  noIndex?: boolean;
}

const BASE_URL = "https://www.vibedia.com.br";
const DEFAULT_IMAGE = `${BASE_URL}/og-default.jpg`;

export default function SEOHead({
  title,
  description,
  canonical,
  ogImage,
  ogType = "website",
  keywords,
  schema,
  noIndex = false,
}: SEOHeadProps) {
  const fullTitle = title.includes("VibeDia") ? title : `${title} | VibeDia`;
  const canonicalUrl = canonical ? `${BASE_URL}${canonical}` : BASE_URL;
  const imageUrl = ogImage || DEFAULT_IMAGE;

  useEffect(() => {
    // Title
    document.title = fullTitle;

    // Meta description
    setMeta("description", description);

    // Keywords
    if (keywords) setMeta("keywords", keywords);

    // Robots
    setMeta("robots", noIndex ? "noindex, nofollow" : "index, follow");

    // Canonical
    setLink("canonical", canonicalUrl);

    // Open Graph
    setOgMeta("og:title", fullTitle);
    setOgMeta("og:description", description);
    setOgMeta("og:url", canonicalUrl);
    setOgMeta("og:image", imageUrl);
    setOgMeta("og:type", ogType);
    setOgMeta("og:site_name", "VibeDia");
    setOgMeta("og:locale", "pt_BR");

    // Twitter Card
    setOgMeta("twitter:card", "summary_large_image");
    setOgMeta("twitter:title", fullTitle);
    setOgMeta("twitter:description", description);
    setOgMeta("twitter:image", imageUrl);
    setOgMeta("twitter:site", "@VibeDia");

    // Schema.org JSON-LD
    if (schema) {
      let schemaEl = document.getElementById("schema-jsonld");
      if (!schemaEl) {
        schemaEl = document.createElement("script");
        schemaEl.id = "schema-jsonld";
        (schemaEl as HTMLScriptElement).type = "application/ld+json";
        document.head.appendChild(schemaEl);
      }
      schemaEl.textContent = JSON.stringify(schema);
    }

    return () => {
      // Cleanup schema on unmount
      const schemaEl = document.getElementById("schema-jsonld");
      if (schemaEl) schemaEl.remove();
    };
  }, [fullTitle, description, canonicalUrl, imageUrl, ogType, keywords, noIndex, schema]);

  return null;
}

function setMeta(name: string, content: string) {
  let el = document.querySelector(`meta[name="${name}"]`);
  if (!el) {
    el = document.createElement("meta");
    el.setAttribute("name", name);
    document.head.appendChild(el);
  }
  el.setAttribute("content", content);
}

function setOgMeta(property: string, content: string) {
  let el = document.querySelector(`meta[property="${property}"]`);
  if (!el) {
    el = document.createElement("meta");
    el.setAttribute("property", property);
    document.head.appendChild(el);
  }
  el.setAttribute("content", content);
}

function setLink(rel: string, href: string) {
  let el = document.querySelector(`link[rel="${rel}"]`);
  if (!el) {
    el = document.createElement("link");
    el.setAttribute("rel", rel);
    document.head.appendChild(el);
  }
  el.setAttribute("href", href);
}

// Schema helpers
export function articleSchema(title: string, description: string, url: string, datePublished: string, imageUrl?: string) {
  return {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: title,
    description,
    url: `https://www.vibedia.com.br${url}`,
    datePublished,
    dateModified: datePublished,
    image: imageUrl || "https://www.vibedia.com.br/og-default.jpg",
    publisher: {
      "@type": "Organization",
      name: "VibeDia",
      url: "https://www.vibedia.com.br",
      logo: {
        "@type": "ImageObject",
        url: "https://www.vibedia.com.br/logo.png",
      },
    },
    author: {
      "@type": "Organization",
      name: "VibeDia",
    },
  };
}

export function breadcrumbSchema(items: { name: string; url: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: `https://www.vibedia.com.br${item.url}`,
    })),
  };
}

export function webPageSchema(title: string, description: string, url: string) {
  return {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: title,
    description,
    url: `https://www.vibedia.com.br${url}`,
    inLanguage: "pt-BR",
    isPartOf: {
      "@type": "WebSite",
      name: "VibeDia",
      url: "https://www.vibedia.com.br",
    },
  };
}
