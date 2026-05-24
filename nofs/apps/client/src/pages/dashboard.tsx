import { NavBar } from "@/components/layout/nav";
import { ProtectedRoute } from "@/components/layout/protected-route";
import { 
  useGetBusinesses, 
  useGetBusinessStats, 
  useUpdateBusiness,
  getGetBusinessesQueryKey,
  getGetBusinessStatsQueryKey 
} from "@repo/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Link } from "wouter";
import { MapPin, Star, Heart, CheckCircle2, Bookmark, Flame } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function Dashboard() {
  const { data: spots, isLoading: isLoadingSpots } = useGetBusinesses();
  const { data: stats, isLoading: isLoadingStats } = useGetBusinessStats();
  const updateMutation = useUpdateBusiness();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const handleToggle = async (e: React.MouseEvent, id: string, field: "liked" | "visited", currentValue: boolean) => {
    e.preventDefault(); // Prevent navigating to spot detail
    e.stopPropagation();

    try {
      await updateMutation.mutateAsync({
        id,
        data: { [field]: !currentValue }
      });
      
      // Update cache
      queryClient.invalidateQueries({ queryKey: getGetBusinessesQueryKey() });
      queryClient.invalidateQueries({ queryKey: getGetBusinessStatsQueryKey() });
      
      toast({
        title: "Spot updated",
        description: `Marked as ${!currentValue ? field : "not " + field}`,
      });
    } catch (err) {
      toast({
        title: "Failed to update",
        variant: "destructive"
      });
    }
  };

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-background text-foreground flex flex-col">
        <NavBar />
        
        <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 w-full">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
          >
            <h1 className="text-4xl font-serif font-bold text-white mb-8">Your Dining Diary</h1>
          </motion.div>

          {/* Stats Banner */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
            {[
              { label: "Saved Spots", value: stats?.total, icon: Bookmark, color: "text-primary", loading: isLoadingStats },
              { label: "Favorites", value: stats?.liked, icon: Heart, color: "text-destructive", loading: isLoadingStats },
              { label: "Visited", value: stats?.visited, icon: CheckCircle2, color: "text-secondary", loading: isLoadingStats }
            ].map((stat, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.4, delay: i * 0.1 }}
              >
                <Card className="bg-card border-card-border">
                  <CardContent className="p-6 flex items-center justify-between">
                    <div>
                      <p className="text-muted-foreground text-sm font-medium">{stat.label}</p>
                      {stat.loading ? (
                        <Skeleton className="h-10 w-16 mt-1 bg-white/5" />
                      ) : (
                        <p className="text-4xl font-bold text-white mt-1">{stat.value || 0}</p>
                      )}
                    </div>
                    <div className={`p-4 rounded-full bg-white/5 ${stat.color}`}>
                      <stat.icon className="w-6 h-6" />
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>

          <h2 className="text-2xl font-serif text-white mb-6">Saved Spots</h2>
          
          {isLoadingSpots ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="space-y-4">
                  <Skeleton className="h-64 w-full rounded-xl bg-white/5" />
                  <Skeleton className="h-6 w-3/4 bg-white/5" />
                  <Skeleton className="h-4 w-1/2 bg-white/5" />
                </div>
              ))}
            </div>
          ) : spots && spots.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {spots.map((spot, index) => (
                <motion.div
                  key={spot.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.05 }}
                >
                  <Link href={`/spot/${spot.business_id}`}>
                    <Card className="h-full cursor-pointer group bg-card border-card-border overflow-hidden hover:border-primary/50 transition-all duration-300">
                      <div className="relative aspect-[4/3] overflow-hidden bg-muted">
                        {spot.detail.image_url ? (
                          <img 
                            src={spot.detail.image_url} 
                            alt={spot.detail.name}
                            className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-500"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <MapPin className="w-12 h-12 text-muted-foreground/30" />
                          </div>
                        )}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-60"></div>
                        
                        {/* Quick action buttons overlay */}
                        <div className="absolute top-3 right-3 flex flex-col gap-2">
                          <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={(e) => handleToggle(e, spot.id, "liked", spot.liked || false)}
                            className={`p-2 rounded-full backdrop-blur-md transition-colors ${
                              spot.liked ? "bg-destructive text-white" : "bg-black/50 text-white/70 hover:bg-black/70 hover:text-white"
                            }`}
                            data-testid={`button-like-${spot.id}`}
                          >
                            <Heart className={`w-4 h-4 ${spot.liked ? "fill-current" : ""}`} />
                          </motion.button>
                          <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={(e) => handleToggle(e, spot.id, "visited", spot.visited || false)}
                            className={`p-2 rounded-full backdrop-blur-md transition-colors ${
                              spot.visited ? "bg-secondary text-white" : "bg-black/50 text-white/70 hover:bg-black/70 hover:text-white"
                            }`}
                            data-testid={`button-visit-${spot.id}`}
                          >
                            <CheckCircle2 className="w-4 h-4" />
                          </motion.button>
                        </div>

                        <div className="absolute bottom-3 left-3 right-3 flex justify-between items-end">
                          <div className="flex items-center gap-1 bg-black/60 backdrop-blur-sm px-2 py-1 rounded-md">
                            <Star className="w-4 h-4 text-primary fill-primary" />
                            <span className="text-white text-sm font-medium">{spot.detail.rating || "N/A"}</span>
                          </div>
                          {spot.detail.price && (
                            <span className="text-white font-medium bg-black/60 backdrop-blur-sm px-2 py-1 rounded-md text-sm">
                              {spot.detail.price}
                            </span>
                          )}
                        </div>
                      </div>
                      <CardContent className="p-5">
                        <h3 className="font-serif text-xl font-bold text-white mb-2 line-clamp-1 group-hover:text-primary transition-colors">
                          {spot.detail.name}
                        </h3>
                        <div className="flex items-start gap-2 text-muted-foreground text-sm mb-3">
                          <MapPin className="w-4 h-4 shrink-0 mt-0.5" />
                          <span className="line-clamp-2">
                            {spot.detail.address}, {spot.detail.city}
                          </span>
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="text-center py-24 bg-white/5 rounded-2xl border border-white/10">
              <Flame className="w-16 h-16 text-muted-foreground/30 mx-auto mb-4" />
              <h3 className="text-2xl font-serif text-white mb-2">No spots saved yet</h3>
              <p className="text-muted-foreground mb-6">Start exploring to build your dining diary.</p>
              <Link href="/">
                <button className="bg-primary text-primary-foreground px-6 py-3 rounded-full font-medium hover:bg-primary/90 transition-colors">
                  Discover Spots
                </button>
              </Link>
            </div>
          )}
        </main>
      </div>
    </ProtectedRoute>
  );
}
