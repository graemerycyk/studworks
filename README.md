# Studworks

**Tell a LEGO machine what to do. It works out the rest.**

**Studworks 0.1.0 Beta — [Open Web App](https://studworks.build/app/).** Describe one thing your
LEGO machine should do, review the plan and decide when it runs.

**It is free, forever.** Not a trial. No Studworks builder account is required.

## The focused Web App beta

- Connect directly in desktop Chrome. The connection window opens over the app
  on arrival; opening it does not request Bluetooth or run a program.
- If the hub needs Pybricks, follow the setup guidance to the official installer.
  Installation changes the hub software and is a separate, deliberate action.
- Run the non-moving hub check, identify the attached parts, then use **Make it**
  to prepare an idea. **Prepare this project** produces the hardware-specific
  program. Review it and approve each exact run separately.
- Start with battery reporting and a hub light. Bounded motor actions need the
  correct motor, room to move and your approval. STOP remains visible.
- Edit machine names, directions and limits. Review exact corrections such as
  “turn 45 degrees instead” or “make the motor 20% slower”; choose a step when
  ambiguous and retain earlier versions during this page session.
- **New project using this machine** carries over the current machine details,
  not its connection or run approval. Download the original before replacing it.
- **Share current version** previews a file without earlier snapshots.
  **Download full backup** includes retained versions. Neither publishes a file.

Work is held in memory on the current page. Download a reviewed backup before
leaving or refreshing. Existing browser-saved projects from earlier builds are
left untouched; this beta does not open, migrate, upload or delete them.
The project library/autosave, shared-project import, Pybricks-file import,
manual bridge-code controls and first-success widget are deferred. Their source
and tests are retained in the platform repository and recorded in its backlog.
Setup help now lives in the [hub setup guide](https://studworks.build/journal/set-up-your-hub/)
and [Projects](https://studworks.build/projects/), not extra workspace panels.

Planning and compilation use Studworks' hosted service. Other desktop browsers
can prepare and review drafts, but this beta needs browser Bluetooth to operate
a hub. Additional connection options and hosted-model parity remain future work.
There is no connected server-side project database in the current deployment.
Improvement collection is implemented but disabled pending storage and safeguards;
the [privacy notice](https://studworks.build/privacy/) distinguishes that planned
collection from the requests needed to prepare a program.

## Hardware and safety

The platform targets City Hub, Technic Hub, BOOST Move, SPIKE Prime, SPIKE Essential
and MINDSTORMS Robot Inventor using [Pybricks](https://pybricks.com) on the hub.
The beta focuses on port inspection, battery, hub-light and bounded motor actions.
Sensors, continuous control and unrestricted corrections are not promised by
this launch. Software tests are not qualification of every browser and hub.

Studworks asks when a motor's purpose is unclear, shows what will run and rejects
instructions it cannot interpret safely. Moves have deadlines and the guarded
runtime coasts motors when a program ends. Keep the physical stop button within
reach; an unconfirmed STOP is not a successful stop. No suggested fix retries
movement automatically.

## Cloud MCP

The cloud MCP interface exposes the same platform to compatible assistants and agents through
the same remote interface. It is separate from the focused Web App workspace.
There is no local MCP installation in this launch.

See the [Claude, ChatGPT and agent guide](https://studworks.build/journal/use-with-claude-chatgpt/)
for Streamable HTTP setup and the [API reference](https://studworks.build/api/v1/openapi.json).
Planning can work without hardware. Physical control needs a nearby, visible
Bluetooth-capable browser, temporary authorization and approval of every exact
run. The conversation can stay in another browser; MCP cannot give a cloud host
direct Bluetooth access. Provider configuration and real-host/hub checks remain
required before public hardware authorization is enabled. External providers
have their own compatibility, charges and privacy terms.

## Projects and journal

Projects are evidence and inspiration, not permission to run someone else's
machine. The current gallery/submission backend still needs activation. Reviewed
project archives can be attached to a submission; importing them back into the
Web App is deferred. There are no builder accounts, verified creator identities
or invented community counts. Journal posts explain the tools and record the
development evidence, with current limitations distinguished from future plans.

## Maintaining the website

The site stays plain HTML/CSS/JavaScript. Its editorial content can be served
statically; web-app links and the submission/moderation backend require the
combined DigitalOcean origin. Pages share `assets/site.css`, including the
colourful Projects/Journal shell. `assets/site.js` adds clipboard controls with a
selectable-text fallback and resolves the MCP address on HTTPS deployments.
Core content and navigation work without JavaScript. The homepage cycles through
five typed examples, with a static reduced-motion alternative; its old Pause
examples and Copy prompt controls have been removed.

All 18 website pages embed the homepage navigation from `scripts/navigation.html`
and the exact footer from `scripts/footer.html`. Navigation differs only in its
current-page/section indicator; every page includes Projects, Journal,
Claude & ChatGPT and the yellow **Start building** action linking directly to
`/app/`. There is no duplicate Web App header link. Page-specific headings remain.
When changing either template, update each page; `scripts/check_site.py` rejects
drift. These are build-time sources, not browser dependencies or public assets.
The shared footer contains navigation, support and attribution, not repeated
pricing slogans. The homepage states the free pricing once in its feature copy;
relevant journal articles and terms can explain it in context. The Web App itself
uses a compact product header and Help menu, without a marketing hero or footer.
Homepage copy distinguishes direct desktop Chrome Bluetooth from drafting in
other browsers. Cloud MCP retains its separate, locally approved connection. Static checks
allow only the explicit sibling routes `/app/` and `/app/connect.html`; the app
repository's deployment preflight checks the actual shipped targets in both
directions, including page fragments.

Local checks and an optional public-assets-only package:

```sh
python3 scripts/check_site.py
node --test scripts/test_copy.cjs
node --test scripts/test_hero_examples.cjs
node --test scripts/test_community.mjs
python3 scripts/build_site.py
python3 -m http.server 8766 --bind 127.0.0.1 --directory dist
```

Open `http://127.0.0.1:8766/projects/`. Python and Node are needed only for local
checks; readers and GitHub Pages need neither. `dist/` is ignored and excludes
scripts, README and source-control files. Publishing remains a separate action;
the build script does not push, deploy or change the domain.

To add a project, copy the closest project page into `projects/<slug>/index.html`,
update its unique title/description/canonical/Open Graph fields, and add a card to
`projects/index.html`. Include the creator’s approved display name, exact hardware,
the prompt, physical results and the build/version on which they were observed.
Concepts must say they are unavailable and must not offer a runnable prompt action.
Do not substitute stock or generated pictures for evidence of an actual build.

To add a journal note, create `journal/<slug>/index.html`, update `journal/index.html`
and `journal/feed.xml`, and run the checks. Dates reflect publication, not the date
an earlier hardware test happened. Adjust draft dates when publishing later.

For submissions, review the wording, chosen credit, attachment history and
permission to share each asset before publishing. Do not publish email
addresses or other private details. A development test must not be presented
as current-release qualification. The admin attachment viewer renders text
only; never run submitted code as part of moderation.

## Licence and attribution

Not affiliated with, endorsed by, or sponsored by the LEGO Group. LEGO® is a
trademark of the LEGO Group.

Not affiliated with the Pybricks project. Studworks does not redistribute
Pybricks; programs import it at runtime on the hub.

Includes the MicroPython cross-compiler, MIT licensed.
