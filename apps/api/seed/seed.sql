-- Demo data. Safe to re-run: wipes both tables and resets ids, so inquiry property_ids below are stable.
-- Prices are integer rupees (1 Cr = 10,000,000). Names and copy are invented for the demo.

TRUNCATE inquiries, properties RESTART IDENTITY CASCADE;

INSERT INTO properties (name, location, price, size_sqft, bedrooms, description, details, image_url, status, created_at) VALUES
(
  'Banyan Court Villa', 'Devanahalli', 42500000, 3200, 3,
  'A calm three-bedroom villa near the airport corridor, with a private lawn and a double-height living room.',
  'Set on a quiet internal street, Banyan Court pairs a double-height living room with a lawn that opens straight off the dining area. The kitchen has a separate utility, and every bedroom has its own bath. Covered parking for two cars and a rooftop terrace complete the plan.',
  'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=1600&q=80',
  'available', now() - interval '40 days'
),
(
  'Tamarind House', 'Whitefield', 68000000, 4100, 4,
  'Four bedrooms around a central courtyard, a short drive from the Whitefield tech parks.',
  'Tamarind House is planned around an open courtyard that brings daylight into every room. The ground floor holds the living, dining and a guest suite; three bedrooms sit upstairs with a family lounge. A home office with its own entrance suits hybrid work.',
  'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1600&q=80',
  'available', now() - interval '32 days'
),
(
  'The Cedar Residence', 'Sarjapur', 89000000, 5200, 5,
  'A five-bedroom home with a lap pool and landscaped deck, finished in stone and warm timber.',
  'The Cedar Residence uses stone, timber and large glazed openings to connect the living spaces with a landscaped deck and a 15-metre lap pool. The master suite has a walk-in wardrobe and a private balcony. A basement level holds a media room and staff quarters.',
  'https://images.unsplash.com/photo-1613490493576-7fde63acd811?auto=format&fit=crop&w=1600&q=80',
  'under_construction', now() - interval '25 days'
),
(
  'Indigo Terrace', 'Indiranagar', 125000000, 4800, 4,
  'A four-bedroom townhouse on a tree-lined street, minutes from 100 Feet Road.',
  'Indigo Terrace is a rare independent home in the middle of the city. Four floors are linked by a lift, with the living spaces on the ground floor and a landscaped terrace on top. Acoustic glazing keeps the street noise out.',
  'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=1600&q=80',
  'available', now() - interval '18 days'
),
(
  'Lakeview Pavilion', 'Hebbal', 150000000, 6500, 6,
  'A six-bedroom estate home with lake views, a private garden and a separate guest pavilion.',
  'Lakeview Pavilion sits on a generous plot facing the lake. The main house has five bedrooms; a separate pavilion across the garden holds a sixth suite and a gym. Living areas open onto a wide verandah that runs the length of the house.',
  'https://images.unsplash.com/photo-1580587771525-78b9dba3b914?auto=format&fit=crop&w=1600&q=80',
  'sold', now() - interval '60 days'
),
(
  'Frangipani Gardens', 'Koramangala', 98000000, 4400, 4,
  'Four bedrooms with a garden on every level, close to the cafes and schools of Koramangala.',
  'Frangipani Gardens stacks a planted terrace onto each floor, so every bedroom opens onto green space. The kitchen and dining area open fully to the ground-floor garden. Solar panels and rainwater harvesting are built in.',
  'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?auto=format&fit=crop&w=1600&q=80',
  'available', now() - interval '10 days'
),
(
  'Palmyra Estate', 'Devanahalli', 54000000, 3800, 3,
  'A single-level three-bedroom home on a large plot, with room to extend later.',
  'Palmyra Estate keeps everything on one level: three bedrooms, an open living and dining space, and a covered outdoor kitchen. The plot leaves space for a future pool or guest wing, and approvals for an extension are in place.',
  'https://images.unsplash.com/photo-1605276374104-dee2a0ed3cd6?auto=format&fit=crop&w=1600&q=80',
  'under_construction', now() - interval '5 days'
),
(
  'Silver Oak Manor', 'Whitefield', 76000000, 4600, 5,
  'A five-bedroom family home in a gated community with a clubhouse and walking trails.',
  'Silver Oak Manor is a corner plot in a gated community. Five bedrooms, a family lounge and a study are spread across two floors, with a sunken living room on the ground floor. Residents share a clubhouse, a pool and two kilometres of walking trails.',
  'https://images.unsplash.com/photo-1613977257363-707ba9348227?auto=format&fit=crop&w=1600&q=80',
  'available', now() - interval '2 days'
);

-- Example personal data only (example.com addresses, made-up numbers).
INSERT INTO inquiries (property_id, name, email, phone, message, created_at) VALUES
(2, 'Ananya Rao',    'ananya.rao@example.com',    '+91 98450 12345', 'Could we visit Tamarind House this Saturday morning? We are looking to move within three months.', now() - interval '6 days'),
(4, 'Rahul Menon',   'rahul.menon@example.com',   '+91 99001 23456', 'Is the price negotiable, and is there a separate parking space for a second car?', now() - interval '4 days'),
(3, 'Priya Shetty',  'priya.shetty@example.com',  '+91 97400 34567', 'What is the expected completion date for The Cedar Residence, and what is the payment schedule?', now() - interval '3 days'),
(6, 'Vikram Iyer',   'vikram.iyer@example.com',   '+91 98860 45678', 'Please share the floor plans and the maintenance charges for Frangipani Gardens.', now() - interval '1 day'),
(2, 'Meera Kapoor',  'meera.kapoor@example.com',  '+91 90080 56789', 'We would like a video walkthrough as we are currently based abroad. Thank you.', now() - interval '3 hours');
