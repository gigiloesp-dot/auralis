// Descriptor construction, not a device FPS/GPU benchmark. Run in an isolated
// process and compare commits with the same Node/CPU load.
import {writeFileSync} from 'node:fs';
const start=performance.now(),{REGIONS}=await import('../js/world/worldData.js'),{getRegionContent}=await import('../js/world/regionContent.js'),records=[];
for(const id of Object.keys(REGIONS)){const before=performance.now(),c=getRegionContent(id);records.push({id,width:c.width,height:c.height,ms:performance.now()-before,camps:c.camps.length,monsters:c.camps.reduce((n,c)=>n+c.spawns.length,0)});}
const report={environment:{node:process.version,platform:process.platform},elapsedMs:performance.now()-start,rssBytes:process.memoryUsage().rss,heapBytes:process.memoryUsage().heapUsed,records};
if(process.argv[2])writeFileSync(process.argv[2],JSON.stringify(report,null,2)+'\n');console.log(JSON.stringify(report));
