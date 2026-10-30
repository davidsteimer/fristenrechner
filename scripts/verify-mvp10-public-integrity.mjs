// SPDX-License-Identifier: AGPL-3.0-only
// Public byte integrity, not a reproduction of private source/legal acceptance.
// Default CLI additionally checks the local Git pin and actually sealed artifacts.
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {readFile,lstat,readdir} from 'node:fs/promises';
import {execFileSync} from 'node:child_process';
import {inflateRawSync} from 'node:zlib';
import {resolve} from 'node:path';
import {fileURLToPath} from 'node:url';

export const root=fileURLToPath(new URL('../',import.meta.url));
export const releaseId='2026-10-28-mvp-010-approved.1';
export const releasePath='data/releases/'+releaseId;
export const manifestPath=releasePath+'/manifest.json';
export const manifestSha256='7562597cee45ad1e4995989f7f31b2e8d0619baaf1f9618355ca870c8426a016';
export const recordedDataCommit='01bbd96a296b0fc4d64cd554acc8cb122c3017a3';
export const recordedParent='70ce67425e046a7a38a4fbe66acbd93c75ca5983';
export const sourceApprovalSha256='992dbec1d485629941133617d458e01e98be73f65eeb9100d942be3cba649776';
export const outputPrefix='outputs/release-mvp10-2026-10-28';
export const schemaBindings=Object.freeze({
 'schemas/release-manifest-v17.schema.json':'ac562b3943db115986895fbd1d7e9a4c34ab583352136c3ad17e6985668dfa05',
 'schemas/administrative-procedure-catalog-v10.schema.json':'4d786b56f4a90eecdb20980bd797e1fe21e460d402a9b65182552aa4a4d0083f',
 'schemas/legal-profile.schema.json':'e1b87a82247f3f09c52aae1629e5a0d4db4de2dd6a493524746427073e2e6145',
 'schemas/calendar-rules-v3.schema.json':'86ec46d639e703cc30dfb1b51fc9cbdb573c911e11920acf503babebec85ca57',
 'schemas/holiday-catalog-v2.schema.json':'b1ef62006968380731209bdf31a952222ea2779811264cc492727bcca3122069',
 'schemas/special-regime-catalog-v3.schema.json':'50f8cb02b8e5b5bebffdb97594b9f3c51b89bb58b2ec26c487baea92f3a1854e',
 'schemas/social-procedure-catalog-v2.schema.json':'16bf46bfe0eeb88fe4015800e903c9b749eb8bb69b74a4e4474f9f5aa0186203'
});
export const publicContract=Object.freeze({releaseId,releasePath,manifestPath,manifestSha256,recordedDataCommit,sourceApprovalSha256,schemaBindings});
export const hash=bytes=>createHash('sha256').update(bytes).digest('hex');
const privatePath=/(?:^|\/)(?:\.work|\.git|\.venv|node_modules|Userinput|private|arbeitskopien)(?:\/|$)|\.private\.|^outputs\/r10-a[12](?:-|\/)/u;
export function assertPublicMvp10Path(path){
 assert.ok(typeof path==='string'&&path.length&&!path.startsWith('/')&&!/[\\:\x00-\x1f\x7f]/u.test(path)
  &&path.split('/').every(part=>part&&part!=='.'&&part!=='..')&&!privatePath.test(path),'Unsafe or private integrity path');
}
export function verifyBoundBytes(files,row){
 assertPublicMvp10Path(row.path);assert.match(row.sha256,/^[a-f0-9]{64}$/u);
 const bytes=files.get(row.path);assert.ok(Buffer.isBuffer(bytes),'Missing public input: '+row.path);
 assert.equal(hash(bytes),row.sha256,'Changed public input: '+row.path);
 if(row.byteLength!==undefined){assert.ok(Number.isSafeInteger(row.byteLength)&&row.byteLength>0);assert.equal(bytes.length,row.byteLength,'Changed public length: '+row.path);}
 return bytes;
}
/** Pure function. Tests may pass an explicitly synthetic digest contract. */
export function validateMvp10PublicIntegrity(files,contract=publicContract){
 const manifest=JSON.parse(verifyBoundBytes(files,{path:contract.manifestPath,sha256:contract.manifestSha256}));
 assert.equal(manifest.releaseId,contract.releaseId);assert.equal(manifest.releaseStatus,'approved');
 assert.equal(manifest.formatVersion,'17.0.0');assert.equal(manifest.compatibility.minimumConsumerFormatVersion,'17.0.0');
 assert.equal(manifest.artifacts.length,44);assert.equal(new Set(manifest.artifacts.map(row=>row.path)).size,44);
 assert.equal(manifest.sourceSummary.sourceIds.length,258);assert.equal(new Set(manifest.sourceSummary.sourceIds).size,258);
 assert.deepEqual(manifest.extensions['steimer.approval'].sourceReviewRef,{reviewId:'MVP10-SOURCE-APPROVAL-20261028',sha256:contract.sourceApprovalSha256});
 const preparation=manifest.extensions['steimer.release-preparation'];
 for(const key of ['publicationApproved','deploymentApproved','productionActivation'])assert.equal(preparation[key],false);
 assert.equal(preparation.operatingApproval,'requiresSeparateDecision');
 for(const[path,sha256]of Object.entries(contract.schemaBindings))verifyBoundBytes(files,{path,sha256});
 const docs=new Map(),roles={};
 for(const row of manifest.artifacts){assertPublicMvp10Path(row.path);const path=contract.releasePath+'/'+row.path;
  const value=JSON.parse(verifyBoundBytes(files,{...row,path}));assert.equal(value.dataKind,row.role);assert.equal(value.$schema,row.schemaId);
  assert.ok(Object.hasOwn(contract.schemaBindings,'schemas/'+row.schemaId.split('/').at(-1)),'Unbound schema identity');
  const identity=row.role==='calendar'?'calendarId':row.role==='legalProfile'?'profileId':'catalogId';
  assert.equal(value[identity],row.contentId);assert.ok(!docs.has(row.contentId),'Duplicate component');docs.set(row.contentId,value);
  roles[row.role]=(roles[row.role]??0)+1;
 }
 assert.deepEqual(roles,{legalProfile:5,specialRegimeCatalog:1,holidayCatalog:1,calendar:35,socialProcedureCatalog:1,administrativeProcedureCatalog:1});
 const social=docs.get('ch-social-procedures'),admin=docs.get('ch-cantonal-administrative-procedures');
 assert.equal(social.federalRules.length,44);assert.equal(social.cantonalBindings.length,50);
 assert.ok(social.cantonalBindings.every(row=>row.procedureContextCanton==='BE'));
 assert.equal(admin.runtimeActive,false);assert.equal(admin.paths.length,245);assert.equal(admin.qualificationPolicies.length,245);
 assert.equal(admin.holidayBindings.length,36);assert.equal(admin.suspensionProfiles.length,46);assert.equal(admin.releaseBinding.pathEligibility.length,245);
 assert.ok(admin.holidayBindings.every(row=>(row.physicalSource??row.physicalBaseline).releaseId===contract.releaseId));
 const expected=[contract.manifestPath,...manifest.artifacts.map(row=>contract.releasePath+'/'+row.path),...Object.keys(contract.schemaBindings)];
 assert.deepEqual([...files.keys()].sort(),expected.sort(),'Unexpected public input closure');
 return{status:'passed',verificationScope:'public-pinned-runtime-and-schema-integrity',releaseId:contract.releaseId,
  manifestSha256:contract.manifestSha256,recordedDataCommit:contract.recordedDataCommit,runtimeFilesVerified:45,schemaFilesVerified:7,
  uniquePublicFilesVerified:52,boundSourceApprovalSha256:contract.sourceApprovalSha256,privateEvidenceRequired:false,
  privateRawEvidenceRechecked:false,sourceApprovalEvidenceReopened:false,completeSourceAuditReproduced:false,
  semanticProjectionAuditReproduced:false,schemaValidationPerformed:false,schemaByteIntegrityVerified:true,
  gitHistoryChecked:false,newApprovalGranted:false,promotionPerformed:false,installationAuthorized:false,publicationAuthorized:false,operatingApproval:false};
}
async function readPublic(repository,path){assertPublicMvp10Path(path);const base=await lstat(repository);assert.ok(base.isDirectory()&&!base.isSymbolicLink());
 const parts=path.split('/');for(let n=1;n<=parts.length;n++){const stat=await lstat(resolve(repository,...parts.slice(0,n)));assert.ok(!stat.isSymbolicLink()&&(n===parts.length?stat.isFile():stat.isDirectory()),'Not regular public input: '+path);}
 return readFile(resolve(repository,path));
}
async function tree(repository,path){const rows=[];for(const entry of await readdir(resolve(repository,path),{withFileTypes:true})){assert.ok(!entry.isSymbolicLink(),'Symlink in inventory');const child=path+'/'+entry.name;assertPublicMvp10Path(child);if(entry.isDirectory())rows.push(...await tree(repository,child));else{assert.ok(entry.isFile());rows.push(child);}}return rows.sort();}
export async function loadMvp10PublicIntegrityInputs(repository=root){const files=new Map([[manifestPath,await readPublic(repository,manifestPath)]]);
 const manifest=JSON.parse(verifyBoundBytes(files,{path:manifestPath,sha256:manifestSha256}));
 for(const row of manifest.artifacts){assertPublicMvp10Path(row.path);const path=releasePath+'/'+row.path;files.set(path,await readPublic(repository,path));}
 for(const path of Object.keys(schemaBindings))files.set(path,await readPublic(repository,path));
 assert.deepEqual(await tree(repository,releasePath),[manifestPath,...manifest.artifacts.map(row=>releasePath+'/'+row.path)].sort(),'Missing or extra runtime file');
 validateMvp10PublicIntegrity(files);return files;
}
export async function verifyMvp10PublicRuntimeIntegrity(repository=root){return validateMvp10PublicIntegrity(await loadMvp10PublicIntegrityInputs(repository));}

const crcTable=Array.from({length:256},(_,n)=>{for(let k=0;k<8;k++)n=(n&1)?0xedb88320^(n>>>1):n>>>1;return n>>>0;});
export function crc32(bytes){let value=0xffffffff;for(const byte of bytes)value=crcTable[(value^byte)&255]^(value>>>8);return(value^0xffffffff)>>>0;}
/** Strict ordinary ZIP parser. Never extracts, invokes a command or follows URLs. */
export function readZip(data){
 assert.ok(Buffer.isBuffer(data)&&data.length>=22,'Invalid ZIP input');let end=-1;
 for(let n=data.length-22;n>=Math.max(0,data.length-65557);n--)if(data.readUInt32LE(n)===0x06054b50&&n+22+data.readUInt16LE(n+20)===data.length){end=n;break;}
 assert.ok(end>=0,'Missing ZIP end');assert.equal(data.readUInt16LE(end+4),0);assert.equal(data.readUInt16LE(end+6),0);
 const count=data.readUInt16LE(end+10),centralSize=data.readUInt32LE(end+12),centralOffset=data.readUInt32LE(end+16);
 assert.ok(count>0&&count!==65535);assert.equal(data.readUInt16LE(end+8),count);assert.equal(centralOffset+centralSize,end);
 const files=new Map(),seen=new Set(),ranges=[];let cursor=centralOffset;
 for(let n=0;n<count;n++){
  assert.ok(cursor+46<=end&&data.readUInt32LE(cursor)===0x02014b50,'Invalid central entry');
  const flags=data.readUInt16LE(cursor+8),method=data.readUInt16LE(cursor+10),crc=data.readUInt32LE(cursor+16),compressed=data.readUInt32LE(cursor+20),size=data.readUInt32LE(cursor+24);
  const length=data.readUInt16LE(cursor+28),extra=data.readUInt16LE(cursor+30),comment=data.readUInt16LE(cursor+32),external=data.readUInt32LE(cursor+38),offset=data.readUInt32LE(cursor+42);
  assert.equal(flags&1,0,'Encrypted ZIP');assert.ok([0,8].includes(method),'Unsupported ZIP method');assert.notEqual((external>>>16)&0xf000,0xa000,'ZIP symlink');
  assert.ok(cursor+46+length+extra+comment<=end,'Truncated central entry');const name=data.subarray(cursor+46,cursor+46+length).toString('utf8');
  const directory=name.endsWith('/'),safe=directory?name.slice(0,-1):name;assertPublicMvp10Path(safe);assert.ok(!seen.has(name),'Duplicate ZIP member');seen.add(name);
  assert.ok(offset+30<=centralOffset&&data.readUInt32LE(offset)===0x04034b50,'Missing local entry');
  const localLength=data.readUInt16LE(offset+26),localExtra=data.readUInt16LE(offset+28),start=offset+30+localLength+localExtra,finish=start+compressed;
  assert.equal(data.readUInt16LE(offset+6),flags);assert.equal(data.readUInt16LE(offset+8),method);
  assert.equal(data.subarray(offset+30,offset+30+localLength).toString('utf8'),name,'Local/central name mismatch');assert.ok(finish<=centralOffset,'ZIP range outside local area');
  assert.ok(!ranges.some(([a,b])=>offset<b&&finish>a),'Overlapping ZIP entries');ranges.push([offset,finish]);
  const packed=data.subarray(start,finish),raw=method===0?Buffer.from(packed):inflateRawSync(packed,{maxOutputLength:Math.max(size,1)});
  assert.equal(raw.length,size,'ZIP length mismatch');assert.equal(crc32(raw),crc,'ZIP CRC mismatch');if(!directory)files.set(name,raw);
  cursor+=46+length+extra+comment;
 }
 assert.equal(cursor,end,'Trailing central data');return files;
}
export function zipInventory(files){return[...files].sort(([a],[b])=>a<b?-1:a>b?1:0).map(([path,bytes])=>({path,byteLength:bytes.length,sha256:hash(bytes)}));}
export function assertByteInventory(files,rows){assert.deepEqual(zipInventory(files),rows,'Archive/readback byte inventory differs');}
export function assertLocalPin(pin,files,contract=publicContract){assert.equal(pin.releaseId,contract.releaseId);assert.equal(pin.commit,contract.recordedDataCommit);assert.equal(pin.parent,recordedParent);
 assert.equal(pin.manifestSha256,contract.manifestSha256);assert.equal(hash(files.get(contract.manifestPath)),contract.manifestSha256);
 assert.equal(pin.localOnly,true);assert.equal(pin.publicationVerified,false);assert.equal(pin.installationAuthorized,false);
 const runtime=new Map([...files].filter(([path])=>path.startsWith(contract.releasePath+'/')));assert.equal(runtime.size,45);assertByteInventory(runtime,pin.files);
}
const xmlAttribute=(text,name)=>{const found=[...text.matchAll(new RegExp('(?:^|\\s)'+name+'="([^"]*)"','gu'))];assert.equal(found.length,1,'Ambiguous XML '+name);return found[0][1];};
const unescapeXml=text=>text.replace(/&quot;/gu,'"').replace(/&apos;/gu,"'").replace(/&lt;/gu,'<').replace(/&gt;/gu,'>').replace(/&amp;/gu,'&');
export function assertPackageScope(files,baseUrl){
 const app=files.get('AppManifest.xml')?.toString();assert.ok(app,'Missing AppManifest');
 assert.equal(xmlAttribute(app,'ProductID'),'13090feb-a6bf-40fa-9d3c-ec8d90516a60');assert.equal(xmlAttribute(app,'Version'),'0.10.0.0');
 assert.equal(xmlAttribute(app,'IsDomainIsolated'),'false');assert.equal(xmlAttribute(app,'IsClientSideSolution'),'true');
 let component;
 for(const[name,bytes]of files){assert.ok(!/\.(?:map|ts|tsx|key|pem)$/u.test(name),'Development/private package entry');if(!/\.(?:xml|rels)$/u.test(name))continue;
  const text=bytes.toString();assert.ok(!/<[^>]*permission/iu.test(text),'Unexpected package permission');
  const found=[...text.matchAll(/<ClientSideComponent\s[^>]*ComponentManifest="([^"]*)"[^>]*>/gu)];for(const row of found){assert.equal(component,undefined,'Duplicate component');component=JSON.parse(unescapeXml(row[1]));}
 }
 assert.ok(component,'Missing component manifest');assert.equal(component.id,'596c7f1c-4d3e-4da8-a7be-27a96024f37c');assert.equal(component.version,'0.10.0');
 assert.deepEqual(component.supportedHosts,['SharePointWebPart','TeamsTab']);assert.equal(component.preconfiguredEntries.length,1);
 assert.deepEqual(component.preconfiguredEntries[0].properties,{providerKind:'github',githubBaseUrl:baseUrl,sharePointMirrorPath:''});
 const bundle='ClientSideAssets/'+component.loaderConfig.scriptResources['fristenrechner-web-part'].path;assert.ok(files.has(bundle)&&files.has(bundle+'.LICENSE.txt'));
 assert.ok(files.get(bundle).toString().includes(baseUrl),'Wrong built data pin');return{bundlePath:bundle,bundleSha256:hash(files.get(bundle))};
}
export async function verifyMvp10PublicIntegrity(repository=root){
 const files=await loadMvp10PublicIntegrityInputs(repository),runtime=validateMvp10PublicIntegrity(files);
 const pin=JSON.parse(await readPublic(repository,outputPrefix+'/local-data-pin.json'));assertLocalPin(pin,files);
 const git=(...args)=>execFileSync('git',args,{cwd:repository,maxBuffer:32*1024*1024});
 assert.equal(git('rev-parse',recordedDataCommit+'^').toString().trim(),recordedParent);
 const paths=[...files.keys()].filter(path=>path.startsWith(releasePath+'/')).sort();
 assert.deepEqual(git('diff-tree','--no-commit-id','--name-only','-r',recordedDataCommit).toString().trim().split('\n').sort(),paths);
 for(const path of paths)assert.deepEqual(git('cat-file','blob',recordedDataCommit+':'+path),files.get(path),'Local Git blob differs: '+path);
 const proof=JSON.parse(await readPublic(repository,outputPrefix+'/artifact-verification.json'));
 assert.equal(proof.kind,'mvp10-local-artifact-sealing');assert.equal(proof.status,'passed');assert.equal(proof.releaseId,releaseId);
 assert.equal(proof.localDataCommit,recordedDataCommit);assert.equal(proof.manifestSha256,manifestSha256);assert.equal(proof.packageVersion,'0.10.0.0');assert.equal(proof.applicationVersion,'0.10.0');
 for(const flag of ['installationAuthorized','publicationAuthorized','operatingApproval','remotePinVerified','realM365TestsPerformed'])assert.equal(proof[flag],false);
 const buildBytes=await readPublic(repository,proof.buildProof.path);verifyBoundBytes(new Map([[proof.buildProof.path,buildBytes]]),proof.buildProof);const build=JSON.parse(buildBytes);
 assert.equal(build.status,'passed');assert.deepEqual(build.localDataPin,pin);assert.equal(build.manifest.sha256,manifestSha256);
 const expectedNames=['fristenrechner-schweiz-0.10.0.0.sppkg','fristenrechner-mvp10-sharepoint-mirror.zip','fristenrechner-mvp10-steimer-web.zip'];
 assert.deepEqual(proof.artifacts.map(row=>row.path).sort(),expectedNames.map(name=>outputPrefix+'/'+name).sort());
 const artifacts=new Map();for(const row of proof.artifacts){const bytes=await readPublic(repository,row.path);verifyBoundBytes(new Map([[row.path,bytes]]),row);artifacts.set(row.path.split('/').at(-1),readZip(bytes));}
 const pkg=artifacts.get(expectedNames[0]);assertByteInventory(pkg,proof.packageAudit.entries);
 const packageScope=assertPackageScope(pkg,'https://raw.githubusercontent.com/davidsteimer/fristenrechner/'+recordedDataCommit+'/'+releasePath);
 const mirror=artifacts.get(expectedNames[1]);assertByteInventory(mirror,proof.mirrorFiles);
 assert.deepEqual([...mirror.keys()].sort(),paths.map(path=>path.slice(releasePath.length+1)).sort());for(const[name,raw]of mirror)assert.deepEqual(raw,files.get(releasePath+'/'+name),'Mirror/Git source mismatch');
 const web=artifacts.get(expectedNames[2]);assertByteInventory(web,proof.webFiles);assert.equal(web.size,12);
 const staticRows=await tree(repository,outputPrefix+'/web-build');assert.deepEqual(staticRows.map(path=>path.slice((outputPrefix+'/web-build/').length)).sort(),[...web.keys()].sort());
 for(const[name,bytes]of web)assert.deepEqual(await readPublic(repository,outputPrefix+'/web-build/'+name),bytes,'Static readback differs');
 const metadata=JSON.parse(web.get('build-manifest.json'));assert.equal(metadata.dataReleaseId,releaseId);assert.equal(metadata.version,'0.10.0');
 assert.equal(metadata.basePath,'/fristenrechner/');assert.equal(metadata.canonicalUrl,'https://www.steimer.ch/fristenrechner/');
 const source=build.archivedInputs.find(row=>row.path==='public-app/.htaccess');assert.ok(source);assert.equal(source.archivedAt,outputPrefix+'/build-evidence/inputs/public-app/.htaccess');
 const htaccess=await readPublic(repository,source.archivedAt);verifyBoundBytes(new Map([[source.path,htaccess]]),source);assert.deepEqual(web.get('.htaccess'),htaccess);
 return{...runtime,verificationScope:'local-pinned-runtime-git-and-sealed-artifact-integrity',gitHistoryChecked:true,gitBlobsVerified:45,
  localArtifactsVerified:3,packageScope,mirrorFilesVerified:45,staticWebFilesVerified:12,privateA2RawEvidenceRequired:false,
  privateRawEvidenceRechecked:false,remotePinVerified:false,installationAuthorized:false,publicationAuthorized:false,operatingApproval:false};
}
if(process.argv[1]&&resolve(process.argv[1])===fileURLToPath(import.meta.url)){
 assert.ok(process.argv.length===2||(process.argv.length===3&&process.argv[2]==='--runtime-only'),'Only explicit read-only audit modes are supported');
 console.log(JSON.stringify(await(process.argv[2]==='--runtime-only'?verifyMvp10PublicRuntimeIntegrity():verifyMvp10PublicIntegrity()),null,2));
}
