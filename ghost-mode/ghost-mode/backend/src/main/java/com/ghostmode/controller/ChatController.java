package com.ghostmode.controller;

import com.ghostmode.model.Message;
import org.springframework.messaging.handler.annotation.DestinationVariable;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.messaging.handler.annotation.SendTo;
import org.springframework.stereotype.Controller;

@Controller
public class ChatController {

    /**
     * Handles messages sent to /app/chat/{roomId}
     * Broadcasts them to /topic/room/{roomId}
     */
    @MessageMapping("/chat/{roomId}")
    @SendTo("/topic/room/{roomId}")
    public Message sendMessage(@DestinationVariable String roomId, @Payload Message chatMessage) {
        // In a real implementation, we would save this message to the database
        // and add some server-side logic (e.g. check if room is active)
        
        // Return the message to broadcast to all subscribers of this room
        return chatMessage;
    }
    
    /**
     * Handles "typing..." status indicator
     */
    @MessageMapping("/chat/{roomId}/typing")
    @SendTo("/topic/room/{roomId}/typing")
    public String sendTypingStatus(@DestinationVariable String roomId, @Payload String userId) {
        return userId;
    }
}
