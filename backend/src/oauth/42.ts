import crypto from 'node:crypto';

const OAUTH_42_AUTHORIZE_URL = 'https://api.intra.42.fr/oauth/authorize';
const OAUTH_42_TOKEN_URL = 'https://api.intra.42.fr/oauth/token';
const OAUTH_42_ME_URL = 'https://api.intra.42.fr/v2/me';

type Env = {
  clientId: string;
  clientSecret: string;
  redirectUri: string;
};

function getEnv(): Env {
  const clientId = process.env.OAUTH_42_CLIENT_ID;
  const clientSecret = process.env.OAUTH_42_CLIENT_SECRET;
  const redirectUri = process.env.OAUTH_42_REDIRECT_URI;
  if (!clientId || !clientSecret || !redirectUri) {
    throw new Error('OAuth 42 configuration missing (check env vars)');
  }
  return { clientId, clientSecret, redirectUri };
}

export function buildAuthorizeUrl(): { url: string; state: string } {
  const { clientId, redirectUri } = getEnv();
  const state = crypto.randomBytes(24).toString('hex');
  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: redirectUri,
    response_type: 'code',
    scope: 'public',
    state,
  });
  return {
    url: `${OAUTH_42_AUTHORIZE_URL}?${params.toString()}`,
    state,
  };
}

export async function exchangeCodeForToken(code: string): Promise<string> {
  const { clientId, clientSecret, redirectUri } = getEnv();
  const response = await fetch(OAUTH_42_TOKEN_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'authorization_code',
      client_id: clientId,
      client_secret: clientSecret,
      code,
      redirect_uri: redirectUri,
    }).toString(),
  });

  if (!response.ok) {
    const text = await response.text().catch(() => '');
    throw new Error(`Token exchange failed (${response.status}): ${text}`);
  }

  const data = await response.json() as { access_token?: string };
  if (!data.access_token) {
    throw new Error('No access_token in token response');
  }
  return data.access_token;
}

export type FortyTwoProfile = {
  id: number;
  login: string;
  email: string;
  displayName: string;
  avatarUrl: string | null;
};

export async function fetchProfile(accessToken: string): Promise<FortyTwoProfile> {
  const response = await fetch(OAUTH_42_ME_URL, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch profile: ${response.status}`);
  }

  const data = await response.json() as {
    id: number;
    login: string;
    email: string;
    displayname?: string;
    image?: { link?: string | null } | null;
  };

  return {
    id: data.id,
    login: data.login,
    email: data.email,
    displayName: data.displayname ?? data.login,
    avatarUrl: data.image?.link ?? null,
  };
}