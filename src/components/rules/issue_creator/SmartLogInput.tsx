import React, { useState } from 'react';
import { Box, Button, TextField, Typography, Collapse } from '@mui/material';
import { ContentPaste, Flare } from '@mui/icons-material';
import toast from 'react-hot-toast';

// Helper function to safely get a value from a nested object path (e.g., "host.name")
const getValueByPath = (obj: any, path: string): any => {
    return path.split('.').reduce((acc, part) => acc && acc[part], obj);
};

// A mapping of common field names for timestamps and sources
const FIELD_MAPPINGS = {
    timestamp: ['@timestamp', 'event.created', 'event.start', 'timestamp', 'time'],
    source: ['host.name', 'winlog.computer_name', 'source.ip', 'user.name', 'agent.hostname', 'host.hostname'],
};

interface SmartLogInputProps {
    setEventSource: (value: string) => void;
    setEventTimestamp: (value: string) => void;
}

export const SmartLogInput: React.FC<SmartLogInputProps> = ({ setEventSource, setEventTimestamp }) => {
    const [logText, setLogText] = useState('');
    const [showInput, setShowInput] = useState(false);

    const handleParse = () => {
        if (!logText.trim()) {
            toast.error('Please paste log data before parsing.');
            return;
        }

        try {
            const parsedLog = JSON.parse(logText);
            let foundTimestamp: string | null = null;
            let foundSource: string | null = null;

            // Find the first matching timestamp
            for (const path of FIELD_MAPPINGS.timestamp) {
                const value = getValueByPath(parsedLog, path);
                if (value && typeof value === 'string') {
                    foundTimestamp = value;
                    break;
                }
            }

            // Find the first matching source identifier
            for (const path of FIELD_MAPPINGS.source) {
                const value = getValueByPath(parsedLog, path);
                if (value && typeof value === 'string') {
                    foundSource = value;
                    break;
                }
            }

            if (foundTimestamp) {
                setEventTimestamp(foundTimestamp);
            }
            if (foundSource) {
                setEventSource(foundSource);
            }

            if (foundTimestamp || foundSource) {
                toast.success('Successfully parsed log and updated fields!');
            } else {
                toast.error('Could not find common timestamp or source fields in the log.');
            }

        } catch (error) {
            toast.error('Invalid JSON format. Please paste a valid JSON log.');
            console.error("Log parsing error:", error);
        }
    };
    
    const handlePasteFromClipboard = async () => {
        try {
            const text = await navigator.clipboard.readText();
            setLogText(text);
            setShowInput(true);
        } catch (err) {
            toast.error('Failed to read from clipboard.');
        }
    };

    return (
        <Box sx={{ p: 2, border: '1px dashed', borderColor: 'divider', borderRadius: 1 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="body2" fontWeight="medium">
                    Have a raw event? Save time by parsing it.
                </Typography>
                <Button 
                    size="small"
                    startIcon={<ContentPaste />}
                    onClick={handlePasteFromClipboard}
                >
                    Paste Log
                </Button>
            </Box>
            <Collapse in={showInput}>
                <TextField
                    fullWidth
                    multiline
                    rows={6}
                    value={logText}
                    onChange={(e) => setLogText(e.target.value)}
                    placeholder="Paste raw JSON log data here..."
                    variant="outlined"
                    sx={{ 
                        mt: 2, 
                        '& .MuiInputBase-input': { 
                            fontFamily: 'monospace',
                            fontSize: '0.8rem'
                        } 
                    }}
                />
                <Button
                    fullWidth
                    variant="contained"
                    startIcon={<Flare />}
                    onClick={handleParse}
                    sx={{ mt: 1 }}
                    disabled={!logText}
                >
                    Parse Log & Auto-Fill Fields
                </Button>
            </Collapse>
        </Box>
    );
};