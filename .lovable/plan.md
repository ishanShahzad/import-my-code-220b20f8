

# Mobile App UI/UX Overhaul Plan

## Issues Identified from Screenshots

### 1. HomeScreen (Screenshot 1)
- Overall layout looks reasonable but the search bar and filter button styling could be tighter
- Categories section is functional but could use polish
- Product cards appear to work but need verification against web parity

### 2. StoresListingScreen (Screenshot 2)
- Store cards have a purple banner that looks flat and monotone
- The "Trust" button and store stats layout works but cards feel oversized with too much vertical spacing
- Search input inside the glass panel looks cramped

### 3. ProfileScreen (Screenshot 3)
- Profile card looks reasonable but the avatar area could be larger/more prominent
- Menu items spacing is very large, causing excessive scrolling
- "Admin Dashboard" icon is using the wrong icon (settings-outline instead of shield)

### 4. OrdersScreen (Screenshot 4)
- Order cards have excessive vertical spacing between them
- Item preview images are showing placeholder cubes instead of product images (data issue)
- Card padding is too generous, wasting screen space

### 5. TrustedStoresScreen (Screenshot 5)
- Header shows a broken layout: red heart icon button is floating with no text beside it
- The "Trusted Stores" title is in a purple header bar that doesn't match the glass aesthetic
- Only one store showing with excessive empty space below
- Missing back button integration with navigation header

### 6. ChangePasswordScreen (Screenshot 6)
- Input fields have thick black borders that clash with the glass design
- The border style uses solid dark outlines instead of subtle glass borders
- Eye toggle icons are barely visible
- Overall form looks harsh against the soft glass background

### 7. AdminDashboardScreen (Screenshot 7)
- Quick Action cards have a broken layout: text is being clipped ("Manage platform users" / "Verify seller stores")
- Action cards are taking too much vertical space with large gaps between them
- Badge numbers overlap with card layout
- **Missing features vs web**: Admin dashboard on web has Store Overview, Analytics, Notifications page, and Notification Settings as navigation items. Mobile admin only has: User Management, Store Verification, Tax Config, Products, Orders. Missing: **Store Overview**, **Analytics**, **Notifications page** (separate from bell), and **Notification Settings**

### 8. Missing Admin Features (Web vs Mobile comparison)
Web admin sidebar has 9 items:
1. Store Overview (**exists on mobile as a screen but NOT in admin quick actions**)
2. Analytics (**exists as AdminAnalyticsScreen but NOT in admin quick actions**)
3. User Management (exists)
4. Products (exists)
5. Orders (exists)
6. Verifications (exists)
7. Tax Config (exists)
8. Notifications (**exists as AdminNotificationsScreen but NOT in admin quick actions**)
9. Settings / Notification Settings (**exists as NotificationSettingsScreen but NOT in admin quick actions**)

## Implementation Plan

### Task 1: Fix ChangePasswordScreen input styling
- Replace thick black `borderWidth: 1` / dark `borderColor` with subtle glass borders matching the theme
- Use `glass.borderSubtle` for border colors and lighter styling
- Improve eye icon visibility with better contrast colors

### Task 2: Fix AdminDashboardScreen layout and add missing features
- Add missing quick action entries: Store Overview, Analytics, Notifications, Notification Settings
- Fix action card text clipping by ensuring proper flex layout
- Reduce excessive vertical spacing between action cards
- Add alert bar for pending orders/out-of-stock (matching web)

### Task 3: Fix TrustedStoresScreen header and layout
- Fix the broken header — remove the floating heart icon button, integrate properly with the title
- Add proper back button navigation
- Improve the header to use consistent glass panel styling without the purple bar
- Fix empty state spacing

### Task 4: Fix OrdersScreen card spacing
- Reduce excessive vertical padding between order cards
- Tighten the card internal padding to reduce wasted space

### Task 5: Fix ProfileScreen menu icon and spacing
- Change Admin Dashboard icon from `settings-outline` to `shield-outline` to match its purpose
- Reduce menu row vertical padding to show more items without excessive scrolling

### Task 6: Fix StoreCard styling on StoresListingScreen
- Reduce card height and tighten content spacing
- Improve banner-to-content transition

### Task 7: Fix ActionCard text clipping
- Ensure subtitle text is not getting cut off in the action cards
- Adjust badge positioning so it doesn't overlap with text content
- Reduce internal padding to make cards more compact

## Technical Details

**Files to modify:**
- `MobileApp/src/screens/ChangePasswordScreen.js` — input border styling
- `MobileApp/src/screens/admin/AdminDashboardScreen.js` — add missing quick actions, fix layout
- `MobileApp/src/screens/TrustedStoresScreen.js` — fix header layout
- `MobileApp/src/screens/OrdersScreen.js` — reduce card spacing
- `MobileApp/src/screens/ProfileScreen.js` — fix admin icon, reduce spacing
- `MobileApp/src/components/common/ActionCard.js` — fix text clipping and spacing
- `MobileApp/src/components/common/OrderCard.js` — tighten padding
- `MobileApp/src/components/common/StoreCard.js` — reduce vertical spacing

**No new dependencies required.** All changes are styling and layout adjustments using existing theme tokens and adding missing navigation entries to the admin dashboard.

