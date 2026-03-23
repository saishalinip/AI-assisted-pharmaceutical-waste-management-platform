// Mock data for the pharma waste management platform

export type UserRole = 'manager' | 'sub-manager' | 'segregation-staff' | 'viewer';
export type Permission = 'manage-users' | 'edit-company' | 'upload-waste' | 'view-requests' | 'create-requests';

export const hasPermission = (role: UserRole, permission: Permission): boolean => {
  const permissions: Record<UserRole, Permission[]> = {
    'manager': ['manage-users', 'edit-company', 'upload-waste', 'view-requests', 'create-requests'],
    'sub-manager': ['upload-waste', 'view-requests', 'create-requests'],
    'segregation-staff': ['upload-waste', 'view-requests'],
    'viewer': ['view-requests'],
  };
  return permissions[role]?.includes(permission) || false;
};

// ✅ BASE MATERIALS ONLY
export const MATERIAL_TYPES = [
  'PVC',
  'Aluminium',
  'Latex',
  'Nitrile',
  'PP',
  'Cotton',
  'Glass',
  'Plastic'
] as const;

export interface Manufacturer {
  id: string;
  companyName: string;
  location: string;
  email: string;
  verificationStatus: 'pending' | 'verified' | 'rejected';
  verificationDocument?: string;
  createdAt: string;
}

export interface ManufacturerUser {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  manufacturerId: string;
  status: 'active' | 'inactive';
}

export interface MaterialPricing {
  material: string;
  minPrice: number;
  maxPrice: number;
}

export interface Recycler {
  id: string;
  organizationName: string;
  location: string;
  email: string;
  materialsProcessed: string[];
  materialPricing: MaterialPricing[];
  pricingConfigured: boolean;
  verificationStatus: 'pending' | 'verified' | 'rejected';
  verificationDocument?: string;
  distance?: number;
  rating?: number;
  createdAt: string;
}

export interface WasteUpload {
  id: string;
  imageUrl: string;
  quantity: number;
  unit: 'kg' | 'tons';
  category?: string;
  location: string;
  identifiedMaterials: MaterialClassification[];
  status: 'pending' | 'classified' | 'request-sent' | 'recycled';
  createdAt: string;
  manufacturerId: string;
}

export interface MaterialClassification {
  type: typeof MATERIAL_TYPES[number] | 'Unknown';
  confidence: number;
  isPrimary: boolean;
}

export interface RecyclingRequest {
  id: string;
  wasteUploadId: string;
  recyclerId: string;
  recyclerName: string;
  manufacturerId: string;
  manufacturerName: string;
  materialType: string;
  quantity: number;
  unit: 'kg' | 'tons';
  location: string;
  status: 'pending' | 'accepted' | 'rejected' | 'completed';
  contactRequested: boolean;
  contactApproved: boolean;
  recyclerContact?: { email: string; phone: string };
  manufacturerContact?: { email: string; phone: string };
  proofDocuments?: string[];
  createdAt: string;
  acceptedAt?: string;
  completedAt?: string;
  imageUrl?: string;
}

// ---------------- MOCK DATA (UPDATED TO BASE MATERIALS) ----------------

export const mockManufacturers: Manufacturer[] = [
  {
    id: 'mfr-001',
    companyName: 'PharmaCorp Industries',
    location: 'Mumbai, Maharashtra',
    email: 'contact@pharmacorp.in',
    verificationStatus: 'verified',
    verificationDocument: '/docs/gst-cert.pdf',
    createdAt: '2024-01-15'
  },
];

export const mockManufacturerUsers: ManufacturerUser[] = [
  { id: 'usr-001', email: 'manager@pharmacorp.in', name: 'Rajesh Kumar', role: 'manager', manufacturerId: 'mfr-001', status: 'active' },
];

export const mockRecyclers: Recycler[] = [
  {
    id: 'rec-001',
    organizationName: 'GreenCycle Solutions',
    location: 'Pune, Maharashtra',
    email: 'contact@greencycle.in',
    materialsProcessed: ['PVC', 'Plastic', 'Glass'],
    materialPricing: [
      { material: 'PVC', minPrice: 25, maxPrice: 35 },
      { material: 'Plastic', minPrice: 20, maxPrice: 30 },
      { material: 'Glass', minPrice: 15, maxPrice: 25 }
    ],
    pricingConfigured: true,
    verificationStatus: 'verified',
    verificationDocument: '/docs/license.pdf',
    distance: 120,
    rating: 4.5,
    createdAt: '2024-02-01'
  }
];

export const mockWasteUploads: WasteUpload[] = [
  {
    id: 'waste-001',
    imageUrl: '/placeholder.svg',
    quantity: 250,
    unit: 'kg',
    category: 'Syringe Waste',
    location: 'Mumbai, Maharashtra',
    identifiedMaterials: [
      { type: 'Plastic', confidence: 90, isPrimary: true }
    ],
    status: 'classified',
    createdAt: '2024-03-10',
    manufacturerId: 'mfr-001'
  }
];

export const mockRecyclingRequests: RecyclingRequest[] = [
  {
    id: 'req-001',
    wasteUploadId: 'waste-001',
    recyclerId: 'rec-001',
    recyclerName: 'GreenCycle Solutions',
    manufacturerId: 'mfr-001',
    manufacturerName: 'PharmaCorp Industries',
    materialType: 'Plastic',
    quantity: 250,
    unit: 'kg',
    location: 'Mumbai, Maharashtra',
    status: 'pending',
    contactRequested: false,
    contactApproved: false,
    createdAt: '2024-03-10',
    imageUrl: '/placeholder.svg'
  }
];

// Helper functions
export const getRecyclerById = (id: string) => mockRecyclers.find(r => r.id === id);
export const getManufacturerById = (id: string) => mockManufacturers.find(m => m.id === id);
export const getRequestsByManufacturer = (manufacturerId: string) =>
  mockRecyclingRequests.filter(r => r.manufacturerId === manufacturerId);
export const getRequestsByRecycler = (recyclerId: string) =>
  mockRecyclingRequests.filter(r => r.recyclerId === recyclerId);
export const getRecyclersByMaterial = (material: string) =>
  mockRecyclers.filter(r => r.materialsProcessed.includes(material) && r.pricingConfigured);
