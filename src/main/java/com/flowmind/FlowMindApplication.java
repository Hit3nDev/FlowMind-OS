package com.flowmind;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication
public class FlowMindApplication {
    public static void main(String[] args) {
        SpringApplication.run(FlowMindApplication.class, args);
        System.out.println("""

╔══════════════════════════════════════════════════════════╗
║   FlowMind OS v3.0 — AI Productivity Intelligence       ║
║   Backend  →  http://localhost:8080                     ║
║   Frontend →  cd frontend && npm run dev                ║
║   Tracker  →  python tracker.py [username] [password]   ║
╚══════════════════════════════════════════════════════════╝
""");
    }
}
