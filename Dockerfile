# Stage 1: build the app with Maven + Java 21
FROM maven:3.9-eclipse-temurin-21 AS build
WORKDIR /app
COPY pom.xml .
RUN mvn -B dependency:go-offline
COPY src ./src
RUN mvn -B clean package -DskipTests

# Stage 2: run just the built jar on a lightweight JRE image
FROM eclipse-temurin:21-jre-jammy
WORKDIR /app
COPY --from=build /app/target/*.jar app.jar

# Render provides the PORT environment variable at runtime — Spring Boot picks it up
# automatically via server.port=${PORT:8080} (see application.yml).
EXPOSE 8080
ENTRYPOINT ["java", "-jar", "app.jar"]
