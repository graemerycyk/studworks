# Studworks

**Tell a LEGO machine what to do. It works out the rest.**

Connect a supported LEGO hub. The native Studworks app finds out what is plugged in, asks about
anything it cannot see, turns one plain-language instruction into a small program,
compiles it on your device, and puts it on the hub.

**It is free, forever.** Not a trial.

**For Mac, iPad and iPhone, with a Chrome web app coming soon.** The browser
workbench is implemented and awaiting deployment and device checks.
The iPhone and iPad apps (iOS/iPadOS) are planned for later in September 2026,
subject to Apple review.

The normal native-app workflow works offline. No account, API key, or Studworks
server is required, and instructions are processed on your device. The optional
web workbench uses Studworks' hosted service for planning and compilation;
external AI apps have their own privacy terms. None requires a Studworks builder account.

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

Three new workflows are implemented in the native app and browser for the next
beta; the public download and hosted service are still awaiting release:

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

## MCP setup

**One app. MCP included.** The Mac app bundles a local
[Model Context Protocol](https://modelcontextprotocol.io) server. Your compatible
desktop AI app acts as the MCP client; Studworks handles Bluetooth, projects,
hardware checks and execution. There is no separate Studworks MCP client to
install for this local workflow. Projects are saved locally on your Mac.
The optional online workbench, cloud MCP/public API and browser hub bridge are
implemented, with DigitalOcean deployment and real-host/device checks still to
come. In supported desktop Chrome, the browser connects to the nearby hub;
cloud MCP cannot reach Bluetooth by itself. Allowing a Claude/ChatGPT session
does not approve a run: each exact program still needs your approval beside the
hub. This does not replace offline use or require builder accounts. Online
requests are sent to the hosted service; an AI provider may process them too.

You do not need Xcode, Swift or the source checkout. These instructions apply to
the bundled Mac app; the first public beta download is being prepared.

1. Install the Studworks Mac app in Applications and open it.
2. Choose **Enable local MCP** under **External AI / MCP** in Studworks. If macOS asks, grant Bluetooth
   permission to **Studworks**, not to the AI app.
3. Configure your AI app to launch the bundled helper as a **local stdio MCP
   server**, with no arguments. For clients using the common JSON format:

```json
{
  "mcpServers": {
    "studworks": {
      "command": "/Applications/Studworks.app/Contents/Helpers/studworks-mcp"
    }
  }
}
```

Keep the helper inside its matching app. If you installed Studworks elsewhere,
use that absolute path. Configuration locations vary by AI client; restart the
client if it requires it and keep Studworks open. The helper does not launch the
app automatically. Compatibility depends on the host supporting this local stdio
integration; listing an MCP server is not itself proof of hardware compatibility.

Start with a read-only hardware check:

> List nearby LEGO hubs. After I choose a hub, connect, run the non-moving
> self-test and inspect its ports. Do not move any motors.

The app and MCP share the same capabilities and guardrails. Each connection needs
a successful non-moving self-test and fresh port inspection. Motor roles must be
confirmed against the real build. An AI can propose a run, but only you can choose
**Approve and run** in Studworks. Keep the mechanism clear and the hub's physical
stop button within reach when testing movement.

### Replacing an older development setup

If your AI app points at a standalone `StudworksMCP/.build/...` or older
`dist/mcp-qualification/...` executable, first stop the program and confirm the
hub is stopped. Replace that configuration with the bundled app path above,
remove duplicate Studworks entries, and restart the AI app. The retired helper
could connect directly to Bluetooth; the bundled helper uses the Studworks app.

The MCP server and Bluetooth connection run locally, but the AI client you connect
may process conversations through its own service. That client's plan, charges,
and privacy terms are separate from Studworks. Studworks itself remains free.

## Studworks 0.1.0 Beta

### Getting started guides

On the combined DigitalOcean site, choose **Open web app** on the homepage or
**Web app** in the navigation/shared footer. The routes are:

| Destination | Same-origin path |
| --- | --- |
| Web app | `/app/` |
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

The connection guide distinguishes the upcoming hosted beta from the bundled
local Mac helper. It does not claim an official directory listing or completed
host/hardware qualification.

### Beta package

The first beta is one Apple-silicon Mac download containing the app, its local
model and the matching MCP helper. No separate server installation or paid
Studworks service. **It is free, forever.** Not a trial.

The beta download is coming next, after final device checks and Mac release
packaging. Its exact candidate tag and build will be recorded on the
[releases page](https://github.com/graemerycyk/studworks/releases); earlier
development candidates are not the new download. iPhone and iPad (iOS/iPadOS)
are planned for later in September 2026, subject to Apple review. The Chrome
web app is implemented and awaiting deployment and device checks.

**Early.** Studworks is being built in the open and is not finished. If you try it
and it does something daft, email [help@studworks.build](mailto:help@studworks.build)
or [open an issue](https://github.com/graemerycyk/studworks/issues). Telling me is
the most useful thing you can do.

## Projects and Journal

The owner approved `/privacy/` and `/terms/`, effective **7 September 2026**.
They identify **studworks.build — Belgium**, with **help@studworks.build** for
privacy/support. Draft labels and `noindex` were removed. The policies distinguish
the current GitHub Pages website from online services that are not yet available;
approval does not announce the DigitalOcean launch or certify legal compliance.
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
There are no builder accounts, likes, comments, tracking, media uploads or
automatic publication. A private receipt lets builders check or withdraw a
submission. `/admin/` uses allowlisted, single-use magic-link moderator login.
This requires the new backend's PostgreSQL and mail configuration: GitHub Pages
alone cannot accept submissions. Unconfigured forms stay closed, not fake-saved.
Copying a prompt does not open the app, connect to hardware or execute anything.
Published builds have a shareable page, project download and explicit web-app
import link. Imported projects become independent copies; source facts require
confirmation and neither live bindings nor run approvals are transferred.
Remixes can link back to their published source. Sharing is not model-training
consent. Direct in-app publishing is not required: export the project and attach
it to the submission form.

### Maintaining the website

The site stays plain HTML/CSS/JavaScript. Its editorial content can be served
statically; web-app links and the submission/moderation backend require the
combined DigitalOcean origin. Pages share `assets/site.css`, including the
colourful Projects/Journal shell. `assets/site.js` adds clipboard controls with a
selectable-text fallback and resolves the MCP address on HTTPS deployments.
Core content and navigation work without JavaScript. The homepage cycles through
five typed examples, with a static reduced-motion alternative; its old Pause
examples and Copy prompt controls have been removed.

All 18 website pages embed the exact footer from `scripts/footer.html`. When
changing it, update each page; `scripts/check_site.py` rejects drift. The template
is build-time source, not a browser dependency or public asset. Static checks
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
