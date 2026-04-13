package com.flowmind.model;
import java.time.Instant;
import java.time.ZoneId;
import java.time.format.DateTimeFormatter;
public class LogEntry {
    private String level, message, formattedTime, username;
    private long   timestamp;
    private static final DateTimeFormatter FMT =
        DateTimeFormatter.ofPattern("HH:mm:ss").withZone(ZoneId.systemDefault());
    public LogEntry(String level, String message, String username) {
        this.level=level; this.message=message; this.username=username;
        this.timestamp=System.currentTimeMillis();
        this.formattedTime=FMT.format(Instant.ofEpochMilli(this.timestamp));
    }
    public String getLevel()         { return level; }
    public String getMessage()       { return message; }
    public long   getTimestamp()     { return timestamp; }
    public String getFormattedTime() { return formattedTime; }
    public String getUsername()      { return username; }
}
