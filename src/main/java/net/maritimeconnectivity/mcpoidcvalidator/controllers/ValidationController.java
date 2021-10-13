package net.maritimeconnectivity.mcpoidcvalidator.controllers;

import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.oauth2.server.resource.authentication.JwtAuthenticationToken;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;


@RestController
@RequestMapping("/api")
@Slf4j
public class ValidationController {

    @GetMapping(
            value = "/validate",
            produces = MediaType.APPLICATION_JSON_VALUE
    )
    public ResponseEntity<String> validateToken() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        JwtAuthenticationToken jwt = (JwtAuthenticationToken) auth;
        String uid = (String) jwt.getTokenAttributes().get("uid");
        return new ResponseEntity<>("UID: " + uid, HttpStatus.OK);
    }
}
