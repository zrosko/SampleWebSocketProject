package com.example.websocket.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;

@Component
public class BroadcastScheduler {

    private final SimpMessagingTemplate messagingTemplate;
    private static final DateTimeFormatter FORMATTER =
            DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss");

    @Autowired
    public BroadcastScheduler(SimpMessagingTemplate messagingTemplate) {
        this.messagingTemplate = messagingTemplate;
    }

    @Scheduled(fixedRate = 5000)
    public void broadcastServerTime() {
        String lastInput = InputStore.getLastInput();
        String serverTime = LocalDateTime.now().format(FORMATTER);
        String message = lastInput + " | Server time: " + serverTime;
        messagingTemplate.convertAndSend("/topic/output", message);
    }
}
