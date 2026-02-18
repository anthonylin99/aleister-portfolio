'use client';

import { useState, useCallback, useMemo } from 'react';
import Link from 'next/link';
import { collectionCategories, collections, getCollectionsByCategory } from '@/data/collections-seed';
import { CategorySection } from '@/components/collections/CategorySection';
import { CollectionCard } from '@/components/collections/CollectionCard';
import { CollectionSearchBar } from '@/components/collections/CollectionSearchBar';
import { Compass, Star, Send } from 'lucide-react';
import { ScrollBanner } from '@/components/ui/ScrollBanner';

export default function ExplorePage() {
  const [query, setQuery] = useState('');

  const handleSearch = useCallback((q: string) => {
    setQuery(q);
  }, []);

  const filteredCollections = useMemo(() => {
    if (!query.trim()) return null; // null = show categories view
    const q = query.toLowerCase().trim();
    return collections.filter((c) => {
      if (c.name.toLowerCase().includes(q)) return true;
      if (c.description.toLowerCase().includes(q)) return true;
      if (c.tags.some((t) => t.includes(q))) return true;
      if (c.stocks.some((s) => s.ticker.toLowerCase() === q)) return true;
      return false;
    });
  }, [query]);

  return (
    <div className="p-6 lg:p-8 min-h-screen relative">
      <div className="stripe-gradient-bg" />
      <div className="sky-sparkles" />

      <div className="relative z-10">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl bg-[var(--gb-gold)]/20 flex items-center justify-center">
              <Compass className="w-5 h-5 text-[var(--gb-gold)]" />
            </div>
            <ScrollBanner className="text-2xl">Horizons</ScrollBanner>
          </div>
          <p className="text-[var(--text-muted)] ml-[52px]">
            Curated stock collections organized by investment themes and strategies
          </p>

          {/* Quick Actions */}
          <div className="flex items-center gap-3 ml-[52px] mt-3">
            <Link
              href="/watchlist"
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[var(--gb-gold)]/10 border border-[var(--gb-gold-border)] text-[var(--gb-gold)] hover:bg-[var(--gb-gold)]/20 transition-colors text-sm"
            >
              <Star className="w-4 h-4" />
              My Watchlist
            </Link>
            <Link
              href="/submit-collection"
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[var(--gb-azure-deep)] border border-[var(--gb-gold-border)] text-[var(--text-muted)] hover:text-[var(--gb-parchment)] hover:bg-[var(--gb-azure)] transition-colors text-sm"
            >
              <Send className="w-4 h-4" />
              Submit Collection
            </Link>
          </div>
        </div>

        {/* Search */}
        <div className="mb-8">
          <CollectionSearchBar onSearch={handleSearch} />
        </div>

        {/* Search Results or Categories */}
        {filteredCollections ? (
          <div>
            <p className="text-sm text-[var(--text-muted)] mb-4">
              {filteredCollections.length} collection{filteredCollections.length !== 1 ? 's' : ''} matching &ldquo;{query}&rdquo;
            </p>
            {filteredCollections.length === 0 ? (
              <div className="gradient-card p-12 rounded-2xl text-center filigree-corners">
                <div className="relative z-10">
                  <p className="text-[var(--text-muted)] mb-2">No collections found</p>
                  <p className="text-sm text-[var(--text-subtle)]">Try a different search term or browse by category below</p>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredCollections.map((c) => {
                  const cat = collectionCategories.find((cat) => cat.id === c.categoryId);
                  return (
                    <CollectionCard
                      key={c.id}
                      collection={{ ...c, category: cat }}
                    />
                  );
                })}
              </div>
            )}
          </div>
        ) : (
          <div>
            {collectionCategories.map((category) => {
              const catCollections = getCollectionsByCategory(category.id);
              return (
                <CategorySection
                  key={category.id}
                  category={category}
                  collections={catCollections}
                />
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
