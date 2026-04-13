package com.flowmind.service;
import org.springframework.stereotype.Service;
import java.io.IOException;

@Service
public class AutomationService {
    private static final String OS=System.getProperty("os.name","").toLowerCase();
    private static final boolean IS_WIN=OS.contains("win");
    private static final boolean IS_MAC=OS.contains("mac");
    private final WorkflowService ws;
    public AutomationService(WorkflowService ws){this.ws=ws;}

    public String openChrome(String uid)          { return exec(uid,chromeCmd()); }
    public String openVSCode(String uid)           { return exec(uid,vscodeCmd()); }
    public String openTerminal(String uid)         { return exec(uid,termCmd()); }
    public String openURL(String url,String uid)   { return exec(uid,urlCmd(url)); }

    public String startStudySession(String uid) {
        ws.log("INFO","Automation: Study Session started",uid);
        exec(uid,urlCmd("https://classroom.google.com")); sleep(600);
        exec(uid,vscodeCmd());
        return "Study session started! Google Classroom and VS Code are opening.";
    }

    public String startCodingSetup(String uid) {
        ws.log("INFO","Automation: Coding Setup started",uid);
        exec(uid,vscodeCmd()); sleep(500);
        exec(uid,urlCmd("https://github.com")); sleep(500);
        exec(uid,termCmd());
        return "Coding setup launched! VS Code, GitHub, and Terminal are opening.";
    }

    public String openSocialApps(String uid) {
        ws.log("INFO","Automation: Social Apps",uid);
        exec(uid,urlCmd("https://web.whatsapp.com")); sleep(500);
        exec(uid,urlCmd("https://discord.com/app"));
        return "Opened WhatsApp Web and Discord in your browser.";
    }

    private String[] chromeCmd() {
        if(IS_WIN) return new String[]{"cmd","/c","start","chrome"};
        if(IS_MAC) return new String[]{"open","-a","Google Chrome"};
        return new String[]{"google-chrome"};
    }
    private String[] vscodeCmd() {
        if(IS_WIN) return new String[]{"cmd","/c","start","code"};
        if(IS_MAC) return new String[]{"open","-a","Visual Studio Code"};
        return new String[]{"code"};
    }
    private String[] termCmd() {
        if(IS_WIN) return new String[]{"cmd","/c","start","cmd"};
        if(IS_MAC) return new String[]{"open","-a","Terminal"};
        return new String[]{"x-terminal-emulator"};
    }
    private String[] urlCmd(String url) {
        if(IS_WIN) return new String[]{"cmd","/c","start",url};
        if(IS_MAC) return new String[]{"open",url};
        return new String[]{"xdg-open",url};
    }

    private String exec(String uid,String[] cmd) {
        try {
            new ProcessBuilder(cmd).redirectErrorStream(true).start();
            ws.log("SUCCESS","Executed: "+String.join(" ",cmd),uid);
            return "✓ Done";
        } catch(IOException e) {
            ws.log("ERROR","Command failed: "+e.getMessage(),uid);
            return "Note: "+e.getMessage();
        }
    }
    private void sleep(long ms){ try{Thread.sleep(ms);}catch(InterruptedException ignored){} }
}
