package com.flowmind.controller;

import com.flowmind.model.Activity;
import com.flowmind.service.UserService;
import com.flowmind.service.WorkflowService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.Map;

@RestController @CrossOrigin(origins="*")
public class ActivityController {
    private final WorkflowService w; private final UserService u;
    public ActivityController(WorkflowService w,UserService u){this.w=w;this.u=u;}

    @PostMapping("/activity")
    public ResponseEntity<?> record(@RequestHeader(value="X-Token",required=false) String token,@RequestBody Activity a){
        String uid=u.isValidToken(token)?u.getUsernameByToken(token):a.getUserId();
        if(uid==null) return ResponseEntity.status(401).body(Map.of("error","Unauthorized"));
        if(a.getAppName()==null||a.getAppName().isBlank()) return ResponseEntity.badRequest().body(Map.of("error","appName required"));
        a.setUserId(uid);
        long now=System.currentTimeMillis();
        if(a.getStartTime()==0) a.setStartTime(now-a.getDurationMs());
        if(a.getEndTime()==0)   a.setEndTime(now);
        if(a.getDurationMs()==0)a.setDurationMs(a.getEndTime()-a.getStartTime());
        if(a.getSource()==null) a.setSource("api");
        if(a.getCategory()==null)a.setCategory(Activity.categorize(a.getAppName()));
        w.recordActivity(a);
        return ResponseEntity.ok(Map.of("status","recorded","appName",a.getAppName(),"durationMs",a.getDurationMs()));
    }

    @GetMapping("/status")
    public ResponseEntity<?> status(@RequestHeader(value="X-Token",required=false) String token){
        if(!u.isValidToken(token)) return ResponseEntity.status(401).body(Map.of("error","Unauthorized"));
        String uid=u.getUsernameByToken(token);
        return ResponseEntity.ok(Map.of("currentApp",w.getCurrentApp(uid),"sessions",w.getActivities(uid).size(),"userId",uid,"tracking",u.isTrackingEnabled(token)));
    }

    @GetMapping("/predict")
    public ResponseEntity<?> predict(@RequestHeader(value="X-Token",required=false) String token,@RequestParam(defaultValue="Chrome") String currentApp){
        if(!u.isValidToken(token)) return ResponseEntity.status(401).body(Map.of("error","Unauthorized"));
        return ResponseEntity.ok(w.predict(u.getUsernameByToken(token),currentApp));
    }

    @GetMapping("/transitions")
    public ResponseEntity<?> transitions(@RequestHeader(value="X-Token",required=false) String token){
        if(!u.isValidToken(token)) return ResponseEntity.status(401).body(Map.of("error","Unauthorized"));
        return ResponseEntity.ok(w.getTransitions(u.getUsernameByToken(token)));
    }

    @GetMapping("/logs")
    public ResponseEntity<?> logs(@RequestHeader(value="X-Token",required=false) String token){
        if(!u.isValidToken(token)) return ResponseEntity.status(401).body(Map.of("error","Unauthorized"));
        return ResponseEntity.ok(w.getLogsForUser(u.getUsernameByToken(token)));
    }
}
