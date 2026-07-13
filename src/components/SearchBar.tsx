import { useState } from "react";
import { Search, MapPin, Calendar, Filter, LocateFixed } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { findNearestCity, getCurrentPosition } from "@/lib/geo";

const INDIAN_CITIES = [
  "Mumbai", "Delhi", "Bangalore", "Hyderabad", "Chennai", "Kolkata", 
  "Pune", "Ahmedabad", "Jaipur", "Lucknow", "Kochi", "Goa"
];

interface SearchBarProps {
  onSearch: (filters: SearchFilters) => void;
}

interface SearchFilters {
  city: string;
  date: string;
  category: string;
  priceType: string;
}

export const SearchBar = ({ onSearch }: SearchBarProps) => {
  const [filters, setFilters] = useState<SearchFilters>({
    city: "",
    date: "",
    category: "",
    priceType: ""
  });
  const [locating, setLocating] = useState(false);
  const { toast } = useToast();

  const handleSearch = () => {
    onSearch(filters);
  };

  const handleNearMe = async () => {
    setLocating(true);
    try {
      const position = await getCurrentPosition();
      const nearestCity = findNearestCity(
        position.coords.latitude,
        position.coords.longitude
      );

      if (!nearestCity) {
        throw new Error("Could not determine nearest city");
      }

      const nextFilters = { ...filters, city: nearestCity };
      setFilters(nextFilters);
      onSearch(nextFilters);

      toast({
        title: "Location detected",
        description: `Showing events near ${nearestCity.charAt(0).toUpperCase() + nearestCity.slice(1)}`,
      });
    } catch (error) {
      toast({
        title: "Couldn't get your location",
        description: error instanceof Error ? error.message : "Please allow location access or select a city manually",
        variant: "destructive",
      });
    } finally {
      setLocating(false);
    }
  };

  return (
    <div className="bg-card rounded-xl p-6 shadow-card border border-border/50 max-w-4xl mx-auto">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        {/* City Search */}
        <div className="relative flex gap-2">
          <div className="relative flex-1">
            <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <Select
              value={filters.city}
              onValueChange={(value) => setFilters(prev => ({ ...prev, city: value }))}
            >
              <SelectTrigger className="pl-10">
                <SelectValue placeholder="Select City" />
              </SelectTrigger>
              <SelectContent>
                {INDIAN_CITIES.map(city => (
                  <SelectItem key={city} value={city.toLowerCase()}>{city}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <Button
            type="button"
            variant="outline"
            size="icon"
            title="Use my location"
            onClick={handleNearMe}
            disabled={locating}
          >
            <LocateFixed className={`w-4 h-4 ${locating ? "animate-pulse" : ""}`} />
          </Button>
        </div>

        {/* Date Filter */}
        <div className="relative">
          <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
          <Input
            type="date"
            className="pl-10"
            onChange={(e) => setFilters(prev => ({ ...prev, date: e.target.value }))}
          />
        </div>

        {/* Category Filter */}
        <div className="relative">
          <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
          <Select onValueChange={(value) => setFilters(prev => ({ ...prev, category: value }))}>
            <SelectTrigger className="pl-10">
              <SelectValue placeholder="Category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="concert">Concerts</SelectItem>
              <SelectItem value="festival">Festivals</SelectItem>
              <SelectItem value="party">Parties</SelectItem>
              <SelectItem value="comedy">Comedy Shows</SelectItem>
              <SelectItem value="workshop">Workshops</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Price Type Filter */}
        <Select onValueChange={(value) => setFilters(prev => ({ ...prev, priceType: value }))}>
          <SelectTrigger>
            <SelectValue placeholder="Price Type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Events</SelectItem>
            <SelectItem value="free">Free Events</SelectItem>
            <SelectItem value="paid">Paid Events</SelectItem>
          </SelectContent>
        </Select>

        {/* Search Button */}
        <Button 
          onClick={handleSearch}
          className="bg-gradient-primary text-primary-foreground hover:shadow-primary transition-all duration-300 hover:scale-105"
        >
          <Search className="w-4 h-4 mr-2" />
          Search Events
        </Button>
      </div>
    </div>
  );
};