import assert from 'node:assert';
import { UpdateService } from '../app/js/update-service.js';

console.log('Running UpdateService tests...');

const updater = new UpdateService('1.0.0');

// Test 1: SemVer comparison
assert.strictEqual(updater.compareSemVer('1.0.1', '1.0.0'), 1, '1.0.1 should be greater than 1.0.0');
assert.strictEqual(updater.compareSemVer('1.0.0', '1.0.0'), 0, '1.0.0 should be equal to 1.0.0');
assert.strictEqual(updater.compareSemVer('0.9.5', '1.0.0'), -1, '0.9.5 should be less than 1.0.0');
assert.strictEqual(updater.compareSemVer('2.1.0', '1.9.99'), 1, '2.1.0 should be greater than 1.9.99');
assert.strictEqual(updater.compareSemVer('1.2.3.4', '1.2.3.3'), 1, 'Revision check');

// Test 2: Configuration
updater.configure('MyOrg', 'MyRepo');
assert.strictEqual(updater.owner, 'MyOrg');
assert.strictEqual(updater.repo, 'MyRepo');

console.log('UpdateService tests passed successfully!');
