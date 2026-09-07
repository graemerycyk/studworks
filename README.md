# Studworks

**Tell a LEGO machine what to do. It works out the rest.**

Connect a supported LEGO hub. Studworks finds out what is plugged in, asks about
anything it cannot see, turns one plain-language instruction into a small program,
compiles it on your device, and puts it on the hub.

**It is free, forever.** Not a trial.

**For Mac, iPad and iPhone.** Chrome support is planned.
The iPhone and iPad apps (iOS/iPadOS) are planned for later in September 2026,
subject to Apple review.

The Studworks app works offline. No account, API key, or Studworks server is
required, and what you type in the app stays on your device.

## What it does

- Inspects the hub and identifies what is connected to each port.
- Answers questions about the hub, including its battery voltage.
- Controls the hub light and creates bounded motor actions from plain language.
- Shows the generated code before you choose to run it.
- Asks when a motor's purpose is unclear and rejects instructions it cannot
  interpret safely instead of guessing.

The beta focuses on explicit, bounded actions. The next candidate adds saved
machine details, portable projects, version history and exact corrections such
as “Make the lift motor 20% slower”, “turn 45 degrees instead” and “wait two seconds
longer”. Exact edits show a before/after review and ask which step when ambiguous.
The web workbench also has device-local autosave, a project library and machine
detail editing; it does not need a builder account. Free-form corrections, sensor automation
and continuous control remain outside the supported surface.

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
An optional online workbench, cloud MCP/API and temporary device pairing are
being prepared on DigitalOcean. They do not replace offline use or require
builder accounts. Online requests are sent to the hosted service; physical runs
still require the connected device's local approval.

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
packaging. It will appear on the
[releases page](https://github.com/graemerycyk/studworks/releases) as
`v0.1.0-beta.1` (app version `0.1.0`). iPhone and iPad (iOS/iPadOS) are planned
for later in September 2026, subject to Apple review. Chrome support is planned.

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
project (up to 1 MiB). Only approved submissions appear publicly. Attachments
include machine notes and version history, so review them before sharing.
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

The site stays plain HTML/CSS/JavaScript. Its static content remains compatible
with the existing root-based GitHub Pages deployment; the intended DigitalOcean
migration adds the same-origin submission/moderation backend. Pages
share `assets/site.css`; `assets/site.js` only adds clipboard buttons with a
selectable-text fallback. Core content and navigation work without JavaScript.

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
