import { useAuth } from "@/lib/auth";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { MapPin, User, LogOut, Menu, X, Compass, History } from "lucide-react";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

export function NavBar() {
  const { user, logout } = useAuth();
  const [location] = useLocation();
  const [isOpen, setIsOpen] = useState(false);

  const isActive = (path: string) => location === path;

  const NavLinks = () => (
    <>
      <Link href="/">
        <div
          className={`flex items-center space-x-2 px-3 py-2 rounded-md transition-colors hover:bg-white/10 ${
            isActive("/") ? "text-primary font-medium" : "text-muted-foreground"
          }`}
          data-testid="nav-home"
        >
          <Compass className="w-4 h-4" />
          <span>Discover</span>
        </div>
      </Link>
      {user ? (
        <>
          <Link href="/dashboard">
            <div
              className={`flex items-center space-x-2 px-3 py-2 rounded-md transition-colors hover:bg-white/10 ${
                isActive("/dashboard") ? "text-primary font-medium" : "text-muted-foreground"
              }`}
              data-testid="nav-dashboard"
            >
              <User className="w-4 h-4" />
              <span>Dashboard</span>
            </div>
          </Link>
          <Link href="/history">
            <div
              className={`flex items-center space-x-2 px-3 py-2 rounded-md transition-colors hover:bg-white/10 ${
                isActive("/history") ? "text-primary font-medium" : "text-muted-foreground"
              }`}
              data-testid="nav-history"
            >
              <History className="w-4 h-4" />
              <span>History</span>
            </div>
          </Link>
        </>
      ) : null}
    </>
  );

  return (
    <nav className="sticky top-0 z-50 w-full border-b border-white/10 bg-background/80 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          <div className="flex-shrink-0 flex items-center">
            <Link href="/">
              <div className="flex items-center gap-2 cursor-pointer group" data-testid="nav-logo">
                <MapPin className="w-6 h-6 text-primary group-hover:text-primary/80 transition-colors" />
                <span className="font-serif text-xl font-bold text-foreground">NOLA Spots</span>
              </div>
            </Link>
          </div>

          <div className="hidden md:flex md:items-center md:space-x-4">
            <NavLinks />
            <div className="ml-4 flex items-center space-x-4 pl-4 border-l border-white/10">
              {user ? (
                <Button
                  variant="ghost"
                  className="text-muted-foreground hover:text-white hover:bg-white/10"
                  onClick={() => logout()}
                  data-testid="button-logout"
                >
                  <LogOut className="w-4 h-4 mr-2" />
                  Sign Out
                </Button>
              ) : (
                <>
                  <Link href="/login">
                    <Button variant="ghost" className="text-muted-foreground hover:text-white" data-testid="button-login">
                      Sign In
                    </Button>
                  </Link>
                  <Link href="/register">
                    <Button className="bg-primary text-primary-foreground hover:bg-primary/90" data-testid="button-register">
                      Sign Up
                    </Button>
                  </Link>
                </>
              )}
            </div>
          </div>

          <div className="flex items-center md:hidden">
            <Button
              variant="ghost"
              size="icon"
              className="text-foreground"
              onClick={() => setIsOpen(!isOpen)}
              data-testid="button-mobile-menu"
            >
              {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </Button>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden border-t border-white/10 bg-background"
          >
            <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 flex flex-col">
              <NavLinks />
              <div className="mt-4 pt-4 border-t border-white/10 flex flex-col gap-2 px-3">
                {user ? (
                  <Button
                    variant="ghost"
                    className="w-full justify-start text-muted-foreground hover:text-white hover:bg-white/10"
                    onClick={() => {
                      logout();
                      setIsOpen(false);
                    }}
                    data-testid="button-mobile-logout"
                  >
                    <LogOut className="w-4 h-4 mr-2" />
                    Sign Out
                  </Button>
                ) : (
                  <>
                    <Link href="/login">
                      <Button
                        variant="ghost"
                        className="w-full justify-start text-muted-foreground hover:text-white"
                        onClick={() => setIsOpen(false)}
                      >
                        Sign In
                      </Button>
                    </Link>
                    <Link href="/register">
                      <Button
                        className="w-full justify-start bg-primary text-primary-foreground hover:bg-primary/90 mt-2"
                        onClick={() => setIsOpen(false)}
                      >
                        Sign Up
                      </Button>
                    </Link>
                  </>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
