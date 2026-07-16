#!/usr/bin/env python3
"""Migrate report HTML files to shared design system."""

import re
from pathlib import Path

REPORTS_DIR = Path(__file__).parent / "reports"

HEAD_ASSETS = """
    <link rel="stylesheet" href="../styles.css">
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Baumans&family=Fira+Code:wght@400;500;700&family=Inter:wght@300;400;500;600;700&family=Space+Grotesk:wght@400;500;600;700&display=swap" rel="stylesheet">
    <link rel="stylesheet" href="../reports.css">
    <script src="../report.js" defer></script>
"""

REPORT_CONFIG = {
    "CKD_Prediction_report.html": {
        "eyebrow": "Technical Report",
        "github": "https://github.com/CherishVasant/Chronic-Kidney-Disease-Prediction",
    },
    "Cloud-Security-In-IoT_report.html": {
        "eyebrow": "Technical Report",
        "github": "https://github.com/CherishVasant/Cloud-Security-In-IoT",
    },
    "Atrial-Fibrillation-Detection_report.html": {
        "eyebrow": "Technical Report",
        "github": "https://github.com/CherishVasant/Atrial-Fibrillation-Detection",
    },
    "TrebleAI_report.html": {
        "eyebrow": "Technical Report",
        "github": "https://github.com/CherishVasant/Treble-AI",
    },
}


def strip_style_blocks(html: str) -> str:
    return re.sub(r"<style[^>]*>.*?</style>", "", html, flags=re.DOTALL | re.IGNORECASE)


def inject_head_assets(html: str) -> str:
    if "../styles.css" in html:
        return html
    return html.replace("</head>", HEAD_ASSETS + "\n</head>", 1)


def build_shell(github_url: str) -> tuple[str, str]:
    prefix = f'''<body class="report-page">
    <canvas id="starfield" aria-hidden="true"></canvas>
    <header>
        <nav class="navbar report-navbar">
            <a href="../index.html" class="nav-head"><span class="gradient-text">Cherish Vasant</span></a>
            <div class="report-nav-actions">
                <a href="../index.html" class="report-nav-link back-link">← Portfolio</a>
                <a href="{github_url}" class="report-nav-link github-link" target="_blank" rel="noopener">GitHub</a>
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


def transform_ckd(html: str, config: dict) -> str:
    html = re.sub(r"<body[^>]*>", "", html, count=1)
    html = re.sub(r"</body>\s*", "", html, flags=re.IGNORECASE)

    # Remove old nav
    html = re.sub(r"<!-- Navigation -->.*?</nav>\s*", "", html, flags=re.DOTALL)

    # Unwrap outer container (first only)
    html = re.sub(r"<div class=\"container\">\s*", "", html, count=1)

    # Transform header
    html = re.sub(
        r'<header class="project-header">\s*<h1 class="project-title[^"]*">([^<]+)</h1>\s*<p class="project-subtitle">\s*([\s\S]*?)\s*</p>\s*<div class="tech-stack">([\s\S]*?)</div>\s*</header>',
        r'''<header class="report-hero">
            <span class="report-eyebrow">''' + config["eyebrow"] + r'''</span>
            <h1 class="report-title">\1</h1>
            <p class="report-intro">\2</p>
            <div class="report-tags">\3</div>
        </header>''',
        html,
        count=1,
    )

    html = re.sub(
        r'<section class="card" id="([^"]+)"',
        r'<section class="report-section card" id="\1"',
        html,
    )

    html = re.sub(
        r'<section class="report-section card" id="summary" style="[^"]*">',
        '<section class="report-section card summary-section" id="summary">',
        html,
    )

    html = re.sub(r"<footer", '<footer class="report-footer"', html, count=1)
    html = re.sub(r"\n\s*</div>\s*(\n\s*<footer)", r"\1", html, count=1)

    prefix, suffix = build_shell(config["github"])
    return prefix + html + suffix


def transform_cloud(html: str, config: dict) -> str:
    html = re.sub(r"<body[^>]*>", "", html, count=1)
    html = re.sub(r"</body>", "", html, flags=re.IGNORECASE)
    html = re.sub(r"<!-- Navigation Header -->.*?</nav>\s*", "", html, flags=re.DOTALL)
    html = html.replace('<div class="container">', "", 1)

    html = re.sub(
        r"<header>\s*<h1>([^<]+)</h1>\s*<p class=\"subtitle\">([^<]+(?:<[^>]+>[^<]*</[^>]+>[^<]*)*)</p>\s*<div class=\"tags\">(.*?)</div>\s*</header>",
        r'''<header class="report-hero">
            <span class="report-eyebrow">''' + config["eyebrow"] + r'''</span>
            <h1 class="report-title">\1</h1>
            <p class="report-intro">\2</p>
            <div class="report-tags">\3</div>
        </header>''',
        html,
        flags=re.DOTALL,
    )

    html = re.sub(r'<section id="([^"]+)"', r'<section class="report-section" id="\1"', html)

    prefix, suffix = build_shell(config["github"])
    # Remove trailing container close before footer
    html = re.sub(r"\n\s*</div>\s*\n\s*<footer", "\n    <footer class=\"report-footer\"", html, count=1)
    return prefix + html + suffix


def transform_treble(html: str, config: dict) -> str:
    html = re.sub(r"<body[^>]*>", "", html, count=1)
    html = re.sub(r"</body>", "", html, flags=re.IGNORECASE)
    html = re.sub(r"<div class=\"container\">\s*", "", html, count=1)
    html = re.sub(r"<!-- Top Navigation bar -->.*?</nav>\s*", "", html, flags=re.DOTALL)

    html = re.sub(
        r"<header>\s*<h1>([^<]+)</h1>\s*<p class=\"subtitle\">([^<]+)</p>\s*<div class=\"tag-container\">(.*?)</div>\s*</header>",
        r'''<header class="report-hero">
            <span class="report-eyebrow">''' + config["eyebrow"] + r'''</span>
            <h1 class="report-title">\1</h1>
            <p class="report-intro">\2</p>
            <div class="report-tags">\3</div>
        </header>''',
        html,
        flags=re.DOTALL,
    )

    html = re.sub(r'<section id="([^"]+)"', r'<section class="report-section" id="\1"', html)

    prefix, suffix = build_shell(config["github"])
    html = re.sub(r"\n\s*</div>\s*\n\s*<footer", "\n    <footer class=\"report-footer\"", html, count=1)
    return prefix + html + suffix


def transform_af(html: str, config: dict) -> str:
    html = re.sub(r"<body[^>]*>", "", html, count=1)
    html = re.sub(r"</body>", "", html, flags=re.IGNORECASE)
    html = re.sub(r"<!-- Header Navigation -->.*?</nav>\s*", "", html, flags=re.DOTALL)

    html = html.replace('<main class="container">', '<div class="af-layout">', 1)
    html = html.replace("</main>", "</div>", 1)

    html = re.sub(
        r'<section class="hero-section">\s*<h1 class="project-title">([^<]+)</h1>\s*<p class="problem-statement">([^<]+(?:&amp;[^<]*)*)</p>\s*<div class="tech-tags">(.*?)</div>\s*</section>',
        r'''<header class="report-hero">
            <span class="report-eyebrow">''' + config["eyebrow"] + r'''</span>
            <h1 class="report-title">\1</h1>
            <p class="report-intro">\2</p>
            <div class="report-tags">\3</div>
        </header>''',
        html,
        flags=re.DOTALL,
    )

    html = re.sub(r"<article class=\"card\">", '<article class="report-section card">', html)

    prefix, suffix = build_shell(config["github"])
    html = re.sub(r"<footer", '<footer class="report-footer"', html, count=1)
    return prefix + html + suffix


TRANSFORMERS = {
    "CKD_Prediction_report.html": transform_ckd,
    "Cloud-Security-In-IoT_report.html": transform_cloud,
    "Atrial-Fibrillation-Detection_report.html": transform_af,
    "TrebleAI_report.html": transform_treble,
}


def process_file(filename: str) -> None:
    path = REPORTS_DIR / filename
    if not path.exists():
        print(f"Skip missing: {filename}")
        return

    config = REPORT_CONFIG[filename]
    transformer = TRANSFORMERS[filename]

    html = path.read_text(encoding="utf-8")
    html = strip_style_blocks(html)
    html = inject_head_assets(html)
    html = transformer(html, config)

    # Ensure material symbols for back-to-top
    if "Material+Symbols" not in html and "material-symbols" not in html.lower():
        html = html.replace(
            "</head>",
            '    <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@24,400,0,0&icon_names=arrow_upward" />\n</head>',
            1,
        )

    if "</html>" not in html:
        html += "\n</html>"

    path.write_text(html, encoding="utf-8")
    print(f"Updated: {filename}")


def main():
    for filename in REPORT_CONFIG:
        process_file(filename)


if __name__ == "__main__":
    main()
