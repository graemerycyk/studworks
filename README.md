# Studworks

**Tell a LEGO machine what to do. It works out the rest.**

Connect a supported LEGO hub in the Web App. Studworks checks what is plugged in,
asks about anything it cannot see and turns one plain-language instruction into
a small program. Our online service compiles it; you review and approve each run.

**It is free, forever.** Not a trial.

**Start with the [Web App](https://studworks.build/app/).** The browser beta is
deployed. Full Mac, iPad and iPhone apps are postponed; their source and tests
remain for a later release. There are no native-app download buttons or promised
App Store dates in this launch. Exact-browser and real-hub checks still apply.

The Web App uses Studworks' hosted service for planning and compilation; private
project copies stay in your browser. External AI tools have their own privacy
terms. No Studworks builder account or user-supplied model API key is required.
The retained native app has a separate on-device/offline path for a later release.

## What it does

- Inspects the hub and identifies what is connected to each port.
- Answers questions about the hub, including its battery voltage.
- Controls the hub light and creates bounded motor actions from plain language.
- Shows the generated code before you choose to run it.
- Asks when a motor's purpose is unclear and rejects instructions it cannot
  interpret safely instead of guessing.

The beta focuses on explicit, bounded actions. The current source includes saved
machine details, portable projects, version history and exact corrections such
as “Make the lift motor 20% slower”, “turn 45 degrees instead” and “wait two seconds
longer”. Exact edits show a before/after review and ask which step when ambiguous.
The web workbench also has device-local autosave, a project library and machine
detail editing; it does not need a builder account.

The Web App beta includes these implemented workflows. Native source retains the
same concepts for later releases:

- **Guided setup:** connect, run the non-moving hub check, confirm the attached
  parts, report the battery and try a red light for two seconds. After each
  completed test, you confirm whether the expected result happened. A detached,
  unloaded motor can optionally turn 15° at 100°/s, after explicit opt-in, port
  confirmation and separate approval of the exact run. Nothing retries itself.
- **New project using this machine:** keep your saved names, descriptions,
  directions and limits in an independent project with a new instruction. The
  original stays separate. Check the current hardware and confirm its roles
  again; no connection or run permission is copied.
- **Share current version** shows exactly which instructions, notes and
  attribution leave your device, without earlier snapshots. **Download full
  backup** includes the retained version history. Both let you review the file
  before export, and neither publishes it automatically.

Free-form corrections, sensor automation and continuous control remain outside
the supported surface. Software checks are not exact-build hardware qualification.

## Why it is different

**Your words become motion.** Tell Studworks one thing you want your LEGO machine
to do. It looks at the real hardware, creates a small program for the build in
front of you, and shows you exactly what will run. If anything is unclear, it asks
before it acts.

- **From idea to action.** Describe what you want. Studworks creates the program;
  you decide when to run it.
- **It knows your build.** Motors and sensors are matched to what is actually
  plugged in, so your train stays your train and your barrier stays your barrier.
- **Guardrails in every run.** Movements have deadlines, motors coast when the
  program ends, and a jam is abandoned instead of forced.
- **Free forever. Private by design.** No trial, account, API key or Studworks
  server. The app runs on your device, even offline.

## Hardware

Works with supported LEGO hubs, including City, Technic, BOOST Move, SPIKE Prime,
SPIKE Essential, and MINDSTORMS Robot Inventor. Studworks detects supported motors
and colour/distance sensors; the first beta exposes port inspection, battery,
hub-light, and bounded motor actions.

Studworks uses [Pybricks](https://pybricks.com) on the hub. If it is not installed
yet, the app guides you through setup.

## Cloud MCP setup

Build in the Web App or a compatible assistant through the
same Studworks platform. **Cloud MCP is the public AI integration**: no local
MCP server or separate Studworks MCP client to install. Terminal clients and
custom agents can use the same remote interface, subject to compatibility and
the same approval rules. See the [connection guide](https://studworks.build/journal/use-with-claude-chatgpt/)
and [public API reference](https://studworks.build/api/v1/openapi.json).

Use the HTTPS server address from that guide in your assistant's connection
settings, not in the conversation. Planning can work without hardware. Hardware
access needs a Bluetooth bridge near the hub, a temporary authorized session,
fresh hardware checks and your separate approval of each exact run. The current
public authorization flow uses a visible desktop Chrome bridge; your assistant
can run in your preferred browser. Provider setup and real-host/device checks
are still required before cloud hardware authorization is activated.

The Web App also has **Use a connected bridge**: work in modern Safari, Firefox,
Chrome or Edge with the hub connected in a separate visible desktop Chrome
bridge. A private temporary invitation and matching confirmation codes
pair the two. Review a current-version project copy, send it, then approve every
exact run beside the hub. The new native plan-refresh path needs a fresh Mac
build; independently revised owner copies require a separate plan review.
This manual Web App path does not need Claude, ChatGPT or OAuth activation.
Native public cloud authorization is not yet part of this pairing flow.
See the [hub guide](https://studworks.build/journal/set-up-your-hub/).

The native app is one iPhone/iPad app, also built for Mac with Mac Catalyst.
Apple still requires separate platform builds, signing and distribution checks.
Its ordinary offline workflow needs neither MCP nor the hosted service. The
Web App and cloud MCP send requests to Studworks' service; your chosen AI
provider may process them too and has separate privacy terms and charges.
**Studworks is free, forever.** No builder account is required.

Local MCP is deferred, not bundled in the app. Existing development users
should stop any hub program, confirm the hub is stopped, then remove old local
Studworks MCP entries from their AI tools. Do not copy old helper binaries into
a new signed app. Cloud authorization does not migrate old local permissions.

## Studworks 0.1.0 Beta

### Getting started guides

On the combined DigitalOcean site, choose **Open Web App** on the homepage or
**Web App** in the navigation/shared footer. The routes are:

| Destination | Same-origin path |
| --- | --- |
| Web App | `/app/` |
| Claude/ChatGPT setup guide | `/journal/use-with-claude-chatgpt/` |
| Browser hub connection | `/app/connect.html` |
| First-time hub setup | `/journal/set-up-your-hub/` |

The connection guide copies the current HTTPS deployment's `/mcp` address,
including a generated DigitalOcean staging domain. Local HTTP retains the public
address as a fallback. `/mcp` is a protocol setting, not a webpage. Hardware
authorization starts from the chosen chat host; opening the hub page alone does
not authorize that chat or approve a run. OAuth must first be configured and
qualified by the operator.

On 8 September 2026 the owner approved consolidating the website on `main` and
publishing its latest design to GitHub Pages before the DigitalOcean migration.
Pages alone cannot serve `/app/` or the API: those links become usable when the
combined DigitalOcean deployment is connected to this domain. `main` is the
default source branch; the former `master` and completed review branch can be
removed after their history is verified in `main`. DigitalOcean takes the locked
website snapshot from the app repository, not a live fetch of this repository.

- [Set up your LEGO hub](https://www.studworks.build/journal/set-up-your-hub/)
- [Use with Claude, ChatGPT or terminal tools](https://www.studworks.build/journal/use-with-claude-chatgpt/)
- [Understand Pybricks project files](https://www.studworks.build/journal/understanding-pybricks-files/)

The connection guide describes cloud MCP and the nearby Bluetooth bridge, not
a bundled local MCP helper. It does not claim an official directory listing or completed
host/hardware qualification.

### Beta package

The beta entry point is **Open Web App**, with GitHub as the secondary link.
There is no Mac/mobile download or disabled App Store button in this section.
Use desktop Chrome for direct Bluetooth, or a separate visible Chrome hub bridge
while working in another desktop browser. **It is free, forever.** Not a trial.

Full native Mac/iPad/iPhone apps are postponed, not deleted. Studworks Connect
utilities for Mac and Windows and hosted-model parity remain planned work,
not available downloads. The current hosted planner is deterministic; cloud hub
authorization still needs provider setup and attended host/hardware qualification.

**Early.** Studworks is being built in the open and is not finished. If you try it
and it does something daft, email [help@studworks.build](mailto:help@studworks.build)
or [open an issue](https://github.com/graemerycyk/studworks/issues). Telling me is
the most useful thing you can do.

## Projects and Journal

The owner approved `/privacy/` and `/terms/`, effective **7 September 2026**.
They identify **studworks.build — Belgium**, with **help@studworks.build** for
privacy/support. Draft labels and `noindex` were removed. The policies distinguish
current DigitalOcean hosting and transient planning from planned improvement
retention and separately gated sharing/authorization. The 10 September policy
update is published; collection is not enabled. Policy publication does not
certify legal compliance or activate those features.
Operator identity/contact details and actual production processing arrangements
remain part of the deployment and directory-submission review.

The website has two lightweight editorial sections:

- [Projects](https://www.studworks.build/projects/): development-tested starter
  experiments, separately labelled future concepts, and a form to share a build
  without a builder account or email. Each editorial project has its own page with hardware, prompts, expected
  behaviour, evidence limits and safety notes.
- [Journal](https://www.studworks.build/journal/): field notes and product decisions,
  with an [Atom feed](https://www.studworks.build/journal/feed.xml).

This is a moderated gallery, not a social network. Builders may submit
anonymously or choose a name/username and an optional HTTPS blog/social link.
Credit is unverified metadata on that build, not a registered profile.
Submit text, a public photo/video link and, optionally, a portable Studworks
project (up to 1 MiB). Only approved submissions appear publicly. Use **Share
current version** and review its exact contents before attaching it. Current
names and notes are not automatically anonymized; a **full backup** also includes
earlier instructions and notes. The whole submitted file becomes public if approved.
There are no builder accounts, likes, comments, visitor profiles, media uploads or
automatic publication. A private receipt lets builders check or withdraw a
submission. `/admin/` uses allowlisted, single-use magic-link moderator login.
This requires the new backend's PostgreSQL and mail configuration: GitHub Pages
alone cannot accept submissions. Unconfigured forms stay closed, not fake-saved.
Copying a prompt does not open the app, connect to hardware or execute anything.
Published builds have a shareable page, project download and explicit web-app
import link. Imported projects become independent copies; source facts require
confirmation and neither live bindings nor run approvals are transferred.
Remixes can link back to their published source. Publishing does not enrol the
whole project or its media in improvement data. The privacy/terms source separately
describes planned default-on, limited submitted input/output improvement and
reviewed training/evaluation without separate opt-in or training checkboxes.
Collection is not enabled: screening, lawful-basis review, rights and retention
safeguards must precede activation. No identity/IP/session-tracking fields enter
that dataset; text can still contain personal information and needs screening.
Builders keep their project rights. Direct in-app publishing is not required:
export the project and attach it to the submission form.

### Maintaining the website

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
current-page/section indicator; every page includes Web App, Projects, Journal,
Claude & ChatGPT and the yellow Get the Mac / iPad App action. Page-specific headings remain.
When changing either template, update each page; `scripts/check_site.py` rejects
drift. These are build-time sources, not browser dependencies or public assets.
Homepage copy distinguishes direct desktop Chrome Bluetooth from the Web App's
browser-independent bridge controller. Bluetooth stays in the connected Mac app
or a separate visible Chrome bridge; every run remains locally approved. Static checks
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
