package com.example.websocket.controller;

public class InputStore {
    private static volatile String lastInput = "";

    public static String getLastInput() {
        return lastInput;
    }

    public static void setLastInput(String input) {
        lastInput = input;
    }
}
