#!/usr/bin/env python3
"""Dependency-free checks for the public static site; no browser or network required."""
from html.parser import HTMLParser
from pathlib import Path
from urllib.parse import unquote, urlsplit
import re
import xml.etree.ElementTree as ET

ROOT = Path(__file__).resolve().parents[1]
# Exact sibling-component entry points on the combined DigitalOcean origin.
# The private deployment preflight verifies these against its shipped web app.
SERVICE_PAGES = {"/app/", "/app/connect.html", "/api/v1/openapi.json"}
PAGE_PATHS = [
    Path("index.html"),
    *(path.relative_to(ROOT) for section in ("projects", "journal", "admin", "privacy", "terms")
      for path in sorted((ROOT / section).rglob("*.html"))),
]


class Page(HTMLParser):
    VOID = {"area", "base", "br", "col", "embed", "hr", "img", "input", "link", "meta", "param", "source", "track", "wbr"}

    def __init__(self, path):
        super().__init__(convert_charrefs=True)
        self.path = path
        self.ids = set()
        self.links = []
        self.stack = []
        self.tags = []
        self.meta = {}
        self.copy_targets = []
        self.feed(path.read_text())
        assert not self.stack, f"Unclosed tags in {path}: {self.stack}"

    def handle_starttag(self, tag, attributes):
        attrs = dict(attributes)
        self.tags.append(tag)
        if tag not in self.VOID:
            self.stack.append(tag)
        if "id" in attrs:
            assert attrs["id"] not in self.ids, f"Duplicate ID in {self.path}: {attrs['id']}"
            self.ids.add(attrs["id"])
        for key in ("href", "src"):
            if key in attrs:
                self.links.append((tag, attrs[key]))
        if tag == "html":
            assert attrs.get("lang") == "en", f"Missing document language: {self.path}"
        if tag == "meta":
            self.meta[attrs.get("name", attrs.get("property", ""))] = attrs.get("content", "")
        if tag == "img":
            assert "alt" in attrs, f"Missing image alt: {self.path}"
        if "data-copy-target" in attrs:
            self.copy_targets.append(attrs["data-copy-target"])
        if tag == "button":
            assert attrs.get("type") in ("button", "submit"), f"Implicit button type: {self.path}"
            if "data-copy-target" in attrs:
                assert "hidden" in attrs, f"Copy controls must degrade without JS: {self.path}"

    def handle_endtag(self, tag):
        assert self.stack and self.stack[-1] == tag, f"Misnested {tag} in {self.path}: {self.stack}"
        self.stack.pop()


def check():
    pages = {ROOT / path: Page(ROOT / path) for path in PAGE_PATHS}
    shared_footer = (ROOT / "scripts/footer.html").read_text().strip()
    shared_navigation = (ROOT / "scripts/navigation.html").read_text().strip()
    titles = set()
    for path, page in pages.items():
        footers = re.findall(r"<footer\b[^>]*>[\s\S]*?</footer>", path.read_text())
        assert len(footers) == 1 and footers[0] == shared_footer, f"Footer must match scripts/footer.html: {path}"
        navigation = re.findall(r'<nav class="site-nav"[^>]*>[\s\S]*?</nav>', path.read_text())
        assert len(navigation) == 1, f"Expected one shared navigation: {path}"
        assert re.sub(r' aria-current="(?:page|true)"', '', navigation[0]) == shared_navigation, f"Navigation must match scripts/navigation.html: {path}"
        assert page.tags.count("h1") == 1, f"Expected one h1: {path}"
        assert page.tags.count("main") == 1, f"Expected one main landmark: {path}"
        assert page.meta.get("description") and page.meta.get("viewport"), f"Missing metadata: {path}"
        title = page.meta.get("og:title")
        assert title and title not in titles, f"Missing/duplicate social title: {path}"
        titles.add(title)
        assert page.meta.get("og:description") and page.meta.get("og:url"), f"Missing social metadata: {path}"
        for target in page.copy_targets:
            assert target in page.ids, f"Missing copy target {target}: {path}"
        for tag, link in page.links:
            url = urlsplit(link)
            assert url.scheme not in ("javascript", "data"), f"Unsafe URL: {path}: {link}"
            if url.scheme or url.netloc:
                assert url.scheme in ("https", "mailto"), f"Unexpected external URL: {link}"
                continue
            if tag == "a" and url.path in SERVICE_PAGES and not url.query and not url.fragment:
                continue
            resolved = ROOT / unquote(url.path).lstrip("/") if url.path.startswith("/") else path.parent / unquote(url.path)
            if not url.path:
                resolved = path
            if resolved.is_dir():
                resolved /= "index.html"
            resolved = resolved.resolve()
            assert resolved.is_relative_to(ROOT) and resolved.is_file(), f"Broken {tag} link: {path}: {link}"
            if url.fragment and resolved in pages:
                assert unquote(url.fragment) in pages[resolved].ids, f"Broken fragment: {path}: {link}"
    concept = (ROOT / "projects/railway-crossing/index.html").read_text()
    assert "Not available in this beta" in concept and "data-copy-target" not in concept
    home = (ROOT / "index.html").read_text()
    readme = (ROOT / "README.md").read_text()
    for route in ("privacy", "terms"):
        policy = (ROOT / route / "index.html").read_text()
        assert "Effective 7 September 2026" in policy, "Keep the owner-approved policy effective date"
        assert "Draft for approval" not in policy and 'content="noindex"' not in policy, "Approved policy pages must not retain draft-only markers"
        assert "<strong>studworks.build</strong>" in policy and "<strong>Belgium</strong>" in policy, "Policies must retain the owner-supplied service name and country"
        assert "provided under the name" in policy, "Do not imply the service name is a verified registered company"
        assert "Updated 10 September 2026" in policy, "Date the planned processing notice separately from the approved policy"
        assert "The Web App is available as a beta" in policy, "Do not call the deployed Web App unavailable"
        assert "Input/output retention for service improvement is planned" in policy and "not enabled" in policy, "Planned improvement retention is not active processing"
        assert "Cloud hub authorization and community submissions" in policy and "launch checks" in policy, "Retain the separate online-feature activation gates"
        assert "(draft)" not in policy
    assert "Privacy (draft)" not in home and "Terms (draft)" not in home
    for content in (home, readme):
        assert "cloud MCP" in content, "The public integration must describe cloud MCP"
        assert "Helpers/studworks-mcp" not in content and "Enable local MCP" not in content, "Local MCP is deferred, not bundled"
        assert "source-only" not in content and "swift build --package-path StudworksMCP" not in content, "Retired MCP setup must not return"
        assert "Studworks 0.1.0 Beta" in content and "Open Web App" in content, "The current beta starts in the Web App"
        assert "September 2026, subject to Apple review" not in content, "Do not promise a postponed native launch date"
    feed = ET.parse(ROOT / "journal/feed.xml").getroot()
    ns = {"a": "http://www.w3.org/2005/Atom"}
    entries = feed.findall("a:entry", ns)
    assert len(entries) == len(list((ROOT / "journal").glob("*/index.html"))), "Journal/feed out of sync"
    for entry in entries:
        href = entry.find("a:link", ns).attrib["href"]
        path = ROOT / urlsplit(href).path.lstrip("/") / "index.html"
        assert path in pages, f"Feed entry has no article: {href}"
        assert entry.findtext("a:title", namespaces=ns) == pages[path].meta["og:title"], f"Feed title mismatch: {href}"
    print(f"PASS: {len(pages)} pages; local links, fragments, metadata, HTML nesting, copy targets and {len(entries)} feed entries.")


if __name__ == "__main__":
    check()
