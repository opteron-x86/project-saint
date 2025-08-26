// src/components/common/SearchBar.tsx
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { 
  TextField, 
  InputAdornment, 
  IconButton, 
  SxProps, 
  Theme,
  TextFieldProps 
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import ClearIcon from '@mui/icons-material/Clear';

export interface SearchBarProps {
  // Controlled mode props
  value?: string;
  onChange?: (value: string) => void;
  
  // Common props
  onSearch?: (value: string) => void;
  onClear?: () => void;
  placeholder?: string;
  debounceTime?: number;
  
  // Styling props
  size?: 'small' | 'medium';
  variant?: 'outlined' | 'filled' | 'standard';
  fullWidth?: boolean;
  sx?: SxProps<Theme>;
  
  // Advanced props
  autoFocus?: boolean;
  disabled?: boolean;
  className?: string;
  id?: string;
  name?: string;
  'aria-label'?: string;
  
  // Pass-through props for TextField
  InputProps?: Partial<TextFieldProps['InputProps']>;
}

const SearchBar: React.FC<SearchBarProps> = ({
  value: controlledValue,
  onChange,
  onSearch,
  onClear,
  placeholder = 'Search...',
  debounceTime = 300,
  size = 'small',
  variant = 'outlined',
  fullWidth = true,
  sx,
  autoFocus = false,
  disabled = false,
  className,
  id,
  name,
  'aria-label': ariaLabel,
  InputProps: additionalInputProps,
}) => {
  const isControlled = controlledValue !== undefined;
  const [internalValue, setInternalValue] = useState('');
  const debounceTimerRef = useRef<NodeJS.Timeout>();
  
  // Use controlled value if provided, otherwise use internal state
  const searchValue = isControlled ? controlledValue : internalValue;

  // Handle input changes
  const handleInputChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = event.target.value;
    
    if (isControlled && onChange) {
      onChange(newValue);
    } else {
      setInternalValue(newValue);
    }
    
    // Debounced search callback
    if (onSearch) {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
      
      debounceTimerRef.current = setTimeout(() => {
        onSearch(newValue);
      }, debounceTime);
    }
  }, [isControlled, onChange, onSearch, debounceTime]);

  // Handle clear action
  const handleClear = useCallback(() => {
    const clearedValue = '';
    
    if (isControlled && onChange) {
      onChange(clearedValue);
    } else {
      setInternalValue(clearedValue);
    }
    
    // Immediate callbacks
    if (onClear) {
      onClear();
    }
    if (onSearch) {
      onSearch(clearedValue);
    }
  }, [isControlled, onChange, onClear, onSearch]);

  // Handle keyboard shortcuts
  const handleKeyDown = useCallback((event: React.KeyboardEvent<HTMLDivElement>) => {
    if (event.key === 'Escape' && searchValue) {
      event.preventDefault();
      handleClear();
    }
  }, [searchValue, handleClear]);

  // Cleanup debounce timer
  useEffect(() => {
    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, []);

  const inputProps = {
    startAdornment: (
      <InputAdornment position="start">
        <SearchIcon fontSize={size === 'small' ? 'small' : 'medium'} />
      </InputAdornment>
    ),
    endAdornment: searchValue && !disabled && (
      <InputAdornment position="end">
        <IconButton
          aria-label="clear search"
          onClick={handleClear}
          edge="end"
          size={size}
          tabIndex={-1}
        >
          <ClearIcon fontSize={size === 'small' ? 'small' : 'medium'} />
        </IconButton>
      </InputAdornment>
    ),
    ...additionalInputProps,
  };

  return (
    <TextField
      id={id}
      name={name}
      className={className}
      fullWidth={fullWidth}
      variant={variant}
      size={size}
      placeholder={placeholder}
      value={searchValue}
      onChange={handleInputChange}
      onKeyDown={handleKeyDown}
      disabled={disabled}
      autoFocus={autoFocus}
      aria-label={ariaLabel || placeholder}
      sx={sx}
      InputProps={inputProps}
    />
  );
};

export default SearchBar;