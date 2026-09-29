import json
import os
import subprocess
import sys

def main():
    config_file = "/tmp/zu_rocket.json"
    if not os.path.exists(config_file):
        print(f"Error: {config_file} not found", file=sys.stderr)
        sys.exit(1)

    with open(config_file, "r") as f:
        cfg = json.load(f)

    env = os.environ.copy()
    env["CLOUDFLARE_EMAIL"] = cfg["cloudflare_email"]
    env["CLOUDFLARE_API_KEY"] = cfg["cloudflare_api_key"]
    env["CLOUDFLARE_ACCOUNT_ID"] = "f121469e28a25823c43919728f7e0a2f"

    wrangler_bin = "/Users/avinash/.npm/_npx/955c3153614f2ba4/node_modules/wrangler/bin/wrangler.js"

    cmd = [
        "node",
        wrangler_bin,
        "pages",
        "deploy",
        "out",
        "--project-name=zerosuniverse-tools",
        "--branch=main",
        "--commit-dirty=true"
    ]

    print(f"Starting deployment for {env['CLOUDFLARE_EMAIL']} with project zerosuniverse-tools...")
    res = subprocess.run(cmd, env=env)
    sys.exit(res.returncode)

if __name__ == "__main__":
    main()
