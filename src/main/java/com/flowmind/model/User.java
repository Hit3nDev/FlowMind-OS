package com.flowmind.model;
public class User {
    private String username, password, displayName, email;
    private boolean trackingEnabled = true;
    public User(String u, String p, String d, String e) { username=u; password=p; displayName=d; email=e; }
    public String  getUsername()    { return username; }
    public String  getPassword()    { return password; }
    public String  getDisplayName() { return displayName; }
    public String  getEmail()       { return email; }
    public boolean isTrackingEnabled()          { return trackingEnabled; }
    public void    setTrackingEnabled(boolean b){ trackingEnabled=b; }
    public void    setDisplayName(String d)     { displayName=d; }
}
