package com.ghostmode.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "rooms")
public class Room {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "user1_id", nullable = false)
    private User user1;

    @ManyToOne
    @JoinColumn(name = "user2_id", nullable = true)
    private User user2;

    @Column(nullable = false)
    private boolean isActive = true;

    @Column(nullable = false)
    private boolean user1Revealed = false;

    @Column(nullable = false)
    private boolean user2Revealed = false;
    
    @Column
    private String passcode; // For private rooms

    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt = LocalDateTime.now();

    @Column
    private LocalDateTime revealTime; // The time when identities are revealed (e.g., 3 days after creation)

    @Column(length = 1000)
    private String aiReason;

    public Room() {}

    public Room(User user1, User user2, LocalDateTime revealTime) {
        this.user1 = user1;
        this.user2 = user2;
        this.revealTime = revealTime;
    }

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public User getUser1() { return user1; }
    public void setUser1(User user1) { this.user1 = user1; }

    public User getUser2() { return user2; }
    public void setUser2(User user2) { this.user2 = user2; }

    public boolean isActive() { return isActive; }
    public void setActive(boolean active) { isActive = active; }

    public LocalDateTime getCreatedAt() { return createdAt; }

    public LocalDateTime getRevealTime() { return revealTime; }
    public void setRevealTime(LocalDateTime revealTime) { this.revealTime = revealTime; }

    public boolean isUser1Revealed() { return user1Revealed; }
    public void setUser1Revealed(boolean user1Revealed) { this.user1Revealed = user1Revealed; }

    public boolean isUser2Revealed() { return user2Revealed; }
    public void setUser2Revealed(boolean user2Revealed) { this.user2Revealed = user2Revealed; }
    
    public String getPasscode() { return passcode; }
    public void setPasscode(String passcode) { this.passcode = passcode; }
    
    public String getAiReason() { return aiReason; }
    public void setAiReason(String aiReason) { this.aiReason = aiReason; }
}
