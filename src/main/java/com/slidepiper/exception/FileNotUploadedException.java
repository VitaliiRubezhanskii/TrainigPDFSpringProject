package com.slidepiper.exception;

@SuppressWarnings("serial")
public class FileNotUploadedException extends RuntimeException {
  public FileNotUploadedException() {
    super("File not uploaded");
  }
}
