# Presence notifications and mobile UI research

2026-11-08; `mcp__primerdoc__*`; @primer/react 38.45.0, Primitives 11.10.0, Octicons 19.42.0. Existing project: init not applicable. Root imports, ThemeProvider/BaseStyles and i18n inspected. No package upgrade.

## Full study gate

All live API/examples/usage/accessibility calls completed for the 76-name deduplicated MCP catalog. All valid returned bodies were fully read in bounded chunks; truncated reads were repeated in smaller chunks. Raw responses and cleaned reading copies are retained in ignored `.paas/primer-full-review.json` and `.paas/primer-clean/` for this session. Editor styling and flattened duplicate JSX were removed only from reading copies; originals remain intact.

All 19 live patterns were read in full: Copy, Create, Customize, Delegate, Delete, Edit, Filter, Search, View, Data Visualization, Degraded Experiences, Empty States, Feature Onboarding, Forms, Loading, Navigation, Notification message, Progressive disclosure, Saving. Five mandatory foundation tools were read in full, token specs before token requests. Followed official React philosophy, content, layout, responsive, primitives/token names and theming links. All component documents were read before planning JSX.

Official fallback index: https://primer.style/product/components/ . Independent guide absence was verified against each official overview and its page navigation; `.paas/primer-availability.json` records the responses. Stale MCP entries absent from the official index also return the Primer landing page at their official component routes. These are not counted as component documents or used in new code. No missing key contract remains for selected components.

| Component | API | Examples | Usage | Accessibility |
| --- | --- | --- | --- | --- |
| ActionBar | read (MCP API + examples props) | read (MCP) | read (MCP) | read (MCP) |
| ActionList | read (MCP API + examples props) | read (MCP) | read (MCP) | read (MCP) |
| ActionMenu | read (MCP API + examples props) | read (MCP) | read (MCP) | read (MCP) |
| AnchoredOverlay | read (MCP API + examples props) | read (MCP) | not-published-verified; overview + related patterns | not-published-verified; overview + related patterns |
| Autocomplete | read (MCP API + examples props) | read (MCP) | read (MCP) | not-published-verified; overview + related patterns |
| Avatar | read (MCP API + examples props) | read (MCP) | not-published-verified; overview + related patterns | not-published-verified; overview + related patterns |
| AvatarStack | read (MCP API + examples props) | read (MCP) | not-published-verified; overview + related patterns | not-published-verified; overview + related patterns |
| Banner | read (MCP API + examples props) | read (MCP) | read (MCP) | read (MCP) |
| Blankslate | read (MCP API + examples props) | read (MCP) | read (MCP) | not-published-verified; overview + related patterns |
| BranchName | read (MCP API + examples props) | read (MCP) | not-published-verified; overview + related patterns | read (MCP) |
| Breadcrumbs | read (MCP API + examples props) | read (MCP) | read (MCP) | read (MCP) |
| Button | read (MCP API + examples props) | read (MCP) | read (MCP) | read (MCP) |
| IconButton | read (MCP API + examples props) | read (MCP) | read (MCP) | read (MCP) |
| ButtonGroup | read (MCP API + examples props) | read (MCP) | read (MCP) | read (MCP) |
| Card | read (MCP API + examples props) | read (MCP) | not-published-verified; overview + related patterns | read (MCP) |
| Checkbox | read (MCP API + examples props) | read (MCP) | not-published-verified; overview + related patterns | read (MCP) |
| CheckboxGroup | read (MCP API + examples props) | read (MCP) | read (MCP) | read (MCP) |
| CircleBadge | read (MCP API + examples props) | read (MCP) | not-published-verified; overview + related patterns | not-published-verified; overview + related patterns |
| ConfirmationDialog | read (MCP API + examples props) | read (MCP) | read (MCP) | read (MCP) |
| CounterLabel | read (MCP API + examples props) | read (MCP) | not-published-verified; overview + related patterns | read (MCP) |
| DataTable | read (MCP API + examples props) | read (MCP) | read (MCP) | read (MCP) |
| Details | read (MCP API + examples props) | read (MCP) | not-published-verified; overview + related patterns | read (MCP) |
| Dialog | read (MCP API + examples props) | read (MCP) | read (MCP) | read (MCP) |
| FeatureFlags | not-published-verified (stale catalog) | not-published-verified; overview + related patterns | not-published-verified; overview + related patterns | not-published-verified; overview + related patterns |
| Flash | not-published-verified (stale catalog) | not-published-verified; overview + related patterns | not-published-verified; overview + related patterns | not-published-verified; overview + related patterns |
| FormControl | read (MCP API + examples props) | read (MCP) | not-published-verified; overview + related patterns | read (MCP) |
| Header | not-published-verified (stale catalog) | not-published-verified; overview + related patterns | not-published-verified; overview + related patterns | not-published-verified; overview + related patterns |
| Heading | read (MCP API + examples props) | read (MCP) | not-published-verified; overview + related patterns | read (MCP) |
| Hidden | not-published-verified (stale catalog) | not-published-verified; overview + related patterns | not-published-verified; overview + related patterns | not-published-verified; overview + related patterns |
| InlineMessage | read (MCP API + examples props) | read (MCP) | not-published-verified; overview + related patterns | not-published-verified; overview + related patterns |
| KeybindingHint | read (official overview recovery) | read (official overview recovery) | not-published-verified; overview + related patterns | not-published-verified; overview + related patterns |
| Label | read (MCP API + examples props) | read (MCP) | not-published-verified; overview + related patterns | read (MCP) |
| LabelGroup | read (MCP API + examples props) | read (MCP) | not-published-verified; overview + related patterns | read (MCP) |
| Link | read (MCP API + examples props) | read (MCP) | read (MCP) | read (MCP) |
| NavList | read (MCP API + examples props) | read (MCP) | read (official /guidlines/ recovery) | read (MCP) |
| Octicon | not-published-verified (stale catalog) | not-published-verified; overview + related patterns | not-published-verified; overview + related patterns | not-published-verified; overview + related patterns |
| Overlay | read (MCP API + examples props) | read (MCP) | not-published-verified; overview + related patterns | read (MCP) |
| PageHeader | read (MCP API + examples props) | read (MCP) | read (MCP) | read (MCP) |
| PageLayout | read (MCP API + examples props) | read (MCP) | not-published-verified; overview + related patterns | read (MCP) |
| Pagehead | not-published-verified (stale catalog) | not-published-verified; overview + related patterns | not-published-verified; overview + related patterns | not-published-verified; overview + related patterns |
| Pagination | read (MCP API + examples props) | read (MCP) | read (MCP) | read (MCP) |
| Popover | read (MCP API + examples props) | read (MCP) | read (MCP) | read (MCP) |
| Portal | not-published-verified (stale catalog) | not-published-verified; overview + related patterns | not-published-verified; overview + related patterns | not-published-verified; overview + related patterns |
| ProgressBar | read (MCP API + examples props) | read (MCP) | not-published-verified; overview + related patterns | read (MCP) |
| Radio | read (MCP API + examples props) | read (MCP) | not-published-verified; overview + related patterns | read (MCP) |
| RadioGroup | read (MCP API + examples props) | read (MCP) | read (MCP) | read (MCP) |
| RelativeTime | read (MCP API + examples props) | read (MCP) | read (MCP) | read (MCP) |
| SegmentedControl | read (MCP API + examples props) | read (MCP) | read (MCP) | read (MCP) |
| Select | read (MCP API + examples props) | read (MCP) | read (MCP) | read (MCP) |
| SelectPanel | read (MCP API + examples props) | read (MCP) | read (MCP) | read (MCP) |
| SkeletonBox | read (MCP API + examples props) | read (MCP) | not-published-verified; overview + related patterns | read (MCP) |
| SkeletonAvatar | read (MCP API + examples props) | read (MCP) | not-published-verified; overview + related patterns | read (MCP) |
| SkeletonText | read (MCP API + examples props) | read (MCP) | not-published-verified; overview + related patterns | read (MCP) |
| Spinner | read (MCP API + examples props) | read (MCP) | not-published-verified; overview + related patterns | read (MCP) |
| SplitPageLayout | read (MCP API + examples props) | read (MCP) | not-published-verified; overview + related patterns | not-published-verified; overview + related patterns |
| Stack | read (MCP API + examples props) | read (MCP) | not-published-verified; overview + related patterns | read (MCP) |
| StateLabel | read (MCP API + examples props) | read (MCP) | not-published-verified; overview + related patterns | read (MCP) |
| SubNav | not-published-verified (stale catalog) | not-published-verified; overview + related patterns | not-published-verified; overview + related patterns | not-published-verified; overview + related patterns |
| TabNav | not-published-verified (stale catalog) | not-published-verified; overview + related patterns | not-published-verified; overview + related patterns | not-published-verified; overview + related patterns |
| Text | read (MCP API + examples props) | read (MCP) | not-published-verified; overview + related patterns | read (MCP) |
| TextInput | read (MCP API + examples props) | read (MCP) | read (MCP) | read (MCP) |
| TextInputWithTokens | read (MCP API + examples props) | read (MCP) | read (MCP) | read (MCP) |
| Textarea | read (MCP API + examples props) | read (MCP) | read (MCP) | read (MCP) |
| Timeline | read (MCP API + examples props) | read (MCP) | not-published-verified; overview + related patterns | read (MCP) |
| ToggleSwitch | read (MCP API + examples props) | read (MCP) | read (MCP) | read (MCP) |
| Token | read (MCP API + examples props) | read (MCP) | read (MCP) | read (MCP) |
| Tooltip | read (MCP API + examples props) | read (MCP) | read (MCP) | read (MCP) |
| TopicTag | not-published-verified (stale catalog) | not-published-verified; overview + related patterns | not-published-verified; overview + related patterns | not-published-verified; overview + related patterns |
| TreeView | read (MCP API + examples props) | read (MCP) | read (MCP) | read (MCP) |
| Truncate | read (MCP API + examples props) | read (MCP) | not-published-verified; overview + related patterns | read (MCP) |
| UnderlineNav | read (MCP API + examples props) | read (MCP) | read (MCP) | read (MCP) |
| AriaAlert | not-published-verified (stale catalog) | not-published-verified; overview + related patterns | not-published-verified; overview + related patterns | not-published-verified; overview + related patterns |
| AriaStatus | not-published-verified (stale catalog) | not-published-verified; overview + related patterns | not-published-verified; overview + related patterns | not-published-verified; overview + related patterns |
| FilteredSearch | not-published-verified (stale catalog) | not-published-verified; overview + related patterns | not-published-verified; overview + related patterns | not-published-verified; overview + related patterns |
| IssueLabel | not-published-verified (stale catalog) | not-published-verified; overview + related patterns | not-published-verified; overview + related patterns | not-published-verified; overview + related patterns |
| UnderlinePanels | read (MCP API + examples props) | read (MCP) | read (MCP) | read (MCP) |

Independent MCP invalid responses remain invalid-response in raw evidence; fallback status above describes the recovered source, not a successful guide call. KeybindingHint official overview includes API, complete demos and usage; no separate a11y guide is published. NavList guidelines are published at the misspelled `/product/components/nav-list/guidlines/` URL. InlineMessage guidance refers to accessible notifications/messages; Spinner and skeletons refer to Loading. Layout-only components rely on logical DOM/landmarks and Layout/Navigation. Avatar alternatives follow Avatar overview and image alt review. Unpublished stale entries are not imported.

## UI implementation plan

- Shell: GitHub mobile screenshots supplied by user establish hamburger/left drawer, contextual underline navigation, compact header actions and visual hierarchy. Their DPR/zoom are unknown; image pixels are not asserted as CSS measurements. Desktop uses PageLayout with small start pane; narrow pane hidden with equivalent Dialog navigation. Header scrolls with page. 768px breakpoint is official Primer narrow/regular boundary.
- Existing target detail: overview template; actual Telegram identity, today/week duration, weekly observed sessions, exact/relative Telegram last seen, and genuine poll success/counters. Settings are an explicitly saved form in a separate UnderlinePanels panel. No guessed data or conversion of unknown periods to offline.
- Resource creation/settings: creation/settings templates, permanent labels, medium controls and explicit save. Related fields share bordered sections; advanced Bark JSON follows relevant templates. New rules load localized built-in API templates for all 11 event kinds, with explicit reset to template for edited rules.
- Events/deliveries/resources: data-list templates. Events use readable titles and persistent reason explanations in shared bordered rows; technical detail available separately. Pagination is the official component with localized public renderPage extension, shareable URLs and focus handling.
- Presence: overview/data list; contribution grid is the existing business visualization (no equivalent published Primer calendar visualization). Month windows use official Pagination and optional touch swipe, full keyboard/link equivalents, date labels and unknown-state legend.
- Selection: ActionMenu/ActionList radio-style options for short enums; SelectPanel with search for resource references. No Select. Current value and label in accessible name, focus return and translated empty/filter states. Flags are an explicit user override of the skill no-emoji rule and supplement language names.
- Spinner: import official base and functional motion CSS, retain component animation and loading announcement; verify computed animation and changing transform in production.

## Tokens and contracts

get_token_group_bundle read fully: bgColor, fgColor, borderColor, text, fontStack, stack, controlStack, page, borderRadius, borderWidth, control, focus, outline, overlay, shadow. Prefer Stack/PageLayout props. Use default/muted backgrounds; default/emphasis borders; title/body shorthand and semibold weights; no decoration shadows or custom control skins. Runtime verify imports resolve variables. Official base motion defines --base-duration-1000 and --base-easing-linear.

Dialog installed public types verify position=left, width=small, onClose and returnFocusRef; standard header/body retains focus trap. Pagination public renderPage passes className/href/click/current-state; localize accessible page labels and preserve official rendering styles. SelectPanel types verify inputLabel, message, controlled open/selection/filter, disableFullscreenOnNarrow, cancel. Installed version is authority when current online examples differ.

## Local verification

The final production build, TypeScript check and local CSS lint passed. Each final CSS Module also passed the Primer MCP lint individually. The Playwright HTML report confirms 11 expected results, zero unexpected, flaky or skipped results. The main workflow covers desktop/narrow/dark/200% zoom, keyboard/focus return, both locales and draft persistence, resource mouse selection, localized templates, target summaries, calendar links and real touch paging, rule/schedule tests, login stages, and Passkey logout/login. The production Spinner has a computed 1s animation duration and its transform changes over time. Locale key sets match; all source files remain within 200 physical lines. No pixel-perfect claim.

See [behavior verification](ui-reliability-verification-2026-11-08.md) for exact tests, commands and evidence limits. Deployment is checked separately against the exact main commits and live PaaS release identity.

## Component integration follow-up

The user explicitly authorized focusing any further full study on components actually used. Stable SelectPanel is retained. Its installed public ItemInput includes inherited React DOM props; onMouseDown prevents native option focus from scrolling the form and moving the anchored panel between mouse-down and mouse-up. This was reproduced with actual browser pointer events: mouse-down hit the option, mouse-up hit the underlying form, and keyboard Enter selected correctly. Mouse selection remains a required regression assertion. Placeholder items have nonempty stable IDs; selected value and label are explicitly associated with the anchor.

An alternative experimental SelectPanel2 was investigated using its installed declarations and official primer/react source, stories and metadata. Its official metadata marks it deprecated and a11yReviewed=false, so it was not introduced. Some stable Primer built-in assistive strings (e.g. filtered-list instructions and hidden navigation suffixes) have no public translation prop in this version. App-owned visible labels, menus, flags, empty/filter states, status messages and public accessible labels are translated; full upstream-internal localization is not claimed. Private DOM or component selectors are not patched.

Each final CSS Module was individually passed to mcp__primerdoc__lint_css with no remaining error marker. Combining separate Modules produces duplicate-selector diagnostics, so aggregate concatenation is not used as the final result. The alt-text review tool failed because the connector does not support sampling; official Avatar/image guidance was used: empty alt is appropriate next to the visible identity heading, with a decorative fallback.
