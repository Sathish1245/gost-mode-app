package com.ghostmode.service;

import com.ghostmode.model.User;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import org.springframework.http.*;

import java.util.List;
import java.util.Map;

@Service
public class AiMatchingService {

    @Value("${gemini.api.key:}")
    private String geminiApiKey;

    private final RestTemplate restTemplate = new RestTemplate();

    public static class MatchResult {
        public User user;
        public String aiReason;
    }

    public MatchResult findBestMatch(User currentUser, List<User> allUsers) {
        MatchResult result = new MatchResult();

        if (allUsers.isEmpty() || (allUsers.size() == 1 && allUsers.get(0).getId().equals(currentUser.getId()))) {
            result.aiReason = "The ether is empty. A dummy spirit was summoned for you.";
            return result; // Handled by controller to generate a dummy
        }

        // Try Gemini if API key is provided
        if (geminiApiKey != null && !geminiApiKey.isEmpty()) {
            try {
                return getGeminiMatch(currentUser, allUsers);
            } catch (Exception e) {
                System.err.println("Gemini API call failed, falling back to heuristics: " + e.getMessage());
            }
        }

        // Fallback: Heuristic matching
        result.user = getHeuristicMatch(currentUser, allUsers);
        result.aiReason = "The stars aligned. Your energies are highly compatible based on mystical heuristics.";
        return result;
    }

    private MatchResult getGeminiMatch(User currentUser, List<User> allUsers) {
        MatchResult result = new MatchResult();
        
        StringBuilder prompt = new StringBuilder();
        prompt.append("You are the Oracle of Ghost Mode, an ethereal AI matchmaker. ");
        prompt.append("Find the best psychological match for the current user from the list of candidates.\n\n");
        prompt.append("Current User: Symbol=").append(currentUser.getSymbol())
              .append(", Vibe=").append(currentUser.getMood())
              .append("\n\nCandidates:\n");
        
        for (int i = 0; i < allUsers.size(); i++) {
            User u = allUsers.get(i);
            if (!u.getId().equals(currentUser.getId())) {
                prompt.append("Candidate ").append(i).append(": Symbol=").append(u.getSymbol())
                      .append(", Vibe=").append(u.getMood()).append("\n");
            }
        }
        prompt.append("\nReply ONLY with a JSON object in this exact format: {\"candidateIndex\": <number>, \"reason\": \"<1-sentence mystical explanation of why their energies balance>\"}");

        String url = "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=" + geminiApiKey;
        
        Map<String, Object> requestBody = Map.of(
            "contents", List.of(
                Map.of("parts", List.of(Map.of("text", prompt.toString())))
            )
        );

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        HttpEntity<Map<String, Object>> request = new HttpEntity<>(requestBody, headers);

        ResponseEntity<Map> response = restTemplate.postForEntity(url, request, Map.class);
        
        try {
            Map body = response.getBody();
            List candidates = (List) body.get("candidates");
            Map firstCandidate = (Map) candidates.get(0);
            Map content = (Map) firstCandidate.get("content");
            List parts = (List) content.get("parts");
            Map firstPart = (Map) parts.get(0);
            String jsonText = (String) firstPart.get("text");
            
            // Clean markdown json ticks
            jsonText = jsonText.replace("```json", "").replace("```", "").trim();
            
            com.fasterxml.jackson.databind.ObjectMapper mapper = new com.fasterxml.jackson.databind.ObjectMapper();
            Map<String, Object> jsonMap = mapper.readValue(jsonText, Map.class);
            
            int matchIndex = (Integer) jsonMap.get("candidateIndex");
            result.user = allUsers.get(matchIndex);
            result.aiReason = (String) jsonMap.get("reason");
        } catch (Exception e) {
            throw new RuntimeException("Failed to parse Gemini response: " + e.getMessage());
        }

        return result;
    }

    private User getHeuristicMatch(User currentUser, List<User> allUsers) {
        User bestMatch = null;
        int highestScore = -100;

        for (User potentialMatch : allUsers) {
            if (potentialMatch.getId().equals(currentUser.getId())) continue;
            int score = 0;
            String myMood = currentUser.getMood() != null ? currentUser.getMood() : "";
            String theirMood = potentialMatch.getMood() != null ? potentialMatch.getMood() : "";

            if (myMood.contains("Intense") && theirMood.contains("Calm")) score += 5;
            else if (myMood.contains("Calm") && theirMood.contains("Intense")) score += 5;
            if (myMood.contains("Mysterious") && theirMood.contains("Observing")) score += 4;
            else if (myMood.contains("Observing") && theirMood.contains("Mysterious")) score += 4;

            if (score > highestScore) {
                highestScore = score;
                bestMatch = potentialMatch;
            }
        }
        return bestMatch != null ? bestMatch : allUsers.stream().filter(u -> !u.getId().equals(currentUser.getId())).findFirst().orElse(null);
    }
}
