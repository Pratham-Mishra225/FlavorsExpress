package com.pratham.FDS.service;

import com.pratham.FDS.dto.LoginRequest;
import com.pratham.FDS.dto.LoginResponse;
import com.pratham.FDS.dto.RegisterRequest;

public interface AuthService {
    LoginResponse register(RegisterRequest request);

    LoginResponse login(LoginRequest request);
}
