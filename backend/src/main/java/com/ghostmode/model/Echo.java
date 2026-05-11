package com.ghostmode.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "echoes")
public class Echo {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 1000)
    private String content;

    @Column(nullable = false)
    private String authorSymbol;

    @Column(nullable = false)
    private String authorColor;

    @Column(nullable = false)
    private int resonanceCount = 0;

    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt = LocalDateTime.now();
    
    @Column(length = 500)
    private String audioUrl;

    public Echo() {}

    public Echo(String content, String authorSymbol, String authorColor) {
        this.content = content;
        this.authorSymbol = authorSymbol;
        this.authorColor = authorColor;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getContent() { return content; }
    public void setContent(String content) { this.content = content; }

    public String getAuthorSymbol() { return authorSymbol; }
    public void setAuthorSymbol(String authorSymbol) { this.authorSymbol = authorSymbol; }

    public String getAuthorColor() { return authorColor; }
    public void setAuthorColor(String authorColor) { this.authorColor = authorColor; }

    public int getResonanceCount() { return resonanceCount; }
    public void incrementResonance() { this.resonanceCount++; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    
    public String getAudioUrl() { return audioUrl; }
    public void setAudioUrl(String audioUrl) { this.audioUrl = audioUrl; }
}
