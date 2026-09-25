# -*- coding: utf-8 -*-
"""Publish worldwide-invest.org on mj-server Traefik edge → office-app :443."""
from __future__ import annotations

import base64
import shlex
import ssl
import sys
import time
import urllib.request
from pathlib import Path

import paramiko

sys.path.insert(0, str(Path.home() / ".cursor" / "scripts"))
from office_vault_secrets import cred  # noqa: E402

sys.stdout.reconfigure(encoding="utf-8", errors="replace")

MJ = "10.0.10.126"
YAML = Path(__file__).resolve().parents[1] / ".impeccable" / "office-app.yaml.live"


def sudo(c, password: str, cmd: str, timeout: int = 60) -> tuple[int, str]:
    wrapped = f"sudo -S -p '' bash -lc {shlex.quote(cmd)}"
    stdin, o, e = c.exec_command(wrapped, timeout=timeout, get_pty=True)
    stdin.write(password + "\n")
    stdin.flush()
    stdin.channel.shutdown_write()
    raw = (o.read() + e.read()).decode(errors="replace").replace(password, "***")
    return o.channel.recv_exit_status(), raw


def main() -> int:
    text = YAML.read_text(encoding="utf-8")
    if "Host(`worldwide-invest.org`)" not in text:
        print("ERROR: local yaml missing correct Host rules", file=sys.stderr)
        return 1

    u, pw = cred(MJ)
    c = paramiko.SSHClient()
    c.set_missing_host_key_policy(paramiko.AutoAddPolicy())
    c.connect(MJ, username=u, password=pw, look_for_keys=False, allow_agent=False, timeout=20)
    b64 = base64.b64encode(text.encode()).decode("ascii")
    code, out = sudo(
        c,
        pw,
        "echo "
        + b64
        + " | base64 -d > /data/coolify/proxy/dynamic/office-app.yaml && "
        "chmod 644 /data/coolify/proxy/dynamic/office-app.yaml && "
        "grep -n 'worldwide-invest' /data/coolify/proxy/dynamic/office-app.yaml",
    )
    print(out[-2000:])
    c.close()
    if code != 0:
        print("ERROR write failed", code, file=sys.stderr)
        return 1

    time.sleep(10)
    ctx = ssl._create_unverified_context()
    for host in ("worldwide-invest.org", "www.worldwide-invest.org", "zeido.net"):
        req = urllib.request.Request("https://86.122.49.78/", headers={"Host": host})
        try:
            with urllib.request.urlopen(req, context=ctx, timeout=25) as r:
                body = r.read(400).decode("utf-8", "replace")
                print(f"EDGE {host} -> {r.status} brand={'Worldwide Invest' in body}")
        except Exception as ex:
            print(f"EDGE {host} -> FAIL {ex}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
