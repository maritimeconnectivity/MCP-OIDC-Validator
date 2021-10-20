package net.maritimeconnectivity.mcpoidcvalidator.controllers;

import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api")
@Slf4j
public class ValidationController {

    @GetMapping(
            value = "/validate",
            produces = MediaType.TEXT_PLAIN_VALUE
    )
    public ResponseEntity<String> validateToken() {
        return new ResponseEntity<>("Access token is valid", HttpStatus.OK);
    }
}
