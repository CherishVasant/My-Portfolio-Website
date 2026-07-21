#!/usr/bin/env python3
"""Fix malformed report HTML after migration."""

import re
from pathlib import Path

REPORTS_DIR = Path(__file__).parent

SHELL_PREFIX_RE = re.compile(
    r"^<body class=\"report-page\">[\s\S]*?<main class=\"report-main\">\s*",
    re.MULTILINE,
)

SHELL_SUFFIX_RE = re.compile(
    r"\s*</main>\s*</div>\s*<nav class=\"section-nav-mobile\"[\s\S]*?<div class=\"back-to-top\"[\s\S]*?</div>\s*",
    re.MULTILINE,
)

HEAD_ASSETS = """
    <link rel="stylesheet" href="../styles.css">
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Baumans&family=Fira+Code:wght@400;500;700&family=Inter:wght@300;400;500;600;700&family=Space+Grotesk:wght@400;500;600;700&display=swap" rel="stylesheet">
    <link rel="stylesheet" href="reports.css">
    <script src="report.js" defer></script>
    <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@24,400,0,0&icon_names=arrow_upward" />
"""

GITHUB_URLS = {
    "CKD_Prediction_report.html": "https://github.com/CherishVasant/Chronic-Kidney-Disease-Prediction",
    "Cloud-Security-In-IoT_report.html": "https://github.com/CherishVasant/Cloud-Security-In-IoT",
    "Atrial-Fibrillation-Detection_report.html": "https://github.com/CherishVasant/Atrial-Fibrillation-Detection",
    "TrebleAI_report.html": "https://github.com/CherishVasant/Treble-AI",
}


def build_shell(github: str) -> tuple[str, str]:
    prefix = f'''<body class="report-page">
    <canvas id="starfield" aria-hidden="true"></canvas>
    <header>
        <nav class="navbar report-navbar">
            <a href="../index.html" class="nav-head"><span class="gradient-text">Cherish Vasant</span></a>
            <div class="report-nav-actions">
                <a href="../index.html" class="report-nav-link back-link">← Portfolio</a>
                <a href="{github}" class="report-nav-link github-link" target="_blank" rel="noopener">GitHub</a>
            </div>
        </nav>
    </header>
    <div class="report-layout">
        <nav class="section-nav-desktop" id="sectionNavDesktop" aria-label="Section navigation"></nav>
        <main class="report-main">
'''
    suffix = '''
        </main>
    </div>
    <nav class="section-nav-mobile" id="sectionNavMobile" aria-label="Section navigation mobile">
        <div class="section-nav-mobile-inner"></div>
    </nav>
    <div class="back-to-top" id="backToTop" aria-label="Back to top">
        <span class="material-symbols-outlined" style="font-size:24px;color:#fff;">arrow_upward</span>
    </div>
'''
    return prefix, suffix


def fix_file(path: Path) -> None:
    raw = path.read_text(encoding="utf-8")

    # Remove accidental leading shell
    raw = SHELL_PREFIX_RE.sub("", raw)
    raw = SHELL_SUFFIX_RE.sub("", raw)

    # Normalize doctype position
    doctype_idx = raw.find("<!DOCTYPE")
    if doctype_idx == -1:
        print(f"ERROR: no doctype in {path.name}")
        return
    raw = raw[doctype_idx:]

    # Split head and remainder
    head_end = raw.lower().find("</head>")
    if head_end == -1:
        print(f"ERROR: no </head> in {path.name}")
        return
    head_end += len("</head>")

    head = raw[:head_end]
    body_content = raw[head_end:]

    # Clean head
    head = re.sub(r"<style[^>]*>.*?</style>", "", head, flags=re.DOTALL | re.IGNORECASE)
    if "../styles.css" not in head:
        head = head.replace("</head>", HEAD_ASSETS + "\n</head>", 1)

    # Remove stray body tags and html close
    body_content = re.sub(r"<body[^>]*>", "", body_content, flags=re.IGNORECASE)
    body_content = re.sub(r"</body>\s*", "", body_content, flags=re.IGNORECASE)
    body_content = re.sub(r"</html>\s*$", "", body_content, flags=re.IGNORECASE)

    github = GITHUB_URLS.get(path.name, "#")
    prefix, suffix = build_shell(github)

    fixed = head + "\n" + prefix + body_content.strip() + suffix + "\n</body>\n</html>\n"
    path.write_text(fixed, encoding="utf-8")
    print(f"Fixed: {path.name}")


def main():
    for path in REPORTS_DIR.glob("*_report.html"):
        fix_file(path)


if __name__ == "__main__":
    main()
