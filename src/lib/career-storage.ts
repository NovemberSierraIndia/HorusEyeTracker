const LINKEDIN_KEY = "horuseye-linkedin-posts";
const PAST_POSTS_KEY = "horuseye-past-linkedin-posts";
const SMART_TOPICS_KEY = "horuseye-smart-topics";
const CERTS_KEY = "horuseye-certificates";

export function getLinkedInPosts(): string[] {
  if (typeof window === "undefined") return [];
  const stored = localStorage.getItem(LINKEDIN_KEY);
  return stored ? JSON.parse(stored) : [];
}

export function saveLinkedInPosts(posts: string[]) {
  localStorage.setItem(LINKEDIN_KEY, JSON.stringify(posts));
}

// Past LinkedIn posts (user-saved for topic analysis)
export function getPastPosts(): string[] {
  if (typeof window === "undefined") return [];
  const stored = localStorage.getItem(PAST_POSTS_KEY);
  return stored ? JSON.parse(stored) : [];
}

export function savePastPosts(posts: string[]) {
  localStorage.setItem(PAST_POSTS_KEY, JSON.stringify(posts));
}

export function addPastPost(post: string): string[] {
  const posts = getPastPosts();
  posts.unshift(post.trim());
  savePastPosts(posts);
  return posts;
}

export function removePastPost(index: number): string[] {
  const posts = getPastPosts();
  posts.splice(index, 1);
  savePastPosts(posts);
  return posts;
}

// Smart topic suggestions (AI-generated from past posts)
export function getSmartTopics(): string[] {
  if (typeof window === "undefined") return [];
  const stored = localStorage.getItem(SMART_TOPICS_KEY);
  return stored ? JSON.parse(stored) : [];
}

export function saveSmartTopics(topics: string[]) {
  localStorage.setItem(SMART_TOPICS_KEY, JSON.stringify(topics));
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
