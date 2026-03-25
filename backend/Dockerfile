FROM golang:alpine AS builder

WORKDIR /app
COPY go.mod go.sum ./
RUN go mod download

COPY . .
RUN CGO_ENABLED=0 GOOS=linux go build -o main .

FROM alpine:latest
WORKDIR /app
COPY --from=builder /app/main .
COPY .env.example .env

# Create uploads directory for local storage fallback
RUN mkdir -p uploads
RUN chmod 777 uploads

EXPOSE 8080
CMD ["./main"]
