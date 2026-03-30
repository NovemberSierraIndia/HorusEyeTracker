const LINKEDIN_KEY = "horuseye-linkedin-posts";
const CERTS_KEY = "horuseye-certificates";

export function getLinkedInPosts(): string[] {
  if (typeof window === "undefined") return [];
  const stored = localStorage.getItem(LINKEDIN_KEY);
  return stored ? JSON.parse(stored) : [];
}

export function saveLinkedInPosts(posts: string[]) {
  localStorage.setItem(LINKEDIN_KEY, JSON.stringify(posts));
}

export interface Certificate {
  name: string;
  platform: string;
  duration: string;
  relevance: string;
  url: string;
  done: boolean;
}

export function getCertificates(): Certificate[] {
  if (typeof window === "undefined") return [];
  const stored = localStorage.getItem(CERTS_KEY);
  return stored ? JSON.parse(stored) : [];
}

export function saveCertificates(certs: Certificate[]) {
  localStorage.setItem(CERTS_KEY, JSON.stringify(certs));
}

export function toggleCertDone(index: number): Certificate[] {
  const certs = getCertificates();
  if (certs[index]) {
    certs[index].done = !certs[index].done;
    saveCertificates(certs);
  }
  return certs;
}
