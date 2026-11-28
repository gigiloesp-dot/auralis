import {execFileSync} from 'node:child_process';
import {LEGACY_UPGRADE_A_ART} from '../js/assets/legacyUpgradeAArt.js';
if(Object.keys(LEGACY_UPGRADE_A_ART).length!==8)throw new Error('Expected8 legacy upgrades');
execFileSync('python',['scripts/validate-legacy-upgrade-a.py'],{stdio:'inherit'});
