#!/bin/bash

# Install system dependencies for code compilation
echo "Installing system dependencies..."

# Update package list
apt-get update

# Install C++ compiler (g++)
apt-get install -y g++

# Install Java compiler (javac)
apt-get install -y openjdk-11-jdk

# Install Python (if not already available)
apt-get install -y python3

# Verify installations
echo "Verifying installations..."
g++ --version
javac -version
python3 --version

echo "Build script completed successfully!" 