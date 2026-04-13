package com.flowmind.model;

public class Activity {
    private String appName;
    private String windowTitle;
    private String userId;
    private long   startTime;
    private long   endTime;
    private long   durationMs;
    private String category;
    private String source;

    public Activity() {}

    public Activity(String appName, String userId, long startTime, long endTime) {
        this.appName    = appName;
        this.userId     = userId;
        this.startTime  = startTime;
        this.endTime    = endTime;
        this.durationMs = endTime - startTime;
        this.category   = categorize(appName);
        this.source     = "api";
    }

    public static String categorize(String app) {
        if (app == null) return "NEUTRAL";
        String a = app.toLowerCase();
        if (a.contains("code") || a.contains("github") || a.contains("classroom") ||
            a.contains("terminal") || a.contains("intellij") || a.contains("jupyter") ||
            a.contains("stackoverflow") || a.contains("notion"))  return "PRODUCTIVE";
        if (a.contains("youtube") || a.contains("netflix") || a.contains("instagram") ||
            a.contains("tiktok") || a.contains("twitter") || a.contains("reddit"))  return "UNPRODUCTIVE";
        return "NEUTRAL";
    }

    public String getAppName()       { return appName; }
    public String getWindowTitle()   { return windowTitle; }
    public String getUserId()        { return userId; }
    public long   getStartTime()     { return startTime; }
    public long   getEndTime()       { return endTime; }
    public long   getDurationMs()    { return durationMs; }
    public String getCategory()      { return category; }
    public String getSource()        { return source; }

    public void setAppName(String v)     { this.appName    = v; if (category == null) category = categorize(v); }
    public void setWindowTitle(String v) { this.windowTitle = v; }
    public void setUserId(String v)      { this.userId     = v; }
    public void setStartTime(long v)     { this.startTime  = v; }
    public void setEndTime(long v)       { this.endTime    = v; }
    public void setDurationMs(long v)    { this.durationMs = v; }
    public void setCategory(String v)    { this.category   = v; }
    public void setSource(String v)      { this.source     = v; }
}
