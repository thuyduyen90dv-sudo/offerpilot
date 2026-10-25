import {readFileSync,writeFileSync} from 'node:fs';
const imports={
'src/models.js':"import {consumeQuota} from './security.js';\n",
'src/production-state.js':"import {refreshCatalog} from './live-jobs.js';\nimport {readVault} from './security.js';\nimport {modelMatch,modelTailor} from './models.js';\n",
'src/production.js':"import {encode64,decode64} from './security.js';\n"
};for(const [p,prefix] of Object.entries(imports))writeFileSync(p,prefix+readFileSync(p,'utf8'));
