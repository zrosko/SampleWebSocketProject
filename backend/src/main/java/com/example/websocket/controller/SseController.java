package com.example.websocket.controller;

import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

import java.io.IOException;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;

@RestController
@CrossOrigin(origins = "*")
public class SseController {

    private static final DateTimeFormatter FORMATTER =
            DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss");

    @PostMapping(value = "/receiveInput2", produces = MediaType.TEXT_EVENT_STREAM_VALUE)
    public SseEmitter receiveInput2(@RequestBody String inputText) {
        String trimmed = inputText.trim().replaceAll("^\"|\"$", "");
        InputStore.setLastInput(trimmed);

        SseEmitter emitter = new SseEmitter(30_000L);

        String serverTime = LocalDateTime.now().format(FORMATTER);
        String message = trimmed + " | Server time: " + serverTime;

        try {
            emitter.send(SseEmitter.event().name("message").data(message));
            emitter.complete();
        } catch (IOException e) {
            emitter.completeWithError(e);
        }

        return emitter;
    }
}
