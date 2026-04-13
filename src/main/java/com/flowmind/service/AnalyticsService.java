package com.flowmind.service;
import com.flowmind.model.Activity;
import com.flowmind.model.AnalyticsData;
import org.springframework.stereotype.Service;
import java.time.LocalDate;
import java.time.ZoneId;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class AnalyticsService {
    private static final Set<String> PRODUCTIVE=Set.of("VS Code","GitHub","Classroom","Terminal","IntelliJ","PyCharm","Jupyter","Notion","StackOverflow");
    private static final Set<String> UNPRODUCTIVE=Set.of("YouTube","Netflix","Instagram","TikTok","Twitter/X","Reddit","Twitch");
    private final WorkflowService ws;
    public AnalyticsService(WorkflowService ws){this.ws=ws;}

    public AnalyticsData compute(String userId){
        List<Activity> all=ws.getActivities(userId);
        long todayStart=LocalDate.now().atStartOfDay(ZoneId.systemDefault()).toInstant().toEpochMilli();
        List<Activity> today=all.stream().filter(a->a.getStartTime()>=todayStart).toList();

        Map<String,Long> usageMs=new LinkedHashMap<>();
        Map<String,Integer> freq=new LinkedHashMap<>();
        long productive=0,unproductive=0,neutral=0,total=0;
        for(Activity a:today){
            long dur=a.getDurationMs();
            usageMs.merge(a.getAppName(),dur,Long::sum);
            freq.merge(a.getAppName(),1,Integer::sum);
            total+=dur;
            if(PRODUCTIVE.contains(a.getAppName())) productive+=dur;
            else if(UNPRODUCTIVE.contains(a.getAppName())) unproductive+=dur;
            else neutral+=dur;
        }

        Map<String,Long> sorted=usageMs.entrySet().stream()
            .sorted(Map.Entry.<String,Long>comparingByValue().reversed())
            .collect(Collectors.toMap(Map.Entry::getKey,Map.Entry::getValue,(a,b)->a,LinkedHashMap::new));

        double score=total==0?0.0:(double)productive/total*100.0;
        String topApp=sorted.isEmpty()?"—":sorted.entrySet().iterator().next().getKey();

        List<String> suggestions=new ArrayList<>();
        if(total==0){
            suggestions.add("🐍 Start tracker.py to capture real activity data.");
        } else {
            long unprodMin=unproductive/60000, prodMin=productive/60000;
            if(unprodMin>30) suggestions.add("⚠️ You've spent "+unprodMin+"min on unproductive apps. Try VS Code or Classroom.");
            if(score>75) suggestions.add("🔥 Excellent focus! Score of "+String.format("%.1f",score)+"% is outstanding.");
            else if(score>50) suggestions.add("✅ Good progress ("+String.format("%.1f",score)+"%). Keep Classroom and VS Code primary.");
            else suggestions.add("💡 Score is "+String.format("%.1f",score)+"%. Open VS Code or Classroom to boost it.");
            if(prodMin>60) suggestions.add("🚀 "+prodMin+" minutes of productive work! Consider pushing to GitHub.");
        }

        double anomalyScore=0.0;
        if(today.size()>3){
            long avg=total/today.size();
            long max=today.stream().mapToLong(Activity::getDurationMs).max().orElse(0);
            if(max>avg*4) anomalyScore=Math.min(0.5+(double)(max-avg*4)/avg/10,1.0);
        }

        String focusTip=score<30?"Use Pomodoro: 25min work → 5min break.":
                        score<60?"You're on track. Try to reduce browser distractions.":
                        "Excellent discipline! Remember to hydrate and stretch.";

        String cur=ws.getCurrentApp(userId);
        var pred=ws.predict(userId,"—".equals(cur)?"Chrome":cur);

        AnalyticsData d=new AnalyticsData();
        d.setProductivityScore(Math.round(score*10.0)/10.0);
        d.setTotalActiveMs(total); d.setProductiveMs(productive);
        d.setUnproductiveMs(unproductive); d.setNeutralMs(neutral);
        d.setAppUsageMs(sorted); d.setAppFrequency(freq);
        d.setSuggestions(suggestions); d.setTopApp(topApp);
        d.setSessionCount(today.size()); d.setPrediction(pred);
        d.setAnomalyScore(Math.round(anomalyScore*100.0)/100.0);
        d.setAnomalyStatus(anomalyScore>0.6?"ANOMALY":"NORMAL");
        d.setFocusTip(focusTip); d.setHasRealData(total>0);
        return d;
    }
}
