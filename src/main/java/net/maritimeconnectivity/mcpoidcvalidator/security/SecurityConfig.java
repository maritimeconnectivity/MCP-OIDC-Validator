package net.maritimeconnectivity.mcpoidcvalidator.security;

import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.builders.WebSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configuration.WebSecurityConfigurerAdapter;

@EnableWebSecurity
public class SecurityConfig extends WebSecurityConfigurerAdapter {

    @Override
    public void configure(WebSecurity webSecurity) throws Exception {
        super.configure(webSecurity);
        webSecurity
                .ignoring()
                .antMatchers(
                        "/",
                        "/js/*.js",
                        "/*.html",
                        "/favicon.ico"
                );
    }

    @Override
    protected void configure(HttpSecurity http) throws Exception {
        http
                .csrf().disable()
                .authorizeRequests()
                .antMatchers(
                        "/",
                        "/js/*.js",
                        "/*.html",
                        "/favicon.ico"
                ).permitAll()
                .anyRequest()
                .authenticated();
    }
}
