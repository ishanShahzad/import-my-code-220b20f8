

# Complete Plan: Role-Based AI Command Center with All Features

This is the unified plan merging **all previously discussed features** (Voice Call Mode, Personal Stylist, Smart Navigation, Contextual Chips) with the **new role-based dashboard integration, comprehensive action tools, and rate limiting**.

---

## Architecture

```text
┌─────────────────────────────────────────────────┐
│           ChatBot.jsx (Unified UI)              │
│                                                 │
│  TEXT MODE           │  VOICE CALL MODE         │
│  Chat bubbles        │  Animated pulsing orb    │
│  Product cards       │  Live waveform bars      │
│  Style advice cards  │  "Listening..."          │
│  Outfit suggestions  │  Call timer              │
│  Color swatches      │  [End Call] button       │
│  [🎤] [Send]         │  TTS auto-response       │
│──────────────────────┴─────────────────────────│
│  EMBEDDED MODE (Dashboard sidebar)              │
│  - Same component, `embedded` prop              │
│  - Role detected from currentUser.role          │
│  - Role-specific quick chips & greeting         │
│──────────────────────┴─────────────────────────│
│             ↓ all feed into ↓                   │
│  ┌───────────────────────────────────────────┐  │
│  │   Edge Function (ai-chat) — Role-Based    │  │
│  │   - Role-specific system prompt           │  │
│  │   - Role-specific tool definitions        │  │
│  │   - User context injected                 │  │
│  │   - Token-optimized history (last 20)     │  │
│  │   - Returns: text + tool calls            │  │
│  └───────────────────────────────────────────┘  │
│             ↓                                   │
│  Tool execution → Backend AI Action APIs        │
│  Action confirmations / Product cards in chat   │
│  Rate limit enforcement (5/20/25/∞ per day)     │
└─────────────────────────────────────────────────┘
```

---

## Step 1: Backend — Rate Limit Model & Endpoints

**Create `Backend/models/AIRateLimit.js`**
- Schema: `userId` (ObjectId, nullable), `ip` (for guests), `messageCount`, `date` (YYYY-MM-DD)

**Add to `Backend/routes/chatbotRoutes.js`:**
- `GET /api/chatbot/rate-limit` — returns remaining messages today
- `POST /api/chatbot/rate-limit/increment` — increments, returns remaining

Limits: Guest 5/day, User 20/day, Seller 25/day, Admin unlimited. Resets at midnight.

---

## Step 2: Backend — Complete AI Action Layer

**Create `Backend/controllers/aiActionController.js`** and **`Backend/routes/aiActionRoutes.js`** — thin validated wrappers around existing controllers with role checks.

**Register in `Backend/server.js`.**

### Seller Actions (17 tools)

| Tool | What it does |
|------|-------------|
| `add_product` | Create product (validates required fields, asks AI to request missing ones) |
| `edit_product` | Update any product field (name, price, description, stock, images, category) |
| `delete_product` | Delete product by name or ID |
| `list_my_products` | List seller's products with search/filter/pagination |
| `bulk_discount` | Apply percentage or fixed discount to multiple products |
| `bulk_price_update` | Update prices of multiple products at once |
| `remove_discount` | Remove discounts from selected products |
| `get_seller_analytics` | Revenue trends, top products, order stats, conversion rates |
| `get_seller_notifications` | Recent alerts and activity feed |
| `get_seller_orders` | List orders for seller's products with status filters |
| `update_order_status` | Change order status (processing → shipped → delivered) |
| `get_my_store` | Store details, settings, verification status |
| `update_store` | Update store name, description, logo, banner, social links, return policy |
| `get_store_analytics` | Store views, trust count, product performance |
| `apply_for_verification` | Submit store verification application |
| `get_shipping_methods` | View configured shipping methods and rates |
| `update_shipping` | Add/update/remove shipping methods and rates |

### Admin Actions (22 tools — all seller tools plus)

| Tool | What it does |
|------|-------------|
| `get_all_users` | List/search all users with role, status, date filters |
| `delete_user` | Delete any user (with confirmation) |
| `block_user` | Block/unblock a user |
| `change_user_role` | Change user role (user/seller/admin) |
| `get_admin_analytics` | Platform-wide revenue, user growth, store distribution |
| `get_admin_notifications` | System alerts (new stores, verification requests, flagged content) |
| `get_all_orders` | View all orders across platform with filters |
| `cancel_order` | Cancel any order |
| `get_order_detail` | Detailed info about a specific order |
| `get_all_complaints` | List all complaints with category/status filters |
| `update_complaint` | Respond to, resolve, or escalate complaints |
| `get_pending_verifications` | List stores awaiting verification |
| `approve_verification` | Approve a store's verification |
| `reject_verification` | Reject with reason |
| `remove_verification` | Revoke verified status |
| `get_all_stores` | List all stores on platform |
| `get_verified_stores` | List verified stores |
| `update_tax_config` | Change platform tax settings |
| `get_tax_config` | View current tax configuration |
| `search_products` | Search all products on platform (admin-level) |

### User Actions (7 tools)

| Tool | What it does |
|------|-------------|
| `search_products` | Search and filter products (with style/occasion context) |
| `navigate` | Navigate to any page in the app |
| `get_my_orders` | View own order history |
| `get_order_detail` | View specific order details |
| `cancel_order` | Cancel own pending order |
| `submit_complaint` | File a complaint |
| `get_my_complaints` | View own complaint history |

---

## Step 3: Edge Function — Role-Based Prompts, Full Tools, Token Optimization

**Major rewrite of `supabase/functions/ai-chat/index.ts`:**

- Accept `role` field in request body
- **Three distinct system prompts:**
  - **User/Guest**: Current personal stylist prompt (fashion consultant, color theory, occasion-based)
  - **Seller**: Business assistant — analytics advisor, product management helper, growth strategist, social media advisor, order manager. Proactively suggests: run ads, optimize listings, seasonal promotions, cross-selling strategies
  - **Admin**: Platform commander — unrestricted access, user management, compliance, platform health monitoring
- **Role-specific tool definitions** (all tools from Step 2 registered as AI function-calling tools)
- **Token optimization:**
  - Only send last 20 messages to AI
  - Older messages summarized into 2-3 sentence context block
  - Strip tool results from history (keep text only)
  - Cap individual historical messages to 500 chars (full content for latest 3)

---

## Step 4: ChatBot.jsx — Complete Refactor

### Existing features preserved and enhanced:

**Voice Call Mode (from original plan):**
- Mic button transforms panel into full-screen voice interface
- Animated pulsing orb + sound wave bars (CSS animations)
- `SpeechRecognition` with `continuous = true` — open phone-call style
- Each recognized sentence sent to AI, AI responds via browser TTS
- "End Call" dumps transcript into chat history
- Call duration timer displayed
- Graceful degradation: mic button hidden if browser lacks Speech API

**Personal Stylist Features (from original plan):**
- **Style Advice Cards**: Rendered when AI gives fashion advice — color palette swatches, occasion tag, reasoning
- **Outfit Suggestion Cards**: Grouped product cards with "Why this works" explanation
- **Follow-up Question Chips**: AI-generated contextual chips ("For a party", "Casual wear")
- **Color Harmony Display**: Visual swatches when AI discusses color combos

**Smart Navigation Engine (from original plan):**
- `navigate(route)` → `useNavigate`
- `addToCart(productId)` → global context `handleAddToCart`
- Inline action confirmation cards

**Personalization on Open (from original plan):**
- Fetches user context via `/api/chatbot/user-context`
- AI greeting references history: "Welcome back! How are those sneakers?"
- Time-aware greetings

**Persistent Chat History (already implemented):**
- MongoDB-backed for logged-in users
- localStorage fallback
- Debounced save, clear button

### New features added:

**Embedded Mode:**
- Accept `embedded` prop — renders inline (no floating bubble) when opened from dashboard sidebar
- Accept `dashboardRole` prop to override role detection

**Rate Limiting UI:**
- On mount and before each send, check remaining messages via backend
- Show "X messages remaining today" indicator in header
- When limit reached: show login prompt (guests) or "limit reached, resets tomorrow" (users)

**Role-Aware Behavior:**
- Detect role from `currentUser?.role`, pass to edge function
- **Role-specific greetings:**
  - Seller: "Welcome back! I'm your business assistant. I can help with analytics, products, orders, and growth strategies."
  - Admin: "Welcome, Admin. I can manage users, review analytics, handle complaints, and run platform operations."
- **Role-specific contextual chips:**
  - **User initial**: "Help me find an outfit", "Track my order", "Style advice", "Browse stores"
  - **User after search**: "Show me more like this", "What goes with this?", "Add to cart"
  - **User after style talk**: "Show me options", "Different color", "Higher budget"
  - **Seller**: "📊 Show analytics", "📦 Add a product", "💰 Apply discount", "📋 Recent orders", "🚀 Growth tips", "🚚 Shipping setup"
  - **Admin**: "👥 User overview", "📊 Platform stats", "🛡️ Complaints", "🔍 Find user", "🏪 Verifications", "⚙️ Tax config"

**All Tool Call Handlers:**
- `add_product`: Call backend, handle missing fields (AI asks user)
- `edit_product`, `delete_product`: With confirmation for destructive actions
- `bulk_discount`, `bulk_price_update`: Execute and confirm
- `get_seller_analytics`, `get_store_analytics`: Fetch and return to AI
- `delete_user`, `block_user`, `change_user_role`: Confirmation dialog first
- `approve_verification`, `reject_verification`: Execute and confirm
- `update_tax_config`: Execute with confirmation
- All other tools: Call backend API → return result to AI for response

---

## Step 5: Dashboard Integration

**Update `Frontend/src/components/layout/SellerDashboard.jsx`:**
- Add `Bot` icon to sidebar menu items as "AI Assistant"
- Toggle state for embedded chat panel
- When clicked, slide-out panel on right with `<ChatBot embedded dashboardRole="seller" />`

**Update `Frontend/src/components/layout/AdminDashboard.jsx`:**
- Same pattern — "AI Assistant" in sidebar
- Panel with `<ChatBot embedded dashboardRole="admin" />`

---

## Step 6: Cleanup

- Delete `Frontend/src/components/common/VoiceCommerce.jsx`
- Remove VoiceCommerce from `Frontend/src/pages/MainLayoutPage.jsx`
- Delete `Backend/utils/hfClient.js`

---

## Files Summary

| Action | File |
|--------|------|
| Create | `Backend/models/AIRateLimit.js` |
| Create | `Backend/controllers/aiActionController.js` |
| Create | `Backend/routes/aiActionRoutes.js` |
| Edit | `Backend/routes/chatbotRoutes.js` (rate limit routes) |
| Edit | `Backend/controllers/chatbotController.js` (rate limit logic) |
| Edit | `Backend/server.js` (register aiActionRoutes) |
| Rewrite | `supabase/functions/ai-chat/index.ts` (role-based prompts, all tools, token optimization) |
| Rewrite | `Frontend/src/components/common/ChatBot.jsx` (embedded mode, voice call, role-awareness, rate limits, all tool handlers, stylist cards) |
| Edit | `Frontend/src/components/layout/SellerDashboard.jsx` (AI sidebar button + panel) |
| Edit | `Frontend/src/components/layout/AdminDashboard.jsx` (AI sidebar button + panel) |
| Edit | `Frontend/src/pages/MainLayoutPage.jsx` (remove VoiceCommerce) |
| Delete | `Frontend/src/components/common/VoiceCommerce.jsx` |
| Delete | `Backend/utils/hfClient.js` |

