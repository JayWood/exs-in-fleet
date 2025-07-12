import {OptionalUnlessRequiredId, WithId} from 'mongodb'

export type User = {
    access_token: string
    refresh_token: string
    expiration: number
    name: string
    playerId: number
    parentPlayerId?: number
}

export type IndustryActivityMaterial = {
    activityID: number;
    materialTypeID: number;
    quantity: number;
    typeID: number;
}
export type IndustryActivityMaterialDocument = WithId<IndustryActivityMaterial>


export interface IndustryActivityProbabilities {
    activityID: number
    probability: number
    productTypeID: number
    typeID: number
}
export type IndustryActivityProbabilitiesDocument = WithId<IndustryActivityProbabilities>

export interface IndustryActivityProduct {
    activityID: number
    productTypeID: number
    quantity: number
    typeID: number
}
export type IndustryActivityProductDocument = WithId<IndustryActivityProduct>


export interface IndustryBlueprint {
    maxProductionLimit: number
    typeID: number
}
export type IndustryBlueprintDocument = WithId<IndustryBlueprint>

export interface InvCategory {
    categoryID: number
    categoryName: string
    iconID: number | "None"
    published: number
}
export type InvCategoryDocument = WithId<InvCategory>

export interface InvGroup {
    anchorable: number
    anchored: number
    categoryID: number
    fittableNonSingleton: number
    groupID: number
    groupName: string
    iconID: number | "None"
    published: number
    useBasePrice: number
}
export type InvGroupDocument = WithId<InvGroup>

export interface InvMarketGroup {
    description: string
    hasTypes: number
    iconID: number
    marketGroupID: number
    marketGroupName: string
    parentGroupID: number | "None"
}
export type InvMarketGroupDocument = WithId<InvMarketGroup>

export interface InvType {
    basePrice: number | "None"
    capacity: number
    description: string
    graphicID: number
    groupID: number
    iconID: number | "None"
    marketGroupID: number | "None"
    mass: number
    portionSize: number
    published: number
    raceID: number | "None"
    soundID: number | "None"
    typeID: number
    typeName: string
    volume: number
}
export type InvTypeDocument = WithId<InvType>

export interface InvVolume {
    typeID: number
    volume: number
}
export type InvVolumeDocument = WithId<InvVolume>

export interface RamActivity {
    activityID: number
    activityName: string
    description: string
    iconNo: number | "None"
    published: number
}
export type RamActivityDocument = WithId<RamActivity>

export interface RamAssemblyLineStation {
    assemblyLineTypeID: number
    ownerID: number
    quantity: number
    regionID: number
    solarSystemID: number
    stationID: number
    stationTypeID: number
}
export type RamAssemblyLineStationDocument = WithId<RamAssemblyLineStation>

export interface RamAssemblyLineType {
    activityID: number
    assemblyLineTypeID: number
    assemblyLineTypeName: string
    baseCostMultiplier: number
    baseMaterialMultiplier: number
    baseTimeMultiplier: number
    description: string
    minCostPerHour: number | "None"
    volume: number
}
export type RamAssemblyLineTypeDocument = WithId<RamAssemblyLineType>

export interface ManufacturingBatchType {
    name?: string;                     // Optional name (e.g. "July Rigs Run")
    createdAt: Date;                   // When this batch was created
    inputTotal: number;                // Raw materials cost
    taxTotal: number;                  // Total taxes paid
    usageTotal: number;                // Facility fees, etc.
    productLogIds: ObjectId[];         // References to ProductLog._id
    notes?: string;                    // Optional notes
}
export type ManufacturingBatchTypeDocument = WithId<ManufacturingBatchType>;
export type ManufacturingBatchTypeInsert = OptionalUnlessRequiredId<ManufacturingBatchType>;

interface ProductLogType {
    typeID: number;          // FK to invTypes.typeID
    batchID: ObjectId;       // FK to ManufacturingBatch._id
    createdAt: Date;         // When this log entry was created
    quantity: number;        // Quantity produced in this log
    unitCost: number;        // Per-unit manufacturing cost
    totalCost: number;       // unitCost * quantity (for redundancy / aggregation)
    notes?: string;          // Optional notes for the entry
}

export type ProductLogTypeDocument = WithId<ProductLogType>;
export type ProductLogTypeInsert = OptionalUnlessRequiredId<ProductLogType>;


export interface ManufacturingBatchType {
    name?: string;                     // Optional name (e.g. "July Rigs Run")
    createdAt: Date;                   // When this batch was created
    inputTotal: number;                // Raw materials cost
    taxTotal: number;                  // Total taxes paid
    usageTotal: number;                // Facility fees, etc.
    productLogIds: ObjectId[];         // References to ProductLog._id
    notes?: string;                    // Optional notes
}

export type ManufacturingBatchTypeDocument = WithId<ManufacturingBatchType>;
export type ManufacturingBatchTypeInsert = OptionalUnlessRequiredId<ManufacturingBatchType>;


export interface ProductLogType {
    typeID: number;          // FK to invTypes.typeID
    batchID: ObjectId;       // FK to ManufacturingBatch._id
    createdAt: Date;         // When this log entry was created
    quantity: number;        // Quantity produced in this log
    unitCost: number;       // Per-unit manufacturing cost
    totalCost: number;       // unitCost * quantity (redundant but useful)
    notes?: string;          // Optional notes
}

export type ProductLogTypeDocument = WithId<ProductLogType>;
export type ProductLogTypeInsert = OptionalUnlessRequiredId<ProductLogType>;


export interface OrderType {
    batchID: ObjectId;          // FK to ManufacturingBatch._id
    orderNumber?: string;       // External or internal order number
    type: 'purchase' | 'sale';  // Order type
    status: 'pending' | 'partial' | 'completed' | 'canceled';
    createdAt: Date;
    updatedAt?: Date;
    notes?: string;
}

export type OrderTypeDocument = WithId<OrderType>;
export type OrderTypeInsert = OptionalUnlessRequiredId<OrderType>;


export interface OrderTransactionType {
    orderID: ObjectId;          // FK to Order._id
    productLogID?: ObjectId;    // Optional FK to ProductLog._id
    date: Date;
    itemTypeID?: number;        // FK to invTypes.typeID (optional fallback)
    quantity?: number;
    unitPrice?: number;
    totalPrice: number;
    notes?: string;
}

export type OrderTransactionTypeDocument = WithId<OrderTransactionType>;
export type OrderTransactionTypeInsert = OptionalUnlessRequiredId<OrderTransactionType>;