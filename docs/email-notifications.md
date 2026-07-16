# Email and Notification Drafts

These are draft copy blocks for Shopify notifications or manual emails. Test with real Shopify variables before publishing.

## Order Confirmation

Subject: Your Jake's Bakes preorder is confirmed

Thanks for your order.

Order: `{{ order.name }}`

Your box:

- Chocolate Chip: `{{ line_item.properties["Chocolate Chip"] }}`
- Oreo: `{{ line_item.properties["Oreo"] }}`
- Biscoff: `{{ line_item.properties["Biscoff"] }}`

Collection:

- Date: [COLLECTION DATE]
- Slot: `{{ attributes["Collection slot"] }}`
- Area: [COLLECTION ADDRESS OR AREA]

Full collection details will be shared where appropriate. If anything looks wrong, contact [BUSINESS EMAIL].

## Ready For Collection

Subject: Your cookie box is ready for collection

Your Jake's Bakes order is ready.

Please collect during your chosen slot and bring your name or order number.

- Order: `{{ order.name }}`
- Date: [COLLECTION DATE]
- Slot: `{{ attributes["Collection slot"] }}`
- Collection instructions: [COLLECTION ADDRESS OR AREA]

If there is a problem, contact [BUSINESS EMAIL].

## Collection Reminder

Subject: Cookie collection reminder

Just a reminder that your Jake's Bakes box is due for collection today.

- Slot: `{{ attributes["Collection slot"] }}`
- Order: `{{ order.name }}`

Automated reminders may need Shopify Email/Flow or an app. If not available for free, send manually.

## Account Invitation

Accounts are optional. Do not make this compulsory.

Copy direction: You can use a Shopify customer account to view order history where supported. Guest checkout remains available.

## Marketing Reminder

Subject: Friday's cookie preorder is open

Use only for customers who opted in to marketing.

Copy direction: This week's cookie preorder is open. Choose your six-cookie box for Friday collection in Barnsley.
