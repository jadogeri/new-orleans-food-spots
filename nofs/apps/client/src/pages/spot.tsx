import { useParams } from "wouter";
import { NavBar } from "@/components/layout/nav";
import { 
  useGetYelpBusiness, 
  useGetBusinesses, 
  useCreateBusiness,
  useUpdateBusiness,
  useDeleteBusiness,
  getGetBusinessesQueryKey,
  getGetBusinessStatsQueryKey
} from "@repo/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/lib/auth";
import { motion } from "framer-motion";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { MapPin, Star, Phone, Globe, Clock, Heart, CheckCircle2, Bookmark, Map } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useEffect, useState } from "react";

export default function SpotDetail() {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: business, isLoading: isLoadingYelp } = useGetYelpBusiness(id || "", {
    query: { enabled: !!id } as never
  });

  const { data: savedSpots, isLoading: isLoadingSaved } = useGetBusinesses({
    query: { enabled: !!user } as never
  });

  const createMutation = useCreateBusiness();
  const updateMutation = useUpdateBusiness();
  const deleteMutation = useDeleteBusiness();

  // Find if current spot is saved
  const savedSpot = savedSpots?.find(s => s.business_id === id);
  const isSaved = !!savedSpot;
  const isLiked = savedSpot?.liked || false;
  const isVisited = savedSpot?.visited || false;

  const [heroImage, setHeroImage] = useState<string | undefined>();

  useEffect(() => {
    if (business?.photos && business.photos.length > 0) {
      setHeroImage(business.photos[0]);
    } else if (business?.image_url) {
      setHeroImage(business.image_url);
    }
  }, [business]);

  const handleSaveToggle = async () => {
    if (!user) {
      toast({ title: "Please sign in to save spots", variant: "destructive" });
      return;
    }

    if (!business) return;

    try {
      if (isSaved) {
        await deleteMutation.mutateAsync({ id: savedSpot.id });
        toast({ title: "Removed from saved spots" });
      } else {
        await createMutation.mutateAsync({
          data: {
            business_id: business.id,
            detail: {
              name: business.name,
              phone: business.phone,
              rating: business.rating,
              image_url: business.image_url,
              price: business.price,
              reviews: business.review_count,
              address: business.location?.address1,
              city: business.location?.city,
              transactions: business.transactions,
              categories: business.categories?.map(c => c.title) || [],
            },
            liked: false,
            visited: false
          }
        });
        toast({ title: "Added to saved spots!" });
      }
      queryClient.invalidateQueries({ queryKey: getGetBusinessesQueryKey() });
      queryClient.invalidateQueries({ queryKey: getGetBusinessStatsQueryKey() });
    } catch (e: unknown) {
      if (e instanceof Error) {
        console.error("Failed to update saved spot:", e.message);
      } else {
        console.error("Failed to update saved spot with unknown error:", e);
      }
      toast({ title: "Failed to update saved spot", variant: "destructive" });
    }
  };

  const handleStatusToggle = async (field: "liked" | "visited", currentValue: boolean) => {
    if (!savedSpot) return;

    try {
      await updateMutation.mutateAsync({
        id: savedSpot.id,
        data: { [field]: !currentValue }
      });
      queryClient.invalidateQueries({ queryKey: getGetBusinessesQueryKey() });
      queryClient.invalidateQueries({ queryKey: getGetBusinessStatsQueryKey() });
      toast({ title: `Marked as ${!currentValue ? field : "not " + field}` });
    } catch (e: unknown) {
      if (e instanceof Error) {
        console.error("Failed to update spot status:", e.message);
      } else {
        console.error("Failed to update spot status with unknown error:", e);
      }
      toast({ title: "Failed to update", variant: "destructive" });
    }
  };

  const isLoading = isLoadingYelp || (user && isLoadingSaved);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <NavBar />
        <div className="w-full h-[40vh] md:h-[60vh]">
          <Skeleton className="w-full h-full rounded-none bg-white/5" />
        </div>
        <div className="max-w-5xl mx-auto px-4 w-full -mt-20 relative z-10 space-y-6 pb-20">
          <Skeleton className="w-2/3 h-16 bg-card" />
          <Skeleton className="w-full h-40 bg-card rounded-xl" />
        </div>
      </div>
    );
  }

  if (!business) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <NavBar />
        <div className="flex-1 flex items-center justify-center text-white">
          <p>Spot not found</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col pb-20">
      <NavBar />
      
      {/* Hero Header */}
      <div className="relative w-full h-[40vh] md:h-[60vh] bg-muted">
        {heroImage && (
          <img 
            src={heroImage} 
            alt={business.name}
            className="w-full h-full object-cover"
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/60 to-transparent"></div>
        
        <div className="absolute bottom-0 left-0 w-full">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pb-8 flex flex-col md:flex-row md:items-end justify-between gap-6">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="flex-1"
            >
              <div className="flex items-center gap-3 mb-3 flex-wrap">
                {business.categories?.map((cat) => (
                  <span key={cat.alias} className="px-3 py-1 bg-white/10 backdrop-blur-md rounded-full text-sm font-medium text-white border border-white/20">
                    {cat.title}
                  </span>
                ))}
                {business.price && (
                  <span className="px-3 py-1 bg-primary/20 text-primary border border-primary/30 rounded-full text-sm font-bold">
                    {business.price}
                  </span>
                )}
                {business.is_closed ? (
                  <span className="px-3 py-1 bg-destructive/20 text-destructive border border-destructive/30 rounded-full text-sm font-bold">
                    Closed
                  </span>
                ) : (
                  <span className="px-3 py-1 bg-secondary/20 text-secondary border border-secondary/30 rounded-full text-sm font-bold">
                    Open
                  </span>
                )}
              </div>
              <h1 className="text-4xl md:text-6xl font-serif font-bold text-white mb-2 shadow-sm drop-shadow-md">
                {business.name}
              </h1>
              <div className="flex items-center gap-4 text-white/90">
                <div className="flex items-center gap-1">
                  <Star className="w-5 h-5 text-primary fill-primary" />
                  <span className="font-bold text-lg">{business.rating}</span>
                  <span className="text-white/60">({business.review_count} reviews)</span>
                </div>
              </div>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="flex items-center gap-3 shrink-0"
            >
              <Button
                size="lg"
                onClick={handleSaveToggle}
                className={`rounded-full shadow-lg ${
                  isSaved 
                    ? "bg-white/10 text-white hover:bg-white/20 border border-white/20" 
                    : "bg-primary text-primary-foreground hover:bg-primary/90"
                }`}
                disabled={createMutation.isPending || deleteMutation.isPending}
                data-testid="button-save-spot"
              >
                <Bookmark className={`w-5 h-5 mr-2 ${isSaved ? "fill-current" : ""}`} />
                {isSaved ? "Saved" : "Save Spot"}
              </Button>
              
              {isSaved && (
                <>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => handleStatusToggle("liked", isLiked)}
                    className={`p-3 rounded-full shadow-lg backdrop-blur-md border border-white/10 transition-colors ${
                      isLiked ? "bg-destructive text-white border-destructive/50" : "bg-white/5 text-white/70 hover:bg-white/10"
                    }`}
                    data-testid="button-detail-like"
                  >
                    <Heart className={`w-6 h-6 ${isLiked ? "fill-current" : ""}`} />
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => handleStatusToggle("visited", isVisited)}
                    className={`p-3 rounded-full shadow-lg backdrop-blur-md border border-white/10 transition-colors ${
                      isVisited ? "bg-secondary text-white border-secondary/50" : "bg-white/5 text-white/70 hover:bg-white/10"
                    }`}
                    data-testid="button-detail-visit"
                  >
                    <CheckCircle2 className="w-6 h-6" />
                  </motion.button>
                </>
              )}
            </motion.div>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 w-full mt-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          <div className="lg:col-span-2 space-y-8">
            {/* Info Cards */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="grid grid-cols-1 sm:grid-cols-2 gap-4"
            >
              <div className="bg-card border border-card-border p-5 rounded-2xl flex items-start gap-4">
                <div className="p-3 bg-white/5 rounded-full shrink-0">
                  <MapPin className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h3 className="font-serif font-bold text-white mb-1">Location</h3>
                  <p className="text-muted-foreground text-sm leading-relaxed">
                    {business.location?.display_address?.map((line, i) => (
                      <span key={i} className="block">{line}</span>
                    ))}
                  </p>
                  <a 
                    href={`https://maps.google.com/?q=${business.coordinates?.latitude},${business.coordinates?.longitude}`}
                    target="_blank" rel="noreferrer"
                    className="text-primary text-sm hover:underline mt-2 inline-flex items-center gap-1"
                  >
                    <Map className="w-3 h-3" /> View Map
                  </a>
                </div>
              </div>

              <div className="bg-card border border-card-border p-5 rounded-2xl flex items-start gap-4">
                <div className="p-3 bg-white/5 rounded-full shrink-0">
                  <Phone className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h3 className="font-serif font-bold text-white mb-1">Contact</h3>
                  <p className="text-muted-foreground text-sm">
                    {business.phone || "Not available"}
                  </p>
                  {business.url && (
                    <a 
                      href={business.url}
                      target="_blank" rel="noreferrer"
                      className="text-primary text-sm hover:underline mt-2 inline-flex items-center gap-1"
                    >
                      <Globe className="w-3 h-3" /> Yelp Page
                    </a>
                  )}
                </div>
              </div>
            </motion.div>

            {/* Photos */}
            {business.photos && business.photos.length > 1 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.4 }}
              >
                <h3 className="text-2xl font-serif font-bold text-white mb-4">Photos</h3>
                <div className="grid grid-cols-2 gap-4">
                  {business.photos.slice(1).map((photo, i) => (
                    <div key={i} className="aspect-square rounded-2xl overflow-hidden cursor-pointer">
                      <img 
                        src={photo} 
                        alt="Spot photo" 
                        className="w-full h-full object-cover hover:scale-110 transition-transform duration-500"
                        onClick={() => setHeroImage(photo)}
                      />
                    </div>
                  ))}
                </div>
              </motion.div>
            )}
          </div>

          <div className="space-y-6">
             <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 0.4 }}
                className="bg-card border border-card-border p-6 rounded-2xl sticky top-24"
             >
               <h3 className="font-serif text-xl font-bold text-white mb-4 flex items-center gap-2">
                 <Clock className="w-5 h-5 text-primary" />
                 Features
               </h3>
               {business.transactions && business.transactions.length > 0 ? (
                 <ul className="space-y-3">
                   {business.transactions.map((t, i) => (
                     <li key={i} className="flex items-center gap-2 text-muted-foreground capitalize">
                       <CheckCircle2 className="w-4 h-4 text-secondary" />
                       {t.replace('_', ' ')}
                     </li>
                   ))}
                 </ul>
               ) : (
                 <p className="text-muted-foreground text-sm">No specific features listed.</p>
               )}
             </motion.div>
          </div>

        </div>
      </div>
    </div>
  );
}
