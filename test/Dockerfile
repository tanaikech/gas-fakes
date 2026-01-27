FROM node:22-slim
WORKDIR /usr/src/app

# 1. Copy root package files (from parent)
COPY package*.json ./
RUN npm install --omit=dev

# 2. Copy the entire project context (Parent + Test folder)
COPY . .

# 3. Handle the test-specific dependencies
WORKDIR /usr/src/app/test
RUN npm install

# 4. Final setup and execution
# Ensure we stay in the test folder so relative paths to appsscript.json work
ENV PORT 8080
EXPOSE 8080

# Execute cloudrun.js from the current (test) folder
CMD ["node", "cloudrun.js"]