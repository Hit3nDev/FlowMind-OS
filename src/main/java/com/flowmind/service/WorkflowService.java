package com.flowmind.service;
import com.flowmind.model.Activity;
import com.flowmind.model.LogEntry;
import com.flowmind.model.Prediction;
import com.flowmind.strategy.MarkovPredictionStrategy;
import com.flowmind.strategy.PredictionStrategy;
import org.springframework.stereotype.Service;
import java.util.*;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.CopyOnWriteArrayList;

@Service
public class WorkflowService {
    private final Map<String,List<Activity>> userActivities   = new ConcurrentHashMap<>();
    private final Map<String,Map<String,Map<String,Integer>>> userTransitions = new ConcurrentHashMap<>();
    private final Map<String,String> lastApp    = new ConcurrentHashMap<>();
    private final Map<String,String> currentApp = new ConcurrentHashMap<>();
    private final List<LogEntry>     logs       = new CopyOnWriteArrayList<>();
    private static final int MAX_LOGS = 500;
    private final PredictionStrategy strategy = new MarkovPredictionStrategy();

    private static final Map<String,String> SUGGESTIONS = Map.of(
        "Chrome","Open Google Classroom or VS Code for productive work?",
        "VS Code","Great work! Consider pushing your code to GitHub.",
        "Classroom","Open VS Code to work on your assignment?",
        "YouTube","You've been on YouTube — time to switch to something productive?",
        "GitHub","Good session! Review your PR or open VS Code."
    );

    public void recordActivity(Activity a) {
        String uid=a.getUserId(), app=a.getAppName();
        if(uid==null||app==null) return;
        ensureUser(uid);
        userActivities.get(uid).add(a);
        String prev=lastApp.get(uid);
        if(prev!=null&&!prev.equalsIgnoreCase(app)) {
            userTransitions.get(uid).computeIfAbsent(prev,k->new ConcurrentHashMap<>()).merge(app,1,Integer::sum);
            log("DEBUG","Markov: "+prev+" → "+app,uid);
        }
        lastApp.put(uid,app);
        currentApp.put(uid,app);
        log("INFO","Activity recorded: ["+app+"] "+a.getDurationMs()+"ms ("+a.getCategory()+")",uid);
    }

    public Prediction predict(String uid, String app) {
        ensureUser(uid);
        var t=userTransitions.get(uid);
        String pred=strategy.predict(t,app);
        double prob=strategy.probability(t,app,pred);
        String explain=strategy.explain(t,app,pred);
        if(pred==null) return new Prediction(app,"—",0.0,"Keep using apps to build your model!","Not enough data yet.");
        return new Prediction(app,pred,Math.round(prob*1000.0)/10.0,
            SUGGESTIONS.getOrDefault(pred,"Consider switching to "+pred+"."),explain);
    }

    public List<Activity> getActivities(String uid)               { return userActivities.getOrDefault(uid,List.of()); }
    public Map<String,Map<String,Integer>> getTransitions(String uid){ return userTransitions.getOrDefault(uid,Map.of()); }
    public String getCurrentApp(String uid)                       { return currentApp.getOrDefault(uid,"—"); }
    public List<LogEntry> getLogs()                               { return Collections.unmodifiableList(logs); }
    public List<LogEntry> getLogsForUser(String uid)              { return logs.stream().filter(l->uid.equals(l.getUsername())).toList(); }

    public void log(String level, String msg, String user) {
        LogEntry e=new LogEntry(level,msg,user);
        logs.add(e);
        if(logs.size()>MAX_LOGS) logs.subList(0,logs.size()-MAX_LOGS).clear();
        System.out.printf("[%s][%s][%s] %s%n",e.getFormattedTime(),level,user,msg);
    }

    private void ensureUser(String uid) {
        userActivities.computeIfAbsent(uid,k->new CopyOnWriteArrayList<>());
        userTransitions.computeIfAbsent(uid,k->new ConcurrentHashMap<>());
    }
}
