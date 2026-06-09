import React, { useState, useRef, useEffect } from "react";
import styles from "./Terminal.module.css";

const COMMANDS = {
  help: () => [
    { t:"info", v:"SimpleLogz Terminal — available commands:" },
    { t:"out",  v:"  ping <host>           Check connectivity" },
    { t:"out",  v:"  curl <url>            Test HTTP endpoint" },
    { t:"out",  v:"  nslookup <host>       DNS lookup" },
    { t:"out",  v:"  ps                    Running processes" },
    { t:"out",  v:"  df                    Disk usage" },
    { t:"out",  v:"  top                   CPU / memory snapshot" },
    { t:"out",  v:"  kubectl get pods      K8s pod status" },
    { t:"out",  v:"  kubectl get nodes     K8s node status" },
    { t:"out",  v:"  docker ps             Container list" },
    { t:"out",  v:"  netstat               Network connections" },
    { t:"out",  v:"  date                  Current date/time" },
    { t:"out",  v:"  whoami                Current user" },
    { t:"out",  v:"  echo <text>           Print text" },
    { t:"out",  v:"  ls                    List files" },
    { t:"out",  v:"  clear                 Clear terminal" },
  ],
  date:   () => [{ t:"out", v: new Date().toString() }],
  whoami: () => [{ t:"out", v: "engineer@simplelogz" }],
  ls:     () => [{ t:"out", v: "logs/    config/    reports/    README.md" }],
  ps: () => [
    { t:"info",  v:"  PID TTY   TIME     CMD" },
    { t:"out",   v:"    1 ?     00:00:01 systemd" },
    { t:"out",   v:" 1234 pts/0 00:00:02 node server.js" },
    { t:"out",   v:" 1235 pts/0 00:00:00 nginx: master process" },
    { t:"out",   v:" 1242 pts/0 00:00:05 postgres: main" },
    { t:"out",   v:" 1250 pts/0 00:00:00 redis-server *:6379" },
  ],
  df: () => [
    { t:"info", v:"Filesystem     Size  Used Avail Use%" },
    { t:"out",  v:"/dev/sda1       50G   22G   26G  46%" },
    { t:"out",  v:"tmpfs          2.0G   12M  2.0G   1%" },
    { t:"out",  v:"/dev/sdb1      500G  180G  296G  38%" },
  ],
  top: () => [
    { t:"info", v:"top — simulated process snapshot" },
    { t:"out",  v:"" },
    { t:"out",  v:"Tasks: 142 total,   2 running, 140 sleeping" },
    { t:"out",  v:"Cpu(s):  4.2%us,  1.3%sy,  0.0%ni, 93.2%id" },
    { t:"out",  v:"Mem:  8192M total,  3210M used,  4982M free" },
    { t:"out",  v:"" },
    { t:"out",  v:"  PID USER      %CPU %MEM COMMAND" },
    { t:"out",  v:" 1234 deploy     3.1  6.3 node server.js" },
    { t:"out",  v:" 1235 www-data   0.7  0.6 nginx: worker" },
    { t:"out",  v:" 1242 postgres   0.4  4.2 postgres: main" },
  ],
  netstat: () => [
    { t:"info", v:"Proto  Local Address        Foreign Address      State" },
    { t:"out",  v:"tcp    0.0.0.0:3001         0.0.0.0:*            LISTEN" },
    { t:"out",  v:"tcp    0.0.0.0:80           0.0.0.0:*            LISTEN" },
    { t:"out",  v:"tcp    0.0.0.0:443          0.0.0.0:*            LISTEN" },
    { t:"out",  v:"tcp    127.0.0.1:5432       127.0.0.1:52140      ESTABLISHED" },
  ],
  "kubectl get pods": () => [
    { t:"info", v:"NAME                     READY  STATUS         RESTARTS  AGE" },
    { t:"out",  v:"api-server-7d4b9c-xk2pl  1/1    Running        0         2d" },
    { t:"err",  v:"worker-6f8b9-zzm4n       0/1    CrashLoopBack  5         4m" },
    { t:"out",  v:"db-proxy-5c7d8-pl9kq     1/1    Running        0         2d" },
    { t:"out",  v:"redis-cache-84fb-n2q5j   1/1    Running        0         5h" },
  ],
  "kubectl get nodes": () => [
    { t:"info", v:"NAME           STATUS  ROLES         AGE   VERSION" },
    { t:"out",  v:"node-master    Ready   control-plane  30d  v1.28.0" },
    { t:"out",  v:"node-worker-1  Ready   <none>         30d  v1.28.0" },
    { t:"out",  v:"node-worker-2  Ready   <none>         30d  v1.28.0" },
  ],
  "docker ps": () => [
    { t:"info", v:"CONTAINER ID   IMAGE           STATUS         PORTS           NAMES" },
    { t:"out",  v:"a1b2c3d4e5f6   nginx:latest    Up 2 days      80->80/tcp      webserver" },
    { t:"out",  v:"b2c3d4e5f6a7   postgres:14     Up 2 days      5432/tcp        database" },
    { t:"err",  v:"c3d4e5f6a7b8   myapp:latest    Exited (137)                   api-server" },
  ],
};

export default function Terminal() {
  const [lines, setLines]     = useState([
    { t:"info", v:"SimpleLogz Terminal v1.0" },
    { t:"info", v:'Type "help" for available commands' },
    { t:"out",  v:"" },
  ]);
  const [input, setInput]     = useState("");
  const [history, setHistory] = useState([]);
  const [histIdx, setHistIdx] = useState(-1);
  const outputRef = useRef(null);
  const inputRef  = useRef(null);

  useEffect(() => {
    if (outputRef.current) outputRef.current.scrollTop = outputRef.current.scrollHeight;
  }, [lines]);

  function addLines(newLines) {
    setLines(l => [...l, ...newLines, { t:"out", v:"" }]);
  }

  function runCommand(cmd) {
    const trimmed = cmd.trim();
    if (!trimmed) return;

    setHistory(h => [trimmed, ...h]);
    setHistIdx(-1);

    addLines([{ t:"prompt", v:`engineer@simplelogz:~$ ${trimmed}` }]);

    if (trimmed === "clear") { setLines([]); return; }

    const handler = COMMANDS[trimmed];
    if (handler) { addLines(handler()); return; }

    if (trimmed.startsWith("echo ")) { addLines([{ t:"out", v: trimmed.slice(5) }]); return; }
    if (trimmed.startsWith("ping ")) {
      const host = trimmed.slice(5);
      addLines([
        { t:"out", v:`PING ${host} (93.184.216.34) 56 bytes of data.` },
        { t:"out", v:`64 bytes: icmp_seq=1 ttl=55 time=12.3 ms` },
        { t:"out", v:`64 bytes: icmp_seq=2 ttl=55 time=11.8 ms` },
        { t:"success", v:`2 packets transmitted, 2 received, 0% packet loss` },
      ]); return;
    }
    if (trimmed.startsWith("curl ")) {
      addLines([
        { t:"out", v:`> GET ${trimmed.slice(5)}` },
        { t:"success", v:"< HTTP/1.1 200 OK" },
        { t:"out", v:`< Content-Type: application/json` },
        { t:"out", v:`{"status":"ok","timestamp":"${new Date().toISOString()}"}` },
      ]); return;
    }
    if (trimmed.startsWith("nslookup ")) {
      const host = trimmed.slice(9);
      addLines([
        { t:"out", v:`Server:\t8.8.8.8\nAddress:\t8.8.8.8#53` },
        { t:"out", v:`Name:\t${host}\nAddress: 93.184.216.34` },
      ]); return;
    }

    addLines([{ t:"err", v:`${trimmed}: command not found. Type "help" for available commands.` }]);
  }

  function handleKey(e) {
    if (e.key === "Enter") { runCommand(input); setInput(""); return; }
    if (e.key === "ArrowUp") {
      e.preventDefault();
      const idx = Math.min(histIdx + 1, history.length - 1);
      setHistIdx(idx); setInput(history[idx] || "");
    }
    if (e.key === "ArrowDown") {
      e.preventDefault();
      const idx = Math.max(histIdx - 1, -1);
      setHistIdx(idx); setInput(idx === -1 ? "" : history[idx]);
    }
  }

  return (
    <div className={styles.page}>
      <div className="container" style={{flex:1,display:"flex",flexDirection:"column",paddingTop:24,paddingBottom:24}}>
        <div className={styles.header}>
          <div>
            <h1 className={styles.title}>Browser Terminal</h1>
            <p className={styles.sub}>Run diagnostic commands. Simulated environment — safe for testing.</p>
          </div>
          <button className="btn btn-outline btn-sm" onClick={()=>setLines([])}>Clear</button>
        </div>

        <div className={styles.terminal} onClick={()=>inputRef.current?.focus()}>
          <div className={styles.bar}>
            <span className={styles.dot} style={{background:"#f87171"}}/>
            <span className={styles.dot} style={{background:"#fbbf24"}}/>
            <span className={styles.dot} style={{background:"#34d399"}}/>
            <span className={styles.barTitle}>simplelogz — terminal</span>
          </div>
          <div className={styles.output} ref={outputRef}>
            {lines.map((l, i) => (
              <div key={i} className={`${styles.line} ${styles[l.t]}`}>{l.v}</div>
            ))}
          </div>
          <div className={styles.inputRow}>
            <span className={styles.prompt}>engineer@simplelogz:~$</span>
            <input
              ref={inputRef}
              className={styles.input}
              value={input}
              onChange={e=>setInput(e.target.value)}
              onKeyDown={handleKey}
              placeholder="type a command…"
              autoComplete="off"
              spellCheck={false}
              autoFocus
            />
          </div>
        </div>
      </div>
    </div>
  );
}
