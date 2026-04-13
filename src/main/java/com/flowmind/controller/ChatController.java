package com.flowmind.controller;
import com.flowmind.model.ChatMessage;
import com.flowmind.service.ChatService;
import com.flowmind.service.UserService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.Map;
@RestController @RequestMapping("/chat") @CrossOrigin(origins="*")
public class ChatController {
    private final ChatService c; private final UserService u;
    public ChatController(ChatService c,UserService u){this.c=c;this.u=u;}
    @PostMapping
    public ResponseEntity<?> chat(@RequestHeader(value="X-Token",required=false) String token,@RequestBody Map<String,String> b){
        if(!u.isValidToken(token)) return ResponseEntity.status(401).body(Map.of("error","Unauthorized"));
        String msg=b.getOrDefault("message","").trim();
        if(msg.isEmpty()) return ResponseEntity.badRequest().body(Map.of("error","Message required"));
        ChatMessage r=c.respond(u.getUsernameByToken(token),msg);
        return ResponseEntity.ok(Map.of("reply",r.getContent(),"action",r.getAction()!=null?r.getAction():"","role","assistant"));
    }
    @GetMapping("/history")
    public ResponseEntity<?> history(@RequestHeader(value="X-Token",required=false) String token){
        if(!u.isValidToken(token)) return ResponseEntity.status(401).body(Map.of("error","Unauthorized"));
        return ResponseEntity.ok(c.getHistory(u.getUsernameByToken(token)));
    }
}
