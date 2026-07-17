# Shopify Transfer Guide

## Product model

One Shopify product: **Brown Butter Chocolate Chip Cookie Box**.

Variants:
- Box of Four - £11.99
- Box of Six - £15.99

Inventory should track boxes, not individual cookies. Weekly capacity is 25 total boxes. If Shopify cannot share one inventory pool cleanly across both variants without an app, the simplest free solution is manual weekly stock control: split a safe quantity between variants, monitor total sales, and set both variants unavailable once the combined 25-box capacity is reached.

## Feature mapping

| Feature | Shopify route | Type | Notes |
|---|---|---|---|
| Header, footer, hero, product cards | Theme sections | Native/theme | Standard theme customisation |
| Box of four/six selector | Product variants | Native | No bundle app needed |
| Cart box size | Variant title | Native | Appears in cart/order |
| Collection slot | Cart attribute or free pickup app | Theme/free app | Must appear on order details |
| Local pickup | Shopify local pickup | Native | Configure pickup location |
| Order confirmation | Shopify notifications | Native | Include collection slot/cart attribute |
| Ready for pickup | Shopify pickup notification | Native | Sent when order is marked ready |
| Reviews | Manual testimonials/theme blocks | Manual/theme | Prefer honest launch state initially |
| Preorder state | Inventory/manual publishing/theme copy | Native/theme/manual | Avoid paid preorder app |
| Legal pages | Shopify policies/pages | Native | Must be reviewed |
| Demo reviews | Theme setting/config | Theme | Must be hidden/replaced before production |

## Collection slots

Test **Delivery Date Picker Time Slot** by one8 before launch. Its listing shows a free plan with 200 orders/month, which supports 25 weekly orders, but paid Basic lists unlimited time slots. Confirm whether the free tier supports the final slot count, disabled slots, and order display before relying on it. A cart attribute is the simplest no-app fallback, but needs robust validation.
