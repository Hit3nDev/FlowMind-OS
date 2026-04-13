package com.flowmind.controller;
import com.flowmind.model.TimelineEntry;
import com.flowmind.service.UserService;
import com.flowmind.service.WorkflowService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;
@RestController @RequestMapping("/timeline") @CrossOrigin(origins="*")
public class TimelineController {
    private final WorkflowService w; private final UserService u;
    public TimelineController(WorkflowService w,UserService u){this.w=w;this.u=u;}
    @GetMapping
    public ResponseEntity<?> get(@RequestHeader(value="X-Token",required=false) String token){
        if(!u.isValidToken(token)) return ResponseEntity.status(401).body("Unauthorized");
        String uid=u.getUsernameByToken(token);
        List<TimelineEntry> entries=w.getActivities(uid).stream().map(TimelineEntry::new)
            .sorted((a,b)->Long.compare(b.getStartTime(),a.getStartTime())).toList();
        return ResponseEntity.ok(entries);
    }
}
