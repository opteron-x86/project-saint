// src/utils/testApi.ts
// Run this in the browser console to test API connectivity

import { apiGet } from '@/api/client';
import * as endpoints from '@/api/endpoints';

export const testApiConnection = async () => {
  const results: Record<string, any> = {};
  
  console.log('🧪 Starting API Connection Tests...\n');
  
  // Test 1: Health Check
  try {
    console.log('Testing: Health Check...');
    const health = await apiGet('/health');
    results.health = { status: 'success', data: health };
    console.log('✅ Health Check passed', health);
  } catch (error) {
    results.health = { status: 'failed', error };
    console.error('❌ Health Check failed', error);
  }
  
  // Test 2: API Documentation
  try {
    console.log('Testing: API Documentation...');
    const docs = await apiGet('/api/docs');
    results.docs = { status: 'success', data: docs };
    console.log('✅ API Docs retrieved', docs);
  } catch (error) {
    results.docs = { status: 'failed', error };
    console.error('❌ API Docs failed', error);
  }
  
  // Test 3: Fetch Rules (paginated)
  try {
    console.log('Testing: Fetch Rules...');
    const rules = await endpoints.fetchRules({ page: 1, limit: 5 });
    results.rules = { status: 'success', count: rules.items.length, total: rules.total };
    console.log(`✅ Rules fetched: ${rules.items.length} of ${rules.total}`, rules);
  } catch (error) {
    results.rules = { status: 'failed', error };
    console.error('❌ Rules fetch failed', error);
  }
  
  // Test 4: Filter Options
  try {
    console.log('Testing: Filter Options...');
    const filters = await endpoints.fetchFilterOptions();
    results.filters = { status: 'success', data: filters };
    console.log('✅ Filter options retrieved', filters);
  } catch (error) {
    results.filters = { status: 'failed', error };
    console.error('❌ Filter options failed', error);
  }
  
  // Test 5: MITRE Coverage
  try {
    console.log('Testing: MITRE Coverage...');
    const coverage = await endpoints.fetchTechniqueCoverage();
    results.mitreCoverage = { status: 'success', techniques: coverage.covered_techniques };
    console.log(`✅ MITRE Coverage: ${coverage.covered_techniques} techniques`, coverage);
  } catch (error) {
    results.mitreCoverage = { status: 'failed', error };
    console.error('❌ MITRE Coverage failed', error);
  }
  
  // Test 6: Dashboard Stats
  try {
    console.log('Testing: Dashboard Stats...');
    const stats = await endpoints.fetchDashboardData();
    results.dashboard = { status: 'success', data: stats };
    console.log('✅ Dashboard stats retrieved', stats);
  } catch (error) {
    results.dashboard = { status: 'failed', error };
    console.error('❌ Dashboard stats failed', error);
  }
  
  // Test 7: Search
  try {
    console.log('Testing: Global Search...');
    const searchResults = await endpoints.globalSearch('CVE', { page: 1, limit: 5 });
    results.search = { status: 'success', total: searchResults.results.total_count };
    console.log(`✅ Search returned ${searchResults.results.total_count} results`, searchResults);
  } catch (error) {
    results.search = { status: 'failed', error };
    console.error('❌ Search failed', error);
  }
  
  // Test 8: Specific Rule (if we have rule IDs)
  if (results.rules?.status === 'success' && results.rules.count > 0) {
    try {
      console.log('Testing: Fetch Specific Rule...');
      // Get the first rule ID from previous test
      const firstRule = await endpoints.fetchRules({ page: 1, limit: 1 });
      if (firstRule.items.length > 0) {
        const ruleId = firstRule.items[0].id;
        const ruleDetail = await endpoints.fetchRuleById(ruleId);
        results.ruleDetail = { status: 'success', ruleId, title: ruleDetail.title };
        console.log(`✅ Rule detail fetched for ID: ${ruleId}`, ruleDetail);
      }
    } catch (error) {
      results.ruleDetail = { status: 'failed', error };
      console.error('❌ Rule detail failed', error);
    }
  }
  
  // Summary
  console.log('\n📊 Test Summary:');
  const passed = Object.values(results).filter(r => r.status === 'success').length;
  const failed = Object.values(results).filter(r => r.status === 'failed').length;
  
  console.log(`✅ Passed: ${passed}`);
  console.log(`❌ Failed: ${failed}`);
  console.log('\nDetailed Results:', results);
  
  return results;
};

// Export for use in browser console
if (typeof window !== 'undefined') {
  (window as any).testApi = testApiConnection;
  console.log('💡 API Test utility loaded. Run `testApi()` in console to test connections.');
}