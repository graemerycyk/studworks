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

The first alpha deliberately focuses on single, explicit actions. Sensor
automation and conversational **Change it** refinement will return after their
safety pass.

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
and colour/distance sensors; the first alpha exposes port inspection, battery,
hub-light, and bounded motor actions.

Studworks uses [Pybricks](https://pybricks.com) on the hub. If it is not installed
yet, the app guides you through setup.

## MCP developer preview

Studworks also has a local macOS [Model Context Protocol](https://modelcontextprotocol.io)
server. It lets a compatible desktop AI client scan for a hub, connect, inspect
every port, read the Studworks API, run a bounded program, read its output, stop
it, and disconnect. A read-only port inspection is required after every connection
before any program can run.

This is currently a **source-only developer preview**. It is not included in the
alpha download and has not completed its real-hub safety qualification. The setup
below is for people who already have the full Studworks source checkout.

### Requirements

- macOS 14 or later and Xcode with Swift 6.2
- A supported LEGO hub with Pybricks installed
- Claude Desktop for the current preview; other MCP clients have not yet been
  qualified for Studworks' macOS Bluetooth permission flow

### Build and test the server

From the root of the full source checkout:

```sh
swift test --package-path StudworksMCP
swift build --package-path StudworksMCP -c release
```

Keep the executable in its SwiftPM release directory so it can find its bundled
safety shim and API description.

### Add it to Claude Desktop

Open `~/Library/Application Support/Claude/claude_desktop_config.json` and add a
local stdio server using an absolute path:

```json
{
  "mcpServers": {
    "studworks": {
      "command": "/ABSOLUTE/PATH/TO/STUDWORKS-SOURCE/StudworksMCP/.build/release/studworks-mcp"
    }
  }
}
```

Fully quit and reopen Claude Desktop, allow Bluetooth when macOS asks, and put the
hub into its blinking-blue discovery mode. Use this as the first safe check:

> List nearby LEGO hubs. Connect to the strongest one, then inspect its ports.
> Do not run a program.

Motor execution through MCP remains a developer test until its disconnect and
process-exit hardening has passed on real hardware. Keep the mechanism clear and
the hub's physical stop button within reach during any hardware test.

The MCP server and Bluetooth connection run locally, but the AI client you connect
may process conversations through its own service. That client's plan, charges,
and privacy terms are separate from Studworks. Studworks itself remains free.

## Download and status

[Download the latest release](https://github.com/graemerycyk/studworks/releases).
The first alpha download is for Apple-silicon Macs while iPad and iPhone builds
finish testing.

**Early.** Studworks is being built in the open and is not finished. If you try it
and it does something daft, email [help@studworks.build](mailto:help@studworks.build)
or [open an issue](https://github.com/graemerycyk/studworks/issues). Telling me is
the most useful thing you can do.

## Licence and attribution

Not affiliated with, endorsed by, or sponsored by the LEGO Group. LEGO® is a
trademark of the LEGO Group.

Not affiliated with the Pybricks project. Studworks does not redistribute
Pybricks; programs import it at runtime on the hub.

Includes the MicroPython cross-compiler, MIT licensed.
