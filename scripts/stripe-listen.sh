#!/usr/bin/env bash
set -euo pipefail

# Forwards Stripe events to the local webhook endpoint for development.
# Requires: https://stripe.com/docs/stripe-cli
# Usage:  npm run stripe:listen
#
# Copy the printed `whsec_*` value into .env.local as STRIPE_WEBHOOK_SECRET.

exec stripe listen --forward-to "http://localhost:3000/api/stripe/webhook"
