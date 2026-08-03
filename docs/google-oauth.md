# Google OAuth Setup (ZERVEY)

ZERVEY uses Supabase Auth with Google as the primary OAuth provider. The in-app
auth code is complete and correct; the most common failure — **"Access blocked:
authorization failed"** / OpenID errors — is a configuration issue on the Google
or Supabase side, not a code bug.

This guide walks through a working end-to-end setup.

## Prerequisites

- A Google Cloud project (or permission to create one)
- A Supabase project (free tier is fine)
- The app's public URL (e.g. `http://localhost:3000` in dev, your Vercel URL in prod)

## 1. Supabase — enable Google provider

1. Supabase Dashboard → **Authentication → Providers** → enable **Google**.
2. Copy the **Redirect URL** Supabase shows you (it looks like
   `https://<project-ref>.supabase.co/auth/v1/callback`). You'll paste it into
   Google below.
3. Temporarily (or permanently) add the app's URL to **Authentication → URL
   Configuration → Site URL**, and confirm `{origin}/auth/callback` is reachable.

## 2. Google Cloud Console — create OAuth client

1. Go to [Google Cloud Console](https://console.cloud.google.com/apis/credentials).
2. Create or select your project.
3. **APIs & Services → OAuth consent screen**:
   - User type: **External**.
   - Scope: ensure `.../auth/userinfo.email`, `.../auth/userinfo.profile`,
     and `openid` are present (the consent screen adds these automatically).
   - **Publishing status** must be **In production**. While it is in
     *Testing* mode, only explicitly added *test users* can sign in — everyone
     else gets "Access blocked".
   - Add your own Google account as a **test user** while you develop.
4. **Credentials → Create Credentials → OAuth client ID**:
   - Application type: **Web application**.
   - **Authorized JavaScript origins**: add the app origin
     (`http://localhost:3000` and/or your production origin).
   - **Authorized redirect URIs**: add **exactly** the Supabase Redirect URL
     from step 1 (plus `{origin}/auth/callback` if you ever wire PKCE directly).
5. Copy the **Client ID** and **Client secret**.

## 3. Back to Supabase

1. **Authentication → Providers → Google**: paste the Client ID and Client
   secret.
2. Save. Changes are usually live within a few minutes.

## 4. Verify

```bash
npm run dev
```

Open `/login`, click **Continue with Google**, and complete the consent flow.
You should land back on `/dashboard` signed in.

### Common failure checklist

| Symptom                                    | Likely cause                                  | Fix                                        |
| ------------------------------------------ | --------------------------------------------- | ------------------------------------------ |
| "Access blocked: authorization failed"     | Consent screen in **Testing** mode / user not a test user | Publish the app, or add the user as a test user |
| `redirect_uri_mismatch`                    | Redirect URI not whitelisted                  | Add the exact Supabase callback to Google  |
| `invalid_client`                           | Wrong Client ID/secret, or not propagated     | Recheck Supabase → Google credentials; wait 5 min |
| OpenID provider error in the browser       | Consent screen scope misconfigured            | Confirm `openid`/email/profile scopes      |
| Loop back to the auth page                 | Callback not refreshing the session           | Verify Site URL / redirect config in Supabase |

## 5. Where the code lives

- `lib/supabase/client.ts` — browser client
- `middleware.ts` — session refresh on protected routes
- `app/auth/callback/route.ts` — OAuth callback → code exchange
- `app/(auth)/login/page.tsx` & `signup/page.tsx` — provider buttons; they also
  render `components/shared/OAuthErrorPanel.tsx` when Google returns an
  access-blocked error, so users see this checklist in-app.

## Note on the in-app error panel

The login/signup pages automatically detect Google access-blocked / OpenID
failures and show a condensed version of this guide with a "Copy callback URL"
button and a shortcut to the Google Console — no need to dig through docs.
