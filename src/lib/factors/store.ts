import fs from 'fs';
import path from 'path';
import type { Factor, FactorAsset, Allocation } from './types';

const FACTORS_PATH = path.join(process.cwd(), 'src/data/factors.json');
const ALLOCATIONS_PATH = path.join(process.cwd(), 'src/data/allocations.json');

function slugify(name: string): string {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

// --- Factors ---

export function getFactors(): Factor[] {
  try {
    const raw = fs.readFileSync(FACTORS_PATH, 'utf-8');
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

export function getFactorById(id: string): Factor | undefined {
  return getFactors().find((f) => f.id === id);
}

export function getFactorByName(name: string): Factor | undefined {
  const lower = name.toLowerCase();
  return getFactors().find((f) => f.name.toLowerCase() === lower);
}

export function findFactorByPartialName(query: string): Factor | { ambiguous: Factor[] } | undefined {
  const lower = query.toLowerCase();
  const factors = getFactors();

  // Exact match first
  const exact = factors.find((f) => f.name.toLowerCase() === lower);
  if (exact) return exact;

  // Partial match
  const matches = factors.filter((f) => f.name.toLowerCase().includes(lower));
  if (matches.length === 1) return matches[0];
  if (matches.length > 1) return { ambiguous: matches };
  return undefined;
}

export function createFactor(
  name: string,
  assets: FactorAsset[],
  color: string,
  description?: string
): Factor {
  const factors = getFactors();

  // Validate unique name
  if (factors.some((f) => f.name.toLowerCase() === name.toLowerCase())) {
    throw new Error(`Factor "${name}" already exists`);
  }

  // Validate weights sum to 1.0
  const totalWeight = assets.reduce((sum, a) => sum + a.weight, 0);
  if (Math.abs(totalWeight - 1.0) > 0.001) {
    throw new Error(`Asset weights must sum to 100% (currently ${(totalWeight * 100).toFixed(1)}%)`);
  }

  const factor: Factor = {
    id: slugify(name),
    name,
    description,
    color,
    assets,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  factors.push(factor);
  fs.writeFileSync(FACTORS_PATH, JSON.stringify(factors, null, 2));
  return factor;
}

export function updateFactor(
  id: string,
  updates: Partial<Pick<Factor, 'name' | 'description' | 'color' | 'assets'>>
): Factor {
  const factors = getFactors();
  const index = factors.findIndex((f) => f.id === id);
  if (index === -1) throw new Error(`Factor "${id}" not found`);

  // If name changed, check uniqueness
  if (updates.name && updates.name.toLowerCase() !== factors[index].name.toLowerCase()) {
    if (factors.some((f) => f.name.toLowerCase() === updates.name!.toLowerCase())) {
      throw new Error(`Factor "${updates.name}" already exists`);
    }
  }

  // If assets updated, validate weights
  if (updates.assets) {
    const totalWeight = updates.assets.reduce((sum, a) => sum + a.weight, 0);
    if (Math.abs(totalWeight - 1.0) > 0.001) {
      throw new Error(`Asset weights must sum to 100% (currently ${(totalWeight * 100).toFixed(1)}%)`);
    }
  }

  factors[index] = {
    ...factors[index],
    ...updates,
    updatedAt: new Date().toISOString(),
  };

  fs.writeFileSync(FACTORS_PATH, JSON.stringify(factors, null, 2));
  return factors[index];
}

export function deleteFactor(id: string): void {
  const factors = getFactors().filter((f) => f.id !== id);
  fs.writeFileSync(FACTORS_PATH, JSON.stringify(factors, null, 2));

  // Also remove any allocations for this factor
  const allocations = getAllocations().filter((a) => a.factorId !== id);
  fs.writeFileSync(ALLOCATIONS_PATH, JSON.stringify(allocations, null, 2));
}

// --- Allocations ---

export function getAllocations(): Allocation[] {
  try {
    const raw = fs.readFileSync(ALLOCATIONS_PATH, 'utf-8');
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

export function getAllocationByFactorId(factorId: string): Allocation | undefined {
  return getAllocations().find((a) => a.factorId === factorId);
}

export function getTotalAllocated(): number {
  return getAllocations().reduce((sum, a) => sum + a.percentage, 0);
}

export function getUnallocated(): number {
  return 100 - getTotalAllocated();
}

export function upsertAllocation(factorId: string, percentage: number): Allocation {
  const allocations = getAllocations();
  const existing = allocations.find((a) => a.factorId === factorId);

  // Validate total doesn't exceed 100%
  const currentTotal = allocations
    .filter((a) => a.factorId !== factorId)
    .reduce((sum, a) => sum + a.percentage, 0);

  if (currentTotal + percentage > 100) {
    throw new Error(
      `Cannot allocate ${percentage}%. Only ${(100 - currentTotal).toFixed(1)}% available.`
    );
  }

  if (existing) {
    existing.percentage = percentage;
    existing.updatedAt = new Date().toISOString();
  } else {
    allocations.push({
      id: `alloc-${factorId}`,
      factorId,
      percentage,
      allocatedAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });
  }

  fs.writeFileSync(ALLOCATIONS_PATH, JSON.stringify(allocations, null, 2));
  return allocations.find((a) => a.factorId === factorId)!;
}

export function removeAllocation(factorId: string): void {
  const allocations = getAllocations().filter((a) => a.factorId !== factorId);
  fs.writeFileSync(ALLOCATIONS_PATH, JSON.stringify(allocations, null, 2));
}
