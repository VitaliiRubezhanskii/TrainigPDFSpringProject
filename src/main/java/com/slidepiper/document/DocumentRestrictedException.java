package com.slidepiper.document;

public class DocumentRestrictedException extends RuntimeException {
    public DocumentRestrictedException() {
        super("Document is restricted");
    }
}