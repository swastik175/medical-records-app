# ── Stage 1: Build ──────────────────────────────────────────────────────────
FROM maven:3.9-eclipse-temurin-17-alpine AS build
WORKDIR /build

# Copy Maven pom first (cache layer)
COPY pom.xml .
RUN mvn dependency:go-offline -B 2>/dev/null || true

# Copy source and build JAR
COPY src src
RUN mvn clean package -DskipTests -B

# ── Stage 2: Runtime ─────────────────────────────────────────────────────────
FROM eclipse-temurin:17-jre-alpine
WORKDIR /app

# Create directories for file uploads and H2 database
RUN mkdir -p /app/uploads/medical-documents /app/data

# Copy JAR from build stage
COPY --from=build /build/target/medical-records-backend-1.0.0.jar app.jar

# Non-root user for security
RUN addgroup -S appgroup && adduser -S appuser -G appgroup \
    && chown -R appuser:appgroup /app
USER appuser

EXPOSE 8080

ENV SPRING_PROFILES_ACTIVE=dev \
    JAVA_OPTS="-Xms256m -Xmx512m -XX:+UseContainerSupport"

ENTRYPOINT ["sh", "-c", "java $JAVA_OPTS -jar app.jar"]
