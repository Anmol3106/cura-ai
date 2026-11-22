# Cura AI Project Status

Updated: 2026-10-13

## Completed

- Built a polished frontend-only Cura AI experience in the existing `frontend/` Next.js app.
- Implemented the opening C-logo intro animation with an interactive target, falling medical mask, heartbeat pulse drawn inside the C mark, cinematic exit, keyboard support, and reduced-motion fallback.
- Reworked the login/signup portal with Stitch-inspired burgundy/chalk styling, password visibility toggle, frontend validation, error states, status messaging, accessible labels, and UI-only demo routing to the dashboard.
- Implemented a responsive dashboard shell with the requested sidebar order: Home, New Chat, Recent Chats, Images & Reports, Billing & Plans, Settings, Profile, Help & Safety, and Log Out.
- Added dashboard sections for home, demo chat, recent chats, report/image upload validation, billing plan comparison, settings, profile, help/safety, and logout confirmation.
- Preserved the `backend/` folder. No backend files were modified.

## Incomplete / UI-Only

- Authentication is not connected to Clerk or any real identity provider.
- The chat uses local demo responses only. No AI backend or medical model is connected.
- File uploads are validated in the browser only. Files are not uploaded, stored, or analyzed.
- Billing and plan actions are UI-only. No payment processor is connected.
- Settings/profile values are static UI controls and are not persisted.
- Logout only returns to the login screen because real auth is not configured.

## Routes Available

- `/` - Intro animation plus login/signup portal.
- `/dashboard` - Responsive Cura AI dashboard with section navigation.

## Stitch Designs Used

The live Stitch MCP connection required reauthentication and could not be inspected through the app tools during this run. The user-provided Stitch export ZIP was used as the visual reference instead:

- `cura_ai_intro_landing/screen.png`
- `cura_ai_login/screen.png`
- `cura_ai_signup/screen.png`
- `cura_ai_dashboard_home/screen.png`
- `cura_ai_new_chat/screen.png`
- `cura_ai_recent_chats/screen.png`
- `cura_ai_images_reports/screen.png`
- `cura_ai_billing_plans/screen.png`
- `cura_ai_settings/screen.png`
- `clinical_precision_warm_luminescence/DESIGN.md`

The extracted reference copy is at `frontend/.stitch-reference/`.

## Files Changed Or Created

- `frontend/src/app/globals.css`
- `frontend/src/app/layout.tsx`
- `frontend/src/app/page.tsx`
- `frontend/src/app/theme.css`
- `frontend/src/app/dashboard/page.tsx`
- `frontend/src/app/dashboard/dashboard.module.css`
- `frontend/src/components/AuthCard.tsx`
- `frontend/src/components/AuthCard.module.css`
- `frontend/src/components/IntroScreen.tsx`
- `frontend/src/components/IntroScreen.module.css`
- `frontend/src/components/DropLink.tsx`
- `frontend/src/components/DropOverlay.tsx`
- `frontend/src/components/DropOverlay.module.css`
- `frontend/public/cura-logo.png`
- `frontend/.stitch-reference/`
- `frontend/next.config.ts`
- `PROJECT_STATUS.md`

Note: `frontend/next.config.ts` was adjusted to remove advanced Next cache/partial prefetch settings that caused Windows/OneDrive `EPERM` failures during static prerender output.

## Known Bugs / Risks

- The current dashboard is a single client page with internal section state, not separate dashboard subroutes.
- The app uses text placeholders for icons to avoid adding dependencies; replacing them with an icon package would improve polish.
- Manrope is specified in CSS, but no new font package or external font loading was added. If the system does not have Manrope, it falls back to Inter/system UI.
- The Stitch reference export is stored in the frontend folder for traceability and may be removed later if the project should stay lean.
- Advanced Next cache components and partial prefetching are disabled because they caused generated-build-directory permission failures in this local OneDrive workspace.

## Checks Run

- `npm run lint` - passed.
- `npm run build` - initially failed because Next.js could not remove stale generated `.next/types` output with `EPERM`.
- Cleared generated cache directory `frontend/.next/types`.
- `npm run build` - passed once, then later reproduced a Windows/OneDrive `EPERM` while creating `.next/server/app/_not-found.segments/_not-found`.
- Cleared generated build directory `frontend/.next`.
- Removed `cacheComponents` and `partialPrefetching` from `frontend/next.config.ts`.
- `npm run build` - passed after the config adjustment.
- `npm run lint` - passed after the final config adjustment.

## Exact Next Steps

1. Replace sidebar text placeholder icons with a real icon set such as `lucide-react`.
2. Split dashboard sections into dedicated App Router routes if deep links are required.
3. Add Clerk authentication and replace demo login/signup routing.
4. Add backend API endpoints for chat, conversation history, profile/settings persistence, and file upload.
5. Connect a real AI service with clear medical safety boundaries and audit logging.
6. Add file storage plus report/image analysis pipeline before claiming analysis results.
7. Add Stripe or another payment provider before enabling plan purchase states.
8. Add Playwright visual checks for intro animation, mobile layout, and dashboard navigation.
