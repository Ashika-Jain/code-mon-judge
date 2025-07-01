FROM node:18

# Install compilers and Python
RUN apt-get update && apt-get install -y g++ python3

# Create and set working directory
WORKDIR /usr/src/app

# Copy package.json only
COPY compiler/package.json ./

# Install dependencies
RUN npm install --verbose

# Copy the compiler source code
COPY compiler/. .

# Copy the CC folder (this works because you're building from backend/)
COPY CC ./CC

# Expose the server port
EXPOSE 5001

# Run the server
CMD ["node", "server.js"]
