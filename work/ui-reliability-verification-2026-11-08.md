# Presence reliability and console verification

Local final verification on 2026-11-08 used disposable API and web data, a virtual Passkey, disabled Telegram accounts and controlled monitoring fixtures. Production data, credentials and Telegram sessions were not copied into the tests. No production notification or scheduled message was triggered.

| Requirement | Evidence |
| --- | --- |
| Offline delivery requires a continuous, confirmed Online → Offline transition; initial/offline recovery and stale/unknown intervals are excluded | `OfflineNotificationTests.OfflineNotifications_RequireUninterruptedOnlineToOfflineAcrossRestarts`; `FirstOnlineFollowedByOffline_IsEligibleWithoutInventingSessionDuration`; `LegacyPendingOfflineEvents_ArePreservedButNeverAssumedConfirmed` |
| Notification avatars belong to the event's target; unavailable/reconfigured profiles cannot use an unrelated icon | `NotificationAvatarTests.AvatarResolver_UsesEachEventsTargetAndRejectsMissingOrReconfiguredProfiles`; `BarkIntegrationTests.BarkerSharper_TransmitsTemplatesParametersAndEachDeviceKey` verifies actual outgoing HTTP JSON for both device keys |
| Local-day/week duration and confirmed session count preserve unknown coverage | `TargetOverviewTests.TargetOverview_UsesLocalDayAndMondayBoundariesWithConfirmedSessionCounts` |
| Global completed-check success totals exclude pending checks | `MonitoringRepositoryTests.Totals_AggregateCompletedChecksAcrossTargetsAndExcludePendingResults` |
| Every notification event has a localized, valid built-in template | `RuleTemplateTests.BuiltInTemplates_CoverEveryEventAndPassDraftValidationWithLocalizedDurations` (English and Chinese) |
| English duration and unknown values render without Chinese units | `NotificationAvatarTests.EnglishTemplates_RenderReadableDurationAndUnknownWithoutChineseUnits` |
| Target identity, native last seen, durations, counts and poll updates are visible | `single_passkey_guards_console_and_configuration_workflows` → `verifyMonitoringDetails` |
| Searchable reference selection works by mouse and enum menus retain selected values | `single_passkey_guards_console_and_configuration_workflows` → `choose`, configuration and creation checks |
| Mobile drawer, focus return, navigation, language flags/draft preservation and readable event explanations | `single_passkey_guards_console_and_configuration_workflows` → `verifyExperience`, `verifyConfigurationPages`, responsive checks |
| Calendar pages use Primer Pagination, preserve focus/URL, and accept actual touch swipes | `single_passkey_guards_console_and_configuration_workflows` → `verifyExperience` |
| New rules follow UI language and event defaults; edited drafts survive language switches | `single_passkey_guards_console_and_configuration_workflows` → `verifyExperience` |
| Loading rotates in the production bundle, including a deliberately delayed failed save | `single_passkey_guards_console_and_configuration_workflows` → `verifyLoadingAnimation` asserts duration and changing transform |
| Manual rule validation/delivery and schedule test controls retain success/error handling | `single_passkey_guards_console_and_configuration_workflows` → `verifyManualTests` |
| Adaptive duration display/input retains mixed Chinese/English units and rejects malformed input | All nine `duration.spec.ts` cases, including `duration_formats_mixed_units`, `duration_parser_accepts_chinese_english_and_numeric_units`, `duration_parser_rejects_partial_negative_duplicate_and_reordered_units`, `duration_forms_roundtrip_human_input_to_numeric_api_settings` |
| Login status can recover, and registration/logout/reauthentication and singleton Passkey checks remain intact | `login_status_failure_can_be_retried`; `single_passkey_guards_console_and_configuration_workflows` |

Commands and final results:

- `dotnet test TelegramCopilot.slnx -c Release --logger 'trx;LogFileName=backend-global-summary.trx' --results-directory <scratch-results>`: 102 passed, zero failed or skipped; TRX validated.
- `dotnet build src/TelegramCopilot.Api -c Release --no-restore`: zero warnings/errors.
- `npm run build`, `npm run typecheck`, `npm run lint:css`: passed.
- `TEST_WEB_URL=http://localhost:3384 TEST_API_URL=http://127.0.0.1:5184 npm run test:e2e`: 11 expected, zero unexpected, flaky or skipped; Playwright HTML report validated.
- Matched English/Chinese locale key sets; no native/Primer Select, Box/sx, debug spec or source file over 200 lines.
- All six modified/new CSS Modules individually passed the Primer MCP checker.

Screenshots cover target detail at mobile/desktop sizes, the navigation drawer, presence in wide/narrow/dark modes, rule validation/tests, schedule tests and account login stages. They are controlled test fixtures, not proof of the live account's Telegram or Bark state.

Evidence limits: a real Bark device receipt was not triggered for this UI/reliability change. Outgoing avatar payloads are verified at a local HTTP receiver. Stable Primer's internal assistive strings without public localization hooks remain upstream English; app-owned labels and public hooks are localized. The alt-text review tool failed due to unavailable connector sampling; official Avatar guidance was followed instead. No pixel-perfect GitHub reproduction is claimed.
