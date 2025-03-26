import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Utility function to remove all metadata from the document
 * This can be useful when you want to ensure no metadata is being served
 * for specific pages or routes
 */
export function cleanDocumentMetadata() {
  if (typeof window === 'undefined') {
    return; // Only run in browser
  }

  // Remove meta tags
  const metaTags = document.querySelectorAll('meta');
  metaTags.forEach(tag => {
    // Keep only required meta tags like viewport, charset, etc.
    const name = tag.getAttribute('name');
    const property = tag.getAttribute('property');
    
    if (
      // Keep viewport and charset meta tags
      name !== 'viewport' && 
      !tag.hasAttribute('charset') &&
      // Remove all OpenGraph tags
      (property?.startsWith('og:') || 
      // Remove Twitter tags
      property?.startsWith('twitter:') ||
      // Remove other common metadata tags
      ['description', 'keywords', 'author'].includes(name || ''))
    ) {
      tag.remove();
    }
  });

  // Remove link tags related to metadata
  const linkTags = document.querySelectorAll('link');
  linkTags.forEach(tag => {
    const rel = tag.getAttribute('rel');
    if (['canonical', 'alternate', 'icon', 'apple-touch-icon', 'manifest'].includes(rel || '')) {
      tag.remove();
    }
  });

  // Remove title tag content
  const titleTag = document.querySelector('title');
  if (titleTag) {
    titleTag.textContent = '';
  }

  // Remove JSON-LD scripts
  const scripts = document.querySelectorAll('script[type="application/ld+json"]');
  scripts.forEach(script => script.remove());
}