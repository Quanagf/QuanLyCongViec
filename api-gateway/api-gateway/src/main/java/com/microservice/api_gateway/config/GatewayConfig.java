package com.microservice.api_gateway.config;

import org.springframework.cloud.gateway.route.RouteLocator;
import org.springframework.cloud.gateway.route.builder.RouteLocatorBuilder;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class GatewayConfig {

    @Bean
    public RouteLocator customRouteLocator(RouteLocatorBuilder builder) {
        return builder.routes()
                .route("user-service", r -> r
                        .path("/api/users/**")
                        .filters(f -> f.stripPrefix(1))
                        .uri("http://user-service:8082"))
                .route("task-service", r -> r
                        .path("/api/tasks/**")
                        .filters(f -> f.stripPrefix(1))
                        .uri("http://task-service:8081"))
                .build();
    }
}
