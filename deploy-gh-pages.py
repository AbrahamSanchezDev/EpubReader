#!/usr/bin/env python3
"""Build this Angular app as a static site and force-push it to a GitHub Pages branch.

Usage: python deploy-gh-pages.py   (answers are remembered in angular-deployer-config.json)
"""
import json
import os
import shutil
import subprocess
import sys
import tempfile
from pathlib import Path

ROOT = Path(__file__).resolve().parent
CONFIG = ROOT / "angular-deployer-config.json"


def ask(prompt, default=""):
    answer = input(f"{prompt} [{default}]: ").strip()
    return answer or default


def run(cmd, cwd=ROOT):
    print(f"\n→ {' '.join(cmd)}")
    subprocess.run(cmd, cwd=cwd, check=True)


def repo_name(url):
    return url.rstrip("/").split("/")[-1].removesuffix(".git")


def browser_dir():
    """dist/<project>/browser, honoring outputPath in angular.json."""
    workspace = json.loads((ROOT / "angular.json").read_text(encoding="utf-8"))
    name, project = next(iter(workspace["projects"].items()))
    out = project["architect"]["build"]["options"].get("outputPath", f"dist/{name}")
    if isinstance(out, dict):
        out = out.get("base", f"dist/{name}")
    return ROOT / out / "browser"


def main():
    sys.stdout.reconfigure(encoding="utf-8")  # → / ✓ crash cp1252 when output is piped on Windows
    cfg = json.loads(CONFIG.read_text()) if CONFIG.exists() else {}
    origin = subprocess.run(["git", "remote", "get-url", "origin"], cwd=ROOT, capture_output=True, text=True).stdout.strip()

    print("=" * 60 + "\nAngular → GitHub Pages Deployer\n" + "=" * 60)
    cfg["repo_url"] = ask("GitHub repository URL", cfg.get("repo_url", origin))
    if "github.com" not in cfg["repo_url"]:
        sys.exit("✗ URL must be a GitHub repository")
    name = repo_name(cfg["repo_url"])
    # <user>.github.io repos and custom domains are served from "/", project repos from "/<repo>".
    default_base = cfg.get("base_path", "" if name.endswith(".github.io") else f"/{name}")
    cfg["base_path"] = ask("Base path ('/' for user site or custom domain)", default_base or "/").rstrip("/")
    cfg["target_branch"] = ask("Target branch", cfg.get("target_branch", "gh-pages"))
    cfg["commit_message"] = ask("Commit message", cfg.get("commit_message", "Deploy Angular build to GitHub Pages"))
    cfg["custom_domain"] = ask("Custom domain for CNAME (blank for none)", cfg.get("custom_domain", ""))

    if input("\nSave this configuration? (y/n) [y]: ").strip().lower() != "n":
        CONFIG.write_text(json.dumps(cfg, indent=2))
    if input(f"Build and force-push to {cfg['target_branch']}? (y/n) [y]: ").strip().lower() == "n":
        sys.exit("✗ Deployment cancelled")

    # --- Build: static output mode, since Pages can't run the SSR server ---
    npm = shutil.which("npm") or "npm"  # npm.cmd on Windows
    run([npm, "run", "build", "--", "--output-mode", "static", "--base-href", cfg["base_path"] + "/"])

    out = browser_dir()
    # Pages serves 404.html for unknown paths; the client-side-rendered shell lets the router take over.
    shutil.copyfile(out / "index.csr.html" if (out / "index.csr.html").exists() else out / "index.html", out / "404.html")
    (out / ".nojekyll").touch()  # otherwise Pages hides files starting with "_"
    if cfg["custom_domain"]:
        (out / "CNAME").write_text(cfg["custom_domain"])

    # --- Push: fresh one-commit repo each time, so gh-pages never accumulates history ---
    with tempfile.TemporaryDirectory() as tmp:
        site = Path(tmp) / "site"
        shutil.copytree(out, site)
        run(["git", "init", "-q"], cwd=site)
        run(["git", "add", "-A"], cwd=site)
        run(["git", "commit", "-q", "-m", cfg["commit_message"]], cwd=site)
        run(["git", "push", "--force", cfg["repo_url"], f"HEAD:{cfg['target_branch']}"], cwd=site)
        # git marks objects read-only on Windows; let TemporaryDirectory delete them
        for p in site.rglob("*"):
            os.chmod(p, 0o700)

    user = cfg["repo_url"].split("github.com")[1].strip(":/").split("/")[0]
    host = cfg["custom_domain"] or f"{user.lower()}.github.io"
    print("\n" + "=" * 60 + f"\n✓ Deployed. Live at: https://{host}{cfg['base_path']}/")
    print(f"  (first time: repo Settings → Pages → Source = branch '{cfg['target_branch']}', folder '/')\n" + "=" * 60)


if __name__ == "__main__":
    try:
        main()
    except subprocess.CalledProcessError as e:
        sys.exit(f"✗ Command failed ({e.returncode}): {' '.join(e.cmd)}")
    except KeyboardInterrupt:
        sys.exit("\n✗ Cancelled")
