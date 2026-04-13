package com.flowmind.service;

import com.flowmind.model.Activity;
import com.flowmind.model.AnalyticsData;
import com.flowmind.model.ChatMessage;
import com.flowmind.model.Prediction;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.time.Duration;
import java.util.*;
import java.util.concurrent.ConcurrentHashMap;

@Service
public class ChatService {

    private final WorkflowService   workflowService;
    private final AnalyticsService  analyticsService;
    private final AutomationService automationService;

    @Value("${anthropic.api.key:}")
    private String anthropicApiKey;

    @Value("${anthropic.model:claude-opus-4-5}")
    private String anthropicModel;

    private final Map<String, List<ChatMessage>> histories = new ConcurrentHashMap<>();
    private final HttpClient httpClient = HttpClient.newBuilder()
        .connectTimeout(Duration.ofSeconds(10))
        .build();

    public ChatService(WorkflowService w, AnalyticsService a, AutomationService au) {
        this.workflowService   = w;
        this.analyticsService  = a;
        this.automationService = au;
    }

    public ChatMessage respond(String userId, String userMessage) {
        List<ChatMessage> history = histories.computeIfAbsent(userId, k -> new ArrayList<>());
        history.add(new ChatMessage("user", userMessage));

        ChatMessage response = buildResponse(userId, userMessage, history);
        history.add(response);
        if (history.size() > 40) history.subList(0, history.size() - 40).clear();

        workflowService.log("INFO", "Chat: " + userMessage.substring(0, Math.min(50, userMessage.length())), userId);
        return response;
    }

    private ChatMessage buildResponse(String userId, String msg, List<ChatMessage> history) {
        String lower = msg.toLowerCase().trim();

        // ── Automation commands (no AI needed) ──────────────────────────────
        if (has(lower,"study session","start study","study mode"))
            return replyAction(automationService.startStudySession(userId), "AUTOMATION_DONE");
        if (has(lower,"coding setup","coding mode","start coding","code setup"))
            return replyAction(automationService.startCodingSetup(userId), "AUTOMATION_DONE");
        if (has(lower,"open social","social apps","whatsapp and discord"))
            return replyAction(automationService.openSocialApps(userId), "AUTOMATION_DONE");
        if (has(lower,"open chrome","launch chrome"))
            return replyAction("🌐 " + automationService.openChrome(userId), "AUTOMATION_DONE");
        if (has(lower,"open vscode","open vs code","launch vscode","open code"))
            return replyAction("💻 " + automationService.openVSCode(userId), "AUTOMATION_DONE");
        if (has(lower,"open terminal","launch terminal"))
            return replyAction("🖥 " + automationService.openTerminal(userId), "AUTOMATION_DONE");
        if (has(lower,"open classroom"))
            return replyAction("📚 " + automationService.openURL("https://classroom.google.com", userId), "AUTOMATION_DONE");
        if (has(lower,"open whatsapp"))
            return replyAction("💬 " + automationService.openURL("https://web.whatsapp.com", userId), "AUTOMATION_DONE");
        if (has(lower,"open github"))
            return replyAction("🐙 " + automationService.openURL("https://github.com", userId), "AUTOMATION_DONE");
        if (has(lower,"open youtube","watch youtube"))
            return replyAction("▶ " + automationService.openURL("https://youtube.com", userId) + "\n⚠️ This will affect your productivity score.", "AUTOMATION_DONE");

        // ── Try Anthropic API ────────────────────────────────────────────────
        String aiResponse = callAnthropicApi(userId, msg, history);
        if (aiResponse != null) {
            ChatMessage cm = new ChatMessage("assistant", aiResponse);
            if (has(lower,"analytics","productivity","score")) cm.setAction("SHOW_ANALYTICS");
            if (has(lower,"timeline","history","activity")) cm.setAction("SHOW_TIMELINE");
            return cm;
        }

        // ── Fallback (no API key) ────────────────────────────────────────────
        return buildFallbackResponse(userId, lower);
    }

    private String callAnthropicApi(String userId, String userMessage, List<ChatMessage> history) {
        if (anthropicApiKey == null || anthropicApiKey.isBlank() || anthropicApiKey.equals("your-api-key-here")) {
            workflowService.log("WARN", "No Anthropic API key configured — using fallback", userId);
            return null;
        }

        try {
            String systemPrompt = buildSystemPrompt(userId);
            String messagesJson = buildMessagesJson(history);

            String requestBody = """
                {
                    "model": "%s",
                    "max_tokens": 1024,
                    "system": %s,
                    "messages": %s
                }
                """.formatted(anthropicModel,
                    jsonString(systemPrompt),
                    messagesJson);

            HttpRequest request = HttpRequest.newBuilder()
                .uri(URI.create("https://api.anthropic.com/v1/messages"))
                .header("x-api-key", anthropicApiKey)
                .header("anthropic-version", "2023-06-01")
                .header("content-type", "application/json")
                .POST(HttpRequest.BodyPublishers.ofString(requestBody))
                .timeout(Duration.ofSeconds(25))
                .build();

            HttpResponse<String> response = httpClient.send(request, HttpResponse.BodyHandlers.ofString());
            String body = response.body();

            if (response.statusCode() == 200) {
                // Parse the response - extract text from content[0].text
                int textStart = body.indexOf("\"text\":\"");
                if (textStart == -1) return null;
                textStart += 8;
                int textEnd = findJsonStringEnd(body, textStart);
                if (textEnd == -1) return null;
                String raw = body.substring(textStart, textEnd);
                return raw.replace("\\n","\n").replace("\\\"","\"").replace("\\\\","\\");
            } else {
                workflowService.log("ERROR", "Anthropic API error " + response.statusCode() + ": " + body.substring(0, Math.min(200, body.length())), userId);
                return null;
            }
        } catch (Exception e) {
            workflowService.log("ERROR", "Anthropic API exception: " + e.getMessage(), userId);
            return null;
        }
    }

    private String buildSystemPrompt(String userId) {
        AnalyticsData analytics = analyticsService.compute(userId);
        String currentApp = workflowService.getCurrentApp(userId);
        List<Activity> activities = workflowService.getActivities(userId);

        String activitySummary = activities.isEmpty()
            ? "No activity recorded yet."
            : "Last " + Math.min(5, activities.size()) + " apps: " +
              activities.subList(Math.max(0, activities.size()-5), activities.size())
                  .stream().map(Activity::getAppName).toList().toString();

        return """
            You are FlowMind AI, an intelligent productivity assistant embedded in FlowMind OS — a real-time workflow tracking and productivity system.

            ## User's Current Context:
            - Username: %s
            - Current App: %s
            - Productivity Score Today: %.1f%%
            - Sessions Today: %d
            - Productive Time: %d minutes
            - Unproductive Time: %d minutes
            - Top App: %s
            - Anomaly Status: %s
            - Recent Activity: %s
            - Has Real Data: %s

            ## Your Capabilities:
            You can help the user with:
            1. Productivity analysis and insights based on their REAL tracking data
            2. Workflow advice and focus techniques
            3. Explaining their patterns and predictions
            4. Suggesting study techniques (Pomodoro, time-blocking, etc.)
            5. Answering any general questions (coding help, math, writing, etc.)
            6. Motivational coaching

            ## Important:
            - Always reference the user's ACTUAL data when discussing their productivity
            - Be conversational, helpful, and concise
            - For app opening/automation commands, the system handles those separately
            - You can answer ANY question, not just productivity ones
            - Use markdown formatting for clarity (**bold**, bullet points, etc.)
            - Keep responses focused and under 300 words unless detailed explanation is needed
            """.formatted(
                userId,
                currentApp,
                analytics.getProductivityScore(),
                analytics.getSessionCount(),
                analytics.getProductiveMs() / 60000,
                analytics.getUnproductiveMs() / 60000,
                analytics.getTopApp() != null ? analytics.getTopApp() : "—",
                analytics.getAnomalyStatus() != null ? analytics.getAnomalyStatus() : "NORMAL",
                activitySummary,
                analytics.isHasRealData() ? "Yes (Python tracker active)" : "No (start tracker.py)"
            );
    }

    private String buildMessagesJson(List<ChatMessage> history) {
        StringBuilder sb = new StringBuilder("[");
        // Include last 10 messages for context (excluding current)
        List<ChatMessage> context = history.subList(Math.max(0, history.size()-11), history.size()-1);
        for (int i = 0; i < context.size(); i++) {
            ChatMessage m = context.get(i);
            if (i > 0) sb.append(",");
            sb.append("{\"role\":\"").append(m.getRole()).append("\",\"content\":")
              .append(jsonString(m.getContent())).append("}");
        }
        // Add current user message
        ChatMessage current = history.get(history.size()-1);
        if (!context.isEmpty()) sb.append(",");
        sb.append("{\"role\":\"").append(current.getRole()).append("\",\"content\":")
          .append(jsonString(current.getContent())).append("}");
        sb.append("]");
        return sb.toString();
    }

    /** Finds the end position of a JSON string starting at `start` (after the opening quote). */
    private int findJsonStringEnd(String s, int start) {
        for (int i = start; i < s.length(); i++) {
            char c = s.charAt(i);
            if (c == '\\') { i++; continue; }
            if (c == '"')  return i;
        }
        return -1;
    }

    /** Escape a Java string for JSON */
    private String jsonString(String s) {
        if (s == null) return "\"\"";
        return "\"" + s.replace("\\","\\\\").replace("\"","\\\"")
                       .replace("\n","\\n").replace("\r","\\r").replace("\t","\\t") + "\"";
    }

    /** Fallback when no Anthropic API key is set */
    private ChatMessage buildFallbackResponse(String userId, String msg) {
        AnalyticsData data = analyticsService.compute(userId);
        String cur = workflowService.getCurrentApp(userId);

        if (has(msg,"hi","hello","hey")) {
            return reply("Hey! I'm FlowMind AI. Your productivity score today is **" +
                data.getProductivityScore() + "%** with **" + data.getSessionCount() + "** sessions.\n\n" +
                "ℹ️ *Set ANTHROPIC_API_KEY in application.properties for full AI capabilities.*\n\n" +
                "Try: 'show productivity', 'open vscode', 'start study session'");
        }
        if (has(msg,"productivity","score")) {
            double s = data.getProductivityScore();
            return replyAction("📊 **Productivity: " + s + "%**\n\n⏱ Productive: " +
                data.getProductiveMs()/60000 + "m\n📺 Unproductive: " +
                data.getUnproductiveMs()/60000 + "m\n🏆 Top: " + data.getTopApp() +
                "\n💡 " + data.getFocusTip(), "SHOW_ANALYTICS");
        }
        if (has(msg,"today","timeline","activity","what did")) {
            List<Activity> acts = workflowService.getActivities(userId);
            if (acts.isEmpty()) return reply("No activity yet. Start tracker.py!");
            StringBuilder sb = new StringBuilder("📋 **Recent activity:**\n\n");
            acts.subList(Math.max(0,acts.size()-6),acts.size()).forEach(a ->
                sb.append("• **").append(a.getAppName()).append("** — ").append(a.getDurationMs()/60000).append("m [").append(a.getCategory()).append("]\n"));
            return replyAction(sb.toString(), "SHOW_TIMELINE");
        }
        if (has(msg,"predict","next")) {
            Prediction p = workflowService.predict(userId, "—".equals(cur)?"Chrome":cur);
            return reply("🔮 Currently on **"+cur+"**\nNext likely: **"+p.getPredictedNextApp()+"** ("+p.getProbability()+"%)");
        }
        return reply("I heard: *\"" + msg + "\"*\n\nℹ️ *Add ANTHROPIC_API_KEY to get full AI responses.*\n\nTry: 'show productivity', 'start study session', 'open vscode'");
    }

    public List<ChatMessage> getHistory(String userId) {
        return Collections.unmodifiableList(histories.getOrDefault(userId, List.of()));
    }

    private boolean has(String input, String... kws) {
        for (String k : kws) if (input.contains(k)) return true;
        return false;
    }
    private ChatMessage reply(String text)               { return new ChatMessage("assistant", text); }
    private ChatMessage replyAction(String text,String a){ ChatMessage m=new ChatMessage("assistant",text); m.setAction(a); return m; }
}
