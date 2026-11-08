# Production deployment

- Repository: https://github.com/RyanStanLin/TelegramCopilot-Web
- Deployment branch: `main`
- Console: https://telegramcopilot.ryanl.in
- API: https://telegramcopilot-api.ryanl.in
- Declaration: `paas.json`; Node port 3000; readiness `/api/auth/status`.
- Platform workflows are pinned to the server-approved commit `472a450fa4a7f8caca1b8b7c2b451eb7758dc442`.

## Updates

A normal commit/push to `main` runs CSS validation, production build, TypeScript and all 11 browser checks. The tests use a disposable local backend at a reviewed fixed source commit, disabled Telegram fixtures and a virtual WebAuthn authenticator. They never use production data or send messages. The workflow includes mobile navigation, localized templates, target statistics, calendar touch paging, animated loading, manual test controls and Passkey reauthentication.

An independent cache-invalidation job and successful checks gate the reusable release. GitHub builds linux/amd64, pushes the repository-ID-specific GHCR image and deploys its digest using GitHub OIDC. PRs only validate. No SSH keys or platform administrator secrets belong in this repository.

```sh
git add <changed-files>
git commit -m 'Describe the change'
git push origin main
```

When checked out as the backend's `web` submodule, run `git switch main` before editing, then run these commands inside `web`. Commit its new pointer in the backend separately when desired. Each repository's push updates its own service.

## Configuration and data

Runtime variables are `TELEGRAMCOPILOT_API_URL`, `WEBAUTHN_ORIGIN`, `WEBAUTHN_RP_ID`, `WEB_DATA_PATH`, `NODE_OPTIONS`, `HOSTNAME` and `PORT`. Values intended for this deployment are in `paas.json`; no external application secrets are required. Telegram/Bark credentials are entered through the application after deployment.

The sole persistent volume is `web-data` at `/data`, owned by UID 10001. It holds web.db, the unique public credential, counters, challenges and the session-signing key. Keep it with the same RP ID and HTTPS origin across updates. Never rename the volume to attempt an upgrade. The container root is read-only; `/tmp` is disposable.

First registration belongs to the first visitor who completes WebAuthn. The owner must register using their own authenticator. Browser integration tests must never run against this production instance.

## Health, backups and recovery

Check `/api/auth/status` and the real login/console pages over HTTPS. An unauthenticated `/api/backend/health` must return 401; the independent API remains unauthenticated by design. A signed-in console request must reach the API, not a generic proxy page.

Actions → **PaaS operations** → Run workflow supports status, routes, history and logs. Use service `web`. A code rollback uses a recorded release ID and does not undo database writes. Use backup/backups/download-backup for encrypted backups; ordinary file-volume backups can briefly stop the writer. Restoring data is a separate maintenance operation with the platform's repository-ID confirmation.

If the Passkey is lost, restrict access and use an explicitly approved local server maintenance session to execute `node tools/reset-passkey.mjs --confirm` in the web container. It invalidates old sessions; the next visitor can register again. Never add an unauthenticated remote reset endpoint.

For readiness failures inspect the same commit's Actions jobs, then logs and volume permissions. For origin mismatch preserve the exact HTTPS origin and RP ID; do not disable verification. For OIDC rejection check the numeric owner/repository identities, branch and approved workflow SHA. Never replace workflow pins with main or weaken platform checks.

## Release evidence

Initial production release verified on 2026-11-08:

- Commit: `f37cfd3888467d3100d6f250bbdb1b8c71332479`.
- Successful complete run: https://github.com/RyanStanLin/TelegramCopilot-Web/actions/runs/42390824079
- Release ID: `5c5e5b100459b5d2b29f6d77117131af1b9c94078f2cae37b25f347453fb223b`.
- HTTPS SSR, production CSS, auth status and unauthenticated proxy rejection passed. The owner registered their own Passkey and reached the console.

Further follow-up push and cross-update persistence acceptance were skipped at the owner's request. This documentation commit still triggers the automatic pipeline; the latest successful main run and PaaS history are authoritative for the current online identity.

Initial web image: `ghcr.io/ryanstanlin/paas-1449504921-web@sha256:1295a53dc4514c1094329bbc85e700a89d2d695a214c86f7d76f75c568dea1af`.
