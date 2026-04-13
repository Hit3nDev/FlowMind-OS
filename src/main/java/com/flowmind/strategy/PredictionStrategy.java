package com.flowmind.strategy;
import java.util.Map;
public interface PredictionStrategy {
    String predict(Map<String,Map<String,Integer>> t, String cur);
    double probability(Map<String,Map<String,Integer>> t, String cur, String pred);
    String explain(Map<String,Map<String,Integer>> t, String cur, String pred);
}
