# Shopify Transfer Guide

Checked against Shopify/app information available on 16 July 2026.

## Recommended Launch Strategy

Use one Shopify product: **Build Your Own Box of Six**.

Variants:

- **Classic Box** - £15.99
- **Premium Mix Box** - £18.49

Theme selector:

- Customer chooses Chocolate Chip, Oreo and Biscoff quantities.
- Total must equal six.
- If Oreo or Biscoff quantity is above zero, the theme selects the Premium Mix variant.
- Flavour quantities are saved as line-item properties.
- Shopify inventory tracks total sellable boxes, starting at 25 per weekly drop.

This avoids hundreds of flavour-combination variants and keeps fulfilment simple.

## Feature Map

| Prototype feature | Shopify equivalent | Native/theme/app | Setup steps | Free? | Limitations |
|---|---|---|---|---|---|
| Announcement bar | Theme announcement bar | Standard theme | Add preorder wording and link to product | Yes | Must update weekly or through theme settings |
| Header/nav | Shopify navigation menus | Native/theme | Create menus for Build, How it works, FAQ, Contact, Policies | Yes | Theme styling varies |
| Hero section | Homepage image/banner section | Standard theme | Add real product photo, heading, CTA | Yes | Replace generated image |
| Product cards | Featured collection / custom section | Theme | Add three flavour cards or metafield-driven blocks | Yes | Individual cookies should not be purchasable |
| Build-a-box selector | Product form customisation | Theme customisation or bundle app | Add quantity controls, exact-six UI and line-item properties | Theme: yes | Front-end-only validation can be bypassed |
| Exact-six enforcement | Cart/checkout validation | Theme plus validation app/function | Best free native option is theme UI plus manual order review; robust server validation may require an app/custom function | Not guaranteed free | Do not claim fully tamper-proof without validation |
| Premium price | Two product variants | Native Shopify | Automatically select Classic or Premium Mix variant based on premium quantity | Yes | Theme must not let customers choose wrong variant manually |
| Inventory limit of 25 | Product variant inventory | Native Shopify | Track inventory on box product/variants; restock weekly to 25 | Yes | If both variants share one physical capacity, monitor combined quantity carefully or use one inventory item strategy |
| 48-hour preorder window | Product publish/status plus theme messaging | Native/manual | Open product Friday; close Sunday or when sold out | Yes | Native scheduled publishing may need manual checks depending theme/admin workflow |
| Sold-out state | Shopify sold-out product state | Native/theme | Stop selling when inventory reaches 0; show next-drop copy | Yes | Low-stock copy must use real inventory |
| Local collection | Pickup in store | Native Shopify | Settings > Shipping and delivery > Pickup in store | Yes | Exact slots are not native |
| Time-slot selection | Cart attribute or pickup app | Theme customisation/free app | Store `Collection slot` as cart attribute/order note or use a pickup/date app | Maybe | Reliable slot capacity/validation may require app features |
| Guest checkout | Shopify checkout | Native | Enable guest checkout / optional accounts | Yes | Do not gate purchase behind account |
| Customer accounts | Shopify customer accounts | Native | Enable optional customer accounts | Yes | Use Shopify sign-in flow; do not custom-build auth |
| Order confirmation | Shopify notification | Native | Edit notification template to include line-item properties and slot | Yes | Test with real orders |
| Ready for pickup | Shopify pickup workflow | Native | Mark order ready for pickup; send notification | Yes | Timing/reminders may be manual |
| Marketing consent | Checkout marketing opt-in | Native | Configure email/SMS consent separately | Yes | Transactional messages do not require marketing opt-in |
| Reviews | Theme testimonial blocks | Manual/theme | Collect feedback manually and add approved quotes | Yes | Do not fabricate reviews |
| FAQ | Shopify page / collapsible section | Native/theme | Create FAQ page with editable answers | Yes | Keep placeholders out of final site |
| Contact form | Shopify contact form | Native/theme | Add fields for order number and reason where theme supports | Yes | Extra fields may need theme editing |
| Policy pages | Shopify policies/pages | Native | Create legal/customer information pages | Yes | Requires legal review |
| Allergen data | Page/metafields | Native/theme | Create cautious allergen page and product metafields | Yes | Must be verified against final ingredients |
| Mobile sticky CTA | Theme section/custom CSS | Theme customisation | Add sticky product summary on mobile | Yes | Avoid covering checkout/cart controls |
| Analytics | Shopify analytics | Native | Use Shopify reports; add GA only if needed | Yes | Cookie consent may be required for non-essential tracking |
| Cookie consent | Shopify/customer privacy settings or theme banner | Native/theme/app | Use only if analytics/marketing cookies require consent | Yes/maybe | Do not add unnecessary scripts |
| SEO | Product/page SEO fields | Native | Titles, descriptions, image alt text, Barnsley copy | Yes | Avoid keyword stuffing |
| Image replacement | Theme media | Native | Replace all generated assets with real photography | Yes | Required before launch |

## Strongest Validation Path

The simplest maintainable launch path is a theme-level selector that adds one box product with line-item properties. It gives customers the right experience and keeps stock/fulfilment straightforward.

The weak point is enforcement. JavaScript can stop normal customers adding an incomplete or underpriced box, but it is not a server-side guarantee. A standard Shopify merchant should either:

1. Use a genuinely free bundle/options app that supports exact counts, fixed bundle pricing and enough monthly orders, if one is confirmed at setup time.
2. Use theme UI plus manual order review for the first small drops, with clear internal checks before baking.
3. Pay for or build robust validation later only if demand justifies it.

At the requested 100 boxes/month maximum, the audited free bundle app below is not enough on its free plan.
