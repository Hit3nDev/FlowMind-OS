package com.flowmind.model;
public class Prediction {
    private String currentApp, predictedNextApp, suggestion, explanation;
    private double probability;
    public Prediction() {}
    public Prediction(String c, String n, double p, String s, String e) {
        currentApp=c; predictedNextApp=n; probability=p; suggestion=s; explanation=e;
    }
    public String getCurrentApp()              { return currentApp; }
    public void   setCurrentApp(String v)      { currentApp=v; }
    public String getPredictedNextApp()        { return predictedNextApp; }
    public void   setPredictedNextApp(String v){ predictedNextApp=v; }
    public double getProbability()             { return probability; }
    public void   setProbability(double v)     { probability=v; }
    public String getSuggestion()              { return suggestion; }
    public void   setSuggestion(String v)      { suggestion=v; }
    public String getExplanation()             { return explanation; }
    public void   setExplanation(String v)     { explanation=v; }
}
