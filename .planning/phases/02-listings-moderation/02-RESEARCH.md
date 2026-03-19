# Phase 2: Listings and Moderation - Research

**Researched:** 2026-03-19
**Domain:** Multi-step forms, file uploads, drag-drop UI, maps, transactional email, status workflows
**Confidence:** HIGH

## Summary

Phase 2 requires building a multi-step listing creation wizard, photo upload with drag-to-reorder, territory map selection with draggable radius, admin moderation queue, and email notifications. The research confirms a stable, well-documented stack for each domain.

The core pattern is react-hook-form with zod for per-step validation and FormProvider for cross-step state sharing. Vercel Blob handles photo uploads with native progress tracking via `onUploadProgress`. The dnd-kit library provides accessible, touch-friendly drag-to-reorder for the photo grid. For territory maps, react-leaflet with leaflet-editable enables draggable circles with adjustable radius. Resend with react-email handles transactional notifications, and jose provides edge-compatible JWT signing for one-click email action links.

**Primary recommendation:** Use the verified stack below without substitution. These libraries are actively maintained, well-documented, and solve the exact requirements. Avoid hand-rolling form state management, upload progress, or drag-drop mechanics.

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions
- Multi-step wizard: Step 1 (Type + location) -> Step 2 (Financials) -> Step 3 (Photos + details)
- Visual cards for type selection, locations are multi-select from seller's owned salons
- Selecting multiple locations = automatic bundle creation
- Mixed bundles allowed (open salons + unopened territories in same listing)
- ONE price per listing (no per-location pricing)
- Auto-save on each step completion
- Success page showing "Listing submitted for review" with status and next steps
- Open salons: Multi-select from dropdown of seller's owned locations
- Territories: Location name + draggable radius on map (shows existing HS locations as context pins)
- Auto-populated read-only fields: Name, Address, TTM revenue, MCR, Opening date, Square footage
- Seller-entered fields: Asking price, TTM profit, Reason for selling, Notes/description, Assets (checkboxes + text)
- LIST-09 (monthly expenses) is REMOVED
- Photo upload: Drag-drop zone + file picker, progress bars, drag to reorder, first = cover, min 1/max 10 photos
- Storage: Vercel Blob
- Seller Dashboard: Card grid with status badges (multi-listing) or full detail view with analytics (single listing)
- Rejection: Red banner with admin reason + "Edit to resubmit" CTA, editing auto-resubmits
- 30-day reminder email with one-click "Mark as Sold" link (no login required)
- Admin queue: Card list with inline Approve/Reject, rejection dropdown + notes
- Common rejection reasons: Wrong category, Missing info, Ownership issue, etc.
- Ownership verification: Check against system data, display Verified/Unverified indicator, admin can approve unverified with warning

### Claude's Discretion
- Exact step indicator design in wizard
- Form validation messaging
- Loading states and skeleton designs
- Photo compression/optimization approach
- Mobile responsive breakpoints

### Deferred Ideas (OUT OF SCOPE)
None - discussion stayed within phase scope
</user_constraints>

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|-----------------|
| LIST-01 | Seller can create listing for a suite location | Multi-step form wizard with type selection cards |
| LIST-02 | Seller can create listing for a flagship location | Same wizard, different type selection |
| LIST-03 | Seller can create listing for an unopened territory | Territory step with leaflet-editable map radius picker |
| LIST-04 | Seller can create a bundle listing | Multi-select locations in Step 1 auto-creates bundle |
| LIST-05 | Open salons auto-populated from system data | Mock data for Phase 2, real API in Phase 4 |
| LIST-06 | Unopened territories require manual entry | Territory form with map picker component |
| LIST-07 | Seller can enter asking price | react-hook-form with zod currency validation |
| LIST-08 | Seller can enter TTM profit | Same form pattern as asking price |
| LIST-10 | Seller can enter reason for selling | Textarea field with character limit |
| LIST-11 | Seller can enter included assets | Checkbox fields + "Other assets" text field |
| LIST-12 | Seller can add free-form notes/description | Textarea with optional character limit |
| LIST-13 | Minimum 1 photo, max 10 (changed from 3) | Vercel Blob upload + dnd-kit sortable grid |
| LIST-22 | Display square footage | Auto-populated read-only field from mock/API |
| LIST-23 | Display opening date | Auto-populated read-only field from mock/API |
| LIST-14 | Seller can view listing status | Seller dashboard with status badges |
| LIST-15 | Seller can edit listing (no re-approval unless rejected) | Edit form, status transitions based on current state |
| LIST-16 | Seller can mark listing as sold | Status transition action + one-click email link |
| LIST-20 | Seller can delist/withdraw listing | Status transition action |
| LIST-21 | 30-day reminder email | Resend scheduled/triggered email with jose-signed action link |
| ADMN-01 | Admin can view pending approval queue | Admin dashboard with card list, sorted by date |
| ADMN-02 | Admin can approve listing | Status transition + Resend notification email |
| ADMN-03 | Admin can reject listing with reason | Rejection dropdown + notes, status transition |
| ADMN-04 | Seller receives email on approval/rejection | Resend transactional email templates |
| ADMN-05 | Admin can view all listings and statuses | Admin listing table/grid with filters |
| ADMN-06 | Admin can view all buyer inquiries | Inquiry list (basic for Phase 2, expanded Phase 3) |
| ADMN-07 | Admin can manage users | User management UI (add, remove, set roles) |
| ADMN-08 | Admin can edit any listing | Admin override for edit form |
| ADMN-09 | Admin can mark any listing as sold | Admin status transition action |
</phase_requirements>

## Standard Stack

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| react-hook-form | 7.71.2 | Form state management | Uncontrolled inputs for performance, FormProvider for multi-step |
| zod | 4.3.6 | Schema validation | Type-safe, composable schemas, per-step validation |
| @hookform/resolvers | 5.2.2 | Zod integration | zodResolver for react-hook-form |
| @vercel/blob | 2.3.1 | Photo storage | Native Vercel integration, client upload with progress |
| @dnd-kit/core | 6.3.1 | Drag-drop foundation | Accessible, sensor-based architecture |
| @dnd-kit/sortable | 10.0.0 | Sortable lists/grids | Optimized for reorder use case |
| react-leaflet | 5.0.0 | Map component | React wrapper for Leaflet, SSR-friendly |
| leaflet | 1.9.4 | Map engine | Lightweight, well-documented |
| leaflet-editable | 1.3.2 | Editable shapes | Circle with drag handles for radius |
| resend | 6.9.4 | Email sending | Simple API, React component templates |
| @react-email/components | 1.0.10 | Email templates | React components for email HTML |
| jose | 6.2.2 | JWT signing/verification | Edge-compatible, Web Crypto API |
| browser-image-compression | 2.0.2 | Client-side image resize | Reduce upload size before Vercel Blob |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| @dnd-kit/utilities | latest | CSS transform helpers | Convert transform to CSS string |
| @types/leaflet | latest | TypeScript types | Type safety for Leaflet |
| date-fns | latest | Date formatting | 30-day calculation, display dates |
| nanoid | latest | ID generation | Photo order IDs, action tokens |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| dnd-kit | react-beautiful-dnd | react-beautiful-dnd is deprecated, dnd-kit actively maintained |
| react-leaflet | @react-google-maps/api | Google Maps requires API key + billing, Leaflet is free |
| react-leaflet | react-map-gl (Mapbox) | Mapbox has usage limits, Leaflet unlimited |
| browser-image-compression | sharp | Sharp is server-side only, need client-side for upload optimization |
| jose | jsonwebtoken | jsonwebtoken not edge-compatible, jose works in middleware |

**Installation:**
```bash
npm install react-hook-form zod @hookform/resolvers @vercel/blob @dnd-kit/core @dnd-kit/sortable @dnd-kit/utilities react-leaflet leaflet leaflet-editable resend @react-email/components jose browser-image-compression
npm install -D @types/leaflet
```

## Architecture Patterns

### Recommended Project Structure
```
src/
├── app/
│   ├── seller/
│   │   ├── listings/
│   │   │   ├── page.tsx              # Seller dashboard (My Listings)
│   │   │   ├── new/
│   │   │   │   └── page.tsx          # Create listing wizard
│   │   │   └── [id]/
│   │   │       ├── page.tsx          # Listing detail view
│   │   │       └── edit/
│   │   │           └── page.tsx      # Edit listing
│   │   └── layout.tsx                # Seller layout with nav
│   ├── admin/
│   │   ├── queue/
│   │   │   └── page.tsx              # Moderation queue
│   │   ├── listings/
│   │   │   └── page.tsx              # All listings view
│   │   ├── users/
│   │   │   └── page.tsx              # User management
│   │   └── layout.tsx                # Admin layout
│   └── api/
│       ├── listings/
│       │   ├── route.ts              # CRUD operations
│       │   └── [id]/
│       │       ├── route.ts          # Single listing ops
│       │       └── status/
│       │           └── route.ts      # Status transitions
│       ├── upload/
│       │   └── route.ts              # Vercel Blob handler
│       └── actions/
│           └── [token]/
│               └── route.ts          # One-click email actions
├── components/
│   ├── listings/
│   │   ├── ListingWizard.tsx         # Multi-step container
│   │   ├── steps/
│   │   │   ├── TypeLocationStep.tsx
│   │   │   ├── FinancialsStep.tsx
│   │   │   └── PhotosDetailsStep.tsx
│   │   ├── PhotoUploader.tsx         # Upload + reorder
│   │   ├── PhotoGrid.tsx             # dnd-kit sortable grid
│   │   ├── TerritoryPicker.tsx       # Map with radius
│   │   ├── LocationSelector.tsx      # Multi-select dropdown
│   │   └── StatusBadge.tsx
│   ├── admin/
│   │   ├── ModerationQueue.tsx
│   │   ├── ListingCard.tsx
│   │   └── RejectionModal.tsx
│   └── ui/
│       ├── StepIndicator.tsx
│       └── ProgressBar.tsx
├── lib/
│   ├── listings/
│   │   ├── schemas.ts                # Zod schemas per step
│   │   ├── status-machine.ts         # Status transitions
│   │   └── actions.ts                # Server actions
│   ├── upload/
│   │   └── compress.ts               # Image compression
│   └── email/
│       ├── templates/
│       │   ├── ListingApproved.tsx
│       │   ├── ListingRejected.tsx
│       │   └── ListingReminder.tsx
│       └── send.ts                   # Resend wrapper
└── emails/                           # react-email preview (dev)
```

### Pattern 1: Multi-Step Form with FormProvider
**What:** Share form state across wizard steps using React context
**When to use:** Any multi-step form where data persists across steps
**Example:**
```typescript
// Source: https://react-hook-form.com/advanced-usage
import { useForm, FormProvider } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

// Parent wizard component
export function ListingWizard() {
  const [step, setStep] = useState(1);
  const methods = useForm({
    resolver: zodResolver(listingSchema),
    mode: 'onBlur',
    defaultValues: {
      type: '',
      locations: [],
      askingPrice: '',
      ttmProfit: '',
      photos: [],
      // ...
    }
  });

  const onStepComplete = async (stepData: Partial<ListingFormData>) => {
    // Validate current step
    const isValid = await methods.trigger(getFieldsForStep(step));
    if (!isValid) return;

    // Auto-save to server (draft)
    await saveDraft(methods.getValues());

    if (step < 3) {
      setStep(step + 1);
    } else {
      await submitListing(methods.getValues());
    }
  };

  return (
    <FormProvider {...methods}>
      <StepIndicator current={step} total={3} />
      {step === 1 && <TypeLocationStep onNext={onStepComplete} />}
      {step === 2 && <FinancialsStep onNext={onStepComplete} onBack={() => setStep(1)} />}
      {step === 3 && <PhotosDetailsStep onSubmit={onStepComplete} onBack={() => setStep(2)} />}
    </FormProvider>
  );
}

// Child step component
function TypeLocationStep({ onNext }) {
  const { register, formState: { errors } } = useFormContext();

  return (
    <div>
      <TypeSelector {...register('type')} error={errors.type} />
      <LocationMultiSelect {...register('locations')} error={errors.locations} />
      <button onClick={() => onNext()}>Next</button>
    </div>
  );
}
```

### Pattern 2: Per-Step Zod Schemas
**What:** Validate only the fields relevant to current step
**When to use:** Multi-step forms where each step has its own validation
**Example:**
```typescript
// Source: https://blog.logrocket.com/building-reusable-multi-step-form-react-hook-form-zod/
import { z } from 'zod';

// Step 1 schema
export const typeLocationSchema = z.object({
  type: z.enum(['suite', 'flagship', 'territory', 'bundle']),
  locations: z.array(z.string()).min(1, 'Select at least one location'),
  // Territory-specific (conditional)
  territoryName: z.string().optional(),
  territoryRadius: z.number().optional(),
  territoryCenter: z.object({
    lat: z.number(),
    lng: z.number(),
  }).optional(),
});

// Step 2 schema
export const financialsSchema = z.object({
  askingPrice: z.number().positive('Enter a valid price'),
  ttmProfit: z.number().optional(),
  reasonForSelling: z.string().max(500).optional(),
});

// Step 3 schema
export const photosDetailsSchema = z.object({
  photos: z.array(z.object({
    url: z.string().url(),
    order: z.number(),
  })).min(1, 'Upload at least 1 photo').max(10),
  inventoryIncluded: z.boolean(),
  laserIncluded: z.boolean(),
  otherAssets: z.string().max(500).optional(),
  notes: z.string().max(2000).optional(),
});

// Combined schema for full validation
export const listingSchema = typeLocationSchema
  .merge(financialsSchema)
  .merge(photosDetailsSchema);

// Helper to get fields for step
export function getFieldsForStep(step: number): (keyof ListingFormData)[] {
  switch (step) {
    case 1: return ['type', 'locations', 'territoryName', 'territoryRadius', 'territoryCenter'];
    case 2: return ['askingPrice', 'ttmProfit', 'reasonForSelling'];
    case 3: return ['photos', 'inventoryIncluded', 'laserIncluded', 'otherAssets', 'notes'];
    default: return [];
  }
}
```

### Pattern 3: Vercel Blob Client Upload with Progress
**What:** Upload directly from browser to Vercel Blob with progress tracking
**When to use:** Photo uploads where you need progress indication
**Example:**
```typescript
// Source: https://vercel.com/docs/vercel-blob/client-upload
'use client';

import { upload } from '@vercel/blob/client';
import { useState } from 'react';

interface UploadProgress {
  id: string;
  filename: string;
  percentage: number;
  status: 'uploading' | 'complete' | 'error';
}

export function PhotoUploader({ onUploadComplete }) {
  const [uploads, setUploads] = useState<UploadProgress[]>([]);

  const handleFiles = async (files: FileList) => {
    for (const file of Array.from(files)) {
      const id = nanoid();

      // Add to progress list
      setUploads(prev => [...prev, {
        id,
        filename: file.name,
        percentage: 0,
        status: 'uploading'
      }]);

      try {
        // Compress before upload
        const compressed = await compressImage(file);

        const blob = await upload(compressed.name, compressed, {
          access: 'public',
          handleUploadUrl: '/api/upload',
          onUploadProgress: (e) => {
            setUploads(prev => prev.map(u =>
              u.id === id ? { ...u, percentage: e.percentage } : u
            ));
          },
        });

        setUploads(prev => prev.map(u =>
          u.id === id ? { ...u, status: 'complete', percentage: 100 } : u
        ));

        onUploadComplete({ id, url: blob.url, filename: file.name });
      } catch (error) {
        setUploads(prev => prev.map(u =>
          u.id === id ? { ...u, status: 'error' } : u
        ));
      }
    }
  };

  return (
    <div>
      <input
        type="file"
        multiple
        accept="image/jpeg,image/png,image/webp"
        onChange={(e) => e.target.files && handleFiles(e.target.files)}
      />
      {uploads.map(u => (
        <div key={u.id}>
          {u.filename}: {u.percentage}%
          <progress value={u.percentage} max={100} />
        </div>
      ))}
    </div>
  );
}

// Server route handler
// Source: https://vercel.com/docs/vercel-blob/client-upload
import { handleUpload } from '@vercel/blob/client';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  const body = await request.json();

  const jsonResponse = await handleUpload({
    body,
    request,
    onBeforeGenerateToken: async (pathname) => {
      // Verify user is authenticated seller
      const session = await getSession();
      if (!session?.user) throw new Error('Unauthorized');

      return {
        allowedContentTypes: ['image/jpeg', 'image/png', 'image/webp'],
        maximumSizeInBytes: 10 * 1024 * 1024, // 10MB
        addRandomSuffix: true,
        tokenPayload: JSON.stringify({ userId: session.user.id }),
      };
    },
    onUploadCompleted: async ({ blob, tokenPayload }) => {
      const { userId } = JSON.parse(tokenPayload);
      // Optionally store in database
      console.log('Upload complete:', blob.url, 'for user:', userId);
    },
  });

  return NextResponse.json(jsonResponse);
}
```

### Pattern 4: dnd-kit Sortable Photo Grid
**What:** Drag-to-reorder photo grid with visual feedback
**When to use:** Photo galleries where order matters (first = cover)
**Example:**
```typescript
// Source: https://dndkit.com/presets/sortable
import {
  DndContext,
  closestCenter,
  PointerSensor,
  TouchSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  rectSortingStrategy,
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

interface Photo {
  id: string;
  url: string;
  order: number;
}

function SortablePhoto({ photo, isFirst }: { photo: Photo; isFirst: boolean }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: photo.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
      <img src={photo.url} alt="" />
      {isFirst && <span className="badge">Cover</span>}
    </div>
  );
}

export function PhotoGrid({ photos, onReorder }) {
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 5 }, // Prevent accidental drags
    }),
    useSensor(TouchSensor, {
      activationConstraint: { delay: 200, tolerance: 5 },
    })
  );

  const handleDragEnd = (event) => {
    const { active, over } = event;
    if (active.id !== over?.id) {
      const oldIndex = photos.findIndex(p => p.id === active.id);
      const newIndex = photos.findIndex(p => p.id === over.id);
      const reordered = arrayMove(photos, oldIndex, newIndex);
      // Update order property
      onReorder(reordered.map((p, i) => ({ ...p, order: i })));
    }
  };

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragEnd={handleDragEnd}
    >
      <SortableContext items={photos.map(p => p.id)} strategy={rectSortingStrategy}>
        <div className="grid grid-cols-3 gap-4">
          {photos.map((photo, index) => (
            <SortablePhoto key={photo.id} photo={photo} isFirst={index === 0} />
          ))}
        </div>
      </SortableContext>
    </DndContext>
  );
}
```

### Pattern 5: Territory Map with Draggable Radius
**What:** Leaflet map with editable circle for territory selection
**When to use:** Territory listing creation (manual location entry)
**Example:**
```typescript
// Source: https://react-leaflet.js.org/docs/example-draggable-marker/
// Source: https://github.com/kartena/Leaflet.EditableHandlers
'use client';

import dynamic from 'next/dynamic';
import { useRef, useState, useEffect } from 'react';

// Dynamic import for SSR compatibility
const MapContainer = dynamic(
  () => import('react-leaflet').then(m => m.MapContainer),
  { ssr: false }
);
const TileLayer = dynamic(
  () => import('react-leaflet').then(m => m.TileLayer),
  { ssr: false }
);
const Circle = dynamic(
  () => import('react-leaflet').then(m => m.Circle),
  { ssr: false }
);
const Marker = dynamic(
  () => import('react-leaflet').then(m => m.Marker),
  { ssr: false }
);

interface TerritoryPickerProps {
  existingLocations: Array<{ lat: number; lng: number; name: string }>;
  value?: { center: { lat: number; lng: number }; radius: number };
  onChange: (value: { center: { lat: number; lng: number }; radius: number }) => void;
}

export function TerritoryPicker({ existingLocations, value, onChange }: TerritoryPickerProps) {
  const [center, setCenter] = useState(value?.center || { lat: 33.749, lng: -84.388 }); // Default: Atlanta
  const [radius, setRadius] = useState(value?.radius || 5000); // 5km default
  const circleRef = useRef(null);

  // Handle circle drag
  const handleCircleEdit = () => {
    if (circleRef.current) {
      const circle = circleRef.current;
      const newCenter = circle.getLatLng();
      setCenter({ lat: newCenter.lat, lng: newCenter.lng });
      onChange({ center: { lat: newCenter.lat, lng: newCenter.lng }, radius });
    }
  };

  return (
    <div>
      <MapContainer center={[center.lat, center.lng]} zoom={11} style={{ height: 400 }}>
        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />

        {/* Existing Hello Sugar locations as context */}
        {existingLocations.map((loc, i) => (
          <Marker key={i} position={[loc.lat, loc.lng]} />
        ))}

        {/* Editable territory circle */}
        <Circle
          ref={circleRef}
          center={[center.lat, center.lng]}
          radius={radius}
          pathOptions={{ color: '#E91E63', fillOpacity: 0.2 }}
          eventHandlers={{
            dragend: handleCircleEdit,
          }}
        />
      </MapContainer>

      {/* Radius slider */}
      <div className="mt-4">
        <label>Radius: {(radius / 1000).toFixed(1)} km</label>
        <input
          type="range"
          min={1000}
          max={50000}
          step={500}
          value={radius}
          onChange={(e) => {
            const newRadius = Number(e.target.value);
            setRadius(newRadius);
            onChange({ center, radius: newRadius });
          }}
        />
      </div>
    </div>
  );
}
```

### Pattern 6: Listing Status State Machine
**What:** Type-safe status transitions with validation
**When to use:** Managing listing lifecycle (draft -> pending -> active/rejected -> sold/delisted)
**Example:**
```typescript
// Lightweight state machine without XState dependency
type ListingStatus = 'draft' | 'pending' | 'active' | 'rejected' | 'sold' | 'delisted';

type StatusTransition = {
  from: ListingStatus;
  to: ListingStatus;
  action: string;
  allowedRoles: ('seller' | 'admin')[];
};

const TRANSITIONS: StatusTransition[] = [
  { from: 'draft', to: 'pending', action: 'submit', allowedRoles: ['seller'] },
  { from: 'pending', to: 'active', action: 'approve', allowedRoles: ['admin'] },
  { from: 'pending', to: 'rejected', action: 'reject', allowedRoles: ['admin'] },
  { from: 'rejected', to: 'pending', action: 'resubmit', allowedRoles: ['seller'] },
  { from: 'active', to: 'sold', action: 'markSold', allowedRoles: ['seller', 'admin'] },
  { from: 'active', to: 'delisted', action: 'delist', allowedRoles: ['seller', 'admin'] },
  { from: 'delisted', to: 'pending', action: 'relist', allowedRoles: ['seller'] },
];

export function canTransition(
  from: ListingStatus,
  to: ListingStatus,
  userRole: 'seller' | 'admin'
): boolean {
  const transition = TRANSITIONS.find(t => t.from === from && t.to === to);
  return transition?.allowedRoles.includes(userRole) ?? false;
}

export function getAvailableActions(
  status: ListingStatus,
  userRole: 'seller' | 'admin'
): { action: string; targetStatus: ListingStatus }[] {
  return TRANSITIONS
    .filter(t => t.from === status && t.allowedRoles.includes(userRole))
    .map(t => ({ action: t.action, targetStatus: t.to }));
}

// Usage in API route
export async function updateListingStatus(
  listingId: string,
  newStatus: ListingStatus,
  userId: string,
  rejectionReason?: string
) {
  const listing = await db.listing.findUnique({ where: { id: listingId } });
  const user = await db.user.findUnique({ where: { id: userId } });

  if (!canTransition(listing.status, newStatus, user.role)) {
    throw new Error(`Cannot transition from ${listing.status} to ${newStatus}`);
  }

  await db.listing.update({
    where: { id: listingId },
    data: {
      status: newStatus,
      rejectionReason: newStatus === 'rejected' ? rejectionReason : null,
      updatedAt: new Date(),
    },
  });

  // Trigger notifications
  if (newStatus === 'active') {
    await sendListingApprovedEmail(listing.sellerId, listingId);
  } else if (newStatus === 'rejected') {
    await sendListingRejectedEmail(listing.sellerId, listingId, rejectionReason);
  }
}
```

### Pattern 7: One-Click Email Action Links
**What:** Signed JWT tokens for stateless action verification
**When to use:** "Mark as Sold" links that work without login
**Example:**
```typescript
// Source: https://github.com/panva/jose
import { SignJWT, jwtVerify } from 'jose';

const ACTION_SECRET = new TextEncoder().encode(process.env.ACTION_TOKEN_SECRET);

// Generate signed action token
export async function createActionToken(
  action: 'markSold' | 'confirmActive',
  listingId: string,
  expiresIn: string = '7d'
): Promise<string> {
  const token = await new SignJWT({ action, listingId })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime(expiresIn)
    .sign(ACTION_SECRET);

  return token;
}

// Verify and execute action
export async function executeAction(token: string): Promise<{ success: boolean; message: string }> {
  try {
    const { payload } = await jwtVerify(token, ACTION_SECRET);
    const { action, listingId } = payload as { action: string; listingId: string };

    const listing = await db.listing.findUnique({ where: { id: listingId } });
    if (!listing) {
      return { success: false, message: 'Listing not found' };
    }

    if (action === 'markSold') {
      if (!canTransition(listing.status, 'sold', 'seller')) {
        return { success: false, message: 'Listing cannot be marked as sold' };
      }
      await db.listing.update({
        where: { id: listingId },
        data: { status: 'sold' },
      });
      return { success: true, message: 'Listing marked as sold' };
    }

    return { success: false, message: 'Unknown action' };
  } catch (error) {
    return { success: false, message: 'Invalid or expired link' };
  }
}

// API route: /api/actions/[token]/route.ts
export async function GET(
  request: Request,
  { params }: { params: { token: string } }
) {
  const result = await executeAction(params.token);

  // Redirect to confirmation page
  const url = new URL('/action-complete', request.url);
  url.searchParams.set('success', result.success.toString());
  url.searchParams.set('message', result.message);

  return Response.redirect(url.toString());
}
```

### Anti-Patterns to Avoid
- **Controlled inputs with react-hook-form:** Use `register()` and uncontrolled inputs, not `value` + `onChange`
- **Uploading through serverless function:** Use client upload for files > 4.5MB to bypass body size limit
- **Storing images as base64 in database:** Store URLs from Vercel Blob, not raw data
- **Custom drag-drop implementation:** dnd-kit handles touch, keyboard, and accessibility
- **Polling for email actions:** Use one-click signed links, not "check your email and enter code"

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Multi-step form state | Custom context/reducer | FormProvider + useFormContext | react-hook-form handles validation, dirty state, errors |
| File upload progress | XMLHttpRequest wrapper | Vercel Blob onUploadProgress | Native support, handles edge cases |
| Drag-drop reorder | Touch events + mouse events | dnd-kit | Accessibility, keyboard support, touch delays |
| Map circle editing | Canvas + math | leaflet-editable | Projection math, drag handles, mobile |
| JWT for edge runtime | jsonwebtoken | jose | jsonwebtoken uses Node crypto, breaks in edge |
| Image compression | Canvas resize code | browser-image-compression | EXIF handling, format conversion, quality |

**Key insight:** Each of these problems has subtle edge cases (touch vs mouse, EXIF rotation, projection distortion, token timing attacks) that the recommended libraries handle correctly.

## Common Pitfalls

### Pitfall 1: Form Validation Not Triggering
**What goes wrong:** Errors don't display after form submission or field blur
**Why it happens:** Mismatched input names, wrong validation mode, or missing refs
**How to avoid:**
- Use exact field names in schema and register()
- Set `mode: 'onBlur'` for immediate feedback
- Ensure all inputs use `{...register('fieldName')}`
**Warning signs:** formState.errors is empty despite invalid input

### Pitfall 2: Vercel Blob Upload Fails for Large Files
**What goes wrong:** Uploads timeout or return 413 errors
**Why it happens:** Files > 4.5MB going through serverless function instead of client upload
**How to avoid:**
- Always use `upload()` from `@vercel/blob/client`
- Never stream files through API routes
- Compress images client-side before upload
**Warning signs:** Uploads work locally but fail in production for larger files

### Pitfall 3: dnd-kit Grid Breaks on Mobile
**What goes wrong:** Sorting glitches, items stuck, scroll conflicts
**Why it happens:** Touch sensor conflicts with page scroll, 3D touch on iOS
**How to avoid:**
- Use TouchSensor with `activationConstraint: { delay: 200, tolerance: 5 }`
- Add `touch-action: none` CSS to sortable items
- Test on real mobile devices, not just devtools emulation
**Warning signs:** Works in desktop/emulation but fails on actual mobile

### Pitfall 4: Leaflet Map Not Rendering (SSR)
**What goes wrong:** "window is not defined" error on page load
**Why it happens:** Leaflet accesses window/document on import, breaks SSR
**How to avoid:**
- Use `next/dynamic` with `{ ssr: false }` for all Leaflet components
- Import Leaflet CSS in component, not global layout
**Warning signs:** Error only in production or first page load

### Pitfall 5: Email Action Links Expire or Fail
**What goes wrong:** "Link expired" when clicking action in email
**Why it happens:** Token expiration too short, clock skew, or user clicks days later
**How to avoid:**
- Use 7-day expiration for non-sensitive actions
- Include clear "valid for 7 days" in email
- Gracefully handle expired links with helpful message
**Warning signs:** Support requests about "broken links" in emails

### Pitfall 6: Photo Order Not Persisting
**What goes wrong:** Photos revert to original order on page refresh
**Why it happens:** Order stored only in component state, not saved to server
**How to avoid:**
- Save order to database on every reorder (debounced)
- Include order in form state submitted with listing
- Use optimistic updates with error rollback
**Warning signs:** Order looks correct until form submission or page reload

## Code Examples

### Client-Side Image Compression Before Upload
```typescript
// Source: https://www.npmjs.com/package/browser-image-compression
import imageCompression from 'browser-image-compression';

export async function compressImage(file: File): Promise<File> {
  // Skip if already small
  if (file.size < 500 * 1024) return file; // < 500KB

  const options = {
    maxSizeMB: 1,
    maxWidthOrHeight: 2048,
    useWebWorker: true,
    fileType: 'image/webp' as const,
  };

  try {
    const compressed = await imageCompression(file, options);
    // Rename with .webp extension
    return new File([compressed], file.name.replace(/\.[^.]+$/, '.webp'), {
      type: 'image/webp',
    });
  } catch (error) {
    console.warn('Compression failed, using original:', error);
    return file;
  }
}
```

### Resend Email Template for Listing Approval
```typescript
// Source: https://resend.com/docs/send-with-nextjs
// emails/ListingApproved.tsx
import { Html, Head, Body, Container, Text, Button, Hr } from '@react-email/components';

interface ListingApprovedProps {
  sellerName: string;
  listingTitle: string;
  listingUrl: string;
}

export function ListingApproved({ sellerName, listingTitle, listingUrl }: ListingApprovedProps) {
  return (
    <Html>
      <Head />
      <Body style={{ fontFamily: 'Arial, sans-serif' }}>
        <Container>
          <Text>Hi {sellerName},</Text>
          <Text>
            Great news! Your listing <strong>{listingTitle}</strong> has been approved
            and is now live on the marketplace.
          </Text>
          <Button href={listingUrl} style={{ background: '#E91E63', color: '#fff', padding: '12px 24px' }}>
            View Your Listing
          </Button>
          <Hr />
          <Text style={{ color: '#666', fontSize: 12 }}>
            Hello Sugar Franchise Marketplace
          </Text>
        </Container>
      </Body>
    </Html>
  );
}

// lib/email/send.ts
import { Resend } from 'resend';
import { ListingApproved } from '@/emails/ListingApproved';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function sendListingApprovedEmail(
  to: string,
  sellerName: string,
  listingTitle: string,
  listingUrl: string
) {
  await resend.emails.send({
    from: 'Hello Sugar Marketplace <noreply@hellosugar.salon>',
    to,
    subject: `Your listing "${listingTitle}" is now live!`,
    react: ListingApproved({ sellerName, listingTitle, listingUrl }),
  });
}
```

### 30-Day Reminder Email with One-Click Action
```typescript
// emails/ListingReminder.tsx
import { Html, Head, Body, Container, Text, Button, Hr } from '@react-email/components';

interface ListingReminderProps {
  sellerName: string;
  listingTitle: string;
  daysActive: number;
  markSoldUrl: string;
  editListingUrl: string;
}

export function ListingReminder({
  sellerName,
  listingTitle,
  daysActive,
  markSoldUrl,
  editListingUrl,
}: ListingReminderProps) {
  return (
    <Html>
      <Head />
      <Body style={{ fontFamily: 'Arial, sans-serif' }}>
        <Container>
          <Text>Hi {sellerName},</Text>
          <Text>
            Your listing <strong>{listingTitle}</strong> has been active for {daysActive} days.
          </Text>
          <Text>Have you sold this location, or would you like to update your listing?</Text>

          <Button
            href={markSoldUrl}
            style={{ background: '#4CAF50', color: '#fff', padding: '12px 24px', marginRight: 8 }}
          >
            Mark as Sold
          </Button>

          <Button
            href={editListingUrl}
            style={{ background: '#2196F3', color: '#fff', padding: '12px 24px' }}
          >
            Update Listing
          </Button>

          <Hr />
          <Text style={{ color: '#666', fontSize: 12 }}>
            This link is valid for 7 days. If you don't take action, your listing will remain active.
          </Text>
        </Container>
      </Body>
    </Html>
  );
}

// Triggered by cron job or scheduled task
export async function sendListingReminders() {
  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

  const listings = await db.listing.findMany({
    where: {
      status: 'active',
      lastReminderSent: { lt: thirtyDaysAgo },
      OR: [
        { lastReminderSent: null },
        { lastReminderSent: { lt: thirtyDaysAgo } },
      ],
    },
    include: { seller: true },
  });

  for (const listing of listings) {
    const markSoldToken = await createActionToken('markSold', listing.id);
    const markSoldUrl = `${process.env.APP_URL}/api/actions/${markSoldToken}`;

    await resend.emails.send({
      from: 'Hello Sugar Marketplace <noreply@hellosugar.salon>',
      to: listing.seller.email,
      subject: `Update on your listing: ${listing.title}`,
      react: ListingReminder({
        sellerName: listing.seller.name,
        listingTitle: listing.title,
        daysActive: Math.floor((Date.now() - listing.createdAt.getTime()) / (24 * 60 * 60 * 1000)),
        markSoldUrl,
        editListingUrl: `${process.env.APP_URL}/seller/listings/${listing.id}/edit`,
      }),
    });

    await db.listing.update({
      where: { id: listing.id },
      data: { lastReminderSent: new Date() },
    });
  }
}
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| react-beautiful-dnd | dnd-kit | 2023 | rbd deprecated, dnd-kit actively maintained |
| formik | react-hook-form | 2021 | Better performance with uncontrolled inputs |
| Custom form state | Zod + react-hook-form | 2022 | Type-safe validation with schema inference |
| S3 presigned URLs | Vercel Blob client upload | 2024 | Simpler setup, native progress tracking |
| jsonwebtoken | jose | 2023 | Edge runtime compatibility |
| Custom email HTML | react-email | 2023 | Component-based email design |

**Deprecated/outdated:**
- react-beautiful-dnd: Deprecated by Atlassian, use dnd-kit
- formik: Still works but react-hook-form has better DX and performance
- Cloudinary for simple uploads: Vercel Blob is simpler when already on Vercel

## Open Questions

1. **Ownership Verification API**
   - What we know: Need to check against "system data" (internal API/franchise records)
   - What's unclear: API contract unknown until Phase 4 discovery
   - Recommendation: Mock ownership check returning random verified/unverified, flag for Phase 4

2. **30-Day Reminder Trigger**
   - What we know: Need to send email when listing active 30+ days
   - What's unclear: Vercel Cron vs external scheduler vs database polling
   - Recommendation: Use Vercel Cron (vercel.json) for daily check, simpler than external service

3. **Photo Storage Lifecycle**
   - What we know: Photos uploaded to Vercel Blob, URLs stored in database
   - What's unclear: Cleanup strategy for orphaned photos (draft abandoned, photos replaced)
   - Recommendation: Add cleanup job to delete blobs not referenced in database after 7 days

## Validation Architecture

### Test Framework
| Property | Value |
|----------|-------|
| Framework | Vitest (assumed from Next.js standard) |
| Config file | vitest.config.ts (Wave 0 if none exists) |
| Quick run command | `npm run test -- --run` |
| Full suite command | `npm run test` |

### Phase Requirements -> Test Map
| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| LIST-01 | Create suite listing | integration | `npm run test -- src/app/api/listings/__tests__/create.test.ts -t "suite"` | Wave 0 |
| LIST-04 | Bundle creation from multi-select | unit | `npm run test -- src/lib/listings/__tests__/bundle.test.ts` | Wave 0 |
| LIST-13 | Photo count validation | unit | `npm run test -- src/lib/listings/__tests__/schemas.test.ts -t "photos"` | Wave 0 |
| LIST-14 | Status display | unit | `npm run test -- src/components/listings/__tests__/StatusBadge.test.tsx` | Wave 0 |
| LIST-16 | Mark as sold action | integration | `npm run test -- src/app/api/actions/__tests__/mark-sold.test.ts` | Wave 0 |
| ADMN-02 | Approve listing | integration | `npm run test -- src/app/api/listings/__tests__/status.test.ts -t "approve"` | Wave 0 |
| ADMN-03 | Reject listing | integration | `npm run test -- src/app/api/listings/__tests__/status.test.ts -t "reject"` | Wave 0 |

### Sampling Rate
- **Per task commit:** `npm run test -- --run --changed`
- **Per wave merge:** `npm run test`
- **Phase gate:** Full suite green before `/gsd:verify-work`

### Wave 0 Gaps
- [ ] `vitest.config.ts` - Test framework configuration
- [ ] `src/lib/listings/__tests__/schemas.test.ts` - Zod schema validation tests
- [ ] `src/lib/listings/__tests__/status-machine.test.ts` - Status transition tests
- [ ] `src/app/api/listings/__tests__/create.test.ts` - Listing creation API tests
- [ ] `src/app/api/listings/__tests__/status.test.ts` - Status change API tests
- [ ] `src/app/api/actions/__tests__/mark-sold.test.ts` - One-click action tests
- [ ] Framework install: `npm install -D vitest @testing-library/react @testing-library/user-event jsdom`

## Sources

### Primary (HIGH confidence)
- [Vercel Blob Client Upload](https://vercel.com/docs/vercel-blob/client-upload) - Upload API, progress tracking, server handler
- [dnd-kit Sortable](https://dndkit.com/presets/sortable) - SortableContext, useSortable, grid strategy
- [React Hook Form Advanced](https://react-hook-form.com/advanced-usage) - FormProvider, multi-step wizard pattern
- [Resend Next.js Docs](https://resend.com/docs/send-with-nextjs) - Email sending, React templates
- [jose GitHub](https://github.com/panva/jose) - JWT sign/verify for edge runtime

### Secondary (MEDIUM confidence)
- [React Leaflet Draggable Marker](https://react-leaflet.js.org/docs/example-draggable-marker/) - Drag events pattern
- [Leaflet EditableHandlers](https://github.com/kartena/Leaflet.EditableHandlers) - Circle editing with handles
- [browser-image-compression npm](https://www.npmjs.com/package/browser-image-compression) - Client-side compression API

### Tertiary (LOW confidence)
- Mobile touch issues with dnd-kit - GitHub issues, may have been fixed in recent versions
- leaflet-editable integration with react-leaflet - May require custom wrapper

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH - All packages verified current on npm registry
- Architecture: HIGH - Patterns from official docs and verified tutorials
- Pitfalls: MEDIUM - Based on GitHub issues and community reports
- Map/territory picker: MEDIUM - leaflet-editable + react-leaflet integration may need adjustment

**Research date:** 2026-03-19
**Valid until:** 2026-04-19 (30 days - stable ecosystem)
