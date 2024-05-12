(()=>{var e={626:e=>{async function t(e,t){let a=await chrome.storage.local.get("levels"),o=null;null==a.levels?o={[e]:t}:(o=a.levels,o[e]=t),await chrome.storage.local.set({levels:o})}async function a(e){let t=(await chrome.storage.local.get("levels")).levels;return null!=t&&null!=t[e]&&(console.log("tablevels: "+t),!0)}async function o(e){let t=(await chrome.storage.local.get("levels")).levels;return!await a(e)||t[e]<0?(console.log("!!Level not found for tabId: ",e),100):(console.log("!!Level found for tabId: ",e),100*t[e])}async function s(){let[e]=await chrome.tabs.query({active:!0,currentWindow:!0});return e}e.exports={worker:function(e,t){return e+t},sum:function(e,t){return e+t},getTabLevel:o,containsTab:a,getCurrentTab:s},chrome.runtime.onStartup.addListener((function(){console.log("Browser opened CLEARING CACHE"),chrome.storage.local.clear()})),new Map,chrome.runtime.onMessage.addListener((async e=>{switch(console.log("Message received from popup"),e.type){case"popup-loaded":let n=await s();var r=await o(n.id);console.log("[SERVICE-WORKER] Popup loaded message received sending level: ",r),chrome.runtime.sendMessage({type:"popup-level",level:r});break;case"adjust-level":console.log("[SERVICE-WORKER] Adjust level message received");var l=await s();await async function(e,o){await chrome.offscreen.hasDocument()?console.log("Offscreen document already exists"):(console.log("Creating offscreen document"),await chrome.offscreen.createDocument({url:"offscreen.html",reasons:["USER_MEDIA"],justification:"Adjust tab audio volume"}),console.log("Created offscreen document"));let s=e.toString(),r=o.toString();if(await a(s))console.log("[WORKER] tab found in activeStreams W/ tabId: ",e),chrome.runtime.sendMessage({type:"adjust-level",target:"offscreen",tabId:e,level:o}),await t(s,r);else{console.log("[WORKER] tab not found in activeStreams W/ tabId: ",e);const a=await chrome.tabCapture.getMediaStreamId({targetTabId:e});chrome.runtime.sendMessage({type:"start-recording",target:"offscreen",data:a,tabId:e,level:o}),await t(s,r)}}(l.id,e.level);break;case"testSave":console.log("[SERVICE-WORKER] Test save message received"),l=await s(),await testSave(l.id);break;case"testGet":console.log("[SERVICE-WORKER] Test get message received"),l=await s(),await testGet(l.id);break;case"clear-storage":console.log("[SERVICE-WORKER] Clear storage message received"),await chrome.storage.local.clear()}}))}},t={};!function a(o){var s=t[o];if(void 0!==s)return s.exports;var r=t[o]={exports:{}};return e[o](r,r.exports,a),r.exports}(626)})();