# Use the official Golang image as the base
FROM golang:1.23.4

# Set the working directory inside the container
WORKDIR /app

# Copy go.mod and go.sum files to leverage caching
COPY go.mod go.sum ./

# Download Go module dependencies
RUN go mod download

# Copy the rest of the application source code
COPY . .

# Build the Go application
RUN go build -o email-verifier

# Expose the port on which the application will run
EXPOSE 8080

# Command to run the executable
CMD ["./email-verifier"]
