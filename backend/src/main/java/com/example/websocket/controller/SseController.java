package com.example.websocket.controller;

import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

import java.io.IOException;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.concurrent.Executors;
import java.util.concurrent.ScheduledExecutorService;
import java.util.concurrent.ScheduledFuture;
import java.util.concurrent.TimeUnit;

@RestController
@CrossOrigin(origins = "*")
public class SseController {

    private static final DateTimeFormatter FORMATTER =
            DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss");

    private static final ScheduledExecutorService scheduler =
            Executors.newScheduledThreadPool(4);

    @PostMapping(value = "/receiveInput2", produces = MediaType.TEXT_EVENT_STREAM_VALUE)
    public SseEmitter receiveInput2(@RequestBody String inputText) {
        String trimmed = inputText.trim().replaceAll("^\"|\"$", "");
        InputStore.setLastInput(trimmed);

        SseEmitter emitter = new SseEmitter(0L); // no timeout — client controls lifecycle

        ScheduledFuture<?>[] futureHolder = new ScheduledFuture<?>[1];

        Runnable task = () -> {
            String serverTime = LocalDateTime.now().format(FORMATTER);
            String message = InputStore.getLastInput() + " | Server time: " + serverTime;
            try {
                emitter.send(SseEmitter.event().name("message").data(message));
            } catch (IOException e) {
                futureHolder[0].cancel(false);
                emitter.completeWithError(e);
            }
        };

        futureHolder[0] = scheduler.scheduleAtFixedRate(task, 0, 5, TimeUnit.SECONDS);

        emitter.onCompletion(() -> futureHolder[0].cancel(false));
        emitter.onTimeout(() -> futureHolder[0].cancel(false));
        emitter.onError(e -> futureHolder[0].cancel(false));

        return emitter;
    }
}
