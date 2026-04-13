package com.flowmind.model;
import java.util.List;
import java.util.Map;
public class AnalyticsData {
    private double productivityScore;
    private long totalActiveMs, productiveMs, unproductiveMs, neutralMs;
    private Map<String,Long>    appUsageMs;
    private Map<String,Integer> appFrequency;
    private List<String>        suggestions;
    private String topApp, anomalyStatus, focusTip;
    private int    sessionCount;
    private Prediction prediction;
    private double anomalyScore;
    private boolean hasRealData;

    public double              getProductivityScore()                { return productivityScore; }
    public void                setProductivityScore(double v)        { productivityScore=v; }
    public long                getTotalActiveMs()                    { return totalActiveMs; }
    public void                setTotalActiveMs(long v)              { totalActiveMs=v; }
    public long                getProductiveMs()                     { return productiveMs; }
    public void                setProductiveMs(long v)               { productiveMs=v; }
    public long                getUnproductiveMs()                   { return unproductiveMs; }
    public void                setUnproductiveMs(long v)             { unproductiveMs=v; }
    public long                getNeutralMs()                        { return neutralMs; }
    public void                setNeutralMs(long v)                  { neutralMs=v; }
    public Map<String,Long>    getAppUsageMs()                       { return appUsageMs; }
    public void                setAppUsageMs(Map<String,Long> v)     { appUsageMs=v; }
    public Map<String,Integer> getAppFrequency()                     { return appFrequency; }
    public void                setAppFrequency(Map<String,Integer> v){ appFrequency=v; }
    public List<String>        getSuggestions()                      { return suggestions; }
    public void                setSuggestions(List<String> v)        { suggestions=v; }
    public String              getTopApp()                           { return topApp; }
    public void                setTopApp(String v)                   { topApp=v; }
    public String              getAnomalyStatus()                    { return anomalyStatus; }
    public void                setAnomalyStatus(String v)            { anomalyStatus=v; }
    public String              getFocusTip()                         { return focusTip; }
    public void                setFocusTip(String v)                 { focusTip=v; }
    public int                 getSessionCount()                     { return sessionCount; }
    public void                setSessionCount(int v)                { sessionCount=v; }
    public Prediction          getPrediction()                       { return prediction; }
    public void                setPrediction(Prediction v)           { prediction=v; }
    public double              getAnomalyScore()                     { return anomalyScore; }
    public void                setAnomalyScore(double v)             { anomalyScore=v; }
    public boolean             isHasRealData()                       { return hasRealData; }
    public void                setHasRealData(boolean v)             { hasRealData=v; }
}
