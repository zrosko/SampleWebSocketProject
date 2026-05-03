package com.example.websocket.controller;

import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.SendTo;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.CrossOrigin;

@Controller
@CrossOrigin(origins = "*")
public class WebSocketController {

    @MessageMapping("/receiveInput")
    @SendTo("/topic/output")
    public String receiveInput(String inputText) {
        InputStore.setLastInput(inputText);
        return inputText;
    }
}
