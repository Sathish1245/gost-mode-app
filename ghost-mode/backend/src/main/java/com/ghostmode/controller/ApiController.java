package com.ghostmode.controller;

import com.ghostmode.model.Room;
import com.ghostmode.model.User;
import com.ghostmode.repository.RoomRepository;
import com.ghostmode.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api")
@CrossOrigin(origins = "*") // Allow requests from our frontend
public class ApiController {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private RoomRepository roomRepository;

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

    // --- Rooms / Matching ---
    @PostMapping("/rooms/match")
    public ResponseEntity<Room> matchUser(@RequestParam Long userId) {
        User user1 = userRepository.findById(userId).orElseThrow(() -> new RuntimeException("User not found"));
        
        // Mock matching logic: In a real app, this would find another user based on interests/mood
        // Here we just grab the first other user or create a "ghost" user for demo purposes.
        List<User> allUsers = userRepository.findAll();
        User user2 = allUsers.stream().filter(u -> !u.getId().equals(userId)).findFirst().orElse(null);

        if (user2 == null) {
            // Create a dummy user to match with if nobody else exists
            user2 = new User("👻", "linear-gradient(135deg, #444, #111)", "Unknown", "Mysterious", "Haunting");
            user2 = userRepository.save(user2);
        }

        // Create a room with identities revealed after 3 days
        Room room = new Room(user1, user2, LocalDateTime.now().plusDays(3));
        room = roomRepository.save(room);

        return ResponseEntity.ok(room);
    }

    @GetMapping("/users/{userId}/rooms")
    public ResponseEntity<List<Room>> getUserRooms(@PathVariable Long userId) {
        List<Room> rooms = roomRepository.findByUserId(userId);
        return ResponseEntity.ok(rooms);
    }
}
