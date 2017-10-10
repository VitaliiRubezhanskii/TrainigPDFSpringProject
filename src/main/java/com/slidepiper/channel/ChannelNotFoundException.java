package com.slidepiper.channel;

public class ChannelNotFoundException extends RuntimeException {
    public ChannelNotFoundException() {
        super("Channel not found");
    }
}