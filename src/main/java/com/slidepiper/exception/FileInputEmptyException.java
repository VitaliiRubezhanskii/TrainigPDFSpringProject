package com.slidepiper.exception;

public class FileInputEmptyException extends RuntimeException {
    public FileInputEmptyException() {
        super("File input is empty");
    }
}
