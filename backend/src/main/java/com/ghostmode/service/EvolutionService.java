package com.ghostmode.service;

import com.ghostmode.model.Echo;
import com.ghostmode.model.User;
import com.ghostmode.repository.EchoRepository;
import com.ghostmode.repository.UserRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
public class EvolutionService {

    private final UserRepository userRepository;
    private final EchoRepository echoRepository;
    private final RestTemplate restTemplate = new RestTemplate();

    @Value("${gemini.api.key:}")
    private String geminiApiKey;

    public EvolutionService(UserRepository userRepository, EchoRepository echoRepository) {
        this.userRepository = userRepository;
        this.echoRepository = echoRepository;
    }

    /**
     * Runs every 4 hours to evolve phantoms based on their recent echoes.
     * We use a fixed rate for demonstration, but in production this would be more complex.
     */
    @Scheduled(fixedRate = 14400000)
    public void evolvePhantoms() {
        triggerEvolutionForAll();
    }

    public void triggerEvolutionForAll() {
        List<User> users = userRepository.findAll();
        for (User user : users) {
            // Find echoes by this user (we match by symbol since echoes are anonymous)
            // In a real system, we'd have a hidden relation, but for Ghost Mode lore,
            // we'll just pull the most recent echoes that match their symbol.
            List<Echo> userEchoes = echoRepository.findAll().stream()
                    .filter(e -> e.getAuthorSymbol().equals(user.getSymbol()))
                    .collect(Collectors.toList());

            if (userEchoes.size() > 0) {
                evolveUser(user, userEchoes);
            }
        }
    }

    private void evolveUser(User user, List<Echo> echoes) {
        if (geminiApiKey == null || geminiApiKey.isEmpty()) return;

        String recentThoughts = echoes.stream()
                .map(Echo::getContent)
                .collect(Collectors.joining(" | "));

        StringBuilder prompt = new StringBuilder();
        prompt.append("You are the Oracle of Ghost Mode. An entity is evolving based on their recent thoughts.\n");
        prompt.append("Current Symbol: ").append(user.getSymbol()).append("\n");
        prompt.append("Recent Thoughts: ").append(recentThoughts).append("\n\n");
        prompt.append("Analyze their psychological state based on these thoughts. Then, assign them a NEW Symbol (one single emoji) ");
        prompt.append("and a NEW Vibe Color (a hex code, e.g., #FF0055). Also provide a 1-sentence mystical message explaining why they evolved.\n");
        prompt.append("Reply ONLY with a JSON object: {\"newSymbol\": \"<emoji>\", \"newColor\": \"<hex>\", \"message\": \"<reason>\"}");

        String url = "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=" + geminiApiKey;

        try {
            Map<String, Object> requestBody = Map.of(
                    "contents", List.of(Map.of("parts", List.of(Map.of("text", prompt.toString()))))
            );

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            HttpEntity<Map<String, Object>> request = new HttpEntity<>(requestBody, headers);

            ResponseEntity<Map> response = restTemplate.postForEntity(url, request, Map.class);
            
            Map body = response.getBody();
            List candidates = (List) body.get("candidates");
            Map firstCandidate = (Map) candidates.get(0);
            Map content = (Map) firstCandidate.get("content");
            List parts = (List) content.get("parts");
            Map firstPart = (Map) parts.get(0);
            String jsonText = (String) firstPart.get("text");

            jsonText = jsonText.replace("```json", "").replace("```", "").trim();

            com.fasterxml.jackson.databind.ObjectMapper mapper = new com.fasterxml.jackson.databind.ObjectMapper();
            Map<String, Object> jsonMap = mapper.readValue(jsonText, Map.class);

            String newSymbol = (String) jsonMap.get("newSymbol");
            String newColor = (String) jsonMap.get("newColor");
            String message = (String) jsonMap.get("message");

            // Only evolve if it actually gave us new data
            if (newSymbol != null && newColor != null && message != null) {
                user.setSymbol(newSymbol);
                user.setVibeColor(newColor);
                user.setEvolutionMessage(message);
                userRepository.save(user);
                System.out.println("Evolved User " + user.getId() + " to " + newSymbol);
            }
        } catch (Exception e) {
            System.err.println("Evolution failed for user " + user.getId() + ": " + e.getMessage());
        }
    }
}
