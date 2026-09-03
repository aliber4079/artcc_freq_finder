import json
import os
import re
from pathlib import Path
import requests

# Optional: set GITHUB_TOKEN env var for higher rate limits
TOKEN = os.getenv("GITHUB_TOKEN", "").strip()
HEADERS = {"Accept": "application/vnd.github+json"}
if TOKEN:
    HEADERS["Authorization"] = f"Bearer {TOKEN}"

OUTDIR = Path("sector_sources")
OUTDIR.mkdir(exist_ok=True)

def gh_get(url, params=None):
    r = requests.get(url, headers=HEADERS, params=params, timeout=60)
    r.raise_for_status()
    return r.json()

def search_repos(query, per_page=50):
    data = gh_get("https://api.github.com/search/repositories", params={"q": query, "per_page": per_page})
    return data.get("items", [])

def search_code(query, per_page=100):
    data = gh_get("https://api.github.com/search/code", params={"q": query, "per_page": per_page})
    return data.get("items", [])

def download_raw(owner, repo, path, default_branch):
    raw_url = f"https://raw.githubusercontent.com/{owner}/{repo}/{default_branch}/{path}"
    r = requests.get(raw_url, timeout=60)
    if r.status_code == 200 and r.text.strip():
        return r.text
    return None

def main():
    # Broad repo discovery: VATUSA + ARTCC + sector files
    repo_queries = [
        "vatusa sector file in:name,description,readme",
        "ARTCC .sct2 vatsim",
        "VATSIM center sector file",
    ]

    repos = {}
    for q in repo_queries:
        for item in search_repos(q):
            full = item["full_name"]
            repos[full] = item

    print(f"Discovered repos: {len(repos)}")

    # Code discovery for sector files in discovered repos (and globally with VATUSA hints)
    sector_exts = ["sct", "sct2", "ese"]
    found_files = []

    # Global-ish targeted searches
    code_queries = [
        "extension:sct2 VATSIM",
        "extension:ese VATSIM",
        "extension:sct VATUSA",
        "Hallsville High",
        "ZKC sector",
    ]

    for cq in code_queries:
        items = search_code(cq)
        for it in items:
            found_files.append({
                "repo": it["repository"]["full_name"],
                "path": it["path"],
                "html_url": it["html_url"],
                "sha": it.get("sha"),
            })

    # De-dup
    uniq = {}
    for f in found_files:
        uniq[(f["repo"], f["path"])] = f
    found_files = list(uniq.values())

    print(f"Discovered candidate files: {len(found_files)}")

    # Download candidates
    downloaded = []
    for f in found_files:
        owner, repo = f["repo"].split("/", 1)
        repo_meta = repos.get(f["repo"])
        if not repo_meta:
            # fetch repo metadata for default branch
            try:
                repo_meta = gh_get(f"https://api.github.com/repos/{owner}/{repo}")
            except Exception:
                continue

        default_branch = repo_meta.get("default_branch", "main")
        content = download_raw(owner, repo, f["path"], default_branch)
        if not content:
            continue

        local = OUTDIR / owner / repo / f["path"]
        local.parent.mkdir(parents=True, exist_ok=True)
        local.write_text(content, encoding="utf-8", errors="ignore")
        downloaded.append({
            "repo": f["repo"],
            "path": f["path"],
            "default_branch": default_branch,
            "html_url": f["html_url"],
            "local_path": str(local),
        })

    manifest = {
        "repos_found": sorted(list(repos.keys())),
        "files_downloaded": downloaded,
    }
    Path("sector_sources_manifest.json").write_text(json.dumps(manifest, indent=2), encoding="utf-8")
    print(f"Downloaded files: {len(downloaded)}")
    print("Wrote sector_sources_manifest.json")

if __name__ == "__main__":
    main()