import { NavBar } from "@/components/layout/nav";
import { ProtectedRoute } from "@/components/layout/protected-route";
import { 
  useGetBusinesses, 
  useDeleteBusiness,
  getGetBusinessesQueryKey,
  getGetBusinessStatsQueryKey
} from "@repo/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Link } from "wouter";
import { Trash2, MapPin, Calendar } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

export default function History() {
  const { data: spots, isLoading } = useGetBusinesses();
  const deleteMutation = useDeleteBusiness();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  // Sort by created_at desc (most recent first)
  const sortedSpots = spots ? [...spots].sort((a, b) => {
    if (!a.created_at || !b.created_at) return 0;
    return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
  }) : [];

  const handleDelete = async (id: string, name: string) => {
    try {
      await deleteMutation.mutateAsync({ id });
      queryClient.invalidateQueries({ queryKey: getGetBusinessesQueryKey() });
      queryClient.invalidateQueries({ queryKey: getGetBusinessStatsQueryKey() });
      toast({
        title: "Spot removed",
        description: `${name} has been removed from your history.`,
      });
    } catch (err: unknown) {
      if (err instanceof Error) {
        console.error("Failed to remove spot:", err.message);
      } else {
        console.error("Failed to remove spot with unknown error:", err);
      }
      toast({
        title: "Failed to remove",
        variant: "destructive",
      });
    }
  };

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-background text-foreground flex flex-col">
        <NavBar />
        
        <main className="flex-1 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 w-full">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="flex items-center gap-3 mb-8"
          >
            <div className="p-3 bg-white/5 rounded-full">
              <Calendar className="w-6 h-6 text-primary" />
            </div>
            <h1 className="text-3xl md:text-4xl font-serif font-bold text-white">Your History</h1>
          </motion.div>

          {isLoading ? (
            <div className="space-y-4">
              {[...Array(5)].map((_, i) => (
                <Skeleton key={i} className="h-24 w-full rounded-xl bg-white/5" />
              ))}
            </div>
          ) : sortedSpots.length > 0 ? (
            <div className="space-y-4">
              {sortedSpots.map((spot, index) => (
                <motion.div
                  key={spot.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.4, delay: index * 0.05 }}
                >
                  <Card className="bg-card border-card-border overflow-hidden hover:border-primary/30 transition-colors">
                    <div className="flex flex-col sm:flex-row items-stretch sm:items-center">
                      <Link href={`/spot/${spot.business_id}`} className="flex-1 flex flex-col sm:flex-row items-stretch sm:items-center">
                        <div className="w-full sm:w-32 h-32 sm:h-24 bg-muted shrink-0 relative">
                          {spot.detail.image_url ? (
                            <img 
                              src={spot.detail.image_url} 
                              alt={spot.detail.name}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <MapPin className="w-6 h-6 text-muted-foreground/30" />
                            </div>
                          )}
                        </div>
                        <CardContent className="p-4 sm:p-5 flex-1 flex flex-col justify-center">
                          <div className="flex justify-between items-start gap-4">
                            <div>
                              <h3 className="font-serif text-lg font-bold text-white line-clamp-1 hover:text-primary transition-colors">
                                {spot.detail.name}
                              </h3>
                              <div className="flex items-center gap-1 mt-1 text-muted-foreground text-sm">
                                <span className="line-clamp-1">
                                  {spot.detail.address}, {spot.detail.city}
                                </span>
                              </div>
                            </div>
                            <div className="text-right shrink-0">
                              <p className="text-xs text-muted-foreground">
                                {spot.created_at ? format(new Date(spot.created_at), 'MMM d, yyyy') : ''}
                              </p>
                            </div>
                          </div>
                        </CardContent>
                      </Link>
                      
                      <div className="p-4 sm:p-5 sm:border-l border-t sm:border-t-0 border-white/5 flex items-center justify-end">
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <button 
                              className="p-2 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-full transition-colors"
                              data-testid={`button-delete-${spot.id}`}
                            >
                              <Trash2 className="w-5 h-5" />
                            </button>
                          </AlertDialogTrigger>
                          <AlertDialogContent className="bg-card border-card-border text-white">
                            <AlertDialogHeader>
                              <AlertDialogTitle>Remove from history?</AlertDialogTitle>
                              <AlertDialogDescription className="text-muted-foreground">
                                This will permanently remove {spot.detail.name} from your saved spots.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel className="bg-transparent border-white/10 hover:bg-white/5 hover:text-white">Cancel</AlertDialogCancel>
                              <AlertDialogAction 
                                onClick={() => handleDelete(spot.id, spot.detail.name)}
                                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                              >
                                Remove
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </div>
                  </Card>
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="text-center py-20 bg-white/5 rounded-2xl border border-white/10">
              <Calendar className="w-16 h-16 text-muted-foreground/30 mx-auto mb-4" />
              <h3 className="text-2xl font-serif text-white mb-2">No history yet</h3>
              <p className="text-muted-foreground mb-6">Your saved spots will appear here.</p>
              <Link href="/">
                <button className="bg-primary text-primary-foreground px-6 py-3 rounded-full font-medium hover:bg-primary/90 transition-colors">
                  Start Exploring
                </button>
              </Link>
            </div>
          )}
        </main>
      </div>
    </ProtectedRoute>
  );
}
