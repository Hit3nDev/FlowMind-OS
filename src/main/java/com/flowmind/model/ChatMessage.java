package com.flowmind.model;
public class ChatMessage {
    private String role, content, action;
    private long   timestamp;
    public ChatMessage(String role, String content) {
        this.role=role; this.content=content; this.timestamp=System.currentTimeMillis();
    }
    public String getRole()           { return role; }
    public String getContent()        { return content; }
    public long   getTimestamp()      { return timestamp; }
    public String getAction()         { return action; }
    public void   setAction(String a) { action=a; }
}
