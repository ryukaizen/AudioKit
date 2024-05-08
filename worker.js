
console.log("Worker is running");

const activeStreams = new Map();
// Messages from the popup
chrome.runtime.onMessage.addListener(async (msg) => {
  console.log("Message received from popup");
  switch (msg.type) {
    case "popup-loaded":
      //await chrome.storage.local.clear();
      let t = await getCurrentTab();
      var level = getTabLevel(t.id);
      console.log("[SERVICE-WORKER] Popup loaded message received sedning level: ", level);
      chrome.runtime.sendMessage({ type: 'popup-level', level: level});
      break;
    case "adjust-level":
      console.log("[SERVICE-WORKER] Adjust level message received");
      var currTab = await getCurrentTab();
      await updateTabVolume(currTab.id, msg.level);
      break;

    case "testSave":
      console.log("[SERVICE-WORKER] Test save message received");
      var currTab = await getCurrentTab();
      await testSave(currTab.id);
      break;

    case "testGet":
      console.log("[SERVICE-WORKER] Test get message received");
      var currTab = await getCurrentTab();
      await testGet(currTab.id);
      break;
  }
});

async function saveTabLevel(tabId, level){
  let items = await chrome.storage.local.get('levels');
  let tabLevels = null;
  // If levels is null, create a new object
  if (items.levels == null){
    tabLevels = {
      [tabId]: level
    };
  }
  // Otherwise, update the existing object
  else{
    tabLevels = items.levels;
    tabLevels[tabId] = level;
  }

  await chrome.storage.local.set({levels: tabLevels});
}

async function getTabLevel(tabId){
  let items = await chrome.storage.local.get('levels');
  let tabLevels = items.levels;
  // If level for current tab is not found, return -1
  if (tabLevels == null){
    return -1;
  }
  else{
    return tabLevels[tabId] * 100;
  }
}

/*
async function testSave(tabId){
  //clear storage
  let items = await chrome.storage.local.get('levels');
  let tabLevels = null;

  if(items.levels == null){
    console.log('[WORKER] levels is null');
    tabLevels = {
      ["1"]: "100",
      ["2"]: "50"
    };
  }
  else{
    tabLevels = items.levels;
    tabLevels[tabId] = "100";
  }
  await chrome.storage.local.set({levels: tabLevels} );
}
*/

/*
async function testGet(tabId){
  // const items = await chrome.storage.local.get('tabId');
   const items = await chrome.storage.local.get('levels');
  // const item = await chrome.storage.local.get("2");
  // console.log('[WORKER] value is ', item);
   console.log('[WORKER] values are ', JSON.stringify(items.levels));
  
  //if (items.tabId) {
    //console.log('[WORKER] Value found currently is ' + items.tabId);
  //}
  //else{
    //console.log('[WORKER] Value not found');
  //}
}
*/


async function updateTabVolume(tabId, volume){
    // Check if the offscreen document already exists
    if (await chrome.offscreen.hasDocument()) {
    }
    else{
      await chrome.offscreen.createDocument({
        url: 'offscreen.html',
        //reasons: ['AUDIO_PLAYBACK'],
        reasons: ['USER_MEDIA'],
        justification: 'Adjust tab audio volume'
      });
      console.log("Created offscreen document");
    }

    if (activeStreams.has(tabId)){
      console.log("[WORKER] tab found in activeStreams W/ tabId: ", tabId);
      chrome.runtime.sendMessage({ type: 'adjust-level', target: 'offscreen', tabId: tabId, level: volume});

    }
    else{
      console.log("[WORKER] tab not found in activeStreams W/ tabId: ", tabId);
      // Get a MediaStream for the Active Tab
      const streamId = await chrome.tabCapture.getMediaStreamId({
        targetTabId: tabId
      });
      
      // Send the stream ID to the offscreen document to start recording
      chrome.runtime.sendMessage({ type: 'start-recording', target: 'offscreen', data: streamId, tabId: tabId, level: volume});
    }

      // Save the stream ID to the activeStreams Map
      activeStreams.set(tabId, volume);
}


async function getCurrentTab() {
  let queryOptions = { active: true, currentWindow: true };
  let [tab] = await chrome.tabs.query(queryOptions);
  return tab;
}


function getTabLevel(tabId){
  let level = 100;
  if (activeStreams.has(tabId)){
    level = activeStreams.get(tabId) * 100;

  }
  return level;
}


