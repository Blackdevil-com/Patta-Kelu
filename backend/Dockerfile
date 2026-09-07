# Stage 1: Build JAR
FROM eclipse-temurin:17-jdk-jammy AS build
WORKDIR /app
COPY .mvn/ .mvn/
COPY mvnw pom.xml ./
RUN ./mvnw dependency:go-offline -B
COPY src/ ./src/
RUN ./mvnw clean package -DskipTests

# Stage 2: Minimal Production JRE
FROM eclipse-temurin:17-jre-jammy
WORKDIR /app
RUN groupadd -r spring && useradd -r -g spring spring
RUN mkdir -p /app/uploads/audio /app/uploads/images && chown -R spring:spring /app
USER spring:spring

COPY --from=build /app/target/pattakelu-backend-1.0.0.jar app.jar

EXPOSE 8080
ENTRYPOINT ["java", "-Djava.security.egd=file:/dev/./urandom", "-jar", "app.jar"]
