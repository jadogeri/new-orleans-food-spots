import axios from "axios";

if (!process.env.YELP_API_KEY) {
  throw new Error("YELP_API_KEY must be set");
}

// Secret may be stored as "YELP_API_KEY=<token>" — strip the prefix
const rawKey = process.env.YELP_API_KEY;
const apiKey = rawKey.includes("=") ? rawKey.split("=").slice(1).join("=") : rawKey;

export const yelpClient = axios.create({
  baseURL: "https://api.yelp.com/v3/businesses",
  timeout: 8000,
  headers: {
    Authorization: `Bearer ${apiKey}`,
    "Content-Type": "application/json",
  },
});
