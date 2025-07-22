<<<<<<< HEAD
<<<<<<< HEAD
=======
>>>>>>> 81c958a (search feature)
// src/components/common/SearchBar.tsx
import React, { useState, useEffect, useCallback } from 'react';
import { TextField, InputAdornment, IconButton, SxProps, Theme } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import ClearIcon from '@mui/icons-material/Clear';
<<<<<<< HEAD

export interface SearchBarProps {
  placeholder?: string;
  initialValue?: string;
  onSearch: (value: string) => void;
  onClear?: () => void; // Added for immediate clear action
  debounceTime?: number;
  width?: string | number;
  size?: 'small' | 'medium';
  variant?: 'outlined' | 'filled' | 'standard';
  sx?: SxProps<Theme>;
  fullWidth?: boolean;
}

const SearchBar: React.FC<SearchBarProps> = ({
  placeholder = 'Search...',
  initialValue = '',
  onSearch,
  onClear,
  debounceTime = 300,
  width,
  size = 'small',
  variant = 'outlined',
  sx,
  fullWidth = true,
}) => {
  const [searchTerm, setSearchTerm] = useState<string>(initialValue);

  const debouncedSearch = useCallback(
    (value: string) => {
      const handler = setTimeout(() => {
        onSearch(value);
      }, debounceTime);

      return () => {
        clearTimeout(handler);
      };
    },
    [onSearch, debounceTime]
  );

  useEffect(() => {
    setSearchTerm(initialValue);
  }, [initialValue]);

  useEffect(() => {
    if (searchTerm !== initialValue || initialValue === '') {
      const cancelDebounce = debouncedSearch(searchTerm);
      return () => {
        cancelDebounce();
      };
    }
  }, [searchTerm, initialValue, debouncedSearch]);

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.target.value);
  };

  const handleClearSearch = () => {
    setSearchTerm('');
    if (onClear) {
      onClear();
    }
    onSearch(''); // Immediately notify parent
  };

  return (
    <TextField
      fullWidth={fullWidth}
      variant={variant}
      size={size}
      placeholder={placeholder}
      value={searchTerm}
      onChange={handleInputChange}
      sx={sx ?? (width && !fullWidth ? { width } : {})}
      InputProps={{
        startAdornment: (
          <InputAdornment position="start">
            <SearchIcon fontSize={size === 'small' ? 'small' : 'medium'} />
          </InputAdornment>
        ),
        endAdornment: searchTerm && (
          <InputAdornment position="end">
            <IconButton
              aria-label="clear search"
              onClick={handleClearSearch}
              edge="end"
              size={size}
            >
              <ClearIcon fontSize={size === 'small' ? 'small' : 'medium'} />
            </IconButton>
          </InputAdornment>
        ),
      }}
    />
  );
};

export default SearchBar;
=======
import React from "react";
import { Box } from "@mui/material";
=======
>>>>>>> 81c958a (search feature)

export interface SearchBarProps {
  placeholder?: string;
  initialValue?: string;
  onSearch: (value: string) => void;
  onClear?: () => void; // Added for immediate clear action
  debounceTime?: number;
  width?: string | number;
  size?: 'small' | 'medium';
  variant?: 'outlined' | 'filled' | 'standard';
  sx?: SxProps<Theme>;
  fullWidth?: boolean;
}

const SearchBar: React.FC<SearchBarProps> = ({
  placeholder = 'Search...',
  initialValue = '',
  onSearch,
  onClear,
  debounceTime = 300,
  width,
  size = 'small',
  variant = 'outlined',
  sx,
  fullWidth = true,
}) => {
  const [searchTerm, setSearchTerm] = useState<string>(initialValue);

<<<<<<< HEAD
<<<<<<< HEAD
export default SearchBar;
>>>>>>> a380730 (Initial deployment)
=======
  // Debounce search function
=======
>>>>>>> 84dc71d (Complete infrastructure overhaul to serverless)
  const debouncedSearch = useCallback(
    (value: string) => {
      const handler = setTimeout(() => {
        onSearch(value);
      }, debounceTime);

      return () => {
        clearTimeout(handler);
      };
    },
    [onSearch, debounceTime]
  );

  useEffect(() => {
    setSearchTerm(initialValue);
  }, [initialValue]);

  useEffect(() => {
    if (searchTerm !== initialValue || initialValue === '') {
      const cancelDebounce = debouncedSearch(searchTerm);
      return () => {
        cancelDebounce();
      };
    }
  }, [searchTerm, initialValue, debouncedSearch]);

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.target.value);
  };

  const handleClearSearch = () => {
    setSearchTerm('');
    if (onClear) {
      onClear();
    }
    onSearch(''); // Immediately notify parent
  };

  return (
    <TextField
      fullWidth={fullWidth}
      variant={variant}
      size={size}
      placeholder={placeholder}
      value={searchTerm}
      onChange={handleInputChange}
      sx={sx ?? (width && !fullWidth ? { width } : {})}
      InputProps={{
        startAdornment: (
          <InputAdornment position="start">
            <SearchIcon fontSize={size === 'small' ? 'small' : 'medium'} />
          </InputAdornment>
        ),
        endAdornment: searchTerm && (
          <InputAdornment position="end">
            <IconButton
              aria-label="clear search"
              onClick={handleClearSearch}
              edge="end"
              size={size}
            >
              <ClearIcon fontSize={size === 'small' ? 'small' : 'medium'} />
            </IconButton>
          </InputAdornment>
        ),
      }}
    />
  );
};

export default SearchBar;
>>>>>>> 81c958a (search feature)
