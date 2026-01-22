#!/usr/bin/env python3
import os
import sys
import unicodedata

ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
SKIP_DIRS = {".git", "node_modules", "dist"}

BIDI_CODEPOINTS = {
    0x202A,  # LRE
    0x202B,  # RLE
    0x202C,  # PDF
    0x202D,  # LRO
    0x202E,  # RLO
    0x2066,  # LRI
    0x2067,  # RLI
    0x2068,  # FSI
    0x2069,  # PDI
    0x200E,  # LRM
    0x200F,  # RLM
    0x200B,  # ZWSP
    0x200C,  # ZWNJ
    0x200D,  # ZWJ
    0xFEFF,  # BOM
}


def iter_files():
    for dirpath, dirnames, filenames in os.walk(ROOT):
        dirnames[:] = [d for d in dirnames if d not in SKIP_DIRS]
        for filename in filenames:
            path = os.path.join(dirpath, filename)
            yield path


def scan_file(path):
    try:
        data = open(path, "rb").read()
    except OSError:
        return []
    try:
        text = data.decode("utf-8")
    except UnicodeDecodeError:
        return []
    hits = []
    for index, ch in enumerate(text):
        if ord(ch) in BIDI_CODEPOINTS or unicodedata.category(ch) == "Cf":
            hits.append((index, ch))
    return hits


def main():
    issues = []
    for path in iter_files():
        hits = scan_file(path)
        if hits:
            for index, ch in hits:
                issues.append(
                    (path, index, f"U+{ord(ch):04X}", unicodedata.name(ch, "UNKNOWN"))
                )
    if issues:
        print("Hidden/bidirectional Unicode characters detected:")
        for path, index, code, name in issues:
            rel = os.path.relpath(path, ROOT)
            print(f"- {rel}:{index} {code} {name}")
        return 1
    print("No hidden/bidirectional Unicode characters found.")
    return 0


if __name__ == "__main__":
    sys.exit(main())
