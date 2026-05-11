package com.ghostmode.controller;

import com.ghostmode.model.Room;
import com.ghostmode.model.User;
import com.ghostmode.repository.RoomRepository;
import com.ghostmode.repository.UserRepository;
import com.ghostmode.service.AiMatchingService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import com.ghostmode.model.Echo;
import com.ghostmode.repository.EchoRepository;

@RestController
@RequestMapping("/api")
@CrossOrigin(origins = "*") // Allow requests from our frontend
public class ApiController {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private RoomRepository roomRepository;

    @Autowired
    private com.ghostmode.repository.MessageRepository messageRepository;

    @Autowired
    private AiMatchingService aiMatchingService;

    @Autowired
    private EchoRepository echoRepository;

    // --- The Void (Echoes) ---
    @GetMapping("/echoes")
    public ResponseEntity<List<Echo>> getRecentEchoes() {
        // Return echoes from the last 24 hours
        List<Echo> echoes = echoRepository.findByCreatedAtAfterOrderByCreatedAtDesc(LocalDateTime.now().minusDays(1));
        return ResponseEntity.ok(echoes);
    }

    @PostMapping("/echoes")
    public ResponseEntity<Echo> postEcho(@RequestBody Echo echo) {
        Echo saved = echoRepository.save(echo);
        return ResponseEntity.ok(saved);
    }

    @PostMapping("/echoes/{id}/resonate")
    public ResponseEntity<Echo> resonateEcho(@PathVariable Long id) {
        Optional<Echo> optionalEcho = echoRepository.findById(id);
        if (optionalEcho.isPresent()) {
            Echo echo = optionalEcho.get();
            echo.incrementResonance();
            return ResponseEntity.ok(echoRepository.save(echo));
        }
        return ResponseEntity.notFound().build();
    }

    // --- Onboarding (Profile creation) ---
    @PostMapping("/users")
    public ResponseEntity<User> createUser(@RequestBody User user) {
        User savedUser = userRepository.save(user);
        return ResponseEntity.ok(savedUser);
    }

    @GetMapping("/users/{id}")
    public ResponseEntity<User> getUser(@PathVariable Long id) {
        Optional<User> user = userRepository.findById(id);
        return user.map(ResponseEntity::ok).orElseGet(() -> ResponseEntity.notFound().build());
    }

    @GetMapping("/users/search")
    public ResponseEntity<User> searchUser(@RequestParam String phantomId) {
        Optional<User> user = userRepository.findByPhantomId(phantomId.toUpperCase());
        return user.map(ResponseEntity::ok).orElseGet(() -> ResponseEntity.notFound().build());
    }

    // --- Rooms / Matching ---
    @PostMapping("/rooms/match")
    public ResponseEntity<Room> matchUser(@RequestParam Long userId) {
        User user1 = userRepository.findById(userId).orElseThrow(() -> new RuntimeException("User not found"));
        
        // AI Personality Matching Algorithm
        List<User> allUsers = userRepository.findAll();
        
        AiMatchingService.MatchResult matchResult = aiMatchingService.findBestMatch(user1, allUsers);
        User user2 = matchResult.user;

        if (user2 == null) {
            // Create a dummy user to match with if nobody else exists
            user2 = new User("👻", "linear-gradient(135deg, #444, #111)", "Unknown", "Mysterious", "Haunting");
            user2 = userRepository.save(user2);
        }

        // Create a room with identities revealed after 3 days
        Room room = new Room(user1, user2, LocalDateTime.now().plusDays(3));
        room.setAiReason(matchResult.aiReason);
        room = roomRepository.save(room);

        return ResponseEntity.ok(room);
    }

    @PostMapping("/rooms/direct")
    public ResponseEntity<Room> directMatch(@RequestParam Long user1Id, @RequestParam Long user2Id) {
        User user1 = userRepository.findById(user1Id).orElseThrow(() -> new RuntimeException("User 1 not found"));
        User user2 = userRepository.findById(user2Id).orElseThrow(() -> new RuntimeException("User 2 not found"));

        // Check if room already exists
        List<Room> rooms = roomRepository.findByUserId(user1Id);
        for (Room r : rooms) {
            if (r.getUser1().getId().equals(user2Id) || r.getUser2().getId().equals(user2Id)) {
                return ResponseEntity.ok(r);
            }
        }

        Room room = new Room(user1, user2, LocalDateTime.now().plusDays(3));
        room = roomRepository.save(room);
        return ResponseEntity.ok(room);
    }

    @GetMapping("/users/{userId}/rooms")
    public ResponseEntity<List<Room>> getUserRooms(@PathVariable Long userId) {
        List<Room> rooms = roomRepository.findByUserId(userId);
        return ResponseEntity.ok(rooms);
    }

    @GetMapping("/rooms/{roomId}/messages")
    public ResponseEntity<List<com.ghostmode.model.Message>> getRoomMessages(@PathVariable Long roomId) {
        List<com.ghostmode.model.Message> messages = messageRepository.findByRoomIdOrderByTimestampAsc(roomId);
        return ResponseEntity.ok(messages);
    }

    @PostMapping("/rooms/{roomId}/reveal")
    public ResponseEntity<Room> revealIdentity(@PathVariable Long roomId, @RequestParam Long userId) {
        Room room = roomRepository.findById(roomId).orElseThrow(() -> new RuntimeException("Room not found"));
        
        if (room.getUser1().getId().equals(userId)) {
            room.setUser1Revealed(true);
        } else if (room.getUser2().getId().equals(userId)) {
            room.setUser2Revealed(true);
        }

        Room savedRoom = roomRepository.save(room);

        // If both revealed, broadcast via WebSocket (We can do it here if we Autowire SimpMessagingTemplate, or just let frontend poll/handle it)
        // For simplicity in this demo, the frontend will check the room state or we can let the clients update when they get the response.
        
        return ResponseEntity.ok(savedRoom);
    }

    // --- Phase 5: Monetization & Phantom Pass ---
    
    @PostMapping("/users/{id}/upgrade")
    public ResponseEntity<User> upgradeToPhantomPass(@PathVariable Long id) {
        User user = userRepository.findById(id).orElseThrow(() -> new RuntimeException("User not found"));
        user.setPremium(true);
        return ResponseEntity.ok(userRepository.save(user));
    }

    @PostMapping("/rooms/private")
    public ResponseEntity<Room> createPrivateRoom(@RequestParam Long userId) {
        User user = userRepository.findById(userId).orElseThrow(() -> new RuntimeException("User not found"));
        if (!user.isPremium()) {
            return ResponseEntity.status(403).build(); // Only Phantom Pass users can create private rooms
        }

        Room room = new Room();
        room.setUser1(user);
        room.setRevealTime(LocalDateTime.now().plusDays(3));
        
        // Generate a 4-character alphanumeric passcode
        String chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
        StringBuilder sb = new StringBuilder();
        java.util.Random rnd = new java.util.Random();
        for (int i = 0; i < 4; i++) {
            sb.append(chars.charAt(rnd.nextInt(chars.length())));
        }
        room.setPasscode(sb.toString());

        return ResponseEntity.ok(roomRepository.save(room));
    }

    @PostMapping("/rooms/join")
    public ResponseEntity<Room> joinPrivateRoom(@RequestParam Long userId, @RequestParam String passcode) {
        User user = userRepository.findById(userId).orElseThrow(() -> new RuntimeException("User not found"));
        
        Optional<Room> optionalRoom = roomRepository.findByPasscode(passcode.toUpperCase());
        if (optionalRoom.isEmpty()) {
            return ResponseEntity.notFound().build();
        }

        Room room = optionalRoom.get();
        if (room.getUser2() != null && !room.getUser2().getId().equals(userId) && !room.getUser1().getId().equals(userId)) {
            return ResponseEntity.status(403).build(); // Room is full
        }

        if (room.getUser2() == null && !room.getUser1().getId().equals(userId)) {
            room.setUser2(user);
            room = roomRepository.save(room);
        }

        return ResponseEntity.ok(room);
    }

    // --- Phase 8: Evolving Phantoms ---
    @Autowired
    private com.ghostmode.service.EvolutionService evolutionService;

    @PostMapping("/admin/trigger-evolution")
    public ResponseEntity<String> triggerEvolution() {
        evolutionService.triggerEvolutionForAll();
        return ResponseEntity.ok("Evolution process triggered for all active users.");
    }

    @PostMapping("/users/{id}/clear-evolution")
    public ResponseEntity<User> clearEvolutionMessage(@PathVariable Long id) {
        User user = userRepository.findById(id).orElseThrow(() -> new RuntimeException("User not found"));
        user.setEvolutionMessage(null);
        return ResponseEntity.ok(userRepository.save(user));
    }
}
