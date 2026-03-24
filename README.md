# Crisp Tracker

A lightweight Node.js + TypeScript backend tool that connects to the Crisp API to track specific phrases and hyperlinks sent by operators in customer conversations.

## What it does
- Connects to Crisp chat via API
- Scans operator messages for specific phrases and links
- Logs results daily to a JSON file
- Generates a daily report showing how many times each phrase was sent

## Tech Stack
- TypeScript
- Node.js
- Crisp API
- node-cron (scheduled daily runs)
- dotenv (secure credential management)

## Setup
- Node.js 18+
- Crisp account with Website ID
- Clone repo and configure .env file
