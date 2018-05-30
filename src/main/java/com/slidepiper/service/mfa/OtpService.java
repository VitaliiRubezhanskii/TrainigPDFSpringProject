package com.slidepiper.service.mfa;

public interface OtpService {

    public void sendOTP(String phoneNumber, int otp) throws Exception;

    public int generateCode();

}

