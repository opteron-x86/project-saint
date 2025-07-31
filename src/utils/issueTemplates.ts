// src/utils/issueTemplates.ts

// Description templates based on issue type
export const DESCRIPTION_TEMPLATES: { [key: string]: { placeholder: string, requiredSections: string[] } } = {
  'False Positive': {
    placeholder: `Please provide detailed information about this false positive:

🔍 WHAT HAPPENED:
• What legitimate activity triggered this rule?
• When did this occur?
• What was the business context?

📊 EVENT DETAILS:
• Event timestamp: [when]
• Source system: [hostname/IP]
• User/process involved: [details]
• Data that triggered the rule: [logs/evidence]

💡 ANALYSIS:
• Why is this a false positive?
• What makes this activity legitimate?
• Impact on security operations

🔧 SUGGESTED FIX:
• How should the rule be tuned?
• What conditions should be added to prevent this?
• Alternative detection approaches`,
    
    requiredSections: ['What happened', 'Event details', 'Analysis'],
  },

  'Performance Issue': {
    placeholder: `Please describe the performance impact:

⚡ PERFORMANCE SYMPTOMS:
• What performance issues are you observing?
• Query execution time: [before/after]
• System resource usage: [CPU/Memory/Disk]
• Impact on other rules or system performance

📈 METRICS & EVIDENCE:
• When did the issue start?
• Frequency of the problem
• Screenshots or monitoring data
• Error messages or logs

🎯 IMPACT ASSESSMENT:
• How many alerts are affected?
• Business operations impact
• User experience degradation

💡 OPTIMIZATION SUGGESTIONS:
• Proposed rule modifications
• Query optimization ideas
• Alternative approaches`,
    
    requiredSections: ['Performance symptoms', 'Impact assessment'],
  },

  'Missing Detection': {
    placeholder: `Help us understand the detection gap:

🎯 ATTACK SCENARIO:
• What attack technique is not being detected?
• MITRE ATT&CK technique ID (if known)
• Attack vector and methodology
• Threat actor or campaign (if applicable)

🔍 EVIDENCE & INDICATORS:
• Indicators of Compromise (IoCs)
• Log samples or evidence
• Timeline of the attack
• Data sources that should detect this

📊 BUSINESS JUSTIFICATION:
• Why is this detection important?
• Risk level and potential impact
• Frequency of this attack type
• Compliance or regulatory requirements

💡 PROPOSED DETECTION:
• Suggested rule logic or approach
• Data sources to leverage
• Expected alert volume
• Testing methodology`,
    
    requiredSections: ['Attack scenario', 'Evidence', 'Business justification'],
  },

  'Bug Report': {
    placeholder: `Help us understand and reproduce the bug:

🐛 BUG DESCRIPTION:
• What is the rule supposed to do?
• What is it actually doing?
• When did you first notice this issue?

🔄 REPRODUCTION STEPS:
1. Step one...
2. Step two...
3. Step three...
• What data triggers the bug?
• Specific conditions or timing

📋 EXPECTED vs ACTUAL:
• Expected behavior: [what should happen]
• Actual behavior: [what actually happens]
• Screenshots or error messages

💻 ENVIRONMENT:
• SIEM platform and version
• Data sources involved
• Recent changes or updates`,
    
    requiredSections: ['Bug description', 'Reproduction steps', 'Expected vs actual'],
  },

  'Tuning Suggestion': {
    placeholder: `Share your improvement idea:

🎯 CURRENT SITUATION:
• What does the rule currently do?
• What issues are you experiencing?
• How often does this occur?

💡 SUGGESTED IMPROVEMENT:
• What changes do you propose?
• How would this improve the rule?
• Expected benefits and outcomes

📊 ANALYSIS:
• Supporting data or evidence
• Testing you've done
• Impact on detection coverage
• Potential side effects

🔧 IMPLEMENTATION:
• Specific rule modifications
• Testing approach
• Rollback plan if needed`,
    
    requiredSections: ['Current situation', 'Suggested improvement'],
  },

  'General Query': {
    placeholder: `Please describe your question or feedback:

❓ YOUR QUESTION:
• What would you like to know?
• What are you trying to achieve?
• Any specific context or background?

📋 ADDITIONAL DETAILS:
• Rule-specific questions
• Documentation needs
• Training or guidance requests
• Feature suggestions

🎯 EXPECTED OUTCOME:
• What kind of response are you looking for?
• How urgent is this question?
• Who else might benefit from the answer?`,
    
    requiredSections: ['Your question'],
  }
};