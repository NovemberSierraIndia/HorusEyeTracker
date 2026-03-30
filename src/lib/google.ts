export async function googleFetch(url: string, accessToken: string) {
  const res = await fetch(url, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  if (!res.ok) {
    throw new Error(`Google API error: ${res.status} ${res.statusText}`);
  }
  return res.json();
}
