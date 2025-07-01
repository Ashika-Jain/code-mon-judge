FROM node:18

# Install system dependencies for code compilation
RUN apt-get update && \
    apt-get install -y \
        g++ \
        default-jdk \
        python3 \
    && rm -rf /var/lib/apt/lists/*

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install Node.js dependencies
RUN npm install

# Copy application code
COPY . .

# Create necessary directories
RUN mkdir -p uploads CC/codes CC/inputs CC/outputs

# Expose port
EXPOSE 5000

# Start the application
CMD ["npm", "start"] 