# Use the official Node.js image.
FROM node:18

# Set the working directory.
WORKDIR /app

# Copy package.json and package-lock.json files.
COPY package.json package-lock.json ./

# Install dependencies.
RUN npm install

# Copy the rest of the application code.
COPY . .

# Build-time environment variable
ARG NEXT_PUBLIC_API_URL

# Set environment variables for production.
ENV NODE_ENV=production

# Build the Next.js application.
RUN NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL npm run build

# Expose the application port.
EXPOSE 3000

# Start the Next.js application.
CMD ["npm", "start"]
