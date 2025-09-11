import { useState, useRef, useEffect } from 'react';
import { MapPin, Search, Loader, Navigation } from 'lucide-react';

interface AddressAutocompleteProps {
    value: string;
    onChange: (value: string) => void;
    onLocationSelect?: (location: { lat: number; lng: number; address: string }) => void;
    placeholder?: string;
    className?: string;
    required?: boolean;
}

interface Suggestion {
    display_name: string;
    lat: string;
    lon: string;
    type?: string;
    class?: string;
    importance?: number;
}

const AddressAutocomplete: React.FC<AddressAutocompleteProps> = ({
    value,
    onChange,
    onLocationSelect,
    placeholder = "Start typing an address...",
    className = "",
    required = false
}) => {
    const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
    const [showSuggestions, setShowSuggestions] = useState(false);
    const [loading, setLoading] = useState(false);
    const [selectedIndex, setSelectedIndex] = useState(-1);

    const debounceTimeout = useRef<NodeJS.Timeout>();
    const inputRef = useRef<HTMLInputElement>(null);

    // Search for address suggestions
    const searchAddressSuggestions = async (query: string) => {
        if (query.length < 3) {
            setSuggestions([]);
            setShowSuggestions(false);
            return;
        }

        setLoading(true);
        try {
            // Using Nominatim search API for address suggestions
            const response = await fetch(
                `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=8&addressdetails=1&countrycodes=us,ca,gb,au,in,de,fr,es,it,nl,se,no,dk,fi&dedupe=1`
            );

            if (response.ok) {
                const data: Suggestion[] = await response.json();
                // Sort by importance if available
                const sortedData = data.sort((a, b) => (b.importance || 0) - (a.importance || 0));
                setSuggestions(sortedData);
                setShowSuggestions(sortedData.length > 0);
                setSelectedIndex(-1);
            } else {
                setSuggestions([]);
                setShowSuggestions(false);
            }
        } catch (error) {
            console.warn('Address search failed:', error);
            setSuggestions([]);
            setShowSuggestions(false);
        } finally {
            setLoading(false);
        }
    };

    // Debounced search function
    const debouncedSearch = (query: string) => {
        if (debounceTimeout.current) {
            clearTimeout(debounceTimeout.current);
        }
        debounceTimeout.current = setTimeout(() => {
            searchAddressSuggestions(query);
        }, 300); // 300ms delay
    };

    // Handle input change
    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newValue = e.target.value;
        onChange(newValue);

        // Trigger search for suggestions
        debouncedSearch(newValue);
    };

    // Handle suggestion selection
    const handleSuggestionSelect = (suggestion: Suggestion) => {
        const location = {
            lat: parseFloat(suggestion.lat),
            lng: parseFloat(suggestion.lon),
        };

        onChange(suggestion.display_name);
        setSuggestions([]);
        setShowSuggestions(false);
        setSelectedIndex(-1);

        if (onLocationSelect) {
            onLocationSelect({
                lat: location.lat,
                lng: location.lng,
                address: suggestion.display_name,
            });
        }
    };

    // Handle keyboard navigation
    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (!showSuggestions || suggestions.length === 0) return;

        switch (e.key) {
            case 'ArrowDown':
                e.preventDefault();
                setSelectedIndex(prev =>
                    prev < suggestions.length - 1 ? prev + 1 : prev
                );
                break;
            case 'ArrowUp':
                e.preventDefault();
                setSelectedIndex(prev => prev > 0 ? prev - 1 : -1);
                break;
            case 'Enter':
                e.preventDefault();
                if (selectedIndex >= 0 && selectedIndex < suggestions.length) {
                    handleSuggestionSelect(suggestions[selectedIndex]);
                }
                break;
            case 'Escape':
                setShowSuggestions(false);
                setSelectedIndex(-1);
                inputRef.current?.blur();
                break;
        }
    };

    // Handle input focus
    const handleInputFocus = () => {
        if (suggestions.length > 0) {
            setShowSuggestions(true);
        }
    };

    // Handle input blur (with delay to allow clicking suggestions)
    const handleInputBlur = () => {
        setTimeout(() => {
            setShowSuggestions(false);
            setSelectedIndex(-1);
        }, 200);
    };

    // Get suggestion type icon
    const getSuggestionIcon = (suggestion: Suggestion) => {
        const type = suggestion.type || suggestion.class;
        switch (type) {
            case 'house':
            case 'building':
                return '🏠';
            case 'road':
            case 'highway':
                return '🛣️';
            case 'city':
            case 'town':
            case 'village':
                return '🏙️';
            case 'state':
            case 'province':
                return '🗺️';
            case 'country':
                return '🌍';
            case 'postcode':
                return '📮';
            default:
                return '📍';
        }
    };

    // Format suggestion display
    const formatSuggestion = (suggestion: Suggestion) => {
        const parts = suggestion.display_name.split(',');
        const primary = parts[0]?.trim();
        const secondary = parts.slice(1, 3).join(',').trim();
        const tertiary = parts.slice(3).join(',').trim();

        return { primary, secondary, tertiary };
    };

    // Cleanup timeout on unmount
    useEffect(() => {
        return () => {
            if (debounceTimeout.current) {
                clearTimeout(debounceTimeout.current);
            }
        };
    }, []);

    return (
        <div className="relative">
            <div className="relative">
                <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                    ref={inputRef}
                    type="text"
                    value={value}
                    onChange={handleInputChange}
                    onFocus={handleInputFocus}
                    onBlur={handleInputBlur}
                    onKeyDown={handleKeyDown}
                    className={`w-full pl-10 pr-10 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${className}`}
                    placeholder={placeholder}
                    required={required}
                    autoComplete="off"
                />
                {loading && (
                    <Loader className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 animate-spin" />
                )}
                {!loading && value && (
                    <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                )}
            </div>

            {/* Suggestions Dropdown */}
            {showSuggestions && suggestions.length > 0 && (
                <div className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-80 overflow-y-auto">
                    {suggestions.map((suggestion, index) => {
                        const { primary, secondary, tertiary } = formatSuggestion(suggestion);
                        const isSelected = index === selectedIndex;

                        return (
                            <button
                                key={index}
                                type="button"
                                onClick={() => handleSuggestionSelect(suggestion)}
                                className={`w-full text-left px-4 py-3 border-b border-gray-100 last:border-b-0 focus:outline-none transition-colors ${isSelected
                                    ? 'bg-blue-50 border-blue-200'
                                    : 'hover:bg-gray-50'
                                    }`}
                            >
                                <div className="flex items-start">
                                    <span className="text-lg mr-3 mt-0.5 flex-shrink-0">
                                        {getSuggestionIcon(suggestion)}
                                    </span>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-medium text-gray-900 truncate">
                                            {primary}
                                        </p>
                                        {secondary && (
                                            <p className="text-xs text-gray-600 truncate">
                                                {secondary}
                                            </p>
                                        )}
                                        {tertiary && (
                                            <p className="text-xs text-gray-500 truncate">
                                                {tertiary}
                                            </p>
                                        )}
                                        {suggestion.type && (
                                            <span className="inline-block px-2 py-0.5 mt-1 text-xs bg-gray-100 text-gray-600 rounded capitalize">
                                                {suggestion.type}
                                            </span>
                                        )}
                                    </div>
                                    <Navigation className="w-3 h-3 text-gray-400 mt-1 flex-shrink-0" />
                                </div>
                            </button>
                        );
                    })}
                </div>
            )}

            {/* Helper text */}
            <div className="mt-2">
                <p className="text-xs text-gray-500">
                    Start typing to see address suggestions. Use arrow keys to navigate, Enter to select.
                </p>

                {value && !showSuggestions && suggestions.length === 0 && !loading && value.length >= 3 && (
                    <div className="mt-1 p-2 bg-yellow-50 border border-yellow-200 rounded text-xs text-yellow-700">
                        <span className="font-medium">No suggestions found.</span> You can still use this address manually.
                    </div>
                )}

                {loading && value.length >= 3 && (
                    <div className="mt-1 p-2 bg-blue-50 border border-blue-200 rounded text-xs text-blue-700">
                        Searching for addresses...
                    </div>
                )}
            </div>
        </div>
    );
};

export default AddressAutocomplete;