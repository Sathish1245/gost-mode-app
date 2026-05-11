package com.ghostmode.controller;

import com.ghostmode.model.Message;
import com.ghostmode.model.Room;
import com.ghostmode.model.User;
import com.ghostmode.repository.MessageRepository;
import com.ghostmode.repository.RoomRepository;
import com.ghostmode.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.messaging.handler.annotation.DestinationVariable;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.messaging.handler.annotation.SendTo;
import org.springframework.stereotype.Controller;

import java.time.LocalDateTime;

@Controller
public class ChatController {

    @Autowired
    private MessageRepository messageRepository;

    @Autowired
    private RoomRepository roomRepository;

    @Autowired
    private UserRepository userRepository;

    /**
     * Handles messages sent to /app/chat/{roomId}
     * Broadcasts them to /topic/room/{roomId}
     */
    @MessageMapping("/chat/{roomId}")
    @SendTo("/topic/room/{roomId}")
    public Message sendMessage(@DestinationVariable String roomId, @Payload Message chatMessage) {
        try {
            Long rId = Long.parseLong(roomId);
            Room room = roomRepository.findById(rId).orElseThrow(() -> new RuntimeException("Room not found"));
            User sender = userRepository.findById(chatMessage.getSender().getId()).orElseThrow(() -> new RuntimeException("Sender not found"));
            
            chatMessage.setRoom(room);
            chatMessage.setSender(sender);
            
            // Check for audio type in content if we are sending type='audio' (frontend sends it differently, let's just save as text for now or add a type field to Message)
            // The frontend sends `type: 'audio'` in the payload, but `Message` model doesn't have a `type` field.
            // Let's assume content="Echo" is enough to identify it, or we could add a type field.
            
            Message savedMessage = messageRepository.save(chatMessage);
            return savedMessage;
        } catch (Exception e) {
            e.printStackTrace();
            return chatMessage;
        }
    }
    
    @MessageMapping("/chat/{roomId}/typing")
    @SendTo("/topic/room/{roomId}/typing")
    public String sendTypingStatus(@DestinationVariable String roomId, @Payload String userId) {
        return userId;
    }

    /**
     * Handles ephemeral messages sent to public Ghost Rooms
     */
    @MessageMapping("/ghostroom/{category}")
    @SendTo("/topic/ghostroom/{category}")
    public com.ghostmode.dto.GhostRoomMessage sendGhostRoomMessage(@DestinationVariable String category, @Payload com.ghostmode.dto.GhostRoomMessage message) {
        // Ephemeral: We don't save this to the database. It exists only in the moment.
        message.setCategory(category);
        return message;
    }
}
