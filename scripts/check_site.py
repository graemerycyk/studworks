#!/usr/bin/env python3
"""Dependency-free checks for the public static site; no browser or network required."""
from html.parser import HTMLParser
from pathlib import Path
from urllib.parse import unquote, urlsplit
import xml.etree.ElementTree as ET

ROOT = Path(__file__).resolve().parents[1]
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
    titles = set()
    for path, page in pages.items():
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
        assert "Draft for approval" in policy and 'content="noindex"' in policy, "Unapproved policy drafts must remain clearly marked and unindexed"
        assert "<strong>studworks.build</strong>" in policy and "<strong>Belgium</strong>" in policy, "Policies must retain the owner-supplied service name and country"
        assert "legal person or business" in policy, "A service name must not silently become a verified legal identity"
    for content in (home, readme):
        assert "/Applications/Studworks.app/Contents/Helpers/studworks-mcp" in content, "MCP must use the bundled helper"
        assert "source-only" not in content and "swift build --package-path StudworksMCP" not in content, "Retired MCP setup must not return"
        assert "Studworks 0.1.0 Beta" in content and "coming next" in content, "Do not advertise an unpublished beta as downloadable"
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
