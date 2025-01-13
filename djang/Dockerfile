# Use an official Node.js runtime as a parent image
FROM node:18
FROM python:slim

# Set the working directory in the container
WORKDIR /src

RUN apt-get update && apt-get -y install gettext
# Copy package.json and package-lock.json to the working directory
COPY package*.json ./

# Install any needed packages specified in package.json

COPY requirements.txt .
RUN pip install -r requirements.txt


# Copy the rest of your application code to the working directory
COPY . .

# Expose the port the app runs on

# Define the command to run your app
ENTRYPOINT ["sh", "docker-entrypoint.sh"]
CMD ["0.0.0.0:8000"]

