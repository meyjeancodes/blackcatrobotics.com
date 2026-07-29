#!/usr/bin/env python3
"""Drive Blender over the BlenderMCP socket (localhost:9876).
Usage:
  python3 drive_socket.py "<code string>"
  python3 drive_socket.py --file build.py
Prints the JSON response (truncated) and exits non-zero on error.
"""
import socket, json, sys, os

PORT = 9876
HOST = "127.0.0.1"

def send_code(code: str, timeout: float = 480.0):
    payload = {"type": "execute_code", "params": {"code": code}}
    s = socket.socket()
    s.settimeout(timeout)
    s.connect((HOST, PORT))
    s.sendall(json.dumps(payload).encode())
    buf = []
    while True:
        try:
            c = s.recv(65536)
        except socket.timeout:
            break
        if not c:
            break
        buf.append(c)
        try:
            json.loads(b"".join(buf).decode())
            break
        except json.JSONDecodeError:
            continue
    s.close()
    raw = b"".join(buf).decode()
    try:
        return json.loads(raw)
    except json.JSONDecodeError:
        return {"status": "RAW", "raw": raw}

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("usage: drive_socket.py '<code>' | --file path.py", file=sys.stderr)
        sys.exit(2)
    if sys.argv[1] == "--file":
        with open(sys.argv[2]) as f:
            code = f.read()
    else:
        code = sys.argv[1]
    try:
        res = send_code(code)
    except Exception as e:
        print("SOCKET_ERROR:", e, file=sys.stderr)
        sys.exit(1)
    out = json.dumps(res, indent=2, default=str)
    # Truncate very long outputs for terminal readability
    if len(out) > 4000:
        out = out[:4000] + "\n...[truncated]"
    print(out)
    if isinstance(res, dict) and res.get("status") == "error":
        sys.exit(3)
