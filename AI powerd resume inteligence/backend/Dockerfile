# Multi-stage Dockerfile for CareerMind Spring Boot Backend
FROM maven:3.9.6-eclipse-temurin-17 AS builder
WORKDIR /app
COPY pom.xml .
RUN mvn dependency:go-offline -B
COPY src ./src
RUN mvn clean package -DskipTests

FROM eclipse-temurin:17-jre-alpine
WORKDIR /app
RUN addgroup -S appgroup && adduser -S appuser -G appgroup \
    && mkdir -p /app/uploads/resumes \
    && chown -R appuser:appgroup /app
USER appuser
COPY --from=builder --chown=appuser:appgroup /app/target/careermind-backend-1.0.0.jar app.jar
ENV PORT=8080
EXPOSE 8080
ENTRYPOINT ["java", "-Xms128m", "-Xmx512m", "-Dserver.port=${PORT}", "-jar", "app.jar"]
