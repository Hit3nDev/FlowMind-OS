package com.flowmind.strategy;
import java.util.Map;
public class MarkovPredictionStrategy implements PredictionStrategy {
    @Override
    public String predict(Map<String,Map<String,Integer>> t, String cur) {
        Map<String,Integer> next=t.get(cur);
        if(next==null||next.isEmpty()) return null;
        return next.entrySet().stream().max(Map.Entry.comparingByValue()).map(Map.Entry::getKey).orElse(null);
    }
    @Override
    public double probability(Map<String,Map<String,Integer>> t, String cur, String pred) {
        Map<String,Integer> next=t.get(cur);
        if(next==null||pred==null) return 0.0;
        int count=next.getOrDefault(pred,0);
        int total=next.values().stream().mapToInt(Integer::intValue).sum();
        return total==0?0.0:(double)count/total;
    }
    @Override
    public String explain(Map<String,Map<String,Integer>> t, String cur, String pred) {
        Map<String,Integer> next=t.get(cur);
        if(next==null||pred==null) return "Not enough tracking data yet.";
        int count=next.getOrDefault(pred,0);
        int total=next.values().stream().mapToInt(Integer::intValue).sum();
        double pct=total==0?0:(double)count/total*100;
        return String.format("From %d observed switches from %s → %s occurred %d times (%.0f%%). Markov picks highest-frequency next state.",total,cur,pred,count,pct);
    }
}
