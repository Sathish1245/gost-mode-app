package com.ghostmode.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "messages")
public class Message {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "room_id", nullable = false)
    private Room room;

    @ManyToOne
    @JoinColumn(name = "sender_id", nullable = false)
    private User sender;

    @Column(nullable = false, length = 2000)
    private String content;

    @Column(nullable = false)
    private boolean isEphemeral = false; // For disappearing messages

    @Column(nullable = false, updatable = false)
    private LocalDateTime timestamp = LocalDateTime.now();

    public Message() {}

    public Message(Room room, User sender, String content, boolean isEphemeral) {
        this.room = room;
        this.sender = sender;
        this.content = content;
        this.isEphemeral = isEphemeral;
    }

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Room getRoom() { return room; }
    public void setRoom(Room room) { this.room = room; }

    public User getSender() { return sender; }
    public void setSender(User sender) { this.sender = sender; }

    public String getContent() { return content; }
    public void setContent(String content) { this.content = content; }

    public boolean isEphemeral() { return isEphemeral; }
    public void setEphemeral(boolean ephemeral) { isEphemeral = ephemeral; }

    public LocalDateTime getTimestamp() { return timestamp; }
}
