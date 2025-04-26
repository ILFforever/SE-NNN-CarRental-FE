FROM node:22.15.0-alpine3.21

# Create app directory
WORKDIR /usr/src/app
# Install app dependencies
# A wildcard is used to ensure both package.json AND package-lock.json are copied
# Copying this separately prevents unnecessary reinstallation of dependencies
COPY package*.json ./
RUN npm install
# Bundle app source
COPY . .
RUN npm run build
# Expose the port the app runs on
EXPOSE 3000

# Run the app
CMD [ "npm", "run", "start" ]