package com.ghostmode.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "users")
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String symbol; // E.g., "🌙", "👻"

    @Column(nullable = false)
    private String vibeColor; // E.g., gradient or hex code

    @Column(length = 500)
    private String musicTaste;

    @Column
    private String mood;

    @Column(length = 1000)
    private String interests;
    
    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt = LocalDateTime.now();

    public User() {}

    public User(String symbol, String vibeColor, String musicTaste, String mood, String interests) {
        this.symbol = symbol;
        this.vibeColor = vibeColor;
        this.musicTaste = musicTaste;
        this.mood = mood;
        this.interests = interests;
    }

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    
    public String getSymbol() { return symbol; }
    public void setSymbol(String symbol) { this.symbol = symbol; }

    public String getVibeColor() { return vibeColor; }
    public void setVibeColor(String vibeColor) { this.vibeColor = vibeColor; }

    public String getMusicTaste() { return musicTaste; }
    public void setMusicTaste(String musicTaste) { this.musicTaste = musicTaste; }

    public String getMood() { return mood; }
    public void setMood(String mood) { this.mood = mood; }

    public String getInterests() { return interests; }
    public void setInterests(String interests) { this.interests = interests; }

    public LocalDateTime getCreatedAt() { return createdAt; }
}
