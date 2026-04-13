package com.flowmind.model;
import java.time.Instant;
public class Session {
    private String token, username;
    private Instant createdAt, lastActive;
    public Session(String t, String u) { token=t; username=u; createdAt=Instant.now(); lastActive=Instant.now(); }
    public String  getToken()     { return token; }
    public String  getUsername()  { return username; }
    public Instant getLastActive(){ return lastActive; }
    public void    touch()        { lastActive=Instant.now(); }
}
