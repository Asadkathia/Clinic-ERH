# Accessibility Audit Checklist

## Scope
Priority screens audited in this pass:
- `Login`
- `Requests`
- `Appointments`
- `Invoices`
- `Payments`
- `WhatsApp`
- `Dashboard`

## Checklist

| Item | Status | Notes |
|---|---|---|
| Keyboard-only navigation on shell/sidebar/topbar | Pass | Skip link added, focus styles visible. |
| Focus visibility across controls | Pass | Global focus-visible styles and card focus-within styles active. |
| Landmark structure (`main`, `aside`, `nav`, `header`) | Pass | App shell and key pages now expose landmarks. |
| Live region feedback (`aria-live`) for async states | Pass | Error/status areas now announce updates. |
| Chart/visual widget accessible labeling | Pass | KPI charts include ARIA labeling and textual context. |
| Reduced motion support | Pass | `prefers-reduced-motion` overrides added globally. |
| Text contrast on high-priority badges/alerts | Pass (manual) | No failing combinations identified in this pass. |
| Icon-only control labels | Pass | Icon buttons now include accessible labels where applicable. |

## Remaining Follow-ups
- Add automated accessibility checks (axe-playwright) in E2E pipeline.
- Expand manual audit to all low-traffic screens and edge dialog states.
