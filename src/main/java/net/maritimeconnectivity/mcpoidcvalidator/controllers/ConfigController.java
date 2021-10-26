package net.maritimeconnectivity.mcpoidcvalidator.controllers;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/config")
public class ConfigController {

    @Value("${spring.security.oauth2.resourceserver.jwt.issuer-uri}")
    private String oidcEndpoint;

    @GetMapping(
            value = "/endpoint",
            produces = MediaType.TEXT_PLAIN_VALUE
    )
    public ResponseEntity<String> getOidcEndpoint() {
        if (oidcEndpoint == null || oidcEndpoint.trim().isEmpty())
            return new ResponseEntity<>("OIDC endpoint is not configured.", HttpStatus.NOT_FOUND);
        return new ResponseEntity<>(oidcEndpoint, HttpStatus.OK);
    }
}
