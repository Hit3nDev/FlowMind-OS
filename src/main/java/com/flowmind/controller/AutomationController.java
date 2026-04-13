package com.flowmind.controller;
import com.flowmind.service.AutomationService;
import com.flowmind.service.UserService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.Map;
@RestController @RequestMapping("/automate") @CrossOrigin(origins="*")
public class AutomationController {
    private final AutomationService a; private final UserService u;
    public AutomationController(AutomationService a,UserService u){this.a=a;this.u=u;}
    @PostMapping("/{action}")
    public ResponseEntity<?> run(@PathVariable String action,@RequestHeader(value="X-Token",required=false) String token,@RequestBody(required=false) Map<String,String> body){
        if(!u.isValidToken(token)) return ResponseEntity.status(401).body(Map.of("error","Unauthorized"));
        String uid=u.getUsernameByToken(token);
        String result=switch(action){
            case "study-session" -> a.startStudySession(uid);
            case "coding-setup"  -> a.startCodingSetup(uid);
            case "social-apps"   -> a.openSocialApps(uid);
            case "open-chrome"   -> a.openChrome(uid);
            case "open-vscode"   -> a.openVSCode(uid);
            case "open-terminal" -> a.openTerminal(uid);
            case "open-classroom"-> a.openURL("https://classroom.google.com",uid);
            case "open-github"   -> a.openURL("https://github.com",uid);
            case "open-whatsapp" -> a.openURL("https://web.whatsapp.com",uid);
            case "open-youtube"  -> a.openURL("https://youtube.com",uid);
            case "open-url"      -> { String url=body!=null?body.getOrDefault("url",""):""; yield url.isEmpty()?"No URL.":a.openURL(url,uid); }
            default -> "Unknown action: "+action;
        };
        return ResponseEntity.ok(Map.of("result",result,"action",action));
    }
}
