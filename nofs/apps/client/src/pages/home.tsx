import { useState } from "react";
import { useSearchYelp } from "@repo/api-client-react";
import { motion } from "framer-motion";
import { Search, MapPin, Star, UtensilsCrossed } from "lucide-react";
import { Link } from "wouter";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { NavBar } from "@/components/layout/nav";

const CATEGORIES = [
  { id: "cajun", label: "Cajun & Creole" },
  { id: "seafood", label: "Seafood" },
  { id: "jazzandblues", label: "Jazz Joints" },
  { id: "cocktailbars", label: "Cocktails" },
  { id: "coffee", label: "Coffee & Beignets" },
];

export default function Home() {
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedTerm, setDebouncedTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | undefined>();

  const { data: searchResults, isLoading } = useSearchYelp(
    { term: debouncedTerm, category: selectedCategory, limit: 20 }
  );

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setDebouncedTerm(searchTerm);
  };

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      <NavBar />
      
      {/* Hero Section */}
      <section className="relative pt-8 pb-5 overflow-hidden">
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 bg-gradient-to-b from-background/10 via-background/80 to-background"></div>
        </div>

        <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
          >
            <h1 className="text-4xl md:text-5xl font-serif font-bold text-white mb-2 drop-shadow-lg">
              Taste the Soul of <span className="text-primary italic">New Orleans</span>
            </h1>
            <p className="text-base md:text-lg text-muted-foreground max-w-2xl mx-auto mb-4">
              Discover, save, and remember the finest spots in the Crescent City.
            </p>
          </motion.div>

          <motion.form
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.15, ease: "easeOut" }}
            onSubmit={handleSearch}
            className="max-w-2xl mx-auto relative group"
          >
            <div className="relative flex items-center w-full">
              <Search className="absolute left-4 w-5 h-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
              <Input
                type="text"
                placeholder="Search gumbo, po-boys, French Quarter..."
                className="w-full pl-12 pr-28 h-12 rounded-full bg-white/5 border-white/20 text-white placeholder:text-muted-foreground focus-visible:ring-primary focus-visible:border-primary backdrop-blur-md transition-all shadow-xl"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                data-testid="input-search"
              />
              <Button
                type="submit"
                className="absolute right-1.5 h-9 px-5 rounded-full font-medium text-sm"
                data-testid="button-search"
              >
                Explore
              </Button>
            </div>
          </motion.form>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.25 }}
            className="mt-3 flex flex-wrap justify-center gap-2"
          >
            <Button
              size="sm"
              variant={selectedCategory === undefined ? "default" : "outline"}
              onClick={() => setSelectedCategory(undefined)}
              className="rounded-full bg-white/5 border-white/10 hover:bg-white/10 hover:text-white text-xs h-7 px-3"
            >
              All
            </Button>
            {CATEGORIES.map((cat) => (
              <Button
                key={cat.id}
                size="sm"
                variant={selectedCategory === cat.id ? "default" : "outline"}
                onClick={() => setSelectedCategory(cat.id === selectedCategory ? undefined : cat.id)}
                className={`rounded-full border-white/10 transition-colors text-xs h-7 px-3 ${
                  selectedCategory === cat.id
                    ? "bg-primary text-primary-foreground hover:bg-primary/90"
                    : "bg-white/5 hover:bg-white/10 hover:text-white text-muted-foreground"
                }`}
                data-testid={`button-category-${cat.id}`}
              >
                {cat.label}
              </Button>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Results Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-24 w-full">
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="space-y-4">
                <Skeleton className="h-64 w-full rounded-xl bg-white/5" />
                <Skeleton className="h-6 w-3/4 bg-white/5" />
                <Skeleton className="h-4 w-1/2 bg-white/5" />
              </div>
            ))}
          </div>
        ) : searchResults?.businesses && searchResults.businesses.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {searchResults.businesses.map((spot, index) => (
              <motion.div
                key={spot.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.05 }}
              >
                <Link href={`/spot/${spot.id}`}>
                  <Card className="h-full cursor-pointer group bg-card border-card-border overflow-hidden hover:border-primary/50 transition-all duration-300 hover:shadow-2xl hover:-translate-y-1">
                    <div className="relative aspect-video overflow-hidden">
                      {spot.image_url ? (
                        <img
                          src={spot.image_url}
                          alt={spot.name}
                          className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-500"
                        />
                      ) : (
                        <div className="w-full h-full bg-muted flex items-center justify-center">
                          <UtensilsCrossed className="w-10 h-10 text-muted-foreground/30" />
                        </div>
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-60 group-hover:opacity-80 transition-opacity"></div>
                      <div className="absolute bottom-2 left-2 right-2 flex justify-between items-end">
                        <div className="flex items-center gap-1 bg-black/60 backdrop-blur-sm px-1.5 py-0.5 rounded">
                          <Star className="w-3 h-3 text-primary fill-primary" />
                          <span className="text-white text-xs font-medium">{spot.rating}</span>
                        </div>
                        {spot.price && (
                          <span className="text-white font-medium bg-black/60 backdrop-blur-sm px-1.5 py-0.5 rounded text-xs">
                            {spot.price}
                          </span>
                        )}
                      </div>
                    </div>
                    <CardContent className="p-3">
                      <h3 className="font-serif text-base font-bold text-white mb-1 line-clamp-1 group-hover:text-primary transition-colors">
                        {spot.name}
                      </h3>
                      <div className="flex items-start gap-1.5 text-muted-foreground text-xs mb-2">
                        <MapPin className="w-3 h-3 shrink-0 mt-0.5" />
                        <span className="line-clamp-1">
                          {spot.location?.display_address?.[0]}
                        </span>
                      </div>
                      <div className="flex flex-wrap gap-1">
                        {spot.categories?.slice(0, 2).map((cat) => (
                          <span
                            key={cat.alias}
                            className="text-xs px-1.5 py-0.5 rounded bg-white/5 text-muted-foreground border border-white/10"
                          >
                            {cat.title}
                          </span>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              </motion.div>
            ))}
          </div>
        ) : debouncedTerm || selectedCategory ? (
          <div className="text-center py-20">
            <UtensilsCrossed className="w-16 h-16 text-muted-foreground/30 mx-auto mb-4" />
            <h3 className="text-2xl font-serif text-white mb-2">No spots found</h3>
            <p className="text-muted-foreground">Try a different search term or category.</p>
          </div>
        ) : null}
      </section>
    </div>
  );
}
