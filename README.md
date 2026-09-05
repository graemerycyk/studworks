# Studworks

**Tell a LEGO machine what to do. It works out the rest.**

Connect a supported LEGO hub. Studworks finds out what is plugged in, asks about
anything it cannot see, turns one plain-language instruction into a small program,
compiles it on your device, and puts it on the hub.

**It is free, forever.** Not a trial.

**For Mac, iPad and iPhone.** Chrome support is planned.

The Studworks app works offline. No account, API key, or Studworks server is
required, and what you type in the app stays on your device.

## What it does

- Inspects the hub and identifies what is connected to each port.
- Answers questions about the hub, including its battery voltage.
- Controls the hub light and creates bounded motor actions from plain language.
- Shows the generated code before you choose to run it.
- Asks when a motor's purpose is unclear and rejects instructions it cannot
  interpret safely instead of guessing.

The first beta focuses on explicit, bounded actions. Sensor automation,
continuous control and conversational **Change it** refinement are not part of
this beta. Both the app and MCP use the same supported behaviour set.

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
install, hosted backend, account service, database service or cloud relay.
Projects are saved locally on your Mac.

You do not need Xcode, Swift or the source checkout. These instructions apply to
the bundled Mac app; the first public beta download is being prepared.

1. Install the Studworks Mac app in Applications and open it.
2. Enable **External AI control** in Studworks. If macOS asks, grant Bluetooth
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

The first beta is one Apple-silicon Mac download containing the app, its local
model and the matching MCP helper. No separate server installation or paid
Studworks service. **It is free, forever.** Not a trial.

The beta download is coming next, after final device checks and Mac release
packaging. It will appear on the
[releases page](https://github.com/graemerycyk/studworks/releases) as
`v0.1.0-beta.1` (app version `0.1.0`). iPad and iPhone builds are still being tested;
Chrome support is planned.

**Early.** Studworks is being built in the open and is not finished. If you try it
and it does something daft, email [help@studworks.build](mailto:help@studworks.build)
or [open an issue](https://github.com/graemerycyk/studworks/issues). Telling me is
the most useful thing you can do.

## Projects and Journal

The website has two lightweight editorial sections:

- [Projects](https://www.studworks.build/projects/): development-tested starter
  experiments, separately labelled future concepts, and an email invitation to
  share a build. Each project has its own page with hardware, prompts, expected
  behaviour, evidence limits and safety notes.
- [Journal](https://www.studworks.build/journal/): field notes and product decisions,
  with an [Atom feed](https://www.studworks.build/journal/feed.xml).

This is a manually curated first version, not a social network. There are no
accounts, likes, comments, tracking, project uploads or automatic publication.
Copying a prompt does not open the app, connect to hardware or execute anything.
In-app publishing, downloadable portable projects and remixing remain future work.

### Maintaining the website

The site stays plain HTML/CSS/JavaScript, compatible with the existing root-based
GitHub Pages deployment. No paid build service or new hosting is required. Pages
share `assets/site.css`; `assets/site.js` only adds clipboard buttons with a
selectable-text fallback. Core content and navigation work without JavaScript.

Local checks and an optional public-assets-only package:

```sh
python3 scripts/check_site.py
node --test scripts/test_copy.cjs
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

For emailed submissions, request only a display name, hardware list, prompt,
description of what happened and links to the creator’s own photo/video. Confirm
the wording, credit and permission to share each asset before publishing. Do not
publish email addresses or other personal details by default. A development test
must not be presented as current-release qualification.

## Licence and attribution

Not affiliated with, endorsed by, or sponsored by the LEGO Group. LEGO® is a
trademark of the LEGO Group.

Not affiliated with the Pybricks project. Studworks does not redistribute
Pybricks; programs import it at runtime on the hub.

Includes the MicroPython cross-compiler, MIT licensed.
