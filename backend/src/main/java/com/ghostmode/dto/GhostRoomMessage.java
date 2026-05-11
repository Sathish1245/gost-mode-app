package com.ghostmode.dto;

public class GhostRoomMessage {
    private String category;
    private String senderSymbol;
    private String senderColor;
    private String content;
    private String type;

    public GhostRoomMessage() {}

    public String getCategory() { return category; }
    public void setCategory(String category) { this.category = category; }

    public String getSenderSymbol() { return senderSymbol; }
    public void setSenderSymbol(String senderSymbol) { this.senderSymbol = senderSymbol; }

    public String getSenderColor() { return senderColor; }
    public void setSenderColor(String senderColor) { this.senderColor = senderColor; }

    public String getContent() { return content; }
    public void setContent(String content) { this.content = content; }

    public String getType() { return type; }
    public void setType(String type) { this.type = type; }
}
