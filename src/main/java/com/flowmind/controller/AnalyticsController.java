package com.flowmind.controller;
import com.flowmind.service.AnalyticsService;
import com.flowmind.service.UserService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
@RestController @RequestMapping("/analytics") @CrossOrigin(origins="*")
public class AnalyticsController {
    private final AnalyticsService a; private final UserService u;
    public AnalyticsController(AnalyticsService a,UserService u){this.a=a;this.u=u;}
    @GetMapping
    public ResponseEntity<?> get(@RequestHeader(value="X-Token",required=false) String token){
        if(!u.isValidToken(token)) return ResponseEntity.status(401).body("Unauthorized");
        return ResponseEntity.ok(a.compute(u.getUsernameByToken(token)));
    }
}
