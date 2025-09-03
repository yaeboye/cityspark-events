import { useState } from "react";
import { Button } from "@/components/ui/button";
import { User, LogOut, Bookmark, Menu, X } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface NavigationHeaderProps {
  user: any;
  onShowAuth: () => void;
}

export const NavigationHeader = ({ user, onShowAuth }: NavigationHeaderProps) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const navigationItems = [
    { name: "Home", href: "#", current: true },
    { name: "Events", href: "#events-section" },
    { name: "Cities", href: "#featured-cities" },
    { name: "About", href: "#" },
  ];

  return (
    <nav className="bg-white shadow-sm sticky top-0 z-50 border-b border-border/40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Logo */}
          <div className="flex items-center">
            <div className="flex-shrink-0 flex items-center">
              <span className="text-primary font-bold text-xl">Weekend Walla</span>
            </div>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:ml-6 md:flex md:items-center md:space-x-8">
            {navigationItems.map((item) => (
              <a
                key={item.name}
                href={item.href}
                className={`${
                  item.current
                    ? "text-foreground font-medium"
                    : "text-muted-foreground hover:text-primary"
                } px-3 py-2 text-sm font-medium transition-colors duration-200`}
              >
                {item.name}
              </a>
            ))}
          </div>

          {/* Desktop Auth Section */}
          <div className="hidden md:flex md:items-center md:space-x-4">
            {user ? (
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">
                  Welcome, {user.email?.split('@')[0]}
                </span>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => window.location.href = '/bookmarks'}
                  className="hover:bg-accent hover:text-accent-foreground"
                >
                  <Bookmark className="w-4 h-4" />
                </Button>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => supabase.auth.signOut()}
                  className="hover:bg-accent hover:text-accent-foreground"
                >
                  <LogOut className="w-4 h-4" />
                </Button>
              </div>
            ) : (
              <Button 
                variant="outline" 
                size="sm"
                onClick={onShowAuth}
                className="hover:bg-accent hover:text-accent-foreground"
              >
                <User className="w-4 h-4 mr-2" />
                Login
              </Button>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="inline-flex items-center justify-center p-2 rounded-md text-muted-foreground hover:text-foreground hover:bg-accent focus:outline-none focus:ring-2 focus:ring-inset focus:ring-primary"
            >
              {isMobileMenuOpen ? (
                <X className="block h-6 w-6" />
              ) : (
                <Menu className="block h-6 w-6" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 bg-white border-t border-border/40">
            {navigationItems.map((item) => (
              <a
                key={item.name}
                href={item.href}
                className={`${
                  item.current
                    ? "text-foreground bg-accent"
                    : "text-muted-foreground hover:text-primary hover:bg-accent"
                } block px-3 py-2 rounded-md text-base font-medium transition-colors duration-200`}
                onClick={() => setIsMobileMenuOpen(false)}
              >
                {item.name}
              </a>
            ))}
            
            {/* Mobile Auth */}
            <div className="pt-4 pb-3 border-t border-border/40">
              {user ? (
                <div className="flex items-center px-3">
                  <div className="flex-shrink-0">
                    <span className="text-sm font-medium text-foreground">
                      {user.email?.split('@')[0]}
                    </span>
                  </div>
                  <div className="ml-auto flex space-x-2">
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => {
                        window.location.href = '/bookmarks';
                        setIsMobileMenuOpen(false);
                      }}
                    >
                      <Bookmark className="w-4 h-4" />
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => {
                        supabase.auth.signOut();
                        setIsMobileMenuOpen(false);
                      }}
                    >
                      <LogOut className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="px-3">
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => {
                      onShowAuth();
                      setIsMobileMenuOpen(false);
                    }}
                    className="w-full justify-center"
                  >
                    <User className="w-4 h-4 mr-2" />
                    Login
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </nav>
  );
};