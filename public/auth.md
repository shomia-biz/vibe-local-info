# Auth.md

You are an agent. This service supports **agentic registration**: discover → register → (claim if needed) → exchange for an access_token → call API → handle revocation. Follow the steps in order; do not skip ahead.

## Step 1 — Discover

Fetch the Authorization Server metadata:
GET https://moa-tips.com/.well-known/oauth-authorization-server

## Step 2 — Pick a method

Use this decision tree:
1. You have a session tied to a user identity
2. You have only the user's email
3. You have neither -> anonymous

## Step 3 — Register

To register, send a request to the identity endpoint specified in the authorization server metadata.
