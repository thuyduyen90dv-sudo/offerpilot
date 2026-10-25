// Production module entry. The build embeds browser assets and bundles these local modules.
import {productionFetch} from './production.js';
export default {fetch(request,env){return productionFetch(request,env,'');}};
