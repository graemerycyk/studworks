# Studworks

**Tell a LEGO machine what to do. It works out the rest.**

Connect a supported LEGO hub. Studworks finds out what is plugged in, asks about
anything it cannot see, turns your description into a program, compiles it on your
own device, and puts it on the hub. Then you tell it what to change.

It works offline. No account, no API key, no server, nothing sent anywhere.

## What makes it different

It knows what it is programming. Most tools that write code for you have no idea
what is on the other end of the cable — Studworks starts by asking the hub, and
when it cannot tell which motor is your barrier, it asks you instead of guessing.
Moving the wrong motor is the one mistake worth avoiding above all others.

## Hardware

Works with supported LEGO hubs, including City, Technic, BOOST Move, SPIKE Prime,
SPIKE Essential, and MINDSTORMS Robot Inventor. Motors and colour/distance sensors.
Studworks uses [Pybricks](https://pybricks.com) on the hub; if it is not installed
yet, the app guides you through setup.

## Status

Early, and built in the open. If you try it and it does something daft, email
[help@studworks.build](mailto:help@studworks.build) or open an issue here.

## Licence and attribution

Not affiliated with, endorsed by, or sponsored by the LEGO Group.
LEGO® is a trademark of the LEGO Group.

Not affiliated with the Pybricks project. Studworks does not redistribute
Pybricks — programs import it at runtime on the hub.

Includes the MicroPython cross-compiler, MIT licensed. See `NOTICE.md` in the
application repository.
