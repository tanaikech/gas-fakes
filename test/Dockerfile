FROM node:22-slim
WORKDIR /usr/src/app

# 1. Copy root package files (from parent)
COPY package*.json ./
RUN npm install --omit=dev

# 2. Copy the entire project context (Parent + Test folder)
COPY . .

# 3. Handle the test-specific dependencies
# Since we copied everything, your test folder is at /usr/src/app/test
WORKDIR /usr/src/app/test
RUN npm install

# 4. Move .env to the expected location if necessary
# If your code expects .env in /usr/src/app/, move it:
# RUN cp .env ../.env

# 5. Return to root
WORKDIR /usr/src/app

ENV PORT 8080
EXPOSE 8080

# Execute cloudrun.js from the test subfolder
CMD ["node", "test/cloudrun.js"]