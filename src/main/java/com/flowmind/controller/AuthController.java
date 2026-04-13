package com.flowmind.controller;

import com.flowmind.service.UserService;
import com.flowmind.service.WorkflowService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.Map;

@RestController @RequestMapping("/auth") @CrossOrigin(origins="*")
public class AuthController {
    private final UserService u; private final WorkflowService w;
    public AuthController(UserService u, WorkflowService w){this.u=u;this.w=w;}

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody Map<String,String> b){
        String un=b.getOrDefault("username","").trim().toLowerCase();
        String pw=b.getOrDefault("password","").trim();
        if(un.isEmpty()||pw.isEmpty()) return ResponseEntity.badRequest().body(Map.of("error","Username and password required."));
        String token=u.login(un,pw);
        if(token==null) return ResponseEntity.status(401).body(Map.of("error","Invalid credentials."));
        var user=u.getUser(token);
        w.log("INFO","User logged in",un);
        return ResponseEntity.ok(Map.of("token",token,"username",un,"displayName",user!=null?user.getDisplayName():un,"message","Welcome back!"));
    }

    @PostMapping("/signup")
    public ResponseEntity<?> signup(@RequestBody Map<String,String> b){
        String un=b.getOrDefault("username","").trim().toLowerCase();
        String pw=b.getOrDefault("password","").trim();
        String dn=b.getOrDefault("displayName",un);
        String em=b.getOrDefault("email","");
        String err=u.register(un,pw,dn,em);
        if(err!=null) return ResponseEntity.badRequest().body(Map.of("error",err));
        String token=u.login(un,pw);
        w.log("INFO","New user registered",un);
        return ResponseEntity.ok(Map.of("token",token,"username",un,"displayName",dn,"message","Account created!"));
    }

    @PostMapping("/logout")
    public ResponseEntity<?> logout(@RequestHeader(value="X-Token",required=false) String token){
        if(token!=null){String uid=u.getUsernameByToken(token);if(uid!=null)w.log("INFO","Logout",uid);u.logout(token);}
        return ResponseEntity.ok(Map.of("message","Logged out."));
    }

    @GetMapping("/me")
    public ResponseEntity<?> me(@RequestHeader(value="X-Token",required=false) String token){
        if(!u.isValidToken(token)) return ResponseEntity.status(401).body(Map.of("error","Unauthorized"));
        var user=u.getUser(token); String uid=u.getUsernameByToken(token);
        return ResponseEntity.ok(Map.of("username",uid,"displayName",user!=null?user.getDisplayName():uid));
    }

    @PostMapping("/tracking")
    public ResponseEntity<?> setTracking(@RequestHeader(value="X-Token",required=false) String token,@RequestBody Map<String,Boolean> b){
        if(!u.isValidToken(token)) return ResponseEntity.status(401).body(Map.of("error","Unauthorized"));
        boolean en=b.getOrDefault("enabled",true); u.setTracking(token,en);
        return ResponseEntity.ok(Map.of("tracking",en));
    }

    @GetMapping("/health")
    public ResponseEntity<?> health(){return ResponseEntity.ok(Map.of("status","UP","service","FlowMind OS v3.0"));}

    @GetMapping("/users")
    public ResponseEntity<?> getUsers() {
        return ResponseEntity.ok(u.getAllUsers());
    }

    @GetMapping("/sessions")
    public ResponseEntity<?> getSessions() {
        return ResponseEntity.ok(u.getAllSessions());
    }

    @PostMapping("/clear")
    public ResponseEntity<?> clear() {
        u.clearAll();
        return ResponseEntity.ok(Map.of("message", "Database cleared."));
    }
}
