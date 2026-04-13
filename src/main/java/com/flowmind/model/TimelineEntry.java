package com.flowmind.model;
import java.time.Instant;
import java.time.ZoneId;
import java.time.format.DateTimeFormatter;
public class TimelineEntry {
    private String appName, windowTitle, startFormatted, endFormatted, category, source;
    private long   durationMs, startTime;
    private static final DateTimeFormatter FMT =
        DateTimeFormatter.ofPattern("HH:mm:ss").withZone(ZoneId.systemDefault());
    public TimelineEntry(Activity a) {
        appName=a.getAppName();
        windowTitle=a.getWindowTitle()!=null?a.getWindowTitle():a.getAppName();
        startTime=a.getStartTime();
        startFormatted=FMT.format(Instant.ofEpochMilli(a.getStartTime()));
        endFormatted=a.getEndTime()>0?FMT.format(Instant.ofEpochMilli(a.getEndTime())):"—";
        durationMs=a.getDurationMs(); category=a.getCategory(); source=a.getSource();
    }
    public String getAppName()        { return appName; }
    public String getWindowTitle()    { return windowTitle; }
    public String getStartFormatted() { return startFormatted; }
    public String getEndFormatted()   { return endFormatted; }
    public long   getDurationMs()     { return durationMs; }
    public String getCategory()       { return category; }
    public String getSource()         { return source; }
    public long   getStartTime()      { return startTime; }
}
