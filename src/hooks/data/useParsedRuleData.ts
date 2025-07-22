// src/hooks/data/useParsedRuleData.ts

import { useMemo } from 'react';
import { RuleDetail as RuleDetailType } from '@/api/types';

// Define a clear interface for the parsed data
export interface ParsedRuleData {
  query: string;
  language: string;
  author: string;
  references: string[];
  false_positives: any[];
  risk_score: number | null;
  interval: string | null;
  license: string | null;
  cves: string[];
  tactics: { name: string; reference: string }[];
  techniques: { id: string; name: string; reference: string }[];
  tags: string[];
}

/**
 * Custom hook to parse the complex, varied structure of a rule object
 * into a consistent format for the UI.
 * @param rule - The raw rule detail object from the API.
 * @returns A memoized object with consistently structured data for rendering.
 */
export const useParsedRuleData = (rule: RuleDetailType | null): ParsedRuleData | null => {
  return useMemo(() => {
    if (!rule) return null;

    const { rule_source, raw_rule, rule_metadata, tags = [] } = rule;
    const meta = rule_metadata || {};
    const raw = raw_rule || {};

    // Initialize with default values
    let specifics = {
      query: 'No detection logic available.',
      language: 'unknown',
      author: 'Unknown',
      references: [],
      false_positives: [],
      risk_score: null,
      interval: null,
      license: null,
      threat: [],
      cves: [],
    };

    // --- Source-Specific Parsing ---
    if (rule_source === 'elastic') {
      specifics.query = raw.query || meta.query || 'N/A';
      specifics.language = raw.language || meta.language || 'unknown';
      specifics.author = (raw.author || meta.author)?.join(', ') || 'Unknown';
      specifics.references = raw.references || meta.references || [];
      specifics.false_positives = raw.false_positives || meta.false_positives || [];
      specifics.risk_score = raw.risk_score || meta.risk_score;
      specifics.interval = raw.interval || meta.interval;
      specifics.license = raw.license || meta.license;
      specifics.threat = raw.threat || meta.threat_mapping || [];
    } else if (rule_source === 'trinitycyber') {
      specifics.query = JSON.stringify(raw.implementation, null, 2);
      specifics.language = 'json';
      specifics.author = 'Trinity Cyber';
      specifics.references = raw.references || [];
      specifics.cves = raw.cve || [];
    }

    const allTechniques = new Map<string, { id: string; name: string; reference: string }>();
    const allTactics = new Map<string, { name: string; reference: string }>();

    // 1. Parse structured threat mapping if it exists (from Elastic rules)
    specifics.threat.forEach((threatItem: any) => {
        if (threatItem.tactic?.id) {
            allTactics.set(threatItem.tactic.id, { name: threatItem.tactic.name, reference: threatItem.tactic.reference });
        }
        threatItem.technique?.forEach((tech: any) => {
            if (tech.id) allTechniques.set(tech.id, { id: tech.id, name: tech.name, reference: tech.reference });
            tech.subtechnique?.forEach((sub: any) => {
                if (sub.id) allTechniques.set(sub.id, { id: sub.id, name: sub.name, reference: sub.reference });
            });
        });
    });

    // 2. Fallback to parsing unstructured tags for all other cases
    tags.forEach(tag => {
        // Match Techniques (Txxxx or Txxxx.xxx)
        const techMatch = tag.match(/T\d{4}(\.\d{3})?/);
        if (techMatch) {
            const techId = techMatch[0];
            if (!allTechniques.has(techId)) {
                allTechniques.set(techId, { id: techId, name: tag, reference: `https://attack.mitre.org/techniques/${techId.replace('.', '/')}` });
            }
        }
        // Match Tactics (TAxxxx)
        const tacticMatch = tag.match(/TA\d{4}/);
        if (tacticMatch) {
            const tacticId = tacticMatch[0];
            if (!allTactics.has(tacticId)) {
                allTactics.set(tacticId, { name: tag, reference: `https://attack.mitre.org/tactics/${tacticId}` });
            }
        }
        // Match CVEs (CVE-YYYY-NNNN...)
        const cveMatch = tag.match(/CVE-\d{4}-\d{4,}/);
        if (cveMatch && !specifics.cves.includes(cveMatch[0])) {
            specifics.cves.push(cveMatch[0]);
        }
    });

    return {
      ...specifics,
      tags,
      tactics: Array.from(allTactics.values()),
      techniques: Array.from(allTechniques.values()),
    };
  }, [rule]);
};

export default useParsedRuleData;
