# ops.md

# operations plan (OPS)
# free saas arabic digital menu + whatsapp ordering

---

# 1. operational model overview

This platform operates as:

- Free multi-restaurant SaaS
- No subscription fees
- No payment gateway
- WhatsApp-based ordering
- Multi-tenant architecture
- Arabic-first (RTL)

Primary goal:
Rapid user acquisition + scalable infrastructure + future monetization readiness.

---

# 2. platform structure

## level 1 – platform (you)

Responsibilities:
- Maintain infrastructure (Supabase & Frontend Host)
- Monitor performance
- Moderate restaurants
- Manage branding
- Handle abuse/spam control

---

## level 2 – restaurant admin

Responsibilities:
- Create menu
- Update items
- Manage availability
- Receive WhatsApp orders
- Handle customer service

---

## level 3 – customer

Responsibilities:
- Browse menu
- Add to cart
- Submit order via WhatsApp

---

# 3. onboarding operations

## restaurant onboarding flow

1. Register account (via Supabase Auth)
2. Verify phone/email
3. Add restaurant info (Saved to Supabase DB)
4. Add categories & items
5. Upload images (Saved to Supabase Storage)
6. Generate QR
7. Go live

Target onboarding time:
< 15 minutes

---

# 4. technical operations

## architecture & stack

- **Frontend**: HTML/CSS/Vanilla JS (or React/Next.js if preferred)
- **Backend & Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth (Email/Password, or OAuth)
- **Storage**: Supabase Storage (for item images and restaurant logos)
- **Hosting**: Vercel / Netlify / GitHub Pages
- **CDN**: Cloudflare or built-in CDN for MENA region

---

## data structure (Supabase Schema Plan)

- **Multi-tenant isolation**: Using Supabase RLS (Row Level Security) to ensure restaurant admins can only access and modify their own data.
- **`restaurants` table**: id, owner_id (auth.uid), name, slug, phone, settings.
- **`categories` table**: id, restaurant_id, name, order.
- **`items` table**: id, category_id, restaurant_id, name, description, price, image_url, available.
- **Public Routes**: Slug-based public routes configured on the frontend fetching unauthenticated read-only data from Supabase.

---

## backups & security

- **Backups**: Automated daily PostgreSQL backups provided by Supabase.
- **Security**: Strict RLS policies on Supabase to prevent unauthorized data access.
- **Version control**: GitHub.

---

# 5. support operations

## support channels

- WhatsApp Business
- Email support
- FAQ page
- Video tutorials

---

## response time targets

- Critical issue: < 4 hours
- Normal support: < 24 hours

---

# 6. moderation & control

Even if free, must include:

- Restaurant approval toggle (Admin dashboard flag in DB)
- Ability to suspend abusive accounts Let Supabase handle auth disabling
- Terms & conditions acceptance
- Content moderation guidelines

---

# 7. performance standards

- Page load < 2 seconds
- Mobile-first optimization
- RTL flawless rendering
- 99% uptime target

---

# 8. scaling plan

## phase 1 – 0 to 100 restaurants

- Supabase Free Tier is sufficient.
- Manual monitoring
- Direct support
- Collect feedback

## phase 2 – 100 to 1000 restaurants

- Upgrade to Supabase Pro (Predictable cost).
- Admin analytics dashboard (custom built against Supabase).
- Feature flags.

## phase 3 – 1000+ restaurants

- Database indexing optimization.
- Read Replicas if traffic demands.
- API layer caching.

---

# 9. risk management

## technical risks

- High traffic spikes -> Handled by Supabase scalable architecture.
- Abuse/spam -> Set up email/phone verification in Supabase Auth.
- WhatsApp link misuse -> Rate limiting on frontend.

---

## business risks

- No monetization initially -> Keep infrastructure costs practically $0 on Supabase Free Tier.
- Free user churn.
- Platform misuse.

---

# 10. future monetization readiness

Even though platform is free, we prepare the database for:

- Feature gating (Boolean flags in Supabase `restaurants` or `subscriptions` table)
- Stripe integration (via Supabase Edge Functions)
- Custom domain upsells

Structure must be:
Free today. Monetizable tomorrow.

---

# 11. team requirements (early stage)

Solo founder can manage:
- Development (Supabase makes it easy for a solo dev)
- Customer support
- Marketing

At 500+ restaurants:
- Add Support agent
- Add Part-time developer

---

# 12. key operational KPIs

- Number of active restaurants
- Orders sent via WhatsApp
- Daily active menus
- Avg onboarding completion time
- Platform uptime

---

# conclusion

This OPS structure using Supabase supports:

- Extremely low infrastructure cost (Free tier to start).
- Fast development (Backend-as-a-Service).
- High security (Row Level Security).
- Monetization switch-ready database structure.
